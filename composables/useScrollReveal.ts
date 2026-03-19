import { onBeforeUnmount } from 'vue'

export function useScrollReveal() {
  let observer: IntersectionObserver | null = null

  const observeElements = (elements: Element[] | NodeListOf<Element>) => {
    if (process.server) return
    const list = Array.from(elements)
    if (!('IntersectionObserver' in window)) {
      list.forEach((el) => el.classList.add('is-visible'))
      return
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('is-visible', entry.isIntersecting)
        })
      },
      { threshold: 0.15 }
    )

    list.forEach((el) => observer?.observe(el))
  }

  onBeforeUnmount(() => observer?.disconnect())

  return { observeElements }
}
