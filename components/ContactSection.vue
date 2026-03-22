<template>
  <section id="contact" class="section-band-a">
    <div class="mx-auto max-w-6xl px-4">
      <div class="grid gap-12 items-stretch lg:grid-cols-2">
        <div class="reveal-on-scroll flex h-full flex-col">
          <h2 class="text-3xl font-semibold tracking-tight sm:text-4xl">Contact Me</h2>
          <p class="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-300">Have a project in mind or want to collaborate? Reach out—I reply quickly.</p>
          <form class="card-animated mt-6 flex flex-1 flex-col space-y-4 rounded-2xl border border-sky-200/80 bg-gradient-to-br from-sky-100/65 via-blue-50/75 to-indigo-50/45 p-6 shadow-sm shadow-sky-900/[0.06] dark:border-slate-800 dark:bg-none dark:bg-slate-900/80 dark:shadow-slate-950/5" novalidate @submit.prevent="submitForm">
            <div class="space-y-1">
              <label for="name" class="block text-sm font-medium text-slate-800 dark:text-slate-100">Name</label>
              <NeonBorderReveal color="#22d3ee" light-color="#0284c7" :duration="1.3" class="rounded-lg">
                <input
                  id="name"
                  v-model="form.name"
                  required
                  placeholder="Your name"
                  class="block w-full rounded-lg border-2 border-transparent bg-white/80 px-3 py-2 text-sm text-slate-900 shadow-sm shadow-sky-900/[0.04] outline-none ring-0 transition placeholder:text-slate-500 focus:border-transparent focus-visible:ring-2 focus-visible:ring-sky-600/45 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 dark:shadow-slate-950/20 dark:focus-visible:ring-cyan-400/60"
                >
              </NeonBorderReveal>
            </div>
            <div class="space-y-1">
              <label for="email" class="block text-sm font-medium text-slate-800 dark:text-slate-100">Email</label>
              <NeonBorderReveal color="#22d3ee" light-color="#0284c7" :duration="1.3" class="rounded-lg">
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  class="block w-full rounded-lg border-2 border-transparent bg-white/80 px-3 py-2 text-sm text-slate-900 shadow-sm shadow-sky-900/[0.04] outline-none ring-0 transition placeholder:text-slate-500 focus:border-transparent focus-visible:ring-2 focus-visible:ring-sky-600/45 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 dark:shadow-slate-950/20 dark:focus-visible:ring-cyan-400/60"
                >
              </NeonBorderReveal>
            </div>
            <div class="space-y-1">
              <label for="message" class="block text-sm font-medium text-slate-800 dark:text-slate-100">Message</label>
              <NeonBorderReveal color="#22d3ee" light-color="#0284c7" :duration="1.3" class="rounded-lg">
                <textarea
                  id="message"
                  v-model="form.message"
                  rows="4"
                  required
                  placeholder="Tell me about your project"
                  class="block w-full resize-none rounded-lg border-2 border-transparent bg-white/80 px-3 py-2 text-sm text-slate-900 shadow-sm shadow-sky-900/[0.04] outline-none ring-0 transition placeholder:text-slate-500 focus:border-transparent focus-visible:ring-2 focus-visible:ring-sky-600/45 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 dark:shadow-slate-950/20 dark:focus-visible:ring-cyan-400/60"
                ></textarea>
              </NeonBorderReveal>
            </div>
            <button type="submit" class="inline-flex w-full items-center justify-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm ring-1 ring-transparent transition hover:-translate-y-0.5 hover:bg-primary-500 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-sky-100 dark:focus-visible:ring-offset-slate-900">Send Message</button>
          </form>
        </div>
        <div class="reveal-on-scroll h-full">
        <div class="card-animated flex h-full flex-col justify-between rounded-2xl border border-sky-200/80 bg-gradient-to-br from-sky-50/90 via-blue-50/70 to-indigo-50/40 p-6 text-sm text-slate-600 shadow-sm shadow-sky-900/[0.06] dark:border-slate-800 dark:bg-none dark:bg-slate-900/80 dark:text-slate-300 dark:shadow-slate-950/5">
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
            <div class="mt-6 border-t border-sky-200/70 pt-4 text-sm dark:border-slate-800">
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
