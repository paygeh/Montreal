import express from 'express'
import { body, param } from 'express-validator'
import { supabase } from '../lib/supabase'
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth'
import { handleValidationErrors } from '../middleware/validation'

const router = express.Router()

// Apply authentication to all grade routes
router.use(authenticateToken)

// POST /grades - Create grade
router.post('/', [
  body('course_id').isUUID().withMessage('Invalid course ID'),
  body('score').isFloat({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
  body('weight').isFloat({ min: 0 }).withMessage('Weight must be a positive number'),
  body('assignment_id').optional().isUUID().withMessage('Invalid assignment ID')
], handleValidationErrors, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user!.user_id
    const { course_id, assignment_id, score, weight } = req.body

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

    // If assignment_id is provided, verify user owns it
    if (assignment_id) {
      const { data: assignment, error: assignmentError } = await supabase
        .from('assignments')
        .select('assignment_id')
        .eq('assignment_id', assignment_id)
        .eq('user_id', userId)
        .single()

      if (assignmentError || !assignment) {
        return res.status(404).json({ error: 'Assignment not found' })
      }
    }

    const { data: grade, error } = await supabase
      .from('grades')
      .insert([{
        user_id: userId,
        course_id,
        assignment_id,
        score,
        weight
      }])
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: 'Failed to create grade' })
    }

    return res.status(201).json(grade)
  } catch (error) {
    console.error('Create grade error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /grades/course/:courseId - Get grades for a course
router.get('/course/:courseId', [
  param('courseId').isUUID().withMessage('Invalid course ID')
], handleValidationErrors, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user!.user_id
    const { courseId } = req.params

    // Verify user owns the course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('course_id')
      .eq('course_id', courseId)
      .eq('user_id', userId)
      .single()

    if (courseError || !course) {
      return res.status(404).json({ error: 'Course not found' })
    }

    const { data: grades, error } = await supabase
      .from('grades')
      .select(`
        *,
        assignments (
          assignment_id,
          title
        )
      `)
      .eq('course_id', courseId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch grades' })
    }

    return res.json(grades || [])
  } catch (error) {
    console.error('Get grades error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// PATCH /grades/:gradeId - Update grade
router.patch('/:gradeId', [
  param('gradeId').isUUID().withMessage('Invalid grade ID'),
  body('score').optional().isFloat({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
  body('weight').optional().isFloat({ min: 0 }).withMessage('Weight must be a positive number')
], handleValidationErrors, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user!.user_id
    const { gradeId } = req.params
    const updates = req.body

    const { data: grade, error } = await supabase
      .from('grades')
      .update(updates)
      .eq('grade_id', gradeId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error || !grade) {
      return res.status(404).json({ error: 'Grade not found' })
    }

    return res.json(grade)
  } catch (error) {
    console.error('Update grade error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE /grades/:gradeId - Delete grade
router.delete('/:gradeId', [
  param('gradeId').isUUID().withMessage('Invalid grade ID')
], handleValidationErrors, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user!.user_id
    const { gradeId } = req.params

    const { error } = await supabase
      .from('grades')
      .delete()
      .eq('grade_id', gradeId)
      .eq('user_id', userId)

    if (error) {
      return res.status(404).json({ error: 'Grade not found' })
    }

    return res.status(204).send()
  } catch (error) {
    console.error('Delete grade error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
