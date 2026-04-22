import express from 'express'
import { body } from 'express-validator'
import { supabase } from '../lib/supabase'
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth'
import { handleValidationErrors } from '../middleware/validation'

const router = express.Router()

// Apply authentication to all profile routes
router.use(authenticateToken)

// GET /profiles/me - Get current user profile
router.get('/me', async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user!.user_id

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error || !profile) {
      return res.status(404).json({ error: 'Profile not found' })
    }

    return res.json(profile)
  } catch (error) {
    console.error('Get profile error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// PATCH /profiles/me - Update current user profile
router.patch('/me', [
  body('name').optional().isLength({ min: 1 }).trim().withMessage('Name must not be empty'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Must be a valid email')
], handleValidationErrors, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user!.user_id
    const updates = req.body

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()

    if (error || !profile) {
      return res.status(404).json({ error: 'Profile not found' })
    }

    return res.json(profile)
  } catch (error) {
    console.error('Update profile error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
