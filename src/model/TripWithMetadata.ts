import type { Trip } from './Trip';
import type { TripDetailRecord } from './TripDetailRecord';

/**
 * Combined trip payload returned by the TripService detail endpoint.
 * It merges the summary metadata (Trip) with the per-trip detail fields.
 */
export type TripWithMetadata = Trip & TripDetailRecord;


