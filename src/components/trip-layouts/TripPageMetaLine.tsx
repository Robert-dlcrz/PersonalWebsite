import { MapPinIcon } from '@heroicons/react/24/outline';
import type { TripWithMetadata } from '@/model/TripWithMetadata';

type TripPageMetaLineProps = {
  trip: TripWithMetadata;
  className?: string;
  /** Larger, higher-contrast text for overlays (cinematic). */
  variant?: 'default' | 'onImage';
};

export function TripPageMetaLine({ trip, className = '', variant = 'default' }: TripPageMetaLineProps) {
  const onImage = variant === 'onImage';
  return (
    <div
      className={`flex flex-wrap items-center gap-x-6 gap-y-2 ${onImage ? 'text-white/90' : 'text-foreground/70'} ${className}`}
    >
      <span className="inline-flex items-center gap-2 text-sm md:text-base">
        <MapPinIcon
          className={`h-5 w-5 shrink-0 ${onImage ? 'text-white/70' : 'text-foreground/45'}`}
          aria-hidden
        />
        {trip.location}
      </span>
      {trip.dateRange && (
        <span className="text-sm md:text-base tabular-nums">
          {trip.dateRange.start} – {trip.dateRange.end}
        </span>
      )}
    </div>
  );
}
