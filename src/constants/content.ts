// ============================================
// SITE CONTENT CONSTANTS
// ============================================
// All text content for the website in one place
// Makes it easy to update content without touching UI code

import { GlobeAltIcon, MusicalNoteIcon } from '@heroicons/react/24/outline';

// ============================================
// PERSONAL INFO
// ============================================
export const PERSONAL_INFO = {
  name: 'Robert De La Cruz',
  title: 'Software Development Engineer',
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
    id: 'interests',
    href: '/interests',
    icon: GlobeAltIcon,
    gradientClasses: 'from-green-400 to-blue-500',
    title: 'Travel & Adventures',
    description: 'Explore my journey around the world. From mountain peaks to hidden gems, discover the places I\'ve been and the adventures I\'ve had.',
    ctaText: 'View Adventures',
    accentColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'music',
    href: '/music',
    icon: MusicalNoteIcon,
    gradientClasses: 'from-purple-400 to-pink-500',
    title: 'Music & Sounds',
    description: 'Dive into my musical world. Check out my favorite tracks, playlists, and connect with me on SoundCloud to explore the sounds that inspire me.',
    ctaText: 'Explore Music',
    accentColor: 'text-purple-600 dark:text-purple-400',
  },
] as const;

// ============================================
// INTERESTS PAGE CONTENT
// ============================================
export const INTERESTS_CONTENT = {
  hero: {
    title: 'Travel & Adventures',
    subtitle: "Life is about the journey, not just the destination. Here are some of my favorite adventures and the incredible places I've explored.",
  },
  backToHome: 'Back to Home',
  cta: {
    title: 'More Adventures Coming Soon!',
    description: 'This is just the beginning. Follow along as I continue to explore new destinations and create more unforgettable memories.',
    buttonText: 'Back to Home',
  },
} as const;

// Sample adventure data - replace with real data later
export const ADVENTURES = [
  {
    id: 1,
    title: 'Mountain Hiking in the Alps',
    location: 'Swiss Alps, Switzerland',
    date: 'Summer 2024',
    description: 'An unforgettable journey through breathtaking mountain trails, pristine lakes, and charming alpine villages.',
    image: '🏔️',
  },
  {
    id: 2,
    title: 'Coastal Road Trip',
    location: 'Pacific Coast Highway, California',
    date: 'Spring 2024',
    description: 'Cruising along the stunning California coastline, from San Francisco to San Diego, discovering hidden beaches and scenic viewpoints.',
    image: '🌊',
  },
  {
    id: 3,
    title: 'Urban Exploration',
    location: 'Tokyo, Japan',
    date: 'Fall 2023',
    description: 'Immersing in the vibrant culture, incredible food scene, and the perfect blend of tradition and modernity.',
    image: '🗼',
  },
  {
    id: 4,
    title: 'Desert Adventures',
    location: 'Sedona, Arizona',
    date: 'Winter 2023',
    description: 'Exploring red rock formations, hiking through canyons, and witnessing some of the most spectacular sunsets.',
    image: '🏜️',
  },
  {
    id: 5,
    title: 'Island Paradise',
    location: 'Hawaiian Islands',
    date: 'Summer 2023',
    description: 'Surfing, snorkeling, and soaking up the aloha spirit across multiple islands, each with its own unique charm.',
    image: '🏝️',
  },
  {
    id: 6,
    title: 'National Parks Tour',
    location: 'Utah & Arizona',
    date: 'Spring 2023',
    description: "Road tripping through Zion, Bryce Canyon, and the Grand Canyon - nature's most impressive masterpieces.",
    image: '🏕️',
  },
] as const;

// ============================================
// MUSIC PAGE CONTENT
// ============================================
export const MUSIC_CONTENT = {
  hero: {
    title: 'Music & Sounds',
    subtitle: 'Music is the soundtrack to life. Explore my curated playlists and discover the sounds that inspire me daily.',
    soundcloudButton: 'Follow on SoundCloud',
    soundcloudUrl: 'https://soundcloud.com', // Update with real URL
  },
  backToHome: 'Back to Home',
  about: {
    title: 'About My Music Taste',
    paragraphs: [
      'Music has always been a huge part of my life. From discovering new artists to creating the perfect playlist for every mood, I believe music has the power to transform any moment.',
      "My taste is eclectic – I appreciate everything from electronic and indie to jazz and hip-hop. What matters most is the vibe, the emotion, and how a track makes you feel. Whether I'm coding, traveling, or just relaxing, there's always a perfect soundtrack.",
      "Check out my SoundCloud to dive deeper into my musical journey, discover my latest finds, and see what's currently on repeat!",
    ],
  },
  cta: {
    soundcloud: {
      title: 'Visit My SoundCloud',
      description: 'Follow me on SoundCloud to stay updated with my latest tracks, favorites, and playlists.',
      buttonText: 'Open SoundCloud',
    },
    home: {
      title: 'Back to Home',
      description: 'Return to the homepage to explore more about me and my other interests.',
      buttonText: 'Go Home',
    },
  },
} as const;

// Sample playlist data - replace with real data later
export const PLAYLISTS = [
  {
    id: 1,
    title: 'Coding Sessions',
    genre: 'Electronic / Chill',
    trackCount: 42,
    description: 'The perfect soundtrack for deep focus coding sessions. Electronic beats and ambient sounds to keep you in the zone.',
    color: 'from-purple-400 to-pink-500',
    emoji: '💻',
  },
  {
    id: 2,
    title: 'Road Trip Vibes',
    genre: 'Indie / Alternative',
    trackCount: 38,
    description: 'Windows down, volume up. The ultimate collection of indie and alternative tracks for the open road.',
    color: 'from-orange-400 to-red-500',
    emoji: '🚗',
  },
  {
    id: 3,
    title: 'Sunset Sessions',
    genre: 'Lofi / Jazz',
    trackCount: 28,
    description: 'Smooth jazz and lofi beats perfect for unwinding as the day winds down. Your evening relaxation companion.',
    color: 'from-yellow-400 to-orange-500',
    emoji: '🌅',
  },
  {
    id: 4,
    title: 'Workout Energy',
    genre: 'Hip Hop / EDM',
    trackCount: 35,
    description: 'High-energy tracks to power through your workout. Bass-heavy beats that keep you moving and motivated.',
    color: 'from-green-400 to-teal-500',
    emoji: '💪',
  },
  {
    id: 5,
    title: 'Late Night Thoughts',
    genre: 'R&B / Soul',
    trackCount: 31,
    description: 'Smooth R&B and soulful melodies for those introspective late-night moments. Pure vibes only.',
    color: 'from-blue-400 to-indigo-500',
    emoji: '🌙',
  },
  {
    id: 6,
    title: 'Morning Coffee',
    genre: 'Acoustic / Folk',
    trackCount: 25,
    description: 'Start your day right with mellow acoustic tunes and folk melodies that pair perfectly with your morning brew.',
    color: 'from-amber-400 to-yellow-500',
    emoji: '☕',
  },
] as const;

