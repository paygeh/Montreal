import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import { createClient } from '@supabase/supabase-js'
import path from 'path'

// Import route modules
import profilesRoutes from './routes/profiles'
import coursesRoutes from './routes/courses'
import assignmentsRoutes from './routes/assignments'
import gradesRoutes from './routes/grades'
import studySessionsRoutes from './routes/study_sessions'
import gpaRoutes from './routes/gpa'
import workloadRoutes from './routes/workload'
import burnoutRoutes from './routes/burnout'

// Load environment variables from .env file
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Debug: Check if environment variables are loaded
console.log('Current working directory:', __dirname)
console.log('Environment variables loaded:')
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET')
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'SET' : 'NOT SET')
console.log('All process.env keys:', Object.keys(process.env).filter(key => key.includes('SUPABASE')))

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})

// Middleware
app.use(helmet())
app.use(limiter)
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'StudySphere API',
    version: '1.0.0'
  })
})

// Register API routes according to OpenAPI specification
app.use('/profiles', profilesRoutes)
app.use('/courses', coursesRoutes)
app.use('/assignments', assignmentsRoutes)
app.use('/grades', gradesRoutes)
app.use('/study-sessions', studySessionsRoutes)
app.use('/gpa', gpaRoutes)
app.use('/workload', workloadRoutes)
app.use('/burnout-alerts', burnoutRoutes)

// API routes
app.get('/api/v1', (req, res) => {
  res.json({ 
    message: 'StudySphere API v1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/v1/auth/register',
        login: 'POST /api/v1/auth/login',
        logout: 'POST /api/v1/auth/logout',
        refresh: 'POST /api/v1/auth/refresh'
      },
      assignments: {
        getAll: 'GET /api/v1/assignments',
        getById: 'GET /api/v1/assignments/:id',
        create: 'POST /api/v1/assignments',
        update: 'PUT /api/v1/assignments/:id',
        delete: 'DELETE /api/v1/assignments/:id',
        importCanvas: 'POST /api/v1/assignments/import/canvas'
      },
      courses: {
        getAll: 'GET /api/v1/courses',
        getById: 'GET /api/v1/courses/:id',
        create: 'POST /api/v1/courses',
        update: 'PUT /api/v1/courses/:id',
        delete: 'DELETE /api/v1/courses/:id'
      },
      gpa: {
        getCurrent: 'GET /api/v1/gpa/current',
        getHistory: 'GET /api/v1/gpa/history',
        setGoal: 'POST /api/v1/gpa/goal',
        getWeeklyUpdate: 'GET /api/v1/gpa/weekly-update',
        calculateRequired: 'GET /api/v1/gpa/calculate-required'
      },
      study: {
        getSessions: 'GET /api/v1/study/sessions',
        createSession: 'POST /api/v1/study/sessions',
        updateSession: 'PUT /api/v1/study/sessions/:id',
        deleteSession: 'DELETE /api/v1/study/sessions/:id',
        getStats: 'GET /api/v1/study/stats',
        getPerformance: 'GET /api/v1/study/performance'
      },
      workload: {
        getWeekly: 'GET /api/v1/workload/weekly',
        getComparison: 'GET /api/v1/workload/comparison',
        getSpikes: 'GET /api/v1/workload/spikes',
        getCalendar: 'GET /api/v1/workload/calendar'
      },
      burnout: {
        getAnalysis: 'GET /api/v1/burnout/analysis',
        getAlerts: 'GET /api/v1/burnout/alerts',
        getRecommendations: 'GET /api/v1/burnout/recommendations'
      },
      profile: {
        get: 'GET /api/v1/profile',
        update: 'PUT /api/v1/profile',
        setPreferences: 'PUT /api/v1/profile/preferences',
        setGoals: 'PUT /api/v1/profile/goals'
      }
    }
  })
})

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.stack)
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.listen(PORT, () => {
  console.log(`\ud83d\ude80 StudySphere API server running on port ${PORT}`)
  console.log(`\ud83d\udcca Health check: http://localhost:${PORT}/health`)
  console.log(`\ud83d\udcda API docs: http://localhost:${PORT}/api/v1`)
  console.log(`\ud83d\udd27 Environment: ${process.env.NODE_ENV || 'development'}`)
})

export default app
