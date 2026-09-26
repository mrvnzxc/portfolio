const DESKTOP_MQ = '(min-width: 1024px)'

type GsapContext = { revert: () => void }

/**
 * `end` = pixel end on the stage bottom (desktop).
 * `end` = null (mobile): the stack releases the moment the last card reaches its slot, and the last
 * card itself is never pinned — it stays in normal flow, so no empty runway is needed and nothing
 * is left floating over the next section.
 */
function runStackAnimation(
  gsap: typeof import('gsap').gsap,
  stage: HTMLElement,
  startOffset: (index: number) => number,
  end: string | null,
) {
  const wrappers = gsap.utils.toArray<HTMLElement>('.projects-card-wrapper', stage)
  const cards = gsap.utils.toArray<HTMLElement>('.projects-stack-card', stage)

  wrappers.forEach((wrapper, index) => {
    wrapper.style.zIndex = String(index + 1)
  })

  const lastIndex = cards.length - 1

  wrappers.forEach((wrapper, index) => {
    const card = cards[index]
    if (!card) return
    if (end === null && index === lastIndex) return

    let scale = 1
    let rotation = 0
    if (index !== lastIndex) {
      scale = 0.9 + 0.025 * index
      rotation = -10
    }

    gsap.to(card, {
      scale,
      rotationX: rotation,
      transformOrigin: 'top center',
      ease: 'none',
      scrollTrigger: {
        trigger: wrapper,
        start: `top ${startOffset(index)}`,
        ...(end === null
          ? { endTrigger: wrappers[lastIndex], end: `top ${startOffset(lastIndex)}` }
          : { endTrigger: stage, end }),
        scrub: true,
        pin: wrapper,
        pinSpacing: false,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    })
  })
}

export function useProjectStackScroll(stageRef: { value: HTMLElement | null }) {
  let ctx: GsapContext | null = null
  let mediaQuery: MediaQueryList | null = null

  function destroy() {
    ctx?.revert()
    ctx = null
  }

  async function init() {
    if (!import.meta.client) return

    destroy()

    const stage = stageRef.value
    if (!stage) return

    try {
      const { gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      const isDesktop = window.matchMedia(DESKTOP_MQ).matches
      /* Cards pin just below the sticky header */
      const headerHeight = document.getElementById('top-nav')?.offsetHeight ?? 0

      ctx = gsap.context(() => {
        if (isDesktop) {
          // Desktop — unchanged from the working version
          runStackAnimation(gsap, stage, (index) => Math.max(60, headerHeight + 12) + 10 * index, 'bottom 550')
        } else {
          // Mobile / tablet — same scale & tilt; stack releases as the last card arrives
          runStackAnimation(gsap, stage, (index) => headerHeight + 12 + 8 * index, null)
        }
      }, stage)

      ScrollTrigger.refresh()
      // Web fonts swap in after first paint and change text heights; re-measure once they settle
      void document.fonts?.ready.then(() => ScrollTrigger.refresh())
    } catch (error) {
      console.error('[useProjectStackScroll] init failed:', error)
      destroy()
    }
  }

  function bind() {
    if (!import.meta.client) return () => {}

    mediaQuery = window.matchMedia(DESKTOP_MQ)
    const onChange = () => {
      void init()
    }

    mediaQuery.addEventListener('change', onChange)

    return () => {
      mediaQuery?.removeEventListener('change', onChange)
      destroy()
    }
  }

  return { init, destroy, bind }
}
