import React, { useState } from 'react'
import { User, Settings, Bell, Target, Calendar, Award, Edit2, Save, X, ChevronDown, ChevronRight, CheckCircle, Clock, Plus } from 'lucide-react'
import { useAuth } from '../Auth/AuthManager'
import { WeeklyGoal, ProgressReflection, Task, Course, StudySession } from '../../types'

interface UserProfileProps {
  tasks?: Task[]
  courses?: Course[]
  studySessions?: StudySession[]
}

export default function UserProfile({ tasks = [], courses = [], studySessions = [] }: UserProfileProps) {
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'goals'>('profile')
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null)
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [goalForm, setGoalForm] = useState({ title: '', description: '', target: '' })
  const [customGoals, setCustomGoals] = useState<{ id: string; title: string; description: string; target: string; current: number; createdAt: string }[]>([])

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!goalForm.title.trim() || !goalForm.target.trim()) return
    setCustomGoals(prev => [...prev, {
      id: Date.now().toString(),
      title: goalForm.title.trim(),
      description: goalForm.description.trim(),
      target: goalForm.target.trim(),
      current: 0,
      createdAt: new Date().toISOString()
    }])
    setGoalForm({ title: '', description: '', target: '' })
    setShowGoalForm(false)
  }
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || ''
  })
  const [notificationSettings, setNotificationSettings] = useState(user?.preferences.notifications || {
    assignmentDueSoon: true,
    studySessionReminders: true,
    weeklyProgressUpdates: true,
    gpaUpdates: true,
    workloadSpikes: true,
    burnoutAlerts: true,
    breakReminders: true
  })

  const handleProfileSave = () => {
    if (user) {
      updateUser({
        ...profileData,
        updatedAt: new Date().toISOString()
      })
      setIsEditingProfile(false)
    }
  }

  const handleNotificationToggle = (setting: keyof typeof notificationSettings) => {
    const newSettings = { ...notificationSettings, [setting]: !notificationSettings[setting] }
    setNotificationSettings(newSettings)
    
    if (user) {
      updateUser({
        preferences: {
          ...user.preferences,
          notifications: newSettings
        },
        updatedAt: new Date().toISOString()
      })
    }
  }

  const getISOWeekStr = (date: Date): string => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const day = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - day)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
  }

  const getWeekDates = (weekStr: string) => {
    const [yearStr, weekStr2] = weekStr.split('-W')
    const year = parseInt(yearStr)
    const week = parseInt(weekStr2)
    const jan4 = new Date(year, 0, 4)
    const weekStart = new Date(jan4)
    weekStart.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7) + (week - 1) * 7)
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)
    return { weekStart, weekEnd }
  }

  const computedReflections = (() => {
    const weekMap = new Map<string, { completedTasks: number; studyMinutes: number; weekStart: Date }>()

    tasks.filter(t => t.status === 'completed' && t.dueDate).forEach(t => {
      const w = getISOWeekStr(new Date(t.dueDate!))
      const existing = weekMap.get(w)
      const { weekStart } = getWeekDates(w)
      weekMap.set(w, { completedTasks: (existing?.completedTasks ?? 0) + 1, studyMinutes: existing?.studyMinutes ?? 0, weekStart })
    })

    studySessions.filter(s => s.startTime).forEach(s => {
      const w = getISOWeekStr(new Date(s.startTime))
      const existing = weekMap.get(w)
      const { weekStart } = getWeekDates(w)
      weekMap.set(w, { completedTasks: existing?.completedTasks ?? 0, studyMinutes: (existing?.studyMinutes ?? 0) + (s.duration || 0), weekStart })
    })

    return Array.from(weekMap.entries())
      .map(([week, data]) => ({ week, ...data, studyHours: Math.round((data.studyMinutes / 60) * 10) / 10 }))
      .sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime())
  })()

  const getWeekBreakdown = (weekStr: string) => {
    const { weekStart, weekEnd } = getWeekDates(weekStr)

    const completedTasksByCourse = courses.map(course => {
      const done = tasks.filter(t =>
        t.courseId === course.id &&
        t.status === 'completed' &&
        t.dueDate &&
        new Date(t.dueDate) >= weekStart &&
        new Date(t.dueDate) <= weekEnd
      )
      return { course, completedTasks: done }
    }).filter(c => c.completedTasks.length > 0)

    const studyHoursByCourse = courses.map(course => {
      const sessions = studySessions.filter(s =>
        s.courseId === course.id &&
        new Date(s.startTime) >= weekStart &&
        new Date(s.startTime) <= weekEnd
      )
      const hours = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60
      return { course, hours: Math.round(hours * 10) / 10, sessionCount: sessions.length }
    }).filter(c => c.hours > 0)

    return { completedTasksByCourse, studyHoursByCourse }
  }

  const weeklyGoals: WeeklyGoal[] = [
    {
      id: '1',
      week: '2026-W16',
      goals: [
        { type: 'study_hours', target: 20, current: 15, unit: 'hours' },
        { type: 'tasks_completed', target: 8, current: 6, unit: 'tasks' },
        { type: 'gpa_target', target: 3.8, current: 3.7, unit: 'GPA' }
      ],
      completed: false,
      createdAt: '2026-04-15T10:00:00Z',
      updatedAt: '2026-04-21T10:00:00Z'
    }
  ]

  const progressReflections: ProgressReflection[] = [
    {
      id: '1',
      userId: user?.id || '',
      week: '2026-W15',
      academicPerformance: {
        gpa: 3.7,
        completedAssignments: 6,
        studyHours: 18
      },
      personalReflection: {
        highlights: ['Completed calculus midterm', 'Started research paper'],
        challenges: ['Balancing multiple deadlines', 'Time management'],
        improvements: ['Better planning', 'Earlier start on assignments']
      },
      nextWeekGoals: ['Complete physics lab report', 'Start studying for finals'],
      createdAt: '2026-04-14T10:00:00Z',
      updatedAt: '2026-04-14T10:00:00Z'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">User Experience</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'profile' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'settings' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Settings
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'goals' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Weekly Goals
            </button>
          </div>
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="btn btn-secondary"
            >
              {isEditingProfile ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </>
              )}
            </button>
          </div>

          <div className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center space-x-6">
              <div className="h-24 w-24 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="h-12 w-12 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{user?.username}</h3>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>

            {/* Profile Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Username</label>
                <input
                  type="text"
                  value={profileData.username}
                  onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                  className="input"
                  disabled={!isEditingProfile}
                />
              </div>

              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  className="input"
                  disabled
                />
              </div>

              <div>
                <label className="label">First Name</label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  className="input"
                  disabled={!isEditingProfile}
                />
              </div>

              <div>
                <label className="label">Last Name</label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  className="input"
                  disabled={!isEditingProfile}
                />
              </div>

              <div className="md:col-span-2">
                <label className="label">Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  className="input"
                  rows={4}
                  placeholder="Tell us about yourself..."
                  disabled={!isEditingProfile}
                />
              </div>
            </div>

            {isEditingProfile && (
              <div className="flex justify-end">
                <button
                  onClick={handleProfileSave}
                  className="btn btn-primary"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-blue-500" />
                <div>
                  <h3 className="font-medium text-gray-900">Assignment Due Soon</h3>
                  <p className="text-sm text-gray-600">Get notified when assignments are due soon</p>
                </div>
              </div>
              <button
                onClick={() => handleNotificationToggle('assignmentDueSoon')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.assignmentDueSoon ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notificationSettings.assignmentDueSoon ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-green-500" />
                <div>
                  <h3 className="font-medium text-gray-900">Study Session Reminders</h3>
                  <p className="text-sm text-gray-600">Remind yourself about scheduled study sessions</p>
                </div>
              </div>
              <button
                onClick={() => handleNotificationToggle('studySessionReminders')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.studySessionReminders ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notificationSettings.studySessionReminders ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Award className="h-5 w-5 text-purple-500" />
                <div>
                  <h3 className="font-medium text-gray-900">Weekly Progress Updates</h3>
                  <p className="text-sm text-gray-600">Receive weekly summaries of your progress</p>
                </div>
              </div>
              <button
                onClick={() => handleNotificationToggle('weeklyProgressUpdates')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.weeklyProgressUpdates ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notificationSettings.weeklyProgressUpdates ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Target className="h-5 w-5 text-orange-500" />
                <div>
                  <h3 className="font-medium text-gray-900">GPA Updates</h3>
                  <p className="text-sm text-gray-600">Only notified for major GPA changes (±0.2+) and milestones</p>
                </div>
              </div>
              <button
                onClick={() => handleNotificationToggle('gpaUpdates')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.gpaUpdates ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notificationSettings.gpaUpdates ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Target className="h-5 w-5 text-red-500" />
                <div>
                  <h3 className="font-medium text-gray-900">Workload Spikes</h3>
                  <p className="text-sm text-gray-600">Alert when workload becomes unusually high</p>
                </div>
              </div>
              <button
                onClick={() => handleNotificationToggle('workloadSpikes')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.workloadSpikes ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notificationSettings.workloadSpikes ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Target className="h-5 w-5 text-yellow-500" />
                <div>
                  <h3 className="font-medium text-gray-900">Burnout Alerts</h3>
                  <p className="text-sm text-gray-600">Get warnings about potential burnout risks</p>
                </div>
              </div>
              <button
                onClick={() => handleNotificationToggle('burnoutAlerts')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.burnoutAlerts ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notificationSettings.burnoutAlerts ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-blue-400" />
                <div>
                  <h3 className="font-medium text-gray-900">Break Reminders</h3>
                  <p className="text-sm text-gray-600">Take regular study breaks</p>
                </div>
              </div>
              <button
                onClick={() => handleNotificationToggle('breakReminders')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.breakReminders ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notificationSettings.breakReminders ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Goals Tab */}
      {activeTab === 'goals' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Weekly Goals</h2>
            <button onClick={() => setShowGoalForm(true)} className="btn btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </button>
          </div>

          {/* Add Goal Modal */}
          {showGoalForm && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Add New Goal</h3>
                  <button onClick={() => setShowGoalForm(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleAddGoal} className="p-6 space-y-4">
                  <div>
                    <label className="label">Title *</label>
                    <input
                      type="text"
                      value={goalForm.title}
                      onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                      className="input"
                      placeholder="e.g. Complete all readings"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Description</label>
                    <textarea
                      value={goalForm.description}
                      onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                      className="input"
                      rows={3}
                      placeholder="What do you want to achieve?"
                    />
                  </div>
                  <div>
                    <label className="label">Target *</label>
                    <input
                      type="text"
                      value={goalForm.target}
                      onChange={(e) => setGoalForm({ ...goalForm, target: e.target.value })}
                      className="input"
                      placeholder="e.g. 10 chapters, 20 hours, 3.8 GPA"
                      required
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="btn btn-primary">Add Goal</button>
                    <button type="button" onClick={() => setShowGoalForm(false)} className="btn btn-secondary">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Custom user-added goals */}
            {customGoals.map(goal => (
              <div key={goal.id} className="border border-primary-200 rounded-lg p-4 bg-primary-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-4 w-4 text-primary-600" />
                      <h3 className="font-medium text-gray-900">{goal.title}</h3>
                    </div>
                    {goal.description && (
                      <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                    )}
                    <div className="text-sm text-primary-700 font-medium">Target: {goal.target}</div>
                  </div>
                  <button
                    onClick={() => setCustomGoals(prev => prev.filter(g => g.id !== goal.id))}
                    className="p-1 rounded hover:bg-primary-100 text-gray-400 hover:text-red-500 transition-colors ml-2"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {weeklyGoals.map(goal => {
              const isExpanded = expandedGoalId === goal.id
              const breakdown = isExpanded ? getWeekBreakdown(goal.week) : null
              return (
                <div key={goal.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Clickable header row */}
                  <button
                    onClick={() => setExpandedGoalId(isExpanded ? null : goal.id)}
                    className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {isExpanded
                          ? <ChevronDown className="h-4 w-4 text-gray-400" />
                          : <ChevronRight className="h-4 w-4 text-gray-400" />}
                        <h3 className="font-medium text-gray-900">Week {goal.week.split('-W')[1]}</h3>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        goal.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {goal.completed ? 'Completed' : 'In Progress'}
                      </span>
                    </div>

                    <div className="mt-3 space-y-3">
                      {goal.goals.map((goalItem, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 capitalize">
                              {goalItem.type.replace(/_/g, ' ')}
                            </div>
                            <div className="text-sm text-gray-600">
                              {typeof goalItem.current === 'number' && typeof goalItem.target === 'number'
                                ? `${goalItem.current} / ${goalItem.target} ${goalItem.unit}`
                                : `${goalItem.target} ${goalItem.unit}`}
                            </div>
                          </div>
                          <div className="w-32">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary-600 h-2 rounded-full"
                                style={{
                                  width: typeof goalItem.current === 'number' && typeof goalItem.target === 'number'
                                    ? `${Math.min((goalItem.current / goalItem.target) * 100, 100)}%`
                                    : '0%'
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </button>

                  {/* Expandable breakdown */}
                  {isExpanded && breakdown && (
                    <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-5">

                      {/* Completed tasks by course */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Completed Tasks
                        </h4>
                        {breakdown.completedTasksByCourse.length === 0 ? (
                          <p className="text-sm text-gray-500">No completed tasks recorded for this week.</p>
                        ) : (
                          <div className="space-y-3">
                            {breakdown.completedTasksByCourse.map(({ course, completedTasks }) => (
                              <div key={course.id}>
                                <div className="text-xs font-semibold text-gray-600 mb-1" style={{ color: course.color }}>
                                  {course.name}
                                </div>
                                <div className="space-y-1">
                                  {completedTasks.map(task => (
                                    <div key={task.id} className="flex items-center gap-2 text-sm text-gray-700">
                                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                                      <span>{task.title}</span>
                                      {task.estimatedTime && (
                                        <span className="text-xs text-gray-400 ml-auto">{task.estimatedTime}min</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Study hours by course */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          Study Hours by Course
                        </h4>
                        {breakdown.studyHoursByCourse.length === 0 ? (
                          <p className="text-sm text-gray-500">No study sessions recorded for this week.</p>
                        ) : (
                          <div className="space-y-2">
                            {breakdown.studyHoursByCourse.map(({ course, hours, sessionCount }) => (
                              <div key={course.id} className="flex items-center gap-3">
                                <div className="w-28 text-xs font-medium text-gray-700 truncate">{course.name}</div>
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="h-2 rounded-full"
                                    style={{
                                      width: `${Math.min((hours / 10) * 100, 100)}%`,
                                      backgroundColor: course.color
                                    }}
                                  />
                                </div>
                                <div className="text-xs text-gray-600 w-20 text-right">
                                  {hours}h · {sessionCount} session{sessionCount !== 1 ? 's' : ''}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Progress Reflections — auto-generated per week */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Progress Reflections</h2>

            {computedReflections.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border border-dashed border-gray-200 rounded-lg">
                <Award className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Reflections will appear here automatically as you complete tasks and log study sessions each week.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {computedReflections.map(({ week, completedTasks, studyHours, weekStart }) => {
                  const isCurrentWeek = getISOWeekStr(new Date()) === week
                  const weekNum = week.split('-W')[1]
                  const weekEndDate = new Date(weekStart)
                  weekEndDate.setDate(weekStart.getDate() + 6)
                  return (
                    <div key={week} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="font-medium text-gray-900">Week {weekNum} Reflection</h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {weekStart.toLocaleDateString()} – {weekEndDate.toLocaleDateString()}
                          </p>
                        </div>
                        {isCurrentWeek && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Current Week</span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center bg-green-50 rounded-lg p-3">
                          <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
                          <div className="text-xs text-gray-600 mt-1">Tasks Completed</div>
                        </div>
                        <div className="text-center bg-blue-50 rounded-lg p-3">
                          <div className="text-2xl font-bold text-blue-600">{studyHours}h</div>
                          <div className="text-xs text-gray-600 mt-1">Study Time</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
