import { ASSISTANT_SYSTEM_PROMPT } from '../utils/assistantPrompt'
import { completeChat, hasChatProvider, type ChatMessage } from '../utils/llmProviders'

const MAX_USER_CHARS = 500
const MAX_REPLY_CHARS = 1500
/* Only the latest turns ride along: enough for follow-ups, small enough for Groq's per-minute token budget */
const MAX_HISTORY = 6

/*
 * Per-visitor speed bump. Each serverless instance keeps its own count, so this isn't airtight;
 * the providers' free quotas are the real ceiling, and with no billing attached nothing can cost money.
 */
const WINDOW_MS = 5 * 60_000
const MAX_PER_WINDOW = 15
const recentByIp = new Map<string, number[]>()

function isRateLimited(ip: string) {
  const now = Date.now()
  const recent = (recentByIp.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  const limited = recent.length >= MAX_PER_WINDOW
  if (!limited) recent.push(now)
  recentByIp.set(ip, recent)

  if (recentByIp.size > 1000) {
    for (const [key, times] of recentByIp) {
      if (!times.length || now - times[times.length - 1] >= WINDOW_MS) recentByIp.delete(key)
    }
  }
  return limited
}

/** Accepts only well-formed user/assistant turns ending on the visitor's question; null means reject. */
function parseHistory(body: unknown): ChatMessage[] | null {
  const raw = (body as { messages?: unknown } | null)?.messages
  if (!Array.isArray(raw) || !raw.length) return null

  const messages: ChatMessage[] = []
  for (const item of raw.slice(-MAX_HISTORY)) {
    const role = item?.role
    const content = typeof item?.content === 'string' ? item.content.trim() : ''
    if ((role !== 'user' && role !== 'assistant') || !content) return null
    if (role === 'user' && content.length > MAX_USER_CHARS) return null
    messages.push({ role, content: content.slice(0, MAX_REPLY_CHARS) })
  }
  return messages[messages.length - 1].role === 'user' ? messages : null
}

/*
 * gpt-oss on Groq sometimes sends several finished replies glued together with no space
 * ("...refresher.Your curiosity is adorable..."). The first one is a whole answer; keep it.
 */
const GLUED_REPLY = /(?<=[a-z0-9)'"’”][.!?])(?=[A-Z][a-z])/

/** The chat shows plain text; drop the markdown models slip in anyway. */
function toPlainText(reply: string) {
  return reply
    .split(GLUED_REPLY)[0]
    .replace(/\*\*|__|`/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[*•]\s+/gm, '- ')
    .trim()
}

export default defineEventHandler(async (event) => {
  const messages = parseHistory(await readBody(event).catch(() => null))
  if (!messages) {
    throw createError({ statusCode: 400, statusMessage: 'Bad request' })
  }

  if (!hasChatProvider()) {
    throw createError({ statusCode: 503, statusMessage: 'Assistant offline' })
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  if (isRateLimited(ip)) {
    throw createError({ statusCode: 429, statusMessage: 'Too many messages' })
  }

  try {
    const reply = await completeChat([{ role: 'system', content: ASSISTANT_SYSTEM_PROMPT }, ...messages])
    return { reply: toPlainText(reply) }
  } catch {
    throw createError({ statusCode: 503, statusMessage: 'Assistant offline' })
  }
})
