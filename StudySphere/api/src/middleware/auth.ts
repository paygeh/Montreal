import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { supabase } from '../lib/supabase'

export interface AuthenticatedRequest extends Request {
  user?: {
    user_id: string
    email: string
    name?: string
  }
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Access token required' })
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    // Get user from Supabase
    const { data: user, error } = await supabase
      .from('profiles')
      .select('user_id, name, email')
      .eq('user_id', decoded.userId)
      .single()

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    req.user = user
    return next()
  } catch (error) {
    console.error('Auth error:', error)
    return res.status(403).json({ error: 'Invalid or expired token' })
  }
}

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
      
      const { data: user, error } = await supabase
        .from('profiles')
        .select('user_id, name, email')
        .eq('user_id', decoded.userId)
        .single()

      if (!error && user) {
        req.user = user
      }
    }

    return next()
  } catch (error) {
    // Continue without authentication for optional auth
    return next()
  }
}
