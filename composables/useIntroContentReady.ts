/**
 * Set to true in app.vue when the terminal intro hands off and the portfolio
 * is revealed. Hero (and similar) can wait on this before starting typewriter UX.
 */
export function useIntroContentReady() {
  return useState('intro-content-ready', () => false)
}
