import { Request, Response, NextFunction } from 'express'
import { supabase } from '../lib/supabase'

type SupabaseAuthWithGetUser = {
  getUser: (token: string) => Promise<{ data: { user: { id: string; email?: string } | null }; error: unknown }>
}

export interface AuthenticatedRequest extends Request {
  user?: { user_id: string; email: string }
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  const { data: { user }, error } = await (supabase.auth as SupabaseAuthWithGetUser).getUser(token as string)

  if (error || !user) {
    return res.status(403).json({ error: 'Invalid or expired token' })
  }

  req.user = { user_id: user.id, email: user.email ?? '' }
  return next()
}
