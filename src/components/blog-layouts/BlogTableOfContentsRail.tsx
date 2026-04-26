'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

import { HOME_ENTRANCE } from '@/constants/motion';
import type { BlogTableOfContentsSection } from '@/model/BlogTableOfContentsSection';

type BlogTableOfContentsRailProps = {
  sections: BlogTableOfContentsSection[];
};

/**
 * Shrinks the observer’s viewport top and bottom so “in view” means a band
 * around the middle of the screen — better for picking the section the reader
 * is actually focused on than using the full window.
 */
const OBSERVER_ROOT_MARGIN = '-40% 0px -55% 0px';

/**
 * Fire as soon as any part of a heading crosses that (shrunken) viewport;
 * pairs with `OBSERVER_ROOT_MARGIN` to tune when the active table-of-contents
 * item switches.
 */
const OBSERVER_THRESHOLD = 0;

/** Unscaled dot diameter (px) for the rail marker beside each table-of-contents link. */
const DOT_BASE_SIZE = 8;

/** Scale applied to the dot while its section is active (when motion is allowed). */
const DOT_ACTIVE_SCALE = 1.35;

/** Dot fill for sections not yet reached or not active — low-contrast rail. */
const DOT_BG_MUTED = 'color-mix(in srgb, var(--foreground) 20%, transparent)';

/** Dot fill when the section is active or already passed (progress / emphasis). */
const DOT_BG_STRONG = 'color-mix(in srgb, var(--foreground) 85%, transparent)';

/** Soft ring color for the active dot’s outer glow (`box-shadow`). */
const DOT_GLOW_RING = 'color-mix(in srgb, var(--foreground) 14%, transparent)';

/**
 * Shared layout and focus styles for every table-of-contents link; state-specific
 * typography and color are added in `linkClassName`.
 */
const LINK_BASE_CLASS =
  'block py-1.5 pl-5 text-sm leading-5 transition-colors focus-visible:outline-none focus-visible:text-foreground';

/** Builds the full link `className` for active, already-read, or upcoming sections. */
function linkClassName(isActive: boolean, isPassed: boolean): string {
  if (isActive) {
    return `${LINK_BASE_CLASS} font-medium text-foreground`;
  }
  if (isPassed) {
    return `${LINK_BASE_CLASS} text-foreground/70 hover:text-foreground`;
  }
  return `${LINK_BASE_CLASS} text-foreground/50 hover:text-foreground`;
}

/**
 * Sticky sidebar table of contents for blog posts: one link per `##` section
 * (ids must match `rehype-slug` anchors in the rendered article). Uses an
 * `IntersectionObserver` to mark the section in view as active, tracks passed
 * sections for lighter progress styling, and scrolls smoothly to a heading on
 * click while updating the URL hash. Renders nothing when `sections` is empty.
 */
export function BlogTableOfContentsRail({ sections }: BlogTableOfContentsRailProps) {
  const reduceMotion = useReducedMotion();

  const sectionIds = useMemo(() => sections.map((section) => section.id), [sections]);
  const firstSectionId = sectionIds[0] ?? null;

  const [activeId, setActiveId] = useState<string | null>(firstSectionId);
  const [passedIds, setPassedIds] = useState<Set<string>>(() => new Set());

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
        setPassedIds((current) => (current.has(topId) ? current : new Set(current).add(topId)));
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
      globalThis.history.replaceState(null, '', `#${id}`);
    },
    [reduceMotion],
  );

  if (sections.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Table of contents">
      <ol className="flex flex-col border-l border-foreground/10">
        {sections.map((section, index) => {
          const isActive = activeId === section.id;
          const isPassed = passedIds.has(section.id);
          return (
            <li
              key={section.id}
              className="relative"
              aria-posinset={index + 1}
              aria-setsize={sections.length}
            >
              <motion.span
                aria-hidden
                className="absolute -left-[5px] top-[0.75rem] inline-block rounded-full"
                style={{ width: DOT_BASE_SIZE, height: DOT_BASE_SIZE }}
                animate={{
                  scale: isActive && !reduceMotion ? DOT_ACTIVE_SCALE : 1,
                  backgroundColor: isActive || isPassed ? DOT_BG_STRONG : DOT_BG_MUTED,
                  boxShadow:
                    isActive && !reduceMotion ? `0 0 0 4px ${DOT_GLOW_RING}` : '0 0 0 0 transparent',
                }}
                transition={{ duration: 0.25, ease: HOME_ENTRANCE.nameEase }}
              />
              <a
                href={`#${section.id}`}
                onClick={(event) => {
                  event.preventDefault();
                  handleNavigate(section.id);
                }}
                className={linkClassName(isActive, isPassed)}
                aria-current={isActive ? 'location' : undefined}
              >
                {section.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
