import express from 'express'
import { body, param } from 'express-validator'
import { supabase } from '../lib/supabase'
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth'
import { handleValidationErrors } from '../middleware/validation'

const router = express.Router()

router.use(authenticateToken)

// GET /study-sessions
router.get('/', async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user!.user_id
    const { data, error } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: false })

    if (error) return res.status(500).json({ error: 'Failed to fetch study sessions' })
    return res.json(data || [])
  } catch (err) {
    console.error('Get study sessions error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /study-sessions
router.post('/', [
  body('start_time').isISO8601().withMessage('Invalid start time'),
  body('end_time').optional().isISO8601().withMessage('Invalid end time'),
  body('duration_minutes').optional().isInt({ min: 1 }).withMessage('Duration must be positive'),
  body('course_id').optional().isUUID().withMessage('Invalid course ID'),
], handleValidationErrors, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user!.user_id
    const { data, error } = await supabase
      .from('study_sessions')
      .insert([{ ...req.body, user_id: userId }])
      .select()
      .single()

    if (error) return res.status(500).json({ error: 'Failed to create study session' })
    return res.status(201).json(data)
  } catch (err) {
    console.error('Create study session error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// PATCH /study-sessions/:sessionId
router.patch('/:sessionId', [
  param('sessionId').isUUID().withMessage('Invalid session ID'),
], handleValidationErrors, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user!.user_id
    const { sessionId } = req.params
    const { data, error } = await supabase
      .from('study_sessions')
      .update(req.body)
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error || !data) return res.status(404).json({ error: 'Study session not found' })
    return res.json(data)
  } catch (err) {
    console.error('Update study session error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE /study-sessions/:sessionId
router.delete('/:sessionId', [
  param('sessionId').isUUID().withMessage('Invalid session ID'),
], handleValidationErrors, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user!.user_id
    const { sessionId } = req.params
    const { error } = await supabase
      .from('study_sessions')
      .delete()
      .eq('session_id', sessionId)
      .eq('user_id', userId)

    if (error) return res.status(404).json({ error: 'Study session not found' })
    return res.status(204).send()
  } catch (err) {
    console.error('Delete study session error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
