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
    professional: {
      label: 'Professional:',
      text: "I'm a passionate software engineer specializing in building scalable, high-performance applications. With expertise in cloud architecture, full-stack development, and modern web technologies, I love solving complex problems and creating elegant solutions.",
    },
    personal: {
      label: 'Personal:',
      text: "Outside of coding, I'm driven by curiosity and a love for learning. I enjoy exploring new technologies, contributing to open-source projects, and sharing knowledge with the developer community.",
    },
    hobbies: {
      label: 'Hobbies:',
      text: "When I'm not at my desk, you'll find me traveling to new destinations, discovering incredible music, and seeking out adventures that push me outside my comfort zone. Life's too short not to explore!",
    },
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
    href: '/interests',
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

