'use client';

import { motion, useReducedMotion } from 'motion/react';
import { HomeHeroTitle } from '@/components/HomeHeroTitle';
import { HomeNavigationGrid } from '@/components/HomeNavigationGrid';
import { SiteFooter } from '@/components/SiteFooter';
import { HOME_SHELL_CLASS } from '@/lib/styles';
import { HOME_ENTRANCE } from '@/constants/motion';

export default function Home() {
  const reduceMotion = useReducedMotion();

  const phaseTwoInitial = reduceMotion
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: HOME_ENTRANCE.cardsOffset };
  const phaseTwoTransition = reduceMotion
    ? { duration: 0 }
    : {
        duration: HOME_ENTRANCE.phaseTwoDuration,
        delay: HOME_ENTRANCE.phaseTwoDelay,
        ease: HOME_ENTRANCE.phaseTwoEase,
      };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="pt-8 pb-8 md:pt-10 md:pb-12">
        <div className={HOME_SHELL_CLASS}>
          <HomeHeroTitle />

          <motion.div
            initial={phaseTwoInitial}
            animate={{ opacity: 1, y: 0 }}
            transition={phaseTwoTransition}
            className="mt-6 grid gap-6 md:mt-8 md:grid-cols-2"
          >
            <HomeNavigationGrid />
          </motion.div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
