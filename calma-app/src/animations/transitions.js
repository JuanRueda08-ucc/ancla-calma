export const EASE = [0.2, 0.8, 0.2, 1]
export const RISE_DISTANCE = 14
export const RISE_DURATION = 1.1

export const riseIn = (delay = 0) => ({
  initial: { opacity: 0, y: RISE_DISTANCE },
  animate: { opacity: 1, y: 0 },
  transition: { duration: RISE_DURATION, delay, ease: EASE },
})
