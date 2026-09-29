export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

type Provider = {
  name: string
  url: string
  apiKey: string
  model: string
  extraBody?: Record<string, unknown>
}

type ChatCompletion = {
  choices?: { message?: { content?: string | null } }[]
}

const REQUEST_TIMEOUT_MS = 15_000

/** Free tiers, in the order we try them. Both speak the OpenAI chat-completions format. */
function configuredProviders(): Provider[] {
  const config = useRuntimeConfig()
  const providers: Provider[] = []

  if (config.groqApiKey) {
    const model = config.groqModel
    providers.push({
      name: 'groq',
      url: 'https://api.groq.com/openai/v1/chat/completions',
      apiKey: config.groqApiKey,
      model,
      // gpt-oss reasons before it answers; low effort keeps replies quick and inside the free token budget
      extraBody: model.includes('gpt-oss') ? { reasoning_effort: 'low' } : undefined
    })
  }

  if (config.geminiApiKey) {
    providers.push({
      name: 'gemini',
      url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
      apiKey: config.geminiApiKey,
      model: config.geminiModel
    })
  }

  return providers
}

export function hasChatProvider() {
  return configuredProviders().length > 0
}

/**
 * Asks each provider in turn and returns the first non-empty reply.
 * Any failure (quota spent, outage, timeout, bad model name) moves on to the next one.
 */
export async function completeChat(messages: ChatMessage[]): Promise<string> {
  for (const provider of configuredProviders()) {
    try {
      const data = await $fetch<ChatCompletion>(provider.url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${provider.apiKey}` },
        body: {
          model: provider.model,
          messages,
          temperature: 0.3,
          max_tokens: 700,
          ...provider.extraBody
        },
        timeout: REQUEST_TIMEOUT_MS,
        retry: 0
      })
      const text = data?.choices?.[0]?.message?.content?.trim()
      if (text) return text
      console.warn(`[assistant] ${provider.name} sent an empty reply`)
    } catch (error: any) {
      const status = error?.statusCode ?? error?.status ?? 'network'
      const message = error?.data?.error?.message ?? error?.message ?? 'unknown error'
      console.warn(`[assistant] ${provider.name} failed (${status}): ${message}`)
    }
  }
  throw new Error('No chat provider answered')
}
