/**
 * This is the raw trip metadata as it exists in the JSON blobs.
 *
 * No derived URLs or computed properties should live here; those are layered on top
 * (see `Trip`).
 */
export type TripRecord = {
  year: number;
  month: string;
  slug: string;
  title: string;
  location: string;
  description: string;
  photosPath: string;
};

