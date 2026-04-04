'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import { HOME_ENTRANCE } from '@/constants/motion';
import { TripPhotoGallery } from '@/components/TripPhotoGallery';
import { TripPageMetaLine } from '@/components/trip-layouts/TripPageMetaLine';
import type { TripPageLayoutProps } from '@/components/trip-layouts/types';
import { HOME_SHELL_CLASS } from '@/lib/styles';

export function TripPage({ trip, galleryPhotos }: TripPageLayoutProps) {
  const reduceMotion = useReducedMotion();

  const heroInitial = reduceMotion
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: HOME_ENTRANCE.titleOffset };
  const heroTransition = reduceMotion
    ? { duration: 0 }
    : {
        duration: HOME_ENTRANCE.nameDuration,
        ease: HOME_ENTRANCE.nameEase,
      };

  const contentInitial = reduceMotion
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: HOME_ENTRANCE.cardsOffset };
  const contentTransition = reduceMotion
    ? { duration: 0 }
    : {
        duration: HOME_ENTRANCE.phaseTwoDuration,
        delay: HOME_ENTRANCE.phaseTwoDelay,
        ease: HOME_ENTRANCE.phaseTwoEase,
      };

  return (
    <section className="pt-8 pb-12 md:pt-10 md:pb-16">
      <div className={HOME_SHELL_CLASS}>
        <motion.div initial={heroInitial} animate={{ opacity: 1, y: 0 }} transition={heroTransition}>
          <div className="relative min-h-[min(72vh,720px)] w-full overflow-hidden bg-foreground/5 md:min-h-[min(78vh,820px)]">
            <Image
              src={trip.coverPhotoUrl}
              alt={trip.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10"
              aria-hidden
            />
            <div className="absolute inset-0 flex flex-col justify-end p-6 pb-10 md:p-10 md:pb-14 lg:p-12 lg:pb-16">
              <p className="text-[0.7rem] uppercase tracking-[0.22em] text-white/70 md:text-xs">
                {trip.month} {trip.year}
              </p>
              <h1 className="mt-2 max-w-4xl font-[family-name:var(--font-display)] text-[clamp(2rem,5.5vw,3.75rem)] leading-[0.95] tracking-[-0.03em] text-white">
                {trip.title}
              </h1>
              <div className="mt-4">
                <TripPageMetaLine trip={trip} variant="onImage" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={contentInitial}
          animate={{ opacity: 1, y: 0 }}
          transition={contentTransition}
        >
          <div className="mt-8 space-y-8 md:mt-10">
            <p className="max-w-3xl text-lg leading-relaxed text-foreground/85 md:text-xl">
              {trip.description}
            </p>
            {galleryPhotos.length > 0 && (
              <TripPhotoGallery tripTitle={trip.title} photos={galleryPhotos} />
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
