export default defineEventHandler((event) => {
  const url = getRequestURL(event)

  if (!url.pathname.startsWith('/api/reclamations')) return

  const token = getCookie(event, 'admin_session')
  const config = useRuntimeConfig()

  if (!token || !verifyToken(token, config.adminSecret)) {
    throw createError({ statusCode: 401, message: 'Non autorisé' })
  }
})
