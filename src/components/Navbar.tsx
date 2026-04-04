'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { PERSONAL_INFO } from '@/constants/content';
import { HOME_SHELL_CLASS } from '@/lib/styles';
import { HOME_ENTRANCE } from '@/constants/motion';
import { motion, useAnimationControls, useReducedMotion } from 'motion/react';

const navLinkClass =
  'text-xs font-medium uppercase tracking-widest text-foreground/70 hover:text-foreground transition-colors';

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const controls = useAnimationControls();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      controls.set({ opacity: 1, y: 0 });
      return;
    }

    controls.set({ opacity: 0, y: HOME_ENTRANCE.navbarOffset });
    void controls.start({
      opacity: 1,
      y: 0,
      transition: {
        duration: HOME_ENTRANCE.phaseTwoDuration,
        delay: HOME_ENTRANCE.phaseTwoDelay,
        ease: HOME_ENTRANCE.phaseTwoEase,
      },
    });
  }, [controls, pathname, reduceMotion]);

  return (
    <motion.header
      initial={reduceMotion ? false : { opacity: 0, y: HOME_ENTRANCE.navbarOffset }}
      animate={controls}
      className="sticky top-0 z-50 border-b border-foreground/10 bg-background/95 backdrop-blur-sm"
    >
      <div className={`${HOME_SHELL_CLASS} flex items-center justify-between gap-4 py-4`}>
        <Link
          href="/"
          className="text-sm font-medium text-foreground hover:opacity-80 transition-opacity"
          onClick={() => setMenuOpen(false)}
        >
          <span className="inline md:hidden">{PERSONAL_INFO.navbarTitle.compact}</span>
          <span className="hidden md:inline lg:hidden">{PERSONAL_INFO.navbarTitle.medium}</span>
          <span className="hidden lg:inline">{PERSONAL_INFO.navbarTitle.full}</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          <Link href="/interests" className={navLinkClass}>
            About
          </Link>
          <Link href="/interests" className={navLinkClass}>
            Travel
          </Link>
          <Link href="/music" className={navLinkClass}>
            Music
          </Link>
        </nav>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-foreground md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {menuOpen ? (
        <nav
          id="mobile-nav"
          className={`${HOME_SHELL_CLASS} flex flex-col gap-4 border-t border-foreground/10 py-4 md:hidden`}
          aria-label="Mobile main"
        >
          <Link
            href="/interests"
            className={navLinkClass}
            onClick={() => setMenuOpen(false)}
          >
            About
          </Link>
          <Link
            href="/interests"
            className={navLinkClass}
            onClick={() => setMenuOpen(false)}
          >
            Travel
          </Link>
          <Link
            href="/music"
            className={navLinkClass}
            onClick={() => setMenuOpen(false)}
          >
            Music
          </Link>
        </nav>
      ) : null}
    </motion.header>
  );
}
