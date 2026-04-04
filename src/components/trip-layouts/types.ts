import type { TripWithMetadata } from '@/model/TripWithMetadata';

export type TripGalleryPhoto = {
  pathname: string;
  url: string;
};

export type TripPageLayoutProps = {
  trip: TripWithMetadata;
  galleryPhotos: TripGalleryPhoto[];
};
