<template>
  <section
    id="orbit-assistant"
    class="oa-panel"
    role="dialog"
    aria-label="Chat about Marvin's work"
    @keydown.esc="emit('close')"
  >
    <header class="oa-head">
      <span class="oa-avatar" :class="`is-${status}`">
        <img src="/profile.webp" alt="" width="36" height="36" decoding="async">
      </span>
      <div class="min-w-0">
        <p class="oa-title">Flo AI</p>
        <p class="oa-sub">{{ subtitle }}</p>
      </div>
      <button type="button" class="oa-close" aria-label="Close the chat" @click="emit('close')">
        <Icon icon="ph:x-bold" />
      </button>
    </header>

    <div ref="logEl" class="oa-log" role="log">
      <p v-for="message in messages" :key="message.id" class="oa-msg" :class="`oa-msg--${message.from}`">
        <template v-if="message.from === 'you'">{{ message.text }}</template>
        <template v-else v-for="(segment, i) in toReplySegments(message.text)" :key="i">
          <a
            v-if="segment.kind === 'link'"
            class="oa-link"
            :href="segment.href"
            :download="segment.download || undefined"
            :target="segment.href.startsWith('http') ? '_blank' : undefined"
            :rel="segment.href.startsWith('http') ? 'noopener noreferrer' : undefined"
          >{{ segment.text }}</a>
          <template v-else>{{ segment.text }}</template>
        </template>
      </p>
      <p v-if="pending" class="oa-msg oa-msg--bot oa-typing" aria-label="Typing">
        <i /><i /><i />
      </p>
    </div>

    <div class="oa-topics" role="group" aria-label="Topics">
      <button
        v-for="topic in ASSISTANT_TOPICS"
        :key="topic.label"
        type="button"
        class="oa-pill"
        :disabled="pending"
        @click="answerTopic(topic, topic.question)"
      >
        <Icon :icon="topic.icon" class="oa-pill__icon" />{{ topic.label }}
      </button>
    </div>

    <form class="oa-input" @submit.prevent="submit">
      <label for="oa-input" class="sr-only">Ask about Marvin</label>
      <input
        id="oa-input"
        ref="inputEl"
        v-model="draft"
        :maxlength="MAX_INPUT"
        autocomplete="off"
        enterkeyhint="send"
        placeholder="Ask about Marvin…"
      >
      <button type="submit" class="oa-send" :disabled="!draft.trim() || pending" aria-label="Send">
        <Icon icon="ph:paper-plane-right-fill" />
      </button>
    </form>
    <p class="oa-note">AI can be wrong. Don't share personal info.</p>
  </section>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  ASSISTANT_TOPICS,
  matchAssistantTopic,
  toReplySegments,
  type AssistantTopic
} from '~/utils/assistantTopics'
import { setPageScrollLock } from '~/utils/pageScrollLock'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

type Message = {
  id: number
  from: 'you' | 'bot'
  text: string
  /** Sent back to the AI as conversation context */
  inHistory: boolean
}

const MAX_INPUT = 500
const HISTORY_TURNS = 6
/* Same breakpoint as the full-screen sheet in the styles below */
const PHONE_QUERY = '(max-width: 639px)'
const WELCOME = "Hi. Ask me anything about Marvin's work, or pick a topic below."
const OFFLINE_REPLY = "I'm offline right now. Email Marvin at johnmarvinbautista18@gmail.com."
const RATE_LIMITED_REPLY = 'Too many messages. Try again in a minute.'

const messages = ref<Message[]>([{ id: 0, from: 'bot', text: WELCOME, inHistory: false }])
const draft = ref('')
const pending = ref(false)
const status = ref<'online' | 'typing' | 'offline'>('online')
const logEl = ref<HTMLElement | null>(null)
const inputEl = ref<HTMLInputElement | null>(null)

const subtitle = computed(
  () => ({ online: 'active now', typing: 'typing…', offline: 'offline right now' })[status.value]
)

let nextId = 1

function scrollToEnd() {
  nextTick(() => {
    if (logEl.value) logEl.value.scrollTop = logEl.value.scrollHeight
  })
}

function add(from: Message['from'], text: string, inHistory: boolean) {
  messages.value.push({ id: nextId++, from, text, inHistory })
  scrollToEnd()
  return messages.value[messages.value.length - 1]
}

function answerTopic(topic: AssistantTopic, asked: string) {
  if (pending.value) return
  add('you', asked, true)
  add('bot', topic.reply, true)
}

function history() {
  return messages.value
    .filter((message) => message.inHistory)
    .slice(-HISTORY_TURNS)
    .map((message) => ({ role: message.from === 'you' ? 'user' : 'assistant', content: message.text }))
}

async function submit() {
  const text = draft.value.trim()
  if (!text || pending.value) return
  draft.value = ''

  const topic = matchAssistantTopic(text)
  if (topic) {
    answerTopic(topic, text)
    return
  }

  const question = add('you', text, true)
  pending.value = true
  status.value = 'typing'
  scrollToEnd()
  try {
    const { reply } = await $fetch<{ reply: string }>('/api/assistant', {
      method: 'POST',
      body: { messages: history() }
    })
    status.value = 'online'
    add('bot', reply, true)
  } catch (error: any) {
    /* The unanswered question shouldn't confuse the next request */
    question.inHistory = false
    const rateLimited = (error?.statusCode ?? error?.response?.status) === 429
    status.value = rateLimited ? 'online' : 'offline'
    add('bot', rateLimited ? RATE_LIMITED_REPLY : OFFLINE_REPLY, false)
  } finally {
    pending.value = false
  }
}

function onOpenChange(open: boolean) {
  const phone = window.matchMedia(PHONE_QUERY).matches
  /* Full-screen on phones, so the page behind shouldn't scroll */
  setPageScrollLock(open && phone)
  if (!open) return
  scrollToEnd()
  /* On phones, focusing would throw the keyboard over the conversation */
  if (!phone) nextTick(() => inputEl.value?.focus())
}

watch(() => props.open, onOpenChange)

/* The panel first mounts when it first opens; the watcher only sees later changes */
onMounted(() => onOpenChange(props.open))

onBeforeUnmount(() => setPageScrollLock(false))
</script>

<style scoped>
/*
 * Ground Control (default): a white drafting sheet with navy linework and drafting-blue bubbles.
 * Space (html.dark): a navy card with a violet-to-cyan hairline and gradient bubbles.
 * No backdrop-filter, so the animated sky never re-blurs under it.
 */
.oa-panel {
  position: fixed;
  z-index: 45;
  right: 1.5rem;
  bottom: 5.6rem;
  display: flex;
  flex-direction: column;
  width: min(370px, calc(100vw - 2rem));
  height: min(560px, calc(100vh - 8rem));
  height: min(560px, calc(100dvh - 8rem));
  overflow: hidden;
  border: 1px solid rgb(15 27 45 / 0.55);
  border-radius: 6px;
  background: #fff;
  box-shadow: 5px 5px 0 rgb(15 27 45 / 0.08);
  color: rgb(var(--c-ink));
  font-size: 13.5px;
  line-height: 1.5;
}

html.dark .oa-panel {
  border: 1px solid transparent;
  border-radius: 18px;
  background:
    linear-gradient(180deg, #10163a, #0a0f26 60%) padding-box,
    linear-gradient(160deg, rgb(165 148 255 / 0.6), rgb(110 231 249 / 0.25) 45%, rgb(165 148 255 / 0.12)) border-box;
  box-shadow: 0 24px 50px -24px #000;
}

/* ---------- Header ---------- */
.oa-head {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.8rem 0.6rem 0.8rem 0.9rem;
  border-bottom: 1px solid rgb(15 27 45 / 0.14);
}

html.dark .oa-head {
  border-bottom-color: rgb(165 148 255 / 0.14);
}

.oa-avatar {
  position: relative;
  flex-shrink: 0;
}

.oa-avatar img {
  display: block;
  width: 36px;
  height: 36px;
  border: 1.5px solid rgb(15 27 45 / 0.8);
  border-radius: 50%;
  object-fit: cover;
}

html.dark .oa-avatar img {
  border-color: #a594ff;
}

/* Status dot: online, typing, offline */
.oa-avatar::after {
  content: '';
  position: absolute;
  right: -1px;
  bottom: -1px;
  width: 10px;
  height: 10px;
  border: 2px solid #fff;
  border-radius: 50%;
  background: #16a34a;
}

html.dark .oa-avatar::after {
  border-color: #10163a;
  background: #34d399;
}

.oa-avatar.is-typing::after {
  background: rgb(var(--c-solar));
}

.oa-avatar.is-offline::after {
  background: rgb(var(--c-muted));
}

.oa-title {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  line-height: 1.2;
}

.oa-sub {
  color: rgb(var(--c-muted));
  font-size: 11.5px;
}

.oa-close {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  margin-left: auto;
  flex-shrink: 0;
  border-radius: 999px;
  color: rgb(var(--c-muted));
  font-size: 13px;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.oa-close:hover {
  color: rgb(var(--c-ink));
  background: rgb(var(--c-nebula) / 0.1);
}

/* ---------- Conversation ---------- */
.oa-log {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0.9rem 0.9rem 0.6rem;
  scrollbar-width: thin;
}

.oa-msg {
  max-width: 86%;
  padding: 0.5rem 0.75rem;
  white-space: pre-line;
  overflow-wrap: anywhere;
  animation: oa-in 0.22s ease-out;
}

.oa-msg--bot {
  align-self: flex-start;
  border: 1px solid rgb(29 78 216 / 0.14);
  border-radius: 14px 14px 14px 4px;
  background: rgb(29 78 216 / 0.06);
}

html.dark .oa-msg--bot {
  border-color: transparent;
  background: rgb(165 148 255 / 0.13);
}

.oa-msg--you {
  align-self: flex-end;
  max-width: 80%;
  border-radius: 14px 14px 4px 14px;
  background: #1d4ed8;
  color: #fff;
}

html.dark .oa-msg--you {
  background: linear-gradient(135deg, #7a66f0 0%, #4f7cf0 55%, #1fb3d4 100%);
}

.oa-link {
  color: rgb(var(--c-ion));
  text-decoration: underline;
  text-decoration-color: rgb(var(--c-ion) / 0.4);
  text-underline-offset: 3px;
}

.oa-link:hover {
  text-decoration-color: currentColor;
}

.oa-typing {
  display: flex;
  gap: 4px;
  padding: 0.75rem 0.85rem;
}

.oa-typing i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgb(var(--c-muted));
  animation: oa-bounce 1s ease-in-out infinite;
}

.oa-typing i:nth-child(2) {
  animation-delay: 0.15s;
}

.oa-typing i:nth-child(3) {
  animation-delay: 0.3s;
}

/* ---------- Topics ---------- */
.oa-topics {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  padding: 0.25rem 0.9rem 0.7rem;
}

.oa-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.7rem;
  border: 1px solid rgb(15 27 45 / 0.25);
  border-radius: 999px;
  color: rgb(var(--c-ink));
  font-size: 12px;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.oa-pill__icon {
  color: rgb(var(--c-ion));
}

.oa-pill:hover:not(:disabled) {
  border-color: rgb(var(--c-ion));
  background: rgb(var(--c-ion) / 0.06);
}

html.dark .oa-pill {
  border-color: rgb(110 231 249 / 0.28);
  background: rgb(110 231 249 / 0.08);
  color: #bdf4fc;
}

html.dark .oa-pill:hover:not(:disabled) {
  border-color: rgb(110 231 249 / 0.6);
  background: rgb(110 231 249 / 0.14);
}

.oa-pill:disabled {
  opacity: 0.5;
  cursor: default;
}

/* ---------- Input ---------- */
.oa-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0.7rem;
  padding: 0.3rem 0.3rem 0.3rem 0.9rem;
  border: 1px solid rgb(15 27 45 / 0.22);
  border-radius: 999px;
  background: #f4f7fa;
  transition: border-color 0.2s ease;
}

html.dark .oa-input {
  border-color: rgb(165 148 255 / 0.22);
  background: #070b1c;
}

.oa-input:focus-within {
  border-color: rgb(var(--c-ion));
}

.oa-input input {
  flex: 1;
  min-width: 0;
  padding: 0.3rem 0;
  border: 0;
  outline: none;
  background: transparent;
  color: rgb(var(--c-ink));
  font: inherit;
}

.oa-input input::placeholder {
  color: rgb(var(--c-muted) / 0.8);
}

.oa-send {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #1d4ed8;
  color: #fff;
  font-size: 14px;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

html.dark .oa-send {
  background: linear-gradient(135deg, #7a66f0 0%, #4f7cf0 55%, #1fb3d4 100%);
}

.oa-send:hover:not(:disabled) {
  transform: scale(1.06);
}

.oa-send:disabled {
  opacity: 0.4;
}

.oa-note {
  padding: 0.45rem 0.9rem 0.6rem;
  color: rgb(var(--c-muted) / 0.85);
  font-size: 10.5px;
  text-align: center;
}

.oa-close:focus-visible,
.oa-pill:focus-visible,
.oa-send:focus-visible,
.oa-link:focus-visible {
  outline: 2px solid rgb(var(--c-ion));
  outline-offset: 2px;
}

/* Phones: a full-screen sheet */
@media (max-width: 639px) {
  .oa-panel,
  html.dark .oa-panel {
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
    border-radius: 0;
    padding-bottom: env(safe-area-inset-bottom);
  }

  html.dark .oa-panel {
    background: linear-gradient(180deg, #10163a, #0a0f26 60%);
  }

  /* 16px keeps iOS from zooming the page when the input is focused */
  .oa-input input {
    font-size: 16px;
  }
}

@keyframes oa-in {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
}

@keyframes oa-bounce {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  30% {
    transform: translateY(-3px);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .oa-msg,
  .oa-typing i {
    animation: none;
  }
}
</style>
