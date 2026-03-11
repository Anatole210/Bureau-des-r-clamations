export default defineEventHandler(async () => {
  const db = getDb()
  const [rows] = await db.execute(
    'SELECT * FROM reclamations ORDER BY created_at DESC'
  )
  return rows
})
