'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { PERSONAL_INFO, HOME_CONTENT } from '@/constants/content';

const navLinkClass =
  'text-xs font-medium uppercase tracking-widest text-foreground/70 hover:text-foreground transition-colors';

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-foreground/10 bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4 md:px-10 lg:px-12">
        <Link
          href="/"
          className="text-sm font-medium text-foreground hover:opacity-80 transition-opacity"
          onClick={() => setMenuOpen(false)}
        >
          {PERSONAL_INFO.name}
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          <Link href="/interests" className={navLinkClass}>
            Interests
          </Link>
          <Link href="/music" className={navLinkClass}>
            Music
          </Link>
          <a
            href="/resume.pdf"
            download
            className={navLinkClass}
          >
            Resume
          </a>
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
          className="mx-auto flex w-full max-w-7xl flex-col gap-4 border-t border-foreground/10 px-6 py-4 md:hidden md:px-10 lg:px-12"
          aria-label="Mobile main"
        >
          <Link
            href="/interests"
            className={navLinkClass}
            onClick={() => setMenuOpen(false)}
          >
            Interests
          </Link>
          <Link
            href="/music"
            className={navLinkClass}
            onClick={() => setMenuOpen(false)}
          >
            Music
          </Link>
          <a
            href="/resume.pdf"
            download
            className={navLinkClass}
            onClick={() => setMenuOpen(false)}
          >
            {HOME_CONTENT.resumeButton}
          </a>
        </nav>
      ) : null}
    </header>
  );
}
