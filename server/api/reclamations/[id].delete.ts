export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const db = getDb()
  await db.execute('DELETE FROM reclamations WHERE id = ?', [id])
  return { success: true }
})
