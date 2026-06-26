const DESKTOP_MQ = '(min-width: 1024px)'

type GsapContext = { revert: () => void }

function runStackAnimation(
  gsap: typeof import('gsap').gsap,
  stage: HTMLElement,
  startOffset: (index: number) => number,
  end: string,
  pinSpacing: boolean | ((index: number, total: number) => boolean) = false,
) {
  const wrappers = gsap.utils.toArray<HTMLElement>('.projects-card-wrapper', stage)
  const cards = gsap.utils.toArray<HTMLElement>('.projects-stack-card', stage)

  wrappers.forEach((wrapper, index) => {
    wrapper.style.zIndex = String(index + 1)
  })

  wrappers.forEach((wrapper, index) => {
    const card = cards[index]
    if (!card) return

    let scale = 1
    let rotation = 0
    if (index !== cards.length - 1) {
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
        end,
        endTrigger: stage,
        scrub: true,
        pin: wrapper,
        pinSpacing:
          typeof pinSpacing === 'function'
            ? pinSpacing(index, cards.length)
            : pinSpacing,
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

      ctx = gsap.context(() => {
        if (isDesktop) {
          // Desktop — unchanged from the working version
          runStackAnimation(gsap, stage, (index) => 60 + 10 * index, 'bottom 550')
        } else {
          // Mobile — reserve document space after the last pin so Services is not covered
          const end = `bottom ${Math.round(window.innerHeight * 0.72)}`
          runStackAnimation(
            gsap,
            stage,
            (index) => 16 + 8 * index,
            end,
            (index, total) => index === total - 1,
          )
        }
      }, stage)

      ScrollTrigger.refresh()
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
