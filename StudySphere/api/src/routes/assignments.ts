import express from 'express'
import { body, param, query } from 'express-validator'
import { supabase } from '../lib/supabase'
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth'
import { handleValidationErrors, validateEnum } from '../middleware/validation'

const router = express.Router()

// Apply authentication to all assignment routes
router.use(authenticateToken)

// GET /assignments - Get assignments (optionally filtered by course)
router.get('/', [
  query('courseId').optional().isUUID().withMessage('Invalid course ID')
], handleValidationErrors, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user!.user_id
    const { courseId } = req.query as { courseId?: string }

    let query = supabase
      .from('assignments')
      .select('*')
      .eq('user_id', userId)

    if (courseId) {
      query = query.eq('course_id', courseId)
    }

    const { data: assignments, error } = await query.order('due_date', { ascending: true })

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch assignments' })
    }

    return res.json(assignments || [])
  } catch (error) {
    console.error('Get assignments error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /assignments - Create assignment
router.post('/', [
  body('course_id').isUUID().withMessage('Invalid course ID'),
  body('title').notEmpty().trim().withMessage('Title is required'),
  body('due_date').optional().isISO8601().toDate().withMessage('Invalid due date'),
  body('estimated_time').isInt({ min: 1 }).withMessage('Estimated time must be at least 1 minute'),
  body('priority_level').optional().isIn(['high', 'medium', 'low']).withMessage('Priority must be high, medium, or low')
], handleValidationErrors, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user!.user_id
    const { course_id, title, due_date, estimated_time, priority_level = 'medium' } = req.body

    // Verify user owns the course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('course_id')
      .eq('course_id', course_id)
      .eq('user_id', userId)
      .single()

    if (courseError || !course) {
      return res.status(404).json({ error: 'Course not found' })
    }

    const { data: assignment, error } = await supabase
      .from('assignments')
      .insert([{
        user_id: userId,
        course_id,
        title,
        due_date,
        estimated_time,
        priority_level
      }])
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: 'Failed to create assignment' })
    }

    return res.status(201).json(assignment)
  } catch (error) {
    console.error('Create assignment error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// PATCH /assignments/:assignmentId - Update assignment
router.patch('/:assignmentId', [
  param('assignmentId').isUUID().withMessage('Invalid assignment ID'),
  body('title').optional().notEmpty().trim().withMessage('Title must not be empty'),
  body('status').optional().isIn(['started', 'in progress', 'completed']).withMessage('Invalid status'),
  body('due_date').optional().isISO8601().toDate().withMessage('Invalid due date'),
  body('priority_level').optional().isIn(['high', 'medium', 'low']).withMessage('Invalid priority level')
], handleValidationErrors, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user!.user_id
    const { assignmentId } = req.params
    const updates = req.body

    const { data: assignment, error } = await supabase
      .from('assignments')
      .update(updates)
      .eq('assignment_id', assignmentId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error || !assignment) {
      return res.status(404).json({ error: 'Assignment not found' })
    }

    return res.json(assignment)
  } catch (error) {
    console.error('Update assignment error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE /assignments/:assignmentId - Delete assignment
router.delete('/:assignmentId', [
  param('assignmentId').isUUID().withMessage('Invalid assignment ID')
], handleValidationErrors, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user!.user_id
    const { assignmentId } = req.params

    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('assignment_id', assignmentId)
      .eq('user_id', userId)

    if (error) {
      return res.status(404).json({ error: 'Assignment not found' })
    }

    return res.status(204).send()
  } catch (error) {
    console.error('Delete assignment error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
