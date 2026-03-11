export default defineEventHandler(async (event) => {
  const { pin } = await readBody(event)
  const config = useRuntimeConfig()

  if (!pin || pin !== config.adminPin) {
    throw createError({ statusCode: 401, message: 'Code PIN incorrect' })
  }

  const token = createToken(config.adminSecret)

  setCookie(event, 'admin_session', token, {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 heures
  })

  return { success: true }
})
