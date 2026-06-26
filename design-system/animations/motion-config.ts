export const motionConfig = {
  fast: {
    duration: 0.15,
    ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
  },
  normal: {
    duration: 0.25,
    ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
  },
  slow: {
    duration: 0.4,
    ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
  },
  spring: {
    type: "spring" as const,
    stiffness: 300,
    damping: 25,
  },
} as const;
