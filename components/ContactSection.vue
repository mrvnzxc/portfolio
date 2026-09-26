<template>
  <section id="contact" class="section-band-a">
    <div class="mx-auto max-w-6xl px-4">
      <div class="grid gap-12 items-stretch lg:grid-cols-2">
        <div class="reveal-on-scroll flex h-full flex-col">
          <h2 class="text-3xl font-semibold tracking-tight sm:text-4xl">Contact Me</h2>
          <p class="mt-3 text-base leading-relaxed text-muted">Have a project in mind or want to collaborate? Reach out—I reply quickly.</p>
          <form class="space-panel card-animated mt-6 flex flex-1 flex-col space-y-4 p-6" novalidate @submit.prevent="submitForm">
            <div class="space-y-1">
              <label for="name" class="block text-sm font-medium text-ink">Name</label>
              <NeonBorderReveal color="#6ee7f9" light-color="#1d4ed8" :duration="1.3" class="rounded-lg">
                <input
                  id="name"
                  v-model="form.name"
                  required
                  placeholder="Your name"
                  class="block w-full rounded-lg border-2 border-transparent bg-white/80 px-3 py-2 text-sm text-ink shadow-sm shadow-[#04060f]/[0.04] outline-none ring-0 transition placeholder:text-muted/80 focus:border-transparent focus-visible:ring-2 focus-visible:ring-ion/50 dark:bg-[#070b1c]/85 dark:shadow-black/20"
                >
              </NeonBorderReveal>
            </div>
            <div class="space-y-1">
              <label for="email" class="block text-sm font-medium text-ink">Email</label>
              <NeonBorderReveal color="#6ee7f9" light-color="#1d4ed8" :duration="1.3" class="rounded-lg">
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  class="block w-full rounded-lg border-2 border-transparent bg-white/80 px-3 py-2 text-sm text-ink shadow-sm shadow-[#04060f]/[0.04] outline-none ring-0 transition placeholder:text-muted/80 focus:border-transparent focus-visible:ring-2 focus-visible:ring-ion/50 dark:bg-[#070b1c]/85 dark:shadow-black/20"
                >
              </NeonBorderReveal>
            </div>
            <div class="space-y-1">
              <label for="message" class="block text-sm font-medium text-ink">Message</label>
              <NeonBorderReveal color="#6ee7f9" light-color="#1d4ed8" :duration="1.3" class="rounded-lg">
                <textarea
                  id="message"
                  v-model="form.message"
                  rows="4"
                  required
                  placeholder="Tell me about your project"
                  class="block w-full resize-none rounded-lg border-2 border-transparent bg-white/80 px-3 py-2 text-sm text-ink shadow-sm shadow-[#04060f]/[0.04] outline-none ring-0 transition placeholder:text-muted/80 focus:border-transparent focus-visible:ring-2 focus-visible:ring-ion/50 dark:bg-[#070b1c]/85 dark:shadow-black/20"
                ></textarea>
              </NeonBorderReveal>
            </div>
            <button type="submit" class="btn-thrust w-full"><Icon icon="ph:paper-plane-tilt-fill" />Send Message</button>
          </form>
        </div>
        <div class="reveal-on-scroll h-full">
        <div class="space-panel card-animated flex h-full flex-col justify-between p-6 text-sm text-muted">
            <div>
              <h3 class="mb-3 text-base font-semibold text-ink">Other ways to reach me</h3>
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <Icon class="h-5 w-5 text-ion" icon="ph:envelope-simple-fill" />
                  <span>johnmarvinbautista@gmail.com</span>
                </div>
                <div class="flex items-center gap-2">
                  <Icon class="h-5 w-5 text-nebula" icon="ph:phone-fill" />
                  <span>+63 909 695 3266</span>
                </div>
                <div class="flex items-center gap-2">
                  <Icon class="h-5 w-5 text-ink" icon="ph:github-logo-fill" />
                  <span>github.com/mrvnzxc</span>
                </div>
              </div>
            </div>
            <div class="mt-6 border-t border-nebula/15 pt-4 text-sm">
              <h4 class="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-ion">Availability</h4>
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
  const nameRegex = /^[a-zA-Z\s]+$/
  if (form.name.trim() && !nameRegex.test(form.name.trim())) {
    showToast({ title: 'Invalid name', message: 'Please enter a valid name (letters only).', variant: 'error' })
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
