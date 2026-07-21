'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { BLOG_CONTENT } from '@/constants/content';
import { HOME_ENTRANCE } from '@/constants/motion';
import { HOME_SHELL_CLASS } from '@/lib/styles';
import type { BlogPostSummary } from '@/model/BlogPostSummary';
import { formatDateForDisplay } from '@/utils/dateUtils';

type BlogPageContentProps = {
  posts: BlogPostSummary[];
};

export function BlogPageContent({ posts }: BlogPageContentProps) {
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

  const listInitial = reduceMotion
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: HOME_ENTRANCE.cardsOffset };
  const listTransition = reduceMotion
    ? { duration: 0 }
    : {
        duration: HOME_ENTRANCE.phaseTwoDuration,
        delay: HOME_ENTRANCE.phaseTwoDelay,
        ease: HOME_ENTRANCE.phaseTwoEase,
      };

  return (
    <section className="pt-8 pb-12 md:pt-10 md:pb-16">
      <div className={HOME_SHELL_CLASS}>
        <div className="mx-auto w-full max-w-3xl">
          <motion.h1
            initial={titleInitial}
            animate={{ opacity: 1, y: 0 }}
            transition={titleTransition}
            className="font-[family-name:var(--font-display)] text-[clamp(2.75rem,8vw,4.5rem)] leading-[0.95] tracking-[-0.03em] text-foreground"
          >
            {BLOG_CONTENT.hero.title}
          </motion.h1>

          {posts.length === 0 ? (
            <p className="mt-8 text-foreground/55">No posts yet.</p>
          ) : (
            <motion.div
              initial={listInitial}
              animate={{ opacity: 1, y: 0 }}
              transition={listTransition}
              className="mt-6 md:mt-8"
            >
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  aria-label={`Read ${post.title}`}
                  className="group block border-b border-foreground/10 py-6 first:pt-0 last:border-b-0 md:py-8"
                >
                  <p className="text-[0.7rem] uppercase tracking-[0.22em] text-foreground/55 md:text-xs">
                    {formatDateForDisplay(post.date)}
                  </p>
                  <h2 className="mt-2 font-[family-name:var(--font-display)] text-[clamp(1.5rem,3.5vw,2.25rem)] leading-[1.05] tracking-[-0.03em] text-foreground transition-opacity group-hover:opacity-70">
                    {post.title}
                  </h2>
                  <p className="mt-3 max-w-2xl text-base leading-relaxed text-foreground/65 md:text-lg">
                    {post.excerpt}
                  </p>
                </Link>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
