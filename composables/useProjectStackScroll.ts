const DESKTOP_MQ = '(min-width: 1024px)'

type GsapContext = { revert: () => void }

type StackEnd = { endTrigger: Element; end: string | (() => string) }

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
): StackEnd | null {
  const wrappers = gsap.utils.toArray<HTMLElement>('.projects-card-wrapper', stage)
  const cards = gsap.utils.toArray<HTMLElement>('.projects-stack-card', stage)

  wrappers.forEach((wrapper, index) => {
    wrapper.style.zIndex = String(index + 1)
  })

  const lastIndex = cards.length - 1
  if (lastIndex < 0) return null

  /* Where the whole stack lets go — reused to release the sticky heading at the same instant */
  const stackEnd: StackEnd =
    end === null
      ? { endTrigger: wrappers[lastIndex], end: () => `top ${startOffset(lastIndex)}` }
      : { endTrigger: stage, end }

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
        start: () => `top ${startOffset(index)}`,
        ...stackEnd,
        scrub: true,
        pin: wrapper,
        pinSpacing: false,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    })
  })

  return stackEnd
}

export function useProjectStackScroll(
  stageRef: { value: HTMLElement | null },
  headingRef?: { value: HTMLElement | null },
) {
  let ctx: GsapContext | null = null
  let mediaQuery: MediaQueryList | null = null

  function destroy() {
    ctx?.revert()
    ctx = null
    headingRef?.value?.classList.remove('is-stack-released')
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
      /* ...and below the section title, which stays parked there while the stack runs */
      const heading = headingRef?.value ?? null
      const headingClearance = () => (heading ? heading.offsetHeight + 14 : 0)

      ctx = gsap.context(() => {
        let stackEnd: StackEnd | null
        if (isDesktop) {
          // Desktop — unchanged from the working version
          stackEnd = runStackAnimation(
            gsap,
            stage,
            (index) => Math.max(60, headerHeight + 12) + headingClearance() + 10 * index,
            'bottom 550',
          )
        } else {
          // Mobile / tablet — same scale & tilt; stack releases as the last card arrives
          stackEnd = runStackAnimation(
            gsap,
            stage,
            (index) => headerHeight + 12 + headingClearance() + 8 * index,
            null,
          )
        }

        if (heading && stackEnd) {
          /* Fade the title out exactly when the cards let go, so none scrolls up behind it */
          ScrollTrigger.create({
            trigger: stackEnd.endTrigger,
            start: stackEnd.end,
            invalidateOnRefresh: true,
            onEnter: () => heading.classList.add('is-stack-released'),
            onLeaveBack: () => heading.classList.remove('is-stack-released'),
          })
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
