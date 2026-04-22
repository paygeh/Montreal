import React, { useState } from 'react'
import { AlertTriangle, TrendingUp, Clock, Target, Bell, BellOff, Coffee, Brain, Heart, Activity, Settings, ChevronRight } from 'lucide-react'
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { Task, Course, StudySession, BurnoutAlert } from '../types'

interface BurnoutMonitorProps {
  tasks: Task[]
  courses: Course[]
  studySessions: StudySession[]
  burnoutAlerts: BurnoutAlert[]
  onAlertCreate: (alert: Omit<BurnoutAlert, 'id' | 'createdAt' | 'updatedAt'>) => void
  onAlertUpdate: (alert: BurnoutAlert) => void
  onAlertDelete: (alertId: string) => void
}

export default function BurnoutMonitor({ 
  tasks, 
  courses, 
  studySessions, 
  burnoutAlerts, 
  onAlertCreate, 
  onAlertUpdate, 
  onAlertDelete 
}: BurnoutMonitorProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'recommendations'>('overview')
  const [spikeAlertsEnabled, setSpikeAlertsEnabled] = useState(true)
  const [burnoutAlertsEnabled, setBurnoutAlertsEnabled] = useState(true)
  const [breakReminderEnabled, setBreakReminderEnabled] = useState(true)

  const calculateWorkloadIntensity = () => {
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay() + 1)
    
    const weekTasks = tasks.filter(task => {
      if (!task.dueDate) return false
      const dueDate = new Date(task.dueDate)
      return dueDate >= weekStart && dueDate <= new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000)
    })
    
    return courses.map(course => {
      const courseTasks = weekTasks.filter(task => task.courseId === course.id)
      const totalMinutes = courseTasks.reduce((sum, task) => sum + (task.estimatedTime || 0), 0)
      const totalHours = totalMinutes / 60
      
      return {
        courseId: course.id,
        courseName: course.name,
        totalHours,
        taskCount: courseTasks.length,
        intensity: totalHours > 15 ? 'extreme' : totalHours > 10 ? 'high' : totalHours > 5 ? 'medium' : 'light'
      }
    })
  }

  const detectWorkloadSpikes = () => {
    const spikes = []
    const today = new Date()
    
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - (i * 7))
      
      const weekTasks = tasks.filter(task => {
        if (!task.dueDate) return false
        const dueDate = new Date(task.dueDate)
        return dueDate >= weekStart && dueDate <= new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000)
      })
      
      const totalHours = weekTasks.reduce((sum, task) => sum + (task.estimatedTime || 0), 0) / 60
      
      if (totalHours > 25) {
        spikes.push({
          weekStart: weekStart.toISOString().split('T')[0],
          totalHours,
          taskCount: weekTasks.length,
          severity: totalHours > 35 ? 'critical' : 'warning'
        })
      }
    }
    
    return spikes
  }

  const detectOverworking = () => {
    const today = new Date()
    const todaySessions = studySessions.filter(session => 
      session.startTime.startsWith(today.toISOString().split('T')[0])
    )
    
    const totalMinutes = todaySessions.reduce((sum, session) => sum + (session.duration || 0), 0)
    const totalHours = totalMinutes / 60
    
    return {
      isOverworking: totalHours > 8,
      totalHours,
      sessionCount: todaySessions.length,
      recommendation: totalHours > 10 ? 'Take a long break and rest' : 
                    totalHours > 8 ? 'Consider taking a break soon' : 
                    totalHours > 6 ? 'Monitor your energy levels' : 'Good balance'
    }
  }

  const getTaskFocusRecommendations = () => {
    const upcomingTasks = tasks
      .filter(task => task.status !== 'completed')
      .filter(task => task.dueDate && new Date(task.dueDate) > new Date())
      .sort((a, b) => {
        const aPriority = a.priority === 'high' ? 3 : a.priority === 'medium' ? 2 : 1
        const bPriority = b.priority === 'high' ? 3 : b.priority === 'medium' ? 2 : 1
        const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
        const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
        
        return (aPriority * 1000000 + aDue) - (bPriority * 1000000 + bDue)
      })
      .slice(0, 5)
    
    return upcomingTasks.map(task => {
      const course = courses.find(c => c.id === task.courseId)
      const daysUntilDue = task.dueDate ? Math.ceil((new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0
      
      return {
        id: task.id,
        title: task.title,
        courseName: course?.name || 'Unknown',
        priority: task.priority,
        daysUntilDue,
        estimatedTime: task.estimatedTime || 0,
        urgency: daysUntilDue <= 2 ? 'critical' : daysUntilDue <= 5 ? 'high' : 'normal',
        reason: daysUntilDue <= 2 ? 'Due soon' : task.priority === 'high' ? 'High priority' : 'Next in queue'
      }
    })
  }

  const getBurnoutRiskFactors = () => {
    const overworking = detectOverworking()
    const workloadIntensity = calculateWorkloadIntensity()
    const spikes = detectWorkloadSpikes()
    
    const riskFactors = [
      {
        name: 'Study Intensity',
        score: overworking.totalHours > 8 ? 80 : overworking.totalHours > 6 ? 60 : 40,
        description: `Currently studying ${overworking.totalHours.toFixed(1)} hours today`
      },
      {
        name: 'Workload Balance',
        score: spikes.length > 0 ? 70 : workloadIntensity.some(w => w.intensity === 'extreme') ? 60 : 30,
        description: spikes.length > 0 ? `${spikes.length} heavy weeks detected` : 'Balanced workload'
      },
      {
        name: 'Task Distribution',
        score: workloadIntensity.some(w => w.totalHours > 15) ? 75 : workloadIntensity.some(w => w.totalHours > 10) ? 50 : 25,
        description: 'Uneven task distribution across courses'
      },
      {
        name: 'Rest Patterns',
        score: overworking.totalHours > 10 ? 85 : overworking.totalHours > 8 ? 65 : 35,
        description: 'Insufficient rest periods detected'
      }
    ]
    
    return riskFactors
  }

  const getBurnoutRiskScore = () => {
    const riskFactors = getBurnoutRiskFactors()
    const averageScore = riskFactors.reduce((sum, factor) => sum + factor.score, 0) / riskFactors.length
    
    return {
      score: Math.round(averageScore),
      level: averageScore > 75 ? 'critical' : averageScore > 60 ? 'high' : averageScore > 40 ? 'moderate' : 'low',
      factors: riskFactors
    }
  }

  const workloadIntensity = calculateWorkloadIntensity()
  const workloadSpikes = detectWorkloadSpikes()
  const overworkingStatus = detectOverworking()
  const taskRecommendations = getTaskFocusRecommendations()
  const burnoutRisk = getBurnoutRiskScore()

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Burnout Monitor</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'overview' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'alerts' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Alerts
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'recommendations' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Recommendations
            </button>
          </div>
        </div>

        {/* Risk Score Display */}
        <div className="text-center mb-6">
          <div className={`text-4xl font-bold ${
            burnoutRisk.level === 'critical' ? 'text-red-600' :
            burnoutRisk.level === 'high' ? 'text-orange-600' :
            burnoutRisk.level === 'moderate' ? 'text-yellow-600' :
            'text-green-600'
          }`}>
            {burnoutRisk.score}/100
          </div>
          <div className="text-lg text-gray-600">Burnout Risk Score</div>
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            burnoutRisk.level === 'critical' ? 'bg-red-100 text-red-800' :
            burnoutRisk.level === 'high' ? 'bg-orange-100 text-orange-800' :
            burnoutRisk.level === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {burnoutRisk.level.charAt(0).toUpperCase() + burnoutRisk.level.slice(1)} Risk
          </div>
        </div>

        {/* Notification Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <div className="font-medium text-gray-900">Workload Spike Alerts</div>
                <div className="text-sm text-gray-600">Get notified about heavy weeks</div>
              </div>
            </div>
            <button
              onClick={() => setSpikeAlertsEnabled(!spikeAlertsEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                spikeAlertsEnabled ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                spikeAlertsEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Brain className="h-5 w-5 text-red-500" />
              <div>
                <div className="font-medium text-gray-900">Burnout Alerts</div>
                <div className="text-sm text-gray-600">Alert for overworking patterns</div>
              </div>
            </div>
            <button
              onClick={() => setBurnoutAlertsEnabled(!burnoutAlertsEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                burnoutAlertsEnabled ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                burnoutAlertsEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Coffee className="h-5 w-5 text-blue-500" />
              <div>
                <div className="font-medium text-gray-900">Break Reminders</div>
                <div className="text-sm text-gray-600">Take regular study breaks</div>
              </div>
            </div>
            <button
              onClick={() => setBreakReminderEnabled(!breakReminderEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                breakReminderEnabled ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                breakReminderEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Workload Intensity Analysis */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Workload Intensity Analysis</h3>
            <div className="space-y-3">
              {workloadIntensity.map(course => (
                <div key={course.courseId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-900">{course.courseName}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      course.intensity === 'extreme' ? 'bg-red-100 text-red-800' :
                      course.intensity === 'high' ? 'bg-orange-100 text-orange-800' :
                      course.intensity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {course.intensity}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>{course.taskCount} tasks</div>
                    <div>{course.totalHours.toFixed(1)} hours</div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          course.intensity === 'extreme' ? 'bg-red-500' :
                          course.intensity === 'high' ? 'bg-orange-500' :
                          course.intensity === 'medium' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((course.totalHours / 20) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Overworking Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Overworking Status</h3>
            {overworkingStatus.isOverworking ? (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="font-medium text-red-900">Overworking Detected</span>
                  </div>
                  <p className="text-sm text-red-800 mb-3">
                    You've studied {overworkingStatus.totalHours.toFixed(1)} hours today across {overworkingStatus.sessionCount} sessions.
                  </p>
                  <div className="bg-red-100 rounded-lg p-3">
                    <h4 className="font-medium text-red-900 mb-2">Recommendation:</h4>
                    <p className="text-sm text-red-800">{overworkingStatus.recommendation}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Break Suggestions:</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Coffee className="h-4 w-4" />
                      <span>Take a 15-minute break now</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      <span>Practice deep breathing exercises</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      <span>Go for a short walk</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Heart className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900">Healthy Balance</span>
                  </div>
                  <p className="text-sm text-green-800">
                    You're studying {overworkingStatus.totalHours.toFixed(1)} hours today, which is within healthy limits.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Keep up the good work!</h4>
                  <div className="text-sm text-gray-600">
                    <div>Continue maintaining regular breaks</div>
                    <div>Stay hydrated and nourished</div>
                    <div>Monitor your energy levels</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Risk Factors Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Risk Factors Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={burnoutRisk.factors}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Risk Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          {/* Active Alerts */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Active Alerts</h3>
            <div className="space-y-3">
              {burnoutAlerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No active alerts. Your study patterns look healthy!
                </div>
              ) : (
                burnoutAlerts.map(alert => (
                  <div key={alert.id} className={`border rounded-lg p-4 ${
                    alert.alertType === 'critical' ? 'border-red-200 bg-red-50' :
                    alert.alertType === 'warning' ? 'border-orange-200 bg-orange-50' :
                    'border-blue-200 bg-blue-50'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {alert.alertType === 'critical' && <AlertTriangle className="h-5 w-5 text-red-600" />}
                          {alert.alertType === 'warning' && <AlertTriangle className="h-5 w-5 text-orange-600" />}
                          <span className="font-medium text-gray-900">{alert.message}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                        <div className="text-xs text-gray-500">
                          {new Date(alert.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onAlertUpdate({ ...alert, status: 'acknowledged' })}
                          className="btn btn-secondary text-sm"
                        >
                          Acknowledge
                        </button>
                        <button
                          onClick={() => onAlertDelete(alert.id)}
                          className="btn btn-error text-sm"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Spike Detection Alerts */}
          {spikeAlertsEnabled && workloadSpikes.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Workload Spike Detection</h3>
              <div className="space-y-3">
                {workloadSpikes.map((spike, index) => (
                  <div key={index} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      <span className="font-medium text-orange-900">Heavy Week Detected</span>
                    </div>
                    <div className="text-sm text-orange-800">
                      <div>Week of {new Date(spike.weekStart).toLocaleDateString()}</div>
                      <div>{spike.totalHours.toFixed(1)} hours across {spike.taskCount} tasks</div>
                      <div className="mt-2 text-xs text-orange-700">
                        Consider redistributing work or starting assignments earlier
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task Focus Recommendations */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Task Focus Recommendations</h3>
            <div className="space-y-3">
              {taskRecommendations.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No pending tasks. Great job staying on top of your work!
                </div>
              ) : (
                taskRecommendations.map(task => (
                  <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">{task.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            task.urgency === 'critical' ? 'bg-red-100 text-red-700' :
                            task.urgency === 'high' ? 'bg-orange-100 text-orange-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {task.urgency}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-1">
                          {task.courseName} · {task.estimatedTime}min
                        </div>
                        <div className="text-xs text-gray-500">
                          {task.reason} · {task.daysUntilDue} days left
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 mt-1" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Burnout Prevention Tips */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Burnout Prevention Tips</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-500 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Time Management</h4>
                  <p className="text-sm text-gray-600">Use the Pomodoro Technique: 25 minutes of focused study followed by a 5-minute break.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Coffee className="h-5 w-5 text-green-500 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Regular Breaks</h4>
                  <p className="text-sm text-gray-600">Take a 15-30 minute break every 2-3 hours of studying to maintain focus and energy.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Heart className="h-5 w-5 text-red-500 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Self-Care</h4>
                  <p className="text-sm text-gray-600">Prioritize sleep, nutrition, and physical activity to maintain mental clarity.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-purple-500 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Set Realistic Goals</h4>
                  <p className="text-sm text-gray-600">Break large tasks into smaller, manageable chunks to avoid feeling overwhelmed.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
