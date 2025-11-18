/**
 * Fields that only exist inside the per-trip detail JSON.
 */
export type TripDetailRecord = {
  dateRange: {
    start: string;
    end: string;
  };
  tags?: string[];
};


