import { z } from 'zod'

const schema = z.object({
  nom: z.string().min(1).max(100),
  prenom: z.string().min(1).max(100),
  objet: z.string().min(1).max(255),
  reclamation: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Données invalides', data: parsed.error.flatten() })
  }

  const db = getDb()
  const { nom, prenom, objet, reclamation } = parsed.data

  const [result] = await db.execute(
    'INSERT INTO reclamations (nom, prenom, objet, reclamation) VALUES (?, ?, ?, ?)',
    [nom, prenom, objet, reclamation]
  )

  return { success: true, id: (result as any).insertId }
})
