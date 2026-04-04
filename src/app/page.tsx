'use client';

import { motion, useReducedMotion } from 'motion/react';
import { NavigationCard } from '@/components/NavigationCard';
import { HOME_CONTENT, NAVIGATION_CARDS, PERSONAL_INFO } from '@/constants/content';
import { HOME_SHELL_CLASS } from '@/lib/styles';
import { HOME_ENTRANCE } from '@/constants/motion';

export default function Home() {
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
          <motion.h1
            initial={titleInitial}
            animate={{ opacity: 1, y: 0 }}
            transition={titleTransition}
            className="font-[family-name:var(--font-display)] text-foreground text-center md:text-left"
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

          <motion.div
            initial={phaseTwoInitial}
            animate={{ opacity: 1, y: 0 }}
            transition={phaseTwoTransition}
            className="mt-6 grid gap-6 md:mt-8 md:grid-cols-2"
          >
            {NAVIGATION_CARDS.map((card) => {
              const IconComponent = card.icon;

              return (
                <NavigationCard
                  key={card.id}
                  href={card.href}
                  gradientClasses={card.gradientClasses}
                  icon={<IconComponent className="h-16 w-16 text-white" />}
                  title={card.title}
                  description={card.description}
                  ctaText={card.ctaText}
                  accentColor={card.accentColor}
                />
              );
            })}
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-foreground/10 py-8 mt-auto">
        <div className="mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-12 text-center text-sm text-foreground/40">
          <p>
            &copy; {new Date().getFullYear()} {PERSONAL_INFO.name}.{' '}
            {HOME_CONTENT.footer.text}
          </p>
        </div>
      </footer>
    </main>
  );
}
