import type { ListBlobResultBlob } from '@vercel/blob';
import { resolveBlobUrl } from '@/utils/blob';
import { BlobClient } from '@/persistence/blobClient';
import type { TripRecord } from '@/model/TripRecord';
import type { Trip } from '@/model/Trip';
import type { TripWithMetadata } from '@/model/TripWithMetadata';
import type { TripDetailRecord } from '@/model/TripDetailRecord';

const DEFAULT_REVALIDATE_SECONDS = 60 * 10; // 10 minutes
const COVER_PHOTO_FILENAME = 'cover.jpg';
const TRIPS_INDEX_PATH = 'trips/trips_index.json';
const TRIP_DETAIL_PATH = (year: string, slug: string) => `trips/${year}/${slug}/trip.json`;
/**
 * Matches JPG/JPEG extensions (e.g., "photo.jpg", "image.JPEG")
 */
const PHOTO_EXTENSION_REGEX = /\.(jpe?g)$/i;

function ensureTrailingSlash(path: string) {
  return path.endsWith('/') ? path : `${path}/`;
}

/**
 * Service for handling trip-related data operations.
 * Uses the generic BlobClient for blob storage interactions.
 */
export class TripService {
  private readonly client: BlobClient;

  constructor(client = new BlobClient()) {
    this.client = client;
  }

  /**
   * Fetch all trip summaries from the index file.
   * Returns trips sorted by year (descending) and month (descending).
   */
  async fetchTripSummaries(): Promise<Trip[]> {
    const trips = await this.client.getJson<TripRecord[]>(TRIPS_INDEX_PATH, {
      revalidateSeconds: DEFAULT_REVALIDATE_SECONDS,
    });

    return [...trips]
      .sort((a, b) => {
        if (a.year !== b.year) {
          return b.year - a.year;
        }
        const monthA = new Date(`${a.month} 1, ${a.year}`).getTime();
        const monthB = new Date(`${b.month} 1, ${b.year}`).getTime();
        return monthB - monthA;
      })
      .map((trip) => ({
        ...trip,
        coverPhotoUrl: resolveBlobUrl(`${trip.photosPath}/${COVER_PHOTO_FILENAME}`),
      }));
  }

  /**
   * Fetch detailed information for a specific trip.
   */
  async fetchTripDetail(year: string, slug: string): Promise<TripWithMetadata> {
    const baseTrip = await this.fetchTripSummary(year, slug);

    const tripDetail = await this.client.getJson<TripDetailRecord>(TRIP_DETAIL_PATH(year, slug), {
      revalidateSeconds: DEFAULT_REVALIDATE_SECONDS,
    });

    return {
      year: baseTrip.year,
      month: baseTrip.month,
      slug: baseTrip.slug,
      title: baseTrip.title,
      location: baseTrip.location,
      description: baseTrip.description,
      photosPath: baseTrip.photosPath,
      coverPhotoUrl: baseTrip.coverPhotoUrl,
      dateRange: tripDetail.dateRange,
      tags: tripDetail.tags,
    };
  }

  private async fetchTripSummary(year: string, slug: string): Promise<Trip> {
    const summaries = await this.fetchTripSummaries();
    const baseTrip = summaries.find(
      (trip) => trip.year === Number(year) && trip.slug === slug,
    );

    if (!baseTrip) {
      throw new Error(`Trip not found in index: ${year}/${slug}`);
    }

    return baseTrip;
  }

  /**
   * Fetch all photos for a given trip from blob storage.
   * Returns only JPEG files from the trip's photos directory.
   */
  async fetchTripPhotos(trip: TripWithMetadata): Promise<ListBlobResultBlob[]> {
    const prefix = ensureTrailingSlash(trip.photosPath);
    try {
      const { blobs } = await this.client.listBlobs(prefix);
      return blobs.filter((blob) => PHOTO_EXTENSION_REGEX.test(blob.pathname));
    } catch (error) {
      console.warn(`TripService: Unable to list photos for ${trip.slug}`, error);
      return [];
    }
  }
}

const TRIP_SERVICE_KEY = '__tripService';

type GlobalWithTripService = typeof globalThis & {
  [TRIP_SERVICE_KEY]?: TripService;
};

const globalWithTripService = globalThis as GlobalWithTripService;

/**
 * Singleton instance of TripService.
 * Ensures we only create one TripService per Node/Next worker.
 * During dev hot reloads this guard prevents multiple instances.
 */
export const tripService =
  globalWithTripService[TRIP_SERVICE_KEY] ?? (globalWithTripService[TRIP_SERVICE_KEY] = new TripService());

declare global {
  // eslint-disable-next-line no-var
  var __tripService: TripService | undefined;
}
