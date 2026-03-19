<template>
  <section id="projects" class="py-16 sm:py-20">
    <div class="mx-auto max-w-6xl px-4">
      <div class="mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4 reveal-on-scroll">
        <h2 class="mb-1 text-3xl font-semibold tracking-tight sm:text-4xl">Featured Project</h2>
        <span class="self-end text-right text-xs sm:self-auto sm:text-left sm:text-sm font-semibold uppercase tracking-wide text-primary-600">Built &amp; shipped</span>
      </div>
      <article class="hover-card card-animated overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/80 shadow-lg shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-900/80 reveal-on-scroll">
        <div class="grid gap-0 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1.1fr)]">
          <div class="space-y-4 p-6 sm:p-8">
            <h3 class="text-2xl font-semibold tracking-tight">Payroll &amp; Attendance Automation</h3>
            <p class="text-base leading-relaxed text-slate-600 dark:text-slate-300">
              Biometric and facial recognition attendance (URU 4500 + OpenCV) feeding straight into payroll exports with audit-ready logs.
            </p>
            <ul class="space-y-2 text-base text-slate-600 dark:text-slate-300">
              <li>Dual-factor verification (fingerprint + face) with anomaly alerts.</li>
              <li>Automated shift reconciliation and overtime calculations.</li>
              <li>Export-ready CSV/Excel and API hooks for ERP integration.</li>
            </ul>
            <div class="flex flex-wrap gap-2 pt-1">
              <span class="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 dark:bg-primary-950/50 dark:text-primary-200">Python</span>
              <span class="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 dark:bg-primary-950/50 dark:text-primary-200">Java</span>
              <span class="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 dark:bg-primary-950/50 dark:text-primary-200">PHP</span>
              <span class="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 dark:bg-primary-950/50 dark:text-primary-200">JavaScript</span>
              <span class="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 dark:bg-primary-950/50 dark:text-primary-200">Docker</span>
            </div>
            <div class="flex flex-wrap gap-3 pt-2">
              <a class="inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-transparent transition hover:-translate-y-0.5 hover:bg-primary-500 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-950" href="#contact">Discuss</a>
            </div>
          </div>
          <aside class="border-t border-slate-200/80 bg-slate-50/80 p-6 dark:border-slate-800 dark:bg-slate-900/70 md:border-l md:border-t-0 md:p-8">
            <div class="flex h-full flex-col justify-between rounded-2xl border border-slate-200/70 bg-slate-50/70 p-5 text-sm text-slate-600 shadow-sm shadow-slate-950/5 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300">
              <div>
                <h4 class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Highlight outcomes</h4>
                <ul class="mt-3 space-y-2">
                  <li>Reduced manual timekeeping errors by 85%.</li>
                  <li>Cut payroll prep time from days to minutes.</li>
                  <li>Improved compliance with exportable audit trails.</li>
                </ul>
              </div>
              <div class="mt-5 border-t border-slate-200/70 pt-4 dark:border-slate-800">
                <h4 class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Role</h4>
                <p class="mt-2">Architecture, backend, biometric integration, deployment.</p>
              </div>
            </div>
          </aside>
        </div>
      </article>
    </div>
  </section>
</template>
