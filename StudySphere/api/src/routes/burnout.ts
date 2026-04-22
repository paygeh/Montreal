import express from 'express'
import { body } from 'express-validator'
import { supabase } from '../lib/supabase'
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth'
import { handleValidationErrors } from '../middleware/validation'

const router = express.Router()

// Apply authentication to all burnout routes
router.use(authenticateToken)

// GET /burnout-alerts - Get burnout alerts
router.get('/', async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user!.user_id

    const { data: alerts, error } = await supabase
      .from('burnout_alerts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch burnout alerts' })
    }

    return res.json(alerts || [])
  } catch (error) {
    console.error('Get burnout alerts error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /burnout-alerts - Create burnout alert
router.post('/', [
  body('alert_type').notEmpty().trim().withMessage('Alert type is required'),
  body('message').notEmpty().trim().withMessage('Message is required'),
  body('workload_id').optional().isUUID().withMessage('Invalid workload ID'),
  body('severity_level').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity level')
], handleValidationErrors, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user!.user_id
    const { alert_type, message, workload_id, severity_level = 'medium' } = req.body

    // If workload_id is provided, verify user owns it
    if (workload_id) {
      const { data: workload, error: workloadError } = await supabase
        .from('workload_records')
        .select('workload_id')
        .eq('workload_id', workload_id)
        .eq('user_id', userId)
        .single()

      if (workloadError || !workload) {
        return res.status(404).json({ error: 'Workload record not found' })
      }
    }

    const { data: alert, error } = await supabase
      .from('burnout_alerts')
      .insert([{
        user_id: userId,
        alert_type,
        message,
        workload_id,
        severity_level,
        status: 'active'
      }])
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: 'Failed to create burnout alert' })
    }

    return res.status(201).json(alert)
  } catch (error) {
    console.error('Create burnout alert error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /burnout-alerts/analysis - Get burnout risk analysis
router.get('/analysis', async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user!.user_id

    // Get recent workload data (last 4 weeks)
    const fourWeeksAgo = new Date()
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)

    const { data: workloadData, error: workloadError } = await supabase
      .from('workload_records')
      .select('*')
      .eq('user_id', userId)
      .gte('week_start_date', fourWeeksAgo.toISOString())
      .order('week_start_date', { ascending: true })

    if (workloadError) {
      return res.status(500).json({ error: 'Failed to fetch workload data' })
    }

    // Get recent study sessions (last 2 weeks)
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

    const { data: studyData, error: studyError } = await supabase
      .from('study_sessions')
      .select('duration_minutes, effectiveness_rating, start_time')
      .eq('user_id', userId)
      .gte('start_time', twoWeeksAgo.toISOString())

    if (studyError) {
      return res.status(500).json({ error: 'Failed to fetch study data' })
    }

    // Calculate burnout risk factors
    const workloads = workloadData || []
    const studySessions = studyData || []

    // Risk factor 1: High workload intensity
    const highIntensityWeeks = workloads.filter(w => w.workload_intensity === 'high').length
    const workloadRisk = workloads.length > 0 ? (highIntensityWeeks / workloads.length) * 100 : 0

    // Risk factor 2: Excessive study hours
    const totalStudyMinutes = studySessions.reduce((sum, session) => sum + (session.duration_minutes || 0), 0)
    const avgDailyStudyMinutes = studySessions.length > 0 ? totalStudyMinutes / 14 : 0 // 14 days
    const studyRisk = avgDailyStudyMinutes > 480 ? 100 : avgDailyStudyMinutes > 360 ? 75 : avgDailyStudyMinutes > 240 ? 50 : 25

    // Risk factor 3: Declining effectiveness
    const recentSessions = studySessions.slice(-7) // Last 7 sessions
    const olderSessions = studySessions.slice(-14, -7) // Previous 7 sessions
    
    const recentAvgEffectiveness = recentSessions.length > 0 
      ? recentSessions.reduce((sum, s) => sum + (s.effectiveness_rating || 0), 0) / recentSessions.length 
      : 0
    
    const olderAvgEffectiveness = olderSessions.length > 0 
      ? olderSessions.reduce((sum, s) => sum + (s.effectiveness_rating || 0), 0) / olderSessions.length 
      : 0

    const effectivenessRisk = olderAvgEffectiveness > 0 
      ? Math.max(0, (olderAvgEffectiveness - recentAvgEffectiveness) / olderAvgEffectiveness) * 100 
      : 0

    // Calculate overall risk score
    const overallRisk = (workloadRisk * 0.4) + (studyRisk * 0.3) + (effectivenessRisk * 0.3)

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
    if (overallRisk >= 75) riskLevel = 'critical'
    else if (overallRisk >= 50) riskLevel = 'high'
    else if (overallRisk >= 25) riskLevel = 'medium'

    // Generate recommendations
    const recommendations = []
    if (workloadRisk > 50) {
      recommendations.push('Consider reducing course load or delegating tasks')
    }
    if (studyRisk > 50) {
      recommendations.push('Take regular breaks and ensure adequate rest')
    }
    if (effectivenessRisk > 30) {
      recommendations.push('Try changing study methods or environment')
    }
    if (overallRisk < 25) {
      recommendations.push('Current study patterns appear sustainable')
    }

    return res.json({
      risk_level: riskLevel,
      risk_score: Math.round(overallRisk),
      risk_factors: {
        workload_intensity: Math.round(workloadRisk),
        study_volume: Math.round(studyRisk),
        effectiveness_decline: Math.round(effectivenessRisk)
      },
      analysis_period: '4 weeks',
      data_points: {
        workload_weeks: workloads.length,
        study_sessions: studySessions.length,
        avg_daily_study_minutes: Math.round(avgDailyStudyMinutes)
      },
      recommendations,
      last_updated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Get burnout analysis error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// PATCH /burnout-alerts/:alertId - Update burnout alert status
router.patch('/:alertId', [
  body('status').isIn(['active', 'acknowledged', 'resolved']).withMessage('Invalid status')
], handleValidationErrors, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user!.user_id
    const { alertId } = req.params
    const { status } = req.body

    const { data: alert, error } = await supabase
      .from('burnout_alerts')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('alert_id', alertId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error || !alert) {
      return res.status(404).json({ error: 'Burnout alert not found' })
    }

    return res.json(alert)
  } catch (error) {
    console.error('Update burnout alert error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
