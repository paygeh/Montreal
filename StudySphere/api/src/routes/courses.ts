import express from 'express'
import { body, param } from 'express-validator'
import { supabase } from '../lib/supabase'
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth'
import { handleValidationErrors, validateUUID } from '../middleware/validation'

const router = express.Router()

// Apply authentication to all course routes
router.use(authenticateToken)

// GET /courses - Get all user courses
router.get('/', async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user!.user_id

    const { data: courses, error } = await supabase
      .from('courses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch courses' })
    }

    return res.json(courses || [])
  } catch (error) {
    console.error('Get courses error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /courses - Create a course
router.post('/', [
  body('course_name').notEmpty().trim().withMessage('Course name is required'),
  body('professor_name').optional().trim(),
  body('current_grade').optional().isFloat({ min: 0, max: 100 }).withMessage('Grade must be between 0 and 100')
], handleValidationErrors, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user!.user_id
    const { course_name, professor_name, current_grade } = req.body

    const { data: course, error } = await supabase
      .from('courses')
      .insert([{
        user_id: userId,
        course_name,
        professor_name,
        current_grade
      }])
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: 'Failed to create course' })
    }

    return res.status(201).json(course)
  } catch (error) {
    console.error('Create course error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// PATCH /courses/:courseId - Update a course
router.patch('/:courseId', [
  param('courseId').isUUID().withMessage('Invalid course ID'),
  body('course_name').optional().notEmpty().trim().withMessage('Course name must not be empty'),
  body('professor_name').optional().trim(),
  body('current_grade').optional().isFloat({ min: 0, max: 100 }).withMessage('Grade must be between 0 and 100')
], handleValidationErrors, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user!.user_id
    const { courseId } = req.params
    const updates = req.body

    const { data: course, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('course_id', courseId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error || !course) {
      return res.status(404).json({ error: 'Course not found' })
    }

    return res.json(course)
  } catch (error) {
    console.error('Update course error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE /courses/:courseId - Delete a course
router.delete('/:courseId', [
  param('courseId').isUUID().withMessage('Invalid course ID')
], handleValidationErrors, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user!.user_id
    const { courseId } = req.params

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('course_id', courseId)
      .eq('user_id', userId)

    if (error) {
      return res.status(404).json({ error: 'Course not found' })
    }

    return res.status(204).send()
  } catch (error) {
    console.error('Delete course error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
