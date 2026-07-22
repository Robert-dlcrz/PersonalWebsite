'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';

import { HOME_CONTENT, PERSONAL_INFO } from '@/constants/content';
import { BLOG_ENTRANCE, HOME_ENTRANCE } from '@/constants/motion';
import { HOME_SHELL_CLASS } from '@/lib/styles';

type AboutMeEditorialSplitProps = {
  photoUrl: string;
};

export function AboutMeEditorialSplit({ photoUrl }: AboutMeEditorialSplitProps) {
  const reduceMotion = useReducedMotion();
  const { title, paragraphs } = HOME_CONTENT.aboutMe;

  const heroInitial = reduceMotion
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: HOME_ENTRANCE.titleOffset };
  const heroTransition = reduceMotion
    ? { duration: 0 }
    : {
        duration: BLOG_ENTRANCE.heroDuration,
        ease: HOME_ENTRANCE.nameEase,
      };

  const contentInitial = reduceMotion
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: HOME_ENTRANCE.cardsOffset };
  const contentTransition = reduceMotion
    ? { duration: 0 }
    : {
        duration: BLOG_ENTRANCE.contentDuration,
        delay: BLOG_ENTRANCE.contentDelay,
        ease: HOME_ENTRANCE.phaseTwoEase,
      };

  return (
    <section className="pt-8 pb-16 md:pt-10 md:pb-24">
      <div className={HOME_SHELL_CLASS}>
        <div className="grid items-start gap-10 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:gap-14 lg:gap-16">
          <motion.div
            initial={contentInitial}
            animate={{ opacity: 1, y: 0 }}
            transition={contentTransition}
            className="flex flex-col justify-center md:min-h-full md:py-4"
          >
            <h1 className="font-[family-name:var(--font-display)] text-[clamp(2rem,5.5vw,3.75rem)] leading-[0.95] tracking-[-0.03em] text-foreground">
              {title}
            </h1>
            <div className="mt-8 space-y-6 md:mt-10">
              {paragraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 48)}
                  className="max-w-3xl text-lg leading-relaxed text-foreground/85 md:text-xl"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={heroInitial}
            animate={{ opacity: 1, y: 0 }}
            transition={heroTransition}
            className="relative aspect-[4/5] w-full overflow-hidden bg-foreground/5"
          >
            <Image
              src={photoUrl}
              alt={PERSONAL_INFO.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 40vw"
              className="origin-center object-cover object-[center_50%] scale-[1.45] transition-transform duration-500 hover:scale-[1.5]"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
