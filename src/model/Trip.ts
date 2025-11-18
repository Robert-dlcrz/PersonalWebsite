import type { TripRecord } from './TripRecord';

/**
 * Lightweight trip summary used across listing pages.
 * Mirrors the fields found in `trips_index.json` plus the
 * derived `coverPhotoUrl` and other fields for rendering.
 */
export type Trip = TripRecord & {
  coverPhotoUrl: string;
};
