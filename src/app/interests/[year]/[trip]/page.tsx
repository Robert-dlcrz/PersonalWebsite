import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeftIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { tripService } from '@/service/tripService';

type TripPageProps = {
  params: Promise<{
    year: string;
    trip: string;
  }>;
};

/**
 * Next.js uses this to pre-generate the `/interests/[year]/[trip]` routes at build time.
 * It enumerates all known trips so the App Router can statically render or cache them ahead of requests.
 */
export async function generateStaticParams() {
  const trips = await tripService.fetchTripSummaries();
  return trips.map((trip) => ({
    year: trip.year.toString(),
    trip: trip.slug,
  }));
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

            {photos.length > 0 && (
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Photo Highlights</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {photos.map((photo) => (
                    <div key={photo.pathname} className="relative h-56 w-full overflow-hidden rounded-2xl">
                      <Image
                        src={photo.url}
                        alt={`${tripDetail.title} photo`}
                        fill
                        className="object-cover"
                        sizes="(min-width: 768px) 50vw, 100vw"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
    </main>
  );
}

