/*
 * Page scroll lock for dialogs. It goes on <html>, not <body>: custom.css gives <html>
 * overflow-x: clip, so a lock on <body> never reaches the window. The page behind a dialog
 * kept scrolling, and <body> became its own scroll box, which unpinned the sticky header.
 */
export function setPageScrollLock(locked: boolean) {
  if (typeof document === 'undefined') return
  const html = document.documentElement
  /* Callers may re-assert the same state; measuring again while locked would read no scrollbar */
  if (locked === (html.style.overflow === 'hidden')) return
  if (locked) {
    /* The scrollbar disappears with the lock; pad its width back so the page doesn't shift */
    const scrollbar = window.innerWidth - html.clientWidth
    html.style.paddingRight = scrollbar > 0 ? `${scrollbar}px` : ''
    html.style.overflow = 'hidden'
  } else {
    html.style.overflow = ''
    html.style.paddingRight = ''
  }
}
