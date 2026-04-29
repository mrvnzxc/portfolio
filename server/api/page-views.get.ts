type VercelOverviewResponse = {
  total?: number
}

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const token = config.vercelAnalyticsToken
  const projectId = config.vercelProjectId
  const teamId = config.vercelTeamId

  if (!token || !projectId) {
    return {
      total: null,
      source: 'missing_config'
    }
  }

  // Hobby plans only expose the latest 31 days.
  const to = new Date()
  const from = new Date(to)
  from.setDate(from.getDate() - 30)

  let resolvedTeamId = teamId

  const query = new URLSearchParams({
    projectId,
    from: from.toISOString(),
    to: to.toISOString()
  })
  if (resolvedTeamId) query.set('teamId', resolvedTeamId)

  try {
    const data = await $fetch<VercelOverviewResponse>(`https://vercel.com/api/web-analytics/overview?${query.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return {
      total: Number.isFinite(data?.total) ? data.total : 0,
      source: 'vercel'
    }
  } catch (error: any) {
    // Helpful while wiring credentials in local/dev.
    const message =
      error?.data?.error?.message ||
      error?.data?.message ||
      error?.message ||
      'unknown_error'
    return {
      total: null,
      source: `request_failed:${message}`
    }
  }
})
