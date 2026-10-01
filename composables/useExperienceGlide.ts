type GsapMatchMedia = { revert: () => void }

/**
 * Flight Log motion: the stage pins below the header and the jobs glide sideways as the page scrolls,
 * settling on a job when scrolling stops. The scrubbed progress lands in `--xp-progress` on the stage
 * (the rail fill reads it); `onStep` hears the job index whenever it changes.
 *
 * With reduced motion nothing pins: the stage keeps its static layout, every job side by side.
 * `is-glide` is added by hand because the stage has no Vue class binding that could wipe it.
 */
export function useExperienceGlide(stageRef: { value: HTMLElement | null }, onStep: (index: number) => void) {
  let mm: GsapMatchMedia | null = null
  let themeObserver: MutationObserver | null = null

  function revertMotion() {
    mm?.revert()
    mm = null
  }

  function destroy() {
    themeObserver?.disconnect()
    themeObserver = null
    revertMotion()
  }

  /*
   * Space and Ground Control set type in different fonts and Ground Control adds title blocks, so a theme
   * switch moves everything below the hero. Rebuilding re-measures every ScrollTrigger on the page and
   * re-checks that a whole job still fits on screen in the new theme.
   * It waits for the switch's view transition to end (useTheme drops `theme-switching`): ScrollTrigger
   * scrolls to the top and back while it measures, and mid-transition the way back could be lost.
   */
  function rebuildOnThemeSwitch() {
    if (themeObserver) return
    const root = document.documentElement
    let dark = root.classList.contains('dark')
    let pending = false
    themeObserver = new MutationObserver(() => {
      if (root.classList.contains('dark') !== dark) {
        dark = !dark
        pending = true
      }
      if (!pending || root.classList.contains('theme-switching')) return
      pending = false
      void document.fonts.ready.then(() => requestAnimationFrame(() => void rebuild()))
    })
    themeObserver.observe(root, { attributes: true, attributeFilter: ['class'] })
  }

  /*
   * ScrollTrigger puts the page back where its scroll cache says. A snap that ran during the switch
   * (clicking the toggle counts as the end of a scroll) can leave that cache stale, so keep the real spot.
   */
  async function rebuild() {
    const y = window.scrollY
    await init()
    if (Math.abs(window.scrollY - y) > 1) window.scrollTo({ top: y, behavior: 'instant' })
  }

  async function init() {
    if (!import.meta.client) return

    revertMotion()

    const stage = stageRef.value
    const track = stage?.querySelector<HTMLElement>('.xp-track')
    const steps = (stage?.querySelectorAll('.xp-slide').length ?? 0) - 1
    if (!stage || !track || steps < 1) return

    try {
      const { gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      const headerHeight = () => document.getElementById('top-nav')?.offsetHeight ?? 0
      let step = -1
      const show = (progress: number) => {
        stage.style.setProperty('--xp-progress', String(progress))
        const next = Math.round(progress * steps)
        if (next !== step) onStep((step = next))
      }

      mm = gsap.matchMedia()
      /* The height floor sends landscape phones to the static layout; matchMedia re-runs when a rotation crosses it */
      mm.add('(prefers-reduced-motion: no-preference) and (min-height: 560px)', () => {
        /* The glide layout (full-height stage, one job per view) has to exist before ScrollTrigger measures it */
        stage.classList.add('is-glide')

        /* A sheet taller than the screen would be cut off while pinned; such screens keep the static layout */
        const content = stage.firstElementChild as HTMLElement | null
        if (content && content.offsetHeight > window.innerHeight - headerHeight()) {
          stage.classList.remove('is-glide')
          return
        }

        show(0)

        gsap.to(track, {
          xPercent: -100 * steps,
          ease: 'none',
          scrollTrigger: {
            trigger: stage,
            start: () => `top top+=${headerHeight()}`,
            end: () => `+=${Math.round(window.innerHeight * 0.9) * steps}`,
            pin: true,
            scrub: true,
            anticipatePin: 1,
            snap: { snapTo: 1 / steps, duration: { min: 0.2, max: 0.6 }, delay: 0.05, ease: 'power2.inOut' },
            invalidateOnRefresh: true,
            onUpdate: (self) => show(self.progress),
          },
        })

        return () => {
          stage.classList.remove('is-glide')
          stage.style.removeProperty('--xp-progress')
          step = -1
          onStep(steps)
        }
      })

      rebuildOnThemeSwitch()
      ScrollTrigger.refresh()
      // Web fonts swap in after first paint and change text heights; re-measure once they settle
      void document.fonts?.ready.then(() => ScrollTrigger.refresh())
    } catch (error) {
      console.error('[useExperienceGlide] init failed:', error)
      destroy()
    }
  }

  return { init, destroy }
}
