export const HOME_ENTRANCE = {
  nameDuration: 0.4,
  phaseTwoDelay: 0.4,
  phaseTwoDuration: 0.6,
  titleOffset: 48,
  navbarOffset: -32,
  cardsOffset: 56,
  nameEase: [0.22, 1, 0.36, 1],
  phaseTwoEase: [0.16, 1, 0.3, 1],
} as const;

export const BLOG_ENTRANCE = {
  heroDuration: 0.45,
  contentDelay: 0.35,
  contentDuration: 0.45,
} as const;

export const NAVBAR_SCROLL = {
  hiddenOffset: '-100%',
  hideDuration: 0.5,
  showDuration: 0.5,
  visibilityEase: [0.4, 0, 0.2, 1],
  scrollThreshold: 72,
  scrollDelta: 8,
} as const;
