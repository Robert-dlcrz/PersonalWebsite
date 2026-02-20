import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeftIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { TripPhotoGallery } from '@/components/TripPhotoGallery';
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

type GalleryPhoto = {
  pathname: string;
  url: string;
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

function buildGalleryPhotos(photos: GalleryPhoto[], photosPath: string): GalleryPhoto[] {
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
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-6 py-12 max-w-5xl">
        <Link
          href="/interests"
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-8"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to adventures
        </Link>

        <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden">
          <div className="relative aspect-[4/3] w-full bg-slate-200 dark:bg-slate-800">
            <Image
              src={tripDetail.coverPhotoUrl}
              alt={tripDetail.title}
              fill
              priority
              sizes="(min-width: 1024px) 900px, 100vw"
              className="object-cover"
            />
          </div>
          <div className="p-8 space-y-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                {tripDetail.month} {tripDetail.year}
              </p>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white">{tripDetail.title}</h1>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-2 text-base">
                <MapPinIcon className="h-5 w-5 text-blue-500" />
                {tripDetail.location}
              </span>
              {tripDetail.dateRange && (
                <span className="text-base">
                  {tripDetail.dateRange.start} – {tripDetail.dateRange.end}
                </span>
              )}
            </div>

            <p className="text-lg text-slate-700 dark:text-slate-200 leading-relaxed">{tripDetail.description}</p>

            {galleryPhotos.length > 0 && (
              <TripPhotoGallery tripTitle={tripDetail.title} photos={galleryPhotos} />
            )}
          </div>
        </article>
      </div>
    </main>
  );
}

