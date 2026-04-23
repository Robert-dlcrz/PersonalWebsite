'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

import { BlogTocRail } from '@/components/blog-layouts/BlogTocRail';
import { HOME_ENTRANCE } from '@/constants/motion';
import { HOME_SHELL_CLASS } from '@/lib/styles';
import type { BlogPost } from '@/model/BlogPost';

type BlogPageProps = {
  post: BlogPost;
  renderedBody: ReactNode;
};

/**
 * Format the ISO-ish frontmatter date ("2026-04-21") as a friendly display
 * string. We construct the Date in UTC-safe parts to avoid off-by-one issues
 * from local timezone interpretation of bare YYYY-MM-DD strings.
 */
function formatDate(iso: string): string {
  const [yearStr, monthStr, dayStr] = iso.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return iso;
  }
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/*
 * The blog entrance runs noticeably slower than the home page so the title
 * has room to "land" before the body reveals. Ordering preserved: hero
 * first, body (article + TOC) fades in only after the hero completes.
 */
const BLOG_HERO_DURATION = 0.9;
const BLOG_CONTENT_DELAY = 0.95;
const BLOG_CONTENT_DURATION = 0.75;

export function BlogPage({ post, renderedBody }: BlogPageProps) {
  const reduceMotion = useReducedMotion();

  const heroInitial = reduceMotion
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: HOME_ENTRANCE.titleOffset };
  const heroTransition = reduceMotion
    ? { duration: 0 }
    : {
        duration: BLOG_HERO_DURATION,
        ease: HOME_ENTRANCE.nameEase,
      };

  const contentInitial = reduceMotion
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: HOME_ENTRANCE.cardsOffset };
  const contentTransition = reduceMotion
    ? { duration: 0 }
    : {
        duration: BLOG_CONTENT_DURATION,
        delay: BLOG_CONTENT_DELAY,
        ease: HOME_ENTRANCE.phaseTwoEase,
      };

  return (
    <section className="pt-8 pb-16 md:pt-10 md:pb-24">
      <div className={HOME_SHELL_CLASS}>
        {/*
          Article stays visually centered in the shell at every viewport.
          On `xl+` the TOC floats in the right margin via `absolute left-full`
          so the article's own column width doesn't change — hero and body
          remain perfectly centered on the page.
        */}
        <div className="mx-auto w-full max-w-3xl">
          <motion.header
            initial={heroInitial}
            animate={{ opacity: 1, y: 0 }}
            transition={heroTransition}
          >
            <p className="text-[0.7rem] uppercase tracking-[0.22em] text-foreground/55 md:text-xs">
              {formatDate(post.date)}
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(2rem,5.5vw,3.75rem)] leading-[0.95] tracking-[-0.03em] text-foreground">
              {post.title}
            </h1>
            {post.excerpt ? (
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-foreground/70 md:text-xl">
                {post.excerpt}
              </p>
            ) : null}
          </motion.header>

          <motion.div
            initial={contentInitial}
            animate={{ opacity: 1, y: 0 }}
            transition={contentTransition}
            className="mt-12 md:mt-16"
          >
            {/*
              The article wrapper is `relative` so the TOC can absolutely
              position into the right margin via `left-full ml-8 w-44`. Total
              offset (11rem + 2rem = 13rem) fits inside the shell's right gutter
              at `xl+` so the rail never crowds the article or clips the viewport.
            */}
            <div className="relative">
              <aside className="pointer-events-none absolute top-0 left-full z-20 ml-8 hidden h-full w-44 xl:block">
                <div className="pointer-events-auto sticky top-24">
                  <BlogTocRail sections={post.sections} />
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
