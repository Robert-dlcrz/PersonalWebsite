'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

import type { BlogTocSection } from '@/model/BlogPost';

type BlogTocRailProps = {
  sections: BlogTocSection[];
};

/**
 * Order the rail cares about is declared once, not recomputed per render.
 * Tuning these here keeps the component body focused on behavior.
 */
const OBSERVER_ROOT_MARGIN = '-40% 0px -55% 0px';
const OBSERVER_THRESHOLD = 0;

const DOT_BASE_SIZE = 8;
const DOT_ACTIVE_SCALE = 1.35;

/**
 * Floating, Stripe/Linear-style TOC rail.
 *
 * Behavior:
 *  - One dot per `##` section, rendered in document order.
 *  - As the user scrolls, `IntersectionObserver` on the actual `h2[id]` elements
 *    flags the heading closest to the viewport center as "active" — its dot
 *    glows and scales up.
 *  - Any dot that has ever been active stays filled (`passedIds`) so the rail
 *    reads like a progress track.
 *  - Clicking a dot/label smooth-scrolls to that heading.
 *  - Uses only `IntersectionObserver` (no scroll listeners), respects
 *    `prefers-reduced-motion`, and ships ~zero layout work per scroll event.
 */
export function BlogTocRail({ sections }: BlogTocRailProps) {
  const reduceMotion = useReducedMotion();

  const sectionIds = useMemo(() => sections.map((section) => section.id), [sections]);

  const [activeId, setActiveId] = useState<string | null>(sections[0]?.id ?? null);
  const passedIdsRef = useRef<Set<string>>(new Set());
  const [passedVersion, setPassedVersion] = useState(0);

  useEffect(() => {
    if (sectionIds.length === 0) {
      return;
    }

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length === 0) {
          return;
        }
        visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const topId = visible[0].target.id;

        setActiveId((current) => (current === topId ? current : topId));

        if (!passedIdsRef.current.has(topId)) {
          passedIdsRef.current.add(topId);
          setPassedVersion((n) => n + 1);
        }
      },
      { rootMargin: OBSERVER_ROOT_MARGIN, threshold: OBSERVER_THRESHOLD },
    );

    for (const el of elements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [sectionIds]);

  const handleNavigate = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      if (typeof history !== 'undefined' && history.replaceState) {
        history.replaceState(null, '', `#${id}`);
      }
    },
    [reduceMotion],
  );

  if (sections.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Table of contents">
      {/*
        Linear/Stripe-style persistent side-nav: one row per `##` section,
        label always visible and clickable, with a small colored dot on the
        left-edge guide line acting as a progress indicator. The active
        section's label is bold; previously-seen sections fade to a lighter
        gray than the upcoming ones so the rail reads like a scroll progress.
      */}
      <ol className="flex flex-col border-l border-foreground/10">
        {sections.map((section, index) => {
          const isActive = activeId === section.id;
          const isPassed = passedIdsRef.current.has(section.id);
          return (
            <li key={section.id} className="relative">
              <motion.span
                aria-hidden
                className="absolute -left-[5px] top-[0.75rem] inline-block rounded-full"
                style={{ width: DOT_BASE_SIZE, height: DOT_BASE_SIZE }}
                animate={{
                  scale: isActive && !reduceMotion ? DOT_ACTIVE_SCALE : 1,
                  backgroundColor:
                    isActive || isPassed
                      ? 'color-mix(in srgb, var(--foreground) 85%, transparent)'
                      : 'color-mix(in srgb, var(--foreground) 20%, transparent)',
                  boxShadow:
                    isActive && !reduceMotion
                      ? '0 0 0 4px color-mix(in srgb, var(--foreground) 14%, transparent)'
                      : '0 0 0 0 transparent',
                }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              />
              <a
                href={`#${section.id}`}
                onClick={(event) => {
                  event.preventDefault();
                  handleNavigate(section.id);
                }}
                className={`block py-1.5 pl-5 text-sm leading-5 transition-colors focus-visible:outline-none focus-visible:text-foreground ${
                  isActive
                    ? 'font-medium text-foreground'
                    : isPassed
                      ? 'text-foreground/70 hover:text-foreground'
                      : 'text-foreground/50 hover:text-foreground'
                }`}
                aria-current={isActive ? 'location' : undefined}
              >
                {section.text}
              </a>
              <span className="sr-only">{`Section ${index + 1} of ${sections.length}`}</span>
            </li>
          );
        })}
        {/* referenced only to re-render on passedVersion bump without exposing it as UI state */}
        <span className="sr-only" data-passed-version={passedVersion} />
      </ol>
    </nav>
  );
}
