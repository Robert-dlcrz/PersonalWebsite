'use client';

import { motion, useReducedMotion } from 'motion/react';
import { PERSONAL_INFO } from '@/constants/content';
import { HOME_ENTRANCE } from '@/constants/motion';

export function HomeHeroTitle() {
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

  return (
    <motion.h1
      initial={titleInitial}
      animate={{ opacity: 1, y: 0 }}
      transition={titleTransition}
      className="font-[family-name:var(--font-display)] text-foreground text-left"
    >
      <span className="hidden min-[1180px]:block whitespace-nowrap text-[clamp(4.8rem,10.6vw,14rem)] leading-[0.88] tracking-[-0.07em]">
        {PERSONAL_INFO.name}
      </span>

      <span className="block min-[1180px]:hidden">
        <span className="block whitespace-nowrap text-[clamp(5rem,24vw,20rem)] leading-[0.76] tracking-[-0.05em]">
          Robert
        </span>
        <span className="block whitespace-nowrap text-[clamp(3.25rem,17vw,13.75rem)] leading-[0.82] tracking-[-0.05em]">
          De La Cruz
        </span>
      </span>
    </motion.h1>
  );
}
