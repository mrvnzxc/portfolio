/*
 * The assistant's topic pills: canned answers shown instantly, without calling the AI.
 * They repeat facts from the page (and server/utils/portfolioKnowledge.ts), so update them together.
 */
export type AssistantTopic = {
  label: string
  icon: string
  /** Shown as the visitor's message when they tap the pill */
  question: string
  /** Typed shortcuts that get the same canned answer */
  aliases: string[]
  reply: string
}

export const ASSISTANT_TOPICS: AssistantTopic[] = [
  {
    label: 'Projects',
    icon: 'ph:rocket-launch-fill',
    question: 'What has Marvin built?',
    aliases: ['projects', 'project'],
    reply: [
      'Three projects:',
      '- Payroll with Attendance System (2025 capstone): biometric and facial-recognition attendance feeding automated payroll. Java, Python, Laravel, MySQL.',
      '- NDDU Siena AR Campus Navigation (2026): real-time AR wayfinding on campus. Nuxt, Supabase, WebXR.',
      '- ReedGrey Sales and Inventory (2026): multi-branch POS with live stock tracking. Nuxt/Vue, Tailwind, Supabase.',
      'Ask about any of them for details.'
    ].join('\n')
  },
  {
    label: 'Stack',
    icon: 'ph:stack-fill',
    question: "What's his tech stack?",
    aliases: ['stack', 'skills', 'tech', 'tech stack'],
    reply: [
      '- Languages: Java, Python, JavaScript, PHP, TypeScript, C++',
      '- Frameworks: Laravel, React / Next.js, Vue / Nuxt, Tailwind CSS, Spring Boot, Node.js, Flask, Express.js, Angular',
      '- Data & tooling: MySQL, PostgreSQL, Supabase, GraphQL, PostGraphile, Docker, GitHub Actions, OpenCV, Firebase, REST APIs'
    ].join('\n')
  },
  {
    label: 'Hiring?',
    icon: 'ph:briefcase-fill',
    question: 'Is he open to work?',
    aliases: ['hire', 'hiring', 'available', 'availability'],
    reply:
      "He works as a Junior Software Developer at Brigada Distribution Incorporated and is open to full-time, freelance and consulting work, remote included. Based in General Santos City, Philippines (UTC+8). He replies within 1 business day."
  },
  {
    label: 'Contact',
    icon: 'ph:envelope-simple-fill',
    question: 'How can I contact him?',
    aliases: ['contact', 'email'],
    reply: [
      '- Email: johnmarvinbautista18@gmail.com',
      '- Phone: +63 909 695 3266',
      '- GitHub: https://github.com/mrvnzxc',
      'Or use the form in the Contact section.'
    ].join('\n')
  },
  {
    label: 'CV',
    icon: 'ph:file-arrow-down-fill',
    question: 'Can I see his CV?',
    aliases: ['cv', 'resume', 'résumé'],
    reply: "Here's his CV: /cv.pdf"
  }
]

const HELP: AssistantTopic = {
  label: 'Help',
  icon: '',
  question: 'help',
  aliases: ['help', 'commands'],
  reply: "Ask me anything about Marvin's work, or tap a topic. Answers come from an AI and can be wrong."
}

/** Typed input like "projects" or "cv?" gets the canned answer instead of an AI call. */
export function matchAssistantTopic(input: string) {
  const key = input.trim().toLowerCase().replace(/[?!.]+$/, '')
  return [...ASSISTANT_TOPICS, HELP].find((topic) => topic.aliases.includes(key)) ?? null
}

export type ReplySegment =
  | { kind: 'text'; text: string }
  | { kind: 'link'; text: string; href: string; download?: boolean }

const LINK = /https?:\/\/[^\s]+|[\w.+-]+@[\w-]+(?:\.[\w-]+)+|\/cv\.pdf/g

/** Splits a reply into text and links (URLs, emails, the CV). */
export function toReplySegments(text: string): ReplySegment[] {
  const segments: ReplySegment[] = []
  let last = 0

  for (const match of text.matchAll(LINK)) {
    let token = match[0]
    const start = match.index ?? 0
    /* A sentence's closing punctuation isn't part of the URL */
    if (token.startsWith('http')) token = token.replace(/[.,;:!?)\]]+$/, '')
    if (start > last) segments.push({ kind: 'text', text: text.slice(last, start) })

    if (token === '/cv.pdf') segments.push({ kind: 'link', text: 'cv.pdf', href: token, download: true })
    else if (token.startsWith('http')) segments.push({ kind: 'link', text: token.replace(/^https?:\/\/(www\.)?/, ''), href: token })
    else segments.push({ kind: 'link', text: token, href: `mailto:${token}` })

    last = start + token.length
  }

  if (last < text.length) segments.push({ kind: 'text', text: text.slice(last) })
  return segments
}
