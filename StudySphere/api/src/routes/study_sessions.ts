import express from 'express'
import { body, param, query } from 'express-validator'
import { supabase } from '../lib/supabase'
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth'
import { handleValidationErrors } from '../middleware/validation'

const router = express.Router()

// Apply authentication to all study session routes
router.use(authenticateToken)

// GET /study-sessions - Get study sessions
router.get('/', [
  query('courseId').optional().isUUID().withMessage('Invalid course ID'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date')
], handleValidationErrors, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user!.user_id
    const { courseId, startDate, endDate } = req.query as { 
      courseId?: string
      startDate?: string
      endDate?: string
    }

    let query = supabase
      .from('study_sessions')
      .select(`
        *,
        courses (
          course_id,
          course_name
        ),
        assignments (
          assignment_id,
          title
        )
      `)
      .eq('user_id', userId)

    if (courseId) {
      query = query.eq('course_id', courseId)
    }

    if (startDate) {
      query = query.gte('start_time', startDate)
    }

    if (endDate) {
      query = query.lte('start_time', endDate)
    }

    const { data: sessions, error } = await query.order('start_time', { ascending: false })

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch study sessions' })
    }

    return res.json(sessions || [])
  } catch (error) {
    console.error('Get study sessions error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /study-sessions - Log study session
router.post('/', [
  body('course_id').isUUID().withMessage('Invalid course ID'),
  body('duration_minutes').isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),
  body('start_time').optional().isISO8601().toDate().withMessage('Invalid start time'),
  body('end_time').optional().isISO8601().toDate().withMessage('Invalid end time'),
  body('notes').optional().trim(),
  body('effectiveness_rating').optional().isInt({ min: 1, max: 5 }).withMessage('Effectiveness rating must be between 1 and 5'),
  body('assignment_id').optional().isUUID().withMessage('Invalid assignment ID')
], handleValidationErrors, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user!.user_id
    const { 
      course_id, 
      duration_minutes, 
      start_time = new Date().toISOString(),
      end_time,
      notes,
      effectiveness_rating,
      assignment_id 
    } = req.body

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

    const { data: session, error } = await supabase
      .from('study_sessions')
      .insert([{
        user_id: userId,
        course_id,
        assignment_id,
        start_time,
        end_time,
        duration_minutes,
        notes,
        effectiveness_rating
      }])
      .select(`
        *,
        courses (
          course_id,
          course_name
        ),
        assignments (
          assignment_id,
          title
        )
      `)
      .single()

    if (error) {
      return res.status(500).json({ error: 'Failed to create study session' })
    }

    return res.status(201).json(session)
  } catch (error) {
    console.error('Create study session error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// PATCH /study-sessions/:sessionId - Update study session
router.patch('/:sessionId', [
  param('sessionId').isUUID().withMessage('Invalid session ID'),
  body('duration_minutes').optional().isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),
  body('start_time').optional().isISO8601().toDate().withMessage('Invalid start time'),
  body('end_time').optional().isISO8601().toDate().withMessage('Invalid end time'),
  body('notes').optional().trim(),
  body('effectiveness_rating').optional().isInt({ min: 1, max: 5 }).withMessage('Effectiveness rating must be between 1 and 5')
], handleValidationErrors, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user!.user_id
    const { sessionId } = req.params
    const updates = req.body

    const { data: session, error } = await supabase
      .from('study_sessions')
      .update(updates)
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .select(`
        *,
        courses (
          course_id,
          course_name
        ),
        assignments (
          assignment_id,
          title
        )
      `)
      .single()

    if (error || !session) {
      return res.status(404).json({ error: 'Study session not found' })
    }

    return res.json(session)
  } catch (error) {
    console.error('Update study session error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE /study-sessions/:sessionId - Delete study session
router.delete('/:sessionId', [
  param('sessionId').isUUID().withMessage('Invalid session ID')
], handleValidationErrors, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user!.user_id
    const { sessionId } = req.params

    const { error } = await supabase
      .from('study_sessions')
      .delete()
      .eq('session_id', sessionId)
      .eq('user_id', userId)

    if (error) {
      return res.status(404).json({ error: 'Study session not found' })
    }

    return res.status(204).send()
  } catch (error) {
    console.error('Delete study session error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
