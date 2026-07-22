// ============================================
// SITE CONTENT CONSTANTS
// ============================================
// All text content for the website in one place
// Makes it easy to update content without touching UI code

import {
  GlobeAltIcon,
  PencilSquareIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

// ============================================
// PERSONAL INFO
// ============================================
export const PERSONAL_INFO = {
  name: 'Robert De La Cruz',
  title: 'Software Development Engineer',
  navbarTitle: {
    compact: 'Software Engineer | Traveler',
    medium: 'Software Development Engineer | Traveler',
    full: 'Software Development Engineer | Traveler | Adventurer',
  },
  domain: 'robertdelacruz.com',
} as const;

// ============================================
// HOMEPAGE CONTENT
// ============================================
export const HOME_CONTENT = {
  aboutMe: {
    title: 'About Me',
    paragraphs: [
      "I'm Robert De La Cruz, a Software Development Engineer at Amazon, where I'm part of the Ring organization. I build backend services and APIs that power customer-facing experiences, working on everything from critical infrastructure improvements and service modernizations to launching new product capabilities. I enjoy solving challenging engineering problems, driving projects from design to production, and exploring how AI can make software development more effective.",
      'Outside of work, I enjoy traveling, staying active, learning about personal finance, and spending weekends watching the Rams, Clippers, and Dodgers. This website is where I share my projects, experiences, and interests as I continue growing as a person and engineer.',
    ],
  },
  resumeButton: 'Download Resume',
  exploreMore: {
    title: 'Explore More',
  },
  footer: {
    text: 'Built with Next.js & Tailwind CSS.',
  },
} as const;

// ============================================
// NAVIGATION CARDS
// ============================================
export const NAVIGATION_CARDS = [
  {
    id: 'about',
    href: '/about-me',
    icon: UserIcon,
    gradientClasses: 'from-gray-900 to-black',
    title: 'About Me',
    description: 'Learn more about my background, experience, and what drives me.',
    ctaText: 'Read More',
    accentColor: 'text-slate-900 dark:text-slate-100',
  },
  {
    id: 'interests',
    href: '/interests',
    icon: GlobeAltIcon,
    gradientClasses: 'from-green-400 to-blue-500',
    title: 'Travel',
    description: 'Explore my journey around the world. From mountain peaks to hidden gems, discover the places I\'ve been and the adventures I\'ve had.',
    ctaText: 'View Adventures',
    accentColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'blog',
    href: '/blog',
    icon: PencilSquareIcon,
    gradientClasses: 'from-amber-500 to-orange-600',
    title: 'Blog',
    description: 'Notes on software engineering, AI workflows, and how I build.',
    ctaText: 'Read Posts',
    accentColor: 'text-amber-700 dark:text-amber-400',
  },
] as const;

// ============================================
// INTERESTS PAGE CONTENT
// ============================================
export const INTERESTS_CONTENT = {
  hero: {
    title: 'Travel & Adventures',
    compactTitle: 'Travel',
    mediumLineOne: 'Travel &',
    mediumLineTwo: 'Adventures',
  },
} as const;

// ============================================
// BLOG PAGE CONTENT
// ============================================
export const BLOG_CONTENT = {
  hero: {
    title: 'Blog',
    compactTitle: 'Blog',
  },
} as const;

