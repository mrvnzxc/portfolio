let sharedObserver: IntersectionObserver | null = null

function ensureObserver(): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null
  }
  if (sharedObserver) return sharedObserver

  sharedObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
        } else {
          entry.target.classList.remove('is-visible')
        }
      })
    },
    {
      threshold: [0, 0.04, 0.12],
      rootMargin: '0px 0px 12% 0px',
    },
  )

  return sharedObserver
}

/**
 * Observes `.reveal-on-scroll` nodes: adds `is-visible` while intersecting,
 * removes when out of view so the reveal animation runs again on re-entry.
 */
export function useScrollReveal() {
  const observeElements = (elements: Element[] | NodeListOf<Element>) => {
    if (process.server) return

    const list = Array.from(elements)
    const obs = ensureObserver()
    if (!obs) {
      list.forEach((el) => el.classList.add('is-visible'))
      return
    }

    list.forEach((el) => obs.observe(el))
  }

  return { observeElements }
}
