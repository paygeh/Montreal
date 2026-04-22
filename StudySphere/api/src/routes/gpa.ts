import express from 'express'
import { body, query } from 'express-validator'
import { supabase } from '../lib/supabase'
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth'
import { handleValidationErrors } from '../middleware/validation'

const router = express.Router()

// Apply authentication to all GPA routes
router.use(authenticateToken)

// GET /gpa - Get GPA records
router.get('/', [
  query('semester').optional().isString().withMessage('Invalid semester'),
  query('year').optional().isInt({ min: 2000, max: 2100 }).withMessage('Invalid year')
], handleValidationErrors, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user!.user_id
    const { semester, year } = req.query as { semester?: string; year?: string }

    let query = supabase
      .from('gpa_records')
      .select(`
        *,
        courses (
          course_id,
          course_name,
          credits
        )
      `)
      .eq('user_id', userId)

    if (semester) {
      query = query.eq('semester', semester)
    }

    if (year) {
      query = query.eq('year', parseInt(year))
    }

    const { data: gpaRecords, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch GPA records' })
    }

    // Calculate current GPA
    let currentGPA = 0
    let totalCredits = 0
    let weightedSum = 0

    if (gpaRecords) {
      gpaRecords.forEach((record: any) => {
        const credits = record.credits?.credits || 0
        totalCredits += credits
        weightedSum += record.gpa_value * credits
      })

      if (totalCredits > 0) {
        currentGPA = weightedSum / totalCredits
      }
    }

    return res.json({
      current_gpa: currentGPA,
      total_credits: totalCredits,
      records: gpaRecords || []
    })
  } catch (error) {
    console.error('Get GPA error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /gpa - Add GPA record
router.post('/', [
  body('gpa_value').isFloat({ min: 0, max: 4 }).withMessage('GPA must be between 0 and 4'),
  body('goal_gpa').isFloat({ min: 0, max: 4 }).withMessage('Goal GPA must be between 0 and 4'),
  body('semester').notEmpty().trim().withMessage('Semester is required'),
  body('year').isInt({ min: 2000, max: 2100 }).withMessage('Invalid year'),
  body('course_id').optional().isUUID().withMessage('Invalid course ID')
], handleValidationErrors, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user!.user_id
    const { gpa_value, goal_gpa, semester, year, course_id } = req.body

    // If course_id is provided, verify user owns it
    if (course_id) {
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('course_id, credits')
        .eq('course_id', course_id)
        .eq('user_id', userId)
        .single()

      if (courseError || !course) {
        return res.status(404).json({ error: 'Course not found' })
      }
    }

    const { data: gpaRecord, error } = await supabase
      .from('gpa_records')
      .insert([{
        user_id: userId,
        gpa_value,
        goal_gpa,
        semester,
        year: parseInt(year),
        course_id
      }])
      .select(`
        *,
        courses (
          course_id,
          course_name,
          credits
        )
      `)
      .single()

    if (error) {
      return res.status(500).json({ error: 'Failed to create GPA record' })
    }

    return res.status(201).json(gpaRecord)
  } catch (error) {
    console.error('Create GPA record error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /gpa/progress - Get GPA progress towards goal
router.get('/progress', async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user!.user_id

    // Get latest GPA record
    const { data: latestRecord, error: latestError } = await supabase
      .from('gpa_records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (latestError || !latestRecord) {
      return res.status(404).json({ error: 'No GPA records found' })
    }

    // Calculate all-time GPA
    const { data: allRecords, error: allError } = await supabase
      .from('gpa_records')
      .select('gpa_value, courses(credits)')
      .eq('user_id', userId)

    if (allError) {
      return res.status(500).json({ error: 'Failed to calculate progress' })
    }

    let totalCredits = 0
    let weightedSum = 0

    if (allRecords) {
      allRecords.forEach((record: any) => {
        const credits = record.credits?.credits || 0
        totalCredits += credits
        weightedSum += record.gpa_value * credits
      })
    }

    const currentGPA = totalCredits > 0 ? weightedSum / totalCredits : 0
    const goalGPA = latestRecord.goal_gpa
    const progress = goalGPA > 0 ? (currentGPA / goalGPA) * 100 : 0
    const difference = currentGPA - goalGPA

    return res.json({
      current_gpa: currentGPA,
      goal_gpa: goalGPA,
      progress_percentage: Math.min(progress, 100),
      difference: difference,
      total_credits: totalCredits,
      on_track: difference >= 0
    })
  } catch (error) {
    console.error('Get GPA progress error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
