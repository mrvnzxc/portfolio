<template>
  <section id="contact" class="border-t border-slate-200/70 py-16 sm:py-20 dark:border-slate-800">
    <div class="mx-auto max-w-6xl px-4">
      <div class="grid gap-12 items-stretch lg:grid-cols-2">
        <div class="reveal-on-scroll flex h-full flex-col">
          <h2 class="text-3xl font-semibold tracking-tight sm:text-4xl">Contact Me</h2>
          <p class="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-300">Have a project in mind or want to collaborate? Reach out—I reply quickly.</p>
          <form class="card-animated mt-6 flex flex-1 flex-col space-y-4 rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-900/80" novalidate @submit.prevent="submitForm">
            <div class="space-y-1">
              <label for="name" class="block text-sm font-medium text-slate-800 dark:text-slate-100">Name</label>
              <input id="name" v-model="form.name" required placeholder="Your name" class="block w-full rounded-lg border-2 border-fuchsia-400/75 bg-white px-3 py-2 text-sm text-slate-900 shadow-[0_0_0_1px_rgba(244,114,182,0.2),0_0_20px_rgba(217,70,239,0.16)] outline-none ring-0 transition placeholder:text-slate-400 focus:border-violet-500 focus:shadow-[0_0_0_1px_rgba(168,85,247,0.35),0_0_26px_rgba(168,85,247,0.26)] dark:border-cyan-300/80 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 dark:shadow-[0_0_0_1px_rgba(34,211,238,0.28),0_0_24px_rgba(34,211,238,0.22)] dark:focus:border-cyan-200 dark:focus:shadow-[0_0_0_1px_rgba(103,232,249,0.4),0_0_28px_rgba(103,232,249,0.3)]">
            </div>
            <div class="space-y-1">
              <label for="email" class="block text-sm font-medium text-slate-800 dark:text-slate-100">Email</label>
              <input id="email" v-model="form.email" type="email" required placeholder="you@example.com" class="block w-full rounded-lg border-2 border-fuchsia-400/75 bg-white px-3 py-2 text-sm text-slate-900 shadow-[0_0_0_1px_rgba(244,114,182,0.2),0_0_20px_rgba(217,70,239,0.16)] outline-none ring-0 transition placeholder:text-slate-400 focus:border-violet-500 focus:shadow-[0_0_0_1px_rgba(168,85,247,0.35),0_0_26px_rgba(168,85,247,0.26)] dark:border-cyan-300/80 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 dark:shadow-[0_0_0_1px_rgba(34,211,238,0.28),0_0_24px_rgba(34,211,238,0.22)] dark:focus:border-cyan-200 dark:focus:shadow-[0_0_0_1px_rgba(103,232,249,0.4),0_0_28px_rgba(103,232,249,0.3)]">
            </div>
            <div class="space-y-1">
              <label for="message" class="block text-sm font-medium text-slate-800 dark:text-slate-100">Message</label>
              <textarea id="message" v-model="form.message" rows="4" required placeholder="Tell me about your project" class="block w-full rounded-lg border-2 border-fuchsia-400/75 bg-white px-3 py-2 text-sm text-slate-900 shadow-[0_0_0_1px_rgba(244,114,182,0.2),0_0_20px_rgba(217,70,239,0.16)] outline-none ring-0 transition placeholder:text-slate-400 focus:border-violet-500 focus:shadow-[0_0_0_1px_rgba(168,85,247,0.35),0_0_26px_rgba(168,85,247,0.26)] dark:border-cyan-300/80 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 dark:shadow-[0_0_0_1px_rgba(34,211,238,0.28),0_0_24px_rgba(34,211,238,0.22)] dark:focus:border-cyan-200 dark:focus:shadow-[0_0_0_1px_rgba(103,232,249,0.4),0_0_28px_rgba(103,232,249,0.3)]"></textarea>
            </div>
            <button type="submit" class="inline-flex w-full items-center justify-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm ring-1 ring-transparent transition hover:-translate-y-0.5 hover:bg-primary-500 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900">Send Message</button>
          </form>
        </div>
        <div class="reveal-on-scroll h-full">
          <div class="card-animated flex h-full flex-col justify-between rounded-2xl border border-slate-200/80 bg-white/80 p-6 text-sm text-slate-600 shadow-sm shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300">
            <div>
              <h3 class="mb-3 text-base font-semibold text-slate-900 dark:text-slate-50">Other ways to reach me</h3>
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <Icon class="h-5 w-5 text-emerald-500 dark:text-emerald-400" icon="ph:envelope-simple-fill" />
                  <span>johnmarvinbautista@gmail.com</span>
                </div>
                <div class="flex items-center gap-2">
                  <Icon class="h-5 w-5 text-sky-500 dark:text-sky-400" icon="ph:phone-fill" />
                  <span>+63 909 695 3266</span>
                </div>
                <div class="flex items-center gap-2">
                  <Icon class="h-5 w-5 text-slate-900 dark:text-slate-100" icon="ph:github-logo-fill" />
                  <span>github.com/mrvnzxc</span>
                </div>
              </div>
            </div>
            <div class="mt-6 border-t border-slate-200/70 pt-4 text-sm dark:border-slate-800">
              <h4 class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Availability</h4>
              <p class="mt-2">Open for full-time or consulting. Typical response within 1 business day.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { reactive } from 'vue'
import { useToast } from '~/composables/useToast'

const { showToast } = useToast()
const form = reactive({ name: '', email: '', message: '' })

const submitForm = async () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.email.trim())) {
    showToast({ title: 'Invalid email', message: 'Please enter a valid email address (e.g. you@example.com).', variant: 'error' })
    return
  }

  const formData = new FormData()
  formData.append('name', form.name)
  formData.append('email', form.email)
  formData.append('message', form.message)

  try {
    const response = await fetch('https://formspree.io/f/mdawnzeb', {
      method: 'POST',
      body: formData,
      headers: { Accept: 'application/json' }
    })

    if (!response.ok) throw new Error('request failed')

    showToast({ title: 'Message sent', message: 'Thanks, ' + (form.name || 'friend') + '! Your message has been sent.', variant: 'success' })
    form.name = ''
    form.email = ''
    form.message = ''
  } catch {
    showToast({ title: 'Something went wrong', message: 'There was a problem sending your message. Please try again later.', variant: 'error' })
  }
}
</script>
