type VisitsCountResponse = {
  data?: { pageviews?: number; visitors?: number }
}

/*
 * Lifetime production page views since Web Analytics was enabled, from Vercel's Web Analytics API
 * (https://vercel.com/docs/rest-api/web-analytics/counts-page-views).
 * Cached for 10 minutes so each visit doesn't wait on a call to Vercel.
 */
export default defineCachedEventHandler(
  async () => {
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

    const query = new URLSearchParams({ projectId })
    if (teamId) query.set('teamId', teamId)

    try {
      const response = await $fetch<VisitsCountResponse>(
        `https://api.vercel.com/v1/query/web-analytics/visits/count?${query.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const total = response?.data?.pageviews

      return {
        total: typeof total === 'number' && Number.isFinite(total) ? total : 0,
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
  },
  { name: 'page-views', maxAge: 60 * 10, swr: true }
)
