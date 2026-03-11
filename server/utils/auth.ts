import { createHmac, timingSafeEqual } from 'crypto'

export function createToken(secret: string): string {
  const payload = Date.now().toString()
  const sig = createHmac('sha256', secret).update(payload).digest('hex')
  return `${payload}.${sig}`
}

export function verifyToken(token: string, secret: string): boolean {
  const dotIndex = token.lastIndexOf('.')
  if (dotIndex === -1) return false

  const payload = token.slice(0, dotIndex)
  const sig = token.slice(dotIndex + 1)
  const expected = createHmac('sha256', secret).update(payload).digest('hex')

  try {
    return timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}
