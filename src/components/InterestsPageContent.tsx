'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { INTERESTS_CONTENT } from '@/constants/content';
import { HOME_ENTRANCE } from '@/constants/motion';
import { HOME_SHELL_CLASS } from '@/lib/styles';
import type { Trip } from '@/model/Trip';

type InterestsPageContentProps = {
  trips: Trip[];
};

export function InterestsPageContent({ trips }: InterestsPageContentProps) {
  const reduceMotion = useReducedMotion();

  const titleInitial = reduceMotion
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: HOME_ENTRANCE.titleOffset };
  const titleTransition = reduceMotion
    ? { duration: 0 }
    : {
        duration: HOME_ENTRANCE.nameDuration,
        ease: HOME_ENTRANCE.nameEase,
      };

  const cardsInitial = reduceMotion
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: HOME_ENTRANCE.cardsOffset };
  const cardsTransition = reduceMotion
    ? { duration: 0 }
    : {
        duration: HOME_ENTRANCE.phaseTwoDuration,
        delay: HOME_ENTRANCE.phaseTwoDelay,
        ease: HOME_ENTRANCE.phaseTwoEase,
      };

  return (
    <section className="pt-8 pb-12 md:pt-10 md:pb-16">
      <div className={HOME_SHELL_CLASS}>
        <motion.h1
          initial={titleInitial}
          animate={{ opacity: 1, y: 0 }}
          transition={titleTransition}
          className="font-[family-name:var(--font-display)] text-foreground text-left"
        >
          <span className="hidden min-[1180px]:block whitespace-nowrap text-[clamp(4.8rem,10.6vw,14rem)] leading-[0.88] tracking-[-0.07em]">
            {INTERESTS_CONTENT.hero.title}
          </span>

          <span className="block min-[1180px]:hidden">
            <span className="block min-[480px]:hidden whitespace-nowrap text-[clamp(4.5rem,22vw,18rem)] leading-[0.76] tracking-[-0.05em]">
              {INTERESTS_CONTENT.hero.compactTitle}
            </span>
            <span className="hidden min-[480px]:block">
              <span className="block whitespace-nowrap text-[clamp(4.5rem,22vw,18rem)] leading-[0.76] tracking-[-0.05em]">
                {INTERESTS_CONTENT.hero.mediumLineOne}
              </span>
              <span className="block whitespace-nowrap text-[clamp(3.3rem,16vw,13rem)] leading-[0.84] tracking-[-0.05em]">
                {INTERESTS_CONTENT.hero.mediumLineTwo}
              </span>
            </span>
          </span>
        </motion.h1>

        <motion.div
          initial={cardsInitial}
          animate={{ opacity: 1, y: 0 }}
          transition={cardsTransition}
          className="mt-6 grid gap-6 md:mt-8 md:grid-cols-2 xl:grid-cols-3"
        >
          {trips.map((trip) => (
            <Link
              key={`${trip.year}-${trip.slug}`}
              href={`/interests/${trip.year}/${trip.slug}`}
              aria-label={`View details about ${trip.title}`}
              className="group block"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-foreground/5">
                <Image
                  src={trip.coverPhotoUrl}
                  alt={`${trip.title} cover`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5 dark:group-hover:bg-white/5" />
              </div>

              <div className="pt-4 pb-2">
                <h2 className="text-lg font-medium text-foreground md:text-xl">{trip.title}</h2>
                <p className="mt-1 text-[0.7rem] uppercase tracking-[0.22em] text-foreground/55 md:text-xs">
                  {trip.month} {trip.year} | {trip.location}
                </p>
              </div>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
