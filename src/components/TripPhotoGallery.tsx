'use client';

import { useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';

// Load the lightbox only in the browser and only when needed after user interaction.
const Lightbox = dynamic(() => import('yet-another-react-lightbox'), {
  ssr: false,
});

type TripPhoto = {
  pathname: string;
  url: string;
};

type TripPhotoGalleryProps = {
  tripTitle: string;
  photos: TripPhoto[];
};

export function TripPhotoGallery({ tripTitle, photos }: TripPhotoGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const lastTriggerIndexRef = useRef<number | null>(null);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const slides = useMemo(() => photos.map((photo) => ({ src: photo.url })), [photos]);

  const openAtIndex = (index: number) => {
    lastTriggerIndexRef.current = index;
    setActiveIndex(index);
    setIsOpen(true);
  };

  const closeLightbox = () => {
    setIsOpen(false);
    const triggerIndex = lastTriggerIndexRef.current;
    if (triggerIndex !== null) {
      requestAnimationFrame(() => {
        buttonRefs.current[triggerIndex]?.focus();
      });
    }
  };

  return (
    <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
      <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Photo Highlights</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {photos.map((photo, index) => (
          <button
            key={photo.pathname}
            type="button"
            aria-label={`Open photo ${index + 1} of ${photos.length} from ${tripTitle}`}
            className="group relative h-96 w-full cursor-pointer overflow-hidden rounded-2xl shadow-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-lg focus:outline-none focus-visible:scale-[1.01] focus-visible:ring-4 focus-visible:ring-blue-400/60"
            onClick={() => openAtIndex(index)}
            ref={(element) => {
              buttonRefs.current[index] = element;
            }}
          >
            <Image
              src={photo.url}
              alt={`${tripTitle} photo ${index + 1}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105 group-focus-visible:scale-105"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </button>
        ))}
      </div>

      {isOpen && (
        <Lightbox
          open={isOpen}
          close={closeLightbox}
          index={activeIndex}
          slides={slides}
          carousel={{ finite: false }}
          on={{
            view: ({ index }) => {
              setActiveIndex((currentIndex) => (currentIndex === index ? currentIndex : index));
            },
          }}
        />
      )}
    </div>
  );
}
