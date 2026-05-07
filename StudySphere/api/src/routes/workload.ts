import express from 'express'
import { body, param } from 'express-validator'
import { supabase } from '../lib/supabase'
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth'
import { handleValidationErrors } from '../middleware/validation'

const router = express.Router()

router.use(authenticateToken)

// GET /workload
router.get('/', async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user!.user_id
    const { data, error } = await supabase
      .from('workload_records')
      .select('*')
      .eq('user_id', userId)
      .order('week_start_date', { ascending: false })

    if (error) return res.status(500).json({ error: 'Failed to fetch workload records' })
    return res.json(data || [])
  } catch (err) {
    console.error('Get workload error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /workload
router.post('/', [
  body('week_start_date').isISO8601().withMessage('Invalid week start date'),
  body('total_estimated_time').isInt({ min: 0 }).withMessage('Total estimated time must be non-negative'),
  body('workload_intensity').isIn(['light', 'medium', 'high', 'extreme']).withMessage('Invalid workload intensity'),
], handleValidationErrors, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user!.user_id
    const { data, error } = await supabase
      .from('workload_records')
      .insert([{ ...req.body, user_id: userId }])
      .select()
      .single()

    if (error) return res.status(500).json({ error: 'Failed to create workload record' })
    return res.status(201).json(data)
  } catch (err) {
    console.error('Create workload error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// PATCH /workload/:workloadId
router.patch('/:workloadId', [
  param('workloadId').isUUID().withMessage('Invalid workload ID'),
], handleValidationErrors, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user!.user_id
    const { workloadId } = req.params
    const { data, error } = await supabase
      .from('workload_records')
      .update(req.body)
      .eq('workload_id', workloadId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error || !data) return res.status(404).json({ error: 'Workload record not found' })
    return res.json(data)
  } catch (err) {
    console.error('Update workload error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
