'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

import { BlogTableOfContentsRail } from '@/components/blog-layouts/BlogTableOfContentsRail';
import { BLOG_ENTRANCE, HOME_ENTRANCE } from '@/constants/motion';
import { HOME_SHELL_CLASS } from '@/lib/styles';
import type { BlogTableOfContentsSection } from '@/model/BlogTableOfContentsSection';
import { formatDateForDisplay } from '@/utils/dateUtils';

type BlogPagePost = {
  title: string;
  date: string;
  excerpt: string;
  sections: BlogTableOfContentsSection[];
};

type BlogPageProps = {
  post: BlogPagePost;
  renderedBody: ReactNode;
};

export function BlogPage({ post, renderedBody }: BlogPageProps) {
  const reduceMotion = useReducedMotion();
  const tableOfContentsSectionKey = post.sections.map((section) => section.id).join('\u0000');

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
        <div className="mx-auto w-full max-w-3xl">
          <motion.header
            initial={heroInitial}
            animate={{ opacity: 1, y: 0 }}
            transition={heroTransition}
          >
            <p className="text-[0.7rem] uppercase tracking-[0.22em] text-foreground/55 md:text-xs">
              {formatDateForDisplay(post.date)}
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(2rem,5.5vw,3.75rem)] leading-[0.95] tracking-[-0.03em] text-foreground">
              {post.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-foreground/70 md:text-xl">
              {post.excerpt}
            </p>
          </motion.header>

          <motion.div
            initial={contentInitial}
            animate={{ opacity: 1, y: 0 }}
            transition={contentTransition}
            className="mt-12 md:mt-16"
          >
            <div className="relative">
              <aside className="pointer-events-none absolute top-0 left-full z-20 ml-8 hidden h-full w-44 xl:block">
                <div className="pointer-events-auto sticky top-24">
                  <BlogTableOfContentsRail key={tableOfContentsSectionKey} sections={post.sections} />
                </div>
              </aside>
              <article>{renderedBody}</article>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
