/**
 * Set to true in app.vue when the warp loader handoff finishes and the portfolio
 * is revealed. Hero (and similar) can wait on this before starting typewriter UX.
 */
export function useIntroContentReady() {
  return useState('intro-content-ready', () => false)
}
