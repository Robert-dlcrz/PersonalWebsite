import { notFound } from 'next/navigation';
import { TripPage } from '@/components/trip-layouts/TripPage';
import type { TripGalleryPhoto } from '@/components/trip-layouts/types';
import { tripService } from '@/service/tripService';

/**
 * Next.js Route Segment Config: dynamicParams
 *
 * When using generateStaticParams(), Next.js pre-generates pages at build time.
 * By default, routes not returned by generateStaticParams would 404.
 *
 * Setting dynamicParams = true allows on-demand rendering for routes that weren't
 * pre-generated (e.g., trips added to Vercel Blob after deployment).
 *
 * Trade-off: First request to a new trip has slight latency (SSR), but subsequent
 * requests are cached. This enables adding trips without code redeployment.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamicparams
 */
export const dynamicParams = true;

/**
 * Next.js uses this to pre-generate the `/interests/[year]/[trip]` routes at build time.
 * It enumerates all known trips so the App Router can statically render or cache them ahead of requests.
 *
 * Even with dynamicParams = true, we keep this for performance: known trips get instant
 * CDN delivery (~50ms) vs on-demand SSR (~200-500ms). New trips still work via dynamicParams.
 */
export async function generateStaticParams() {
  const trips = await tripService.fetchTripSummaries();
  return trips.map((trip) => ({
    year: trip.year.toString(),
    trip: trip.slug,
  }));
}

type TripPageProps = {
  params: Promise<{
    year: string;
    trip: string;
  }>;
};

/**
 * Module-private helper: normalize `photosPath` so cover-photo matching is reliable
 * whether the path comes in with or without a trailing slash.
 * Example: `trips/2025/hawaii/photos/` and `trips/2025/hawaii/photos`
 * both map to `trips/2025/hawaii/photos/cover.jpg`.
 */
function buildCoverPathname(photosPath: string): string {
  const normalizedPhotosPath = photosPath.replace(/\/$/, '');
  return `${normalizedPhotosPath}/cover.jpg`;
}

function buildGalleryPhotos(photos: TripGalleryPhoto[], photosPath: string): TripGalleryPhoto[] {
  const coverPathname = buildCoverPathname(photosPath);

  return photos.filter((photo) => photo.pathname !== coverPathname);
}

export default async function TripDetailPage({ params }: TripPageProps) {
  const { year, trip } = await params;

  let tripDetail = null;
  try {
    tripDetail = await tripService.fetchTripDetail(year, trip);
  } catch {
    return notFound();
  }

  const photos = await tripService.fetchTripPhotos(tripDetail);
  const galleryPhotos = buildGalleryPhotos(
    photos.map((photo) => ({
      pathname: photo.pathname,
      url: photo.url,
    })),
    tripDetail.photosPath,
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <TripPage trip={tripDetail} galleryPhotos={galleryPhotos} />
    </main>
  );
}
