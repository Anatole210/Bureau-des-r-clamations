export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  const method = getMethod(event)

  if (!url.pathname.startsWith('/api/reclamations')) return

  // Le POST est public (soumission du formulaire), GET et DELETE sont réservés à l'admin
  if (method === 'POST') return

  const token = getCookie(event, 'admin_session')
  const config = useRuntimeConfig()

  if (!token || !verifyToken(token, config.adminSecret)) {
    throw createError({ statusCode: 401, message: 'Non autorisé' })
  }
})
