import express from 'express'
import { body, query } from 'express-validator'
import { supabase } from '../lib/supabase'
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth'
import { handleValidationErrors } from '../middleware/validation'

const router = express.Router()

// Apply authentication to all workload routes
router.use(authenticateToken)

// GET /workload - Get workload records
router.get('/', [
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date'),
  query('intensity').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid intensity level')
], handleValidationErrors, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user!.user_id
    const { startDate, endDate, intensity } = req.query as { 
      startDate?: string
      endDate?: string
      intensity?: string
    }

    let query = supabase
      .from('workload_records')
      .select(`
        *,
        courses (
          course_id,
          course_name
        )
      `)
      .eq('user_id', userId)

    if (startDate) {
      query = query.gte('week_start_date', startDate)
    }

    if (endDate) {
      query = query.lte('week_start_date', endDate)
    }

    if (intensity) {
      query = query.eq('workload_intensity', intensity)
    }

    const { data: workloadRecords, error } = await query.order('week_start_date', { ascending: false })

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch workload records' })
    }

    return res.json(workloadRecords || [])
  } catch (error) {
    console.error('Get workload error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /workload - Create workload record
router.post('/', [
  body('week_start_date').isISO8601().toDate().withMessage('Invalid week start date'),
  body('total_estimated_time').isInt({ min: 0 }).withMessage('Total time must be a positive integer'),
  body('workload_intensity').isIn(['low', 'medium', 'high']).withMessage('Intensity must be low, medium, or high'),
  body('course_id').optional().isUUID().withMessage('Invalid course ID')
], handleValidationErrors, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user!.user_id
    const { week_start_date, total_estimated_time, workload_intensity, course_id } = req.body

    // If course_id is provided, verify user owns it
    if (course_id) {
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('course_id')
        .eq('course_id', course_id)
        .eq('user_id', userId)
        .single()

      if (courseError || !course) {
        return res.status(404).json({ error: 'Course not found' })
      }
    }

    const { data: workload, error } = await supabase
      .from('workload_records')
      .insert([{
        user_id: userId,
        week_start_date,
        total_estimated_time,
        workload_intensity,
        course_id
      }])
      .select(`
        *,
        courses (
          course_id,
          course_name
        )
      `)
      .single()

    if (error) {
      return res.status(500).json({ error: 'Failed to create workload record' })
    }

    return res.status(201).json(workload)
  } catch (error) {
    console.error('Create workload error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /workload/analysis - Get workload analysis
router.get('/analysis', [
  query('weeks').optional().isInt({ min: 1, max: 52 }).withMessage('Weeks must be between 1 and 52')
], handleValidationErrors, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user!.user_id
    const { weeks = '8' } = req.query as { weeks?: string }

    // Get workload records for the specified number of weeks
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - (parseInt(weeks) * 7))

    const { data: workloadRecords, error } = await supabase
      .from('workload_records')
      .select('*')
      .eq('user_id', userId)
      .gte('week_start_date', startDate.toISOString())
      .order('week_start_date', { ascending: true })

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch workload data' })
    }

    // Calculate analysis
    const records = workloadRecords || []
    const totalWeeks = records.length
    const averageWeeklyTime = totalWeeks > 0 
      ? records.reduce((sum, record) => sum + record.total_estimated_time, 0) / totalWeeks 
      : 0

    const intensityDistribution = {
      low: records.filter(r => r.workload_intensity === 'low').length,
      medium: records.filter(r => r.workload_intensity === 'medium').length,
      high: records.filter(r => r.workload_intensity === 'high').length
    }

    // Detect workload spikes (weeks with > 50% more time than average)
    const spikeThreshold = averageWeeklyTime * 1.5
    const spikes = records.filter(record => record.total_estimated_time > spikeThreshold)

    return res.json({
      analysis_period: `${weeks} weeks`,
      total_weeks_analyzed: totalWeeks,
      average_weekly_time: Math.round(averageWeeklyTime),
      intensity_distribution: intensityDistribution,
      workload_spikes: spikes.length,
      spike_weeks: spikes.map((spike: any) => ({
        week_start_date: spike.week_start_date,
        total_time: spike.total_estimated_time,
        intensity: spike.workload_intensity
      })),
      trend: totalWeeks >= 2 ? {
        direction: records[totalWeeks - 1].total_estimated_time > records[0].total_estimated_time ? 'increasing' : 'decreasing',
        change: records[totalWeeks - 1].total_estimated_time - records[0].total_estimated_time
      } : null
    })
  } catch (error) {
    console.error('Get workload analysis error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
