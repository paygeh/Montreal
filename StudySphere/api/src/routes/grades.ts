import express from 'express'
import { body, param } from 'express-validator'
import { supabase } from '../lib/supabase'
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth'
import { handleValidationErrors } from '../middleware/validation'

const router = express.Router()

router.use(authenticateToken)

// GET /grades
router.get('/', async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user!.user_id
    const { data, error } = await supabase
      .from('grades')
      .select('*, courses(course_name, credits)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) return res.status(500).json({ error: 'Failed to fetch grades' })
    return res.json(data || [])
  } catch (err) {
    console.error('Get grades error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /grades
router.post('/', [
  body('course_id').isUUID().withMessage('Invalid course ID'),
  body('grade').isFloat({ min: 0, max: 100 }).withMessage('Grade must be between 0 and 100'),
  body('semester').notEmpty().withMessage('Semester is required'),
], handleValidationErrors, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user!.user_id
    const { data, error } = await supabase
      .from('grades')
      .insert([{ ...req.body, user_id: userId }])
      .select('*, courses(course_name, credits)')
      .single()

    if (error) return res.status(500).json({ error: 'Failed to create grade' })
    return res.status(201).json(data)
  } catch (err) {
    console.error('Create grade error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE /grades/:gradeId
router.delete('/:gradeId', [
  param('gradeId').isUUID().withMessage('Invalid grade ID'),
], handleValidationErrors, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user!.user_id
    const { gradeId } = req.params
    const { error } = await supabase
      .from('grades')
      .delete()
      .eq('grade_id', gradeId)
      .eq('user_id', userId)

    if (error) return res.status(404).json({ error: 'Grade not found' })
    return res.status(204).send()
  } catch (err) {
    console.error('Delete grade error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
