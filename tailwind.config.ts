import type { Config } from 'tailwindcss'

/** Theme-aware token: RGB triplet lives in custom.css (:root / html.dark), alpha comes from the utility. */
const token = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`

export default <Partial<Config>>{
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* Nebula violet */
        primary: {
          50: '#f3f2ff',
          100: '#e8e5ff',
          200: '#d2ccff',
          300: '#b3a8ff',
          400: '#9584fb',
          500: '#7a66f0',
          600: '#6349dc',
          700: '#5239b8',
          800: '#412e92',
          900: '#312570',
          950: '#1d1745'
        },
        void: '#04060f',
        ink: token('ink'),
        muted: token('muted'),
        ion: token('ion'),
        nebula: token('nebula'),
        solar: token('solar')
      },
      fontFamily: {
        /* Chakra Petch in space (dark), IBM Plex Sans Condensed in Ground Control (light) — set in custom.css */
        display: ['var(--font-display)'],
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
      }
    }
  }
}
