import React, { useState } from 'react'
import { Calendar, TrendingUp, AlertTriangle, Clock, Plus, Target } from 'lucide-react'
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { Task, Course, WorkloadRecord, OngoingProject } from '../types'

interface WorkloadAnalyzerProps {
  tasks: Task[]
  courses: Course[]
  workloadRecords: WorkloadRecord[]
  ongoingProjects: OngoingProject[]
  onWorkloadRecordAdd: (record: Omit<WorkloadRecord, 'id' | 'createdAt' | 'updatedAt'>) => void
  onProjectAdd: (project: Omit<OngoingProject, 'id' | 'createdAt' | 'updatedAt'>) => void
  onProjectUpdate: (project: OngoingProject) => void
  onProjectDelete: (projectId: string) => void
}

export default function WorkloadAnalyzer({ 
  tasks, 
  courses, 
  workloadRecords, 
  ongoingProjects, 
  onWorkloadRecordAdd, 
  onProjectAdd, 
  onProjectUpdate, 
  onProjectDelete 
}: WorkloadAnalyzerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'projects'>('overview')
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [showAddProject, setShowAddProject] = useState(false)

  const getWeekStartDate = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff))
  }

  const getWeekTasks = (weekStart: Date) => {
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    
    return tasks.filter(task => {
      if (!task.dueDate) return false
      const dueDate = new Date(task.dueDate)
      return dueDate >= weekStart && dueDate <= weekEnd
    })
  }

  const getWorkloadIntensity = (tasks: Task[]) => {
    const totalMinutes = tasks.reduce((sum, task) => sum + (task.estimatedTime || 0), 0)
    const totalHours = totalMinutes / 60
    
    if (totalHours < 10) return 'light'
    if (totalHours < 20) return 'medium'
    if (totalHours < 30) return 'high'
    return 'extreme'
  }

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'light': return 'bg-green-100 text-green-800 border-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'extreme': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const detectWorkloadSpikes = () => {
    const spikeWeeks = []
    const today = new Date()
    
    for (let i = 0; i < 8; i++) {
      const weekStart = getWeekStartDate(new Date(today))
      weekStart.setDate(weekStart.getDate() - (i * 7))
      
      const weekTasks = getWeekTasks(weekStart)
      const intensity = getWorkloadIntensity(weekTasks)
      
      if (intensity === 'high' || intensity === 'extreme') {
        spikeWeeks.push({
          weekStart: weekStart.toISOString().split('T')[0],
          intensity,
          taskCount: weekTasks.length,
          totalHours: weekTasks.reduce((sum, task) => sum + (task.estimatedTime || 0), 0) / 60
        })
      }
    }
    
    return spikeWeeks
  }

  const getWeeklyComparisonData = () => {
    const data = []
    const today = new Date()
    
    for (let i = 7; i >= 0; i--) {
      const weekStart = getWeekStartDate(new Date(today))
      weekStart.setDate(weekStart.getDate() - (i * 7))
      
      const weekTasks = getWeekTasks(weekStart)
      const totalHours = weekTasks.reduce((sum, task) => sum + (task.estimatedTime || 0), 0) / 60
      
      data.push({
        week: `Week ${8 - i}`,
        date: weekStart.toLocaleDateString(),
        hours: Math.round(totalHours * 10) / 10,
        tasks: weekTasks.length,
        intensity: getWorkloadIntensity(weekTasks)
      })
    }
    
    return data
  }

  const getCurrentWeekTasks = () => {
    const weekStart = getWeekStartDate(new Date())
    return getWeekTasks(weekStart)
  }

  const getCourseWorkload = () => {
    const currentWeekTasks = getCurrentWeekTasks()
    return courses.map(course => {
      const courseTasks = currentWeekTasks.filter(task => task.courseId === course.id)
      const totalHours = courseTasks.reduce((sum, task) => sum + (task.estimatedTime || 0), 0) / 60
      
      return {
        name: course.name,
        hours: Math.round(totalHours * 10) / 10,
        tasks: courseTasks.length,
        color: course.color || '#3b82f6'
      }
    }).filter(course => course.hours > 0)
  }

  const getCalendarData = (month: Date) => {
    const year = month.getFullYear()
    const mon  = month.getMonth()
    const firstDay = new Date(year, mon, 1)
    const lastDay  = new Date(year, mon + 1, 0)

    // Monday-based offset (Mon=0 … Sun=6)
    const startOffset = (firstDay.getDay() + 6) % 7
    // Pad to complete the last row
    const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7

    const data: ({
      date: number; fullDate: string; hours: number; taskCount: number; intensity: string; taskList: Task[]
    } | null)[] = []

    for (let i = 0; i < totalCells; i++) {
      const dayIndex = i - startOffset + 1
      if (dayIndex < 1 || dayIndex > lastDay.getDate()) {
        data.push(null)
        continue
      }
      const date = new Date(year, mon, dayIndex)
      const dayTasks = tasks.filter(task => {
        if (!task.dueDate) return false
        return new Date(task.dueDate).toDateString() === date.toDateString()
      })
      const totalHours = dayTasks.reduce((sum, task) => sum + (task.estimatedTime || 0), 0) / 60
      data.push({
        date: dayIndex,
        fullDate: date.toISOString().split('T')[0],
        hours: totalHours,
        taskCount: dayTasks.length,
        taskList: dayTasks,
        intensity: totalHours > 6 ? 'extreme' : totalHours > 4 ? 'high' : totalHours > 2 ? 'medium' : totalHours > 0 ? 'light' : 'none'
      })
    }
    return data
  }

  const currentWeekTasks = getCurrentWeekTasks()
  const workloadSpikes = detectWorkloadSpikes()
  const weeklyComparison = getWeeklyComparisonData()
  const courseWorkload = getCourseWorkload()
  const calendarData = getCalendarData(calendarMonth)

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Workload Analyzer</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'overview' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'projects' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Projects
            </button>
          </div>
        </div>

        {/* Current Week Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">
              {currentWeekTasks.length}
            </div>
            <div className="text-sm text-gray-600">Tasks This Week</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(currentWeekTasks.reduce((sum, task) => sum + (task.estimatedTime || 0), 0) / 60 * 10) / 10}h
            </div>
            <div className="text-sm text-gray-600">Total Hours</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {workloadSpikes.length}
            </div>
            <div className="text-sm text-gray-600">Heavy Weeks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {ongoingProjects.length}
            </div>
            <div className="text-sm text-gray-600">Active Projects</div>
          </div>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Current Week Homework */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">This Week's Homework</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getIntensityColor(getWorkloadIntensity(currentWeekTasks))}`}>
                {getWorkloadIntensity(currentWeekTasks).charAt(0).toUpperCase() + getWorkloadIntensity(currentWeekTasks).slice(1)} Workload
              </span>
            </div>

            <div className="space-y-3">
              {currentWeekTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No homework due this week.
                </div>
              ) : (
                currentWeekTasks
                  .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
                  .map(task => {
                    const course = courses.find(c => c.id === task.courseId)
                    return (
                      <div key={task.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900">{task.title}</h4>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                task.priority === 'high' ? 'bg-red-100 text-red-700' :
                                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {task.priority}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {task.estimatedTime || 0}min
                              </span>
                              <span className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                {course?.name || 'Unknown'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
              )}
            </div>
          </div>

        </div>
      )}

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Project Management</h3>
            <button
              onClick={() => setShowAddProject(true)}
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </button>
          </div>

          {/* Stale project reminder banner */}
          {(() => {
            const stale = ongoingProjects.filter(p =>
              p.status !== 'completed' && p.status !== 'cancelled' &&
              (new Date().getTime() - new Date(p.updatedAt).getTime()) > 7 * 24 * 60 * 60 * 1000
            )
            return stale.length > 0 ? (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-lg p-4 mb-6">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-amber-800 text-sm">
                    {stale.length} project{stale.length !== 1 ? 's haven\'t' : ' hasn\'t'} been updated in over a week
                  </p>
                  <p className="text-amber-700 text-xs mt-0.5">
                    {stale.map(p => p.title).join(', ')} — consider logging new progress.
                  </p>
                </div>
              </div>
            ) : null
          })()}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ongoingProjects.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                No ongoing projects. Add your first project to get started!
              </div>
            ) : (
              ongoingProjects.map(project => {
                const progress = project.progressPercentage || 0
                const daysUntilDue = project.endDate ? Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0
                
                const daysSinceUpdate = Math.floor((new Date().getTime() - new Date(project.updatedAt).getTime()) / (1000 * 60 * 60 * 24))
                const isStale = project.status !== 'completed' && project.status !== 'cancelled' && daysSinceUpdate >= 7

                return (
                  <div key={project.id} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                    isStale ? 'border-amber-300 bg-amber-50' : 'border-gray-200'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{project.title}</h4>
                        {isStale && (
                          <div className="flex items-center gap-1 mt-1">
                            <AlertTriangle className="h-3 w-3 text-amber-500" />
                            <span className="text-xs text-amber-600 font-medium">No update for {daysSinceUpdate} days</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => onProjectDelete(project.id)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        ×
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">
                        {project.courseId ? courses.find(c => c.id === project.courseId)?.name : 'No course'}
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        {project.startDate && `Start: ${new Date(project.startDate).toLocaleDateString()}`}
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        {project.endDate && `Due: ${new Date(project.endDate).toLocaleDateString()}`}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        <span className={
                          daysUntilDue > 7 ? 'text-green-600' :
                          daysUntilDue > 3 ? 'text-yellow-600' :
                          daysUntilDue > 0 ? 'text-orange-600' :
                          'text-red-600'
                        }>
                          {daysUntilDue > 0 ? `${daysUntilDue} days left` : 'Overdue'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* Weekly Comparison + Calendar — inside overview */}
      {activeTab === 'overview' && (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Weekly Workload Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart data={weeklyComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={2} />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>

          {/* Calendar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}
                className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
              >
                ← Previous
              </button>
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900">
                  {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCalendarMonth(new Date())}
                  className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}
                  className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="text-center text-xs font-bold text-gray-500 uppercase tracking-wider py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarData.map((day, index) => {
                if (!day) return <div key={index} className="min-h-[90px]" />
                const isToday = day.fullDate === new Date().toISOString().split('T')[0]
                const cellStyle =
                  day.intensity === 'extreme' ? 'bg-red-500 border-red-600 text-white shadow-md' :
                  day.intensity === 'high'    ? 'bg-orange-400 border-orange-500 text-white shadow-md' :
                  day.intensity === 'medium'  ? 'bg-yellow-300 border-yellow-400 text-yellow-900' :
                  day.intensity === 'light'   ? 'bg-emerald-200 border-emerald-400 text-emerald-900' :
                                               'bg-gray-50 border-gray-200 text-gray-500'
                return (
                  <div
                    key={index}
                    className={`relative group border-2 rounded-xl p-2 min-h-[90px] cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${
                      isToday ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                    } ${cellStyle}`}
                  >
                    <div className={`text-sm font-bold mb-1 ${
                      isToday ? 'bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs' : ''
                    }`}>
                      {day.date}
                    </div>
                    {day.taskCount > 0 && (
                      <div className="flex flex-wrap gap-0.5">
                        {Array.from({ length: Math.min(day.taskCount, 5) }).map((_, i) => (
                          <div key={i} className={`w-2 h-2 rounded-full ${
                            day.intensity === 'extreme' ? 'bg-red-200' :
                            day.intensity === 'high'    ? 'bg-orange-200' :
                            day.intensity === 'medium'  ? 'bg-yellow-600' :
                                                         'bg-emerald-600'
                          }`} />
                        ))}
                        {day.taskCount > 5 && <span className="text-xs opacity-75">+{day.taskCount - 5}</span>}
                      </div>
                    )}
                    {day.taskCount > 0 && (
                      <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-56 pointer-events-none">
                        <div className="bg-gray-900 text-white rounded-xl shadow-xl p-3 text-left">
                          <div className="font-semibold text-sm mb-2 border-b border-gray-700 pb-1">
                            {new Date(day.fullDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                          </div>
                          <div className="text-xs text-gray-300 mb-2">
                            {day.taskCount} task{day.taskCount !== 1 ? 's' : ''} · {day.hours.toFixed(1)}h total
                          </div>
                          <div className="space-y-2">
                            {day.taskList.map(task => (
                              <div key={task.id} className={`border-l-2 pl-2 ${
                                task.priority === 'high'   ? 'border-red-400' :
                                task.priority === 'medium' ? 'border-yellow-400' :
                                                             'border-green-400'
                              }`}>
                                <div className="font-medium text-xs text-white truncate">{task.title}</div>
                                <div className="text-xs text-gray-400 flex gap-2 mt-0.5">
                                  <span className={`capitalize ${
                                    task.priority === 'high'   ? 'text-red-400' :
                                    task.priority === 'medium' ? 'text-yellow-400' :
                                                                 'text-green-400'
                                  }`}>{task.priority}</span>
                                  {task.estimatedTime && <span>{task.estimatedTime}min</span>}
                                  {task.courseId && <span>{courses.find(c => c.id === task.courseId)?.name}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-center">
                          <div className="w-3 h-3 bg-gray-900 rotate-45 -mt-1.5" />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2"><div className="w-5 h-5 bg-gray-50 border-2 border-gray-200 rounded-lg"></div><span className="text-gray-600">Free</span></div>
              <div className="flex items-center gap-2"><div className="w-5 h-5 bg-emerald-200 border-2 border-emerald-400 rounded-lg"></div><span className="text-gray-600">Light (&lt;2h)</span></div>
              <div className="flex items-center gap-2"><div className="w-5 h-5 bg-yellow-300 border-2 border-yellow-400 rounded-lg"></div><span className="text-gray-600">Medium (2–4h)</span></div>
              <div className="flex items-center gap-2"><div className="w-5 h-5 bg-orange-400 border-2 border-orange-500 rounded-lg"></div><span className="text-gray-600">High (4–6h)</span></div>
              <div className="flex items-center gap-2"><div className="w-5 h-5 bg-red-500 border-2 border-red-600 rounded-lg"></div><span className="text-gray-600">Extreme (&gt;6h)</span></div>
              <div className="flex items-center gap-2"><div className="w-5 h-5 bg-white border-2 border-blue-500 rounded-lg ring-2 ring-blue-500 ring-offset-1"></div><span className="text-gray-600">Today</span></div>
            </div>
          </div>
        </>
      )}

      {/* Add Project Modal */}
      {showAddProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Add Ongoing Project</h3>
            <AddProjectForm
              courses={courses}
              onSubmit={(projectData) => {
                onProjectAdd(projectData)
                setShowAddProject(false)
              }}
              onCancel={() => setShowAddProject(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

interface AddProjectFormProps {
  courses: Course[]
  onSubmit: (project: Omit<OngoingProject, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

function AddProjectForm({ courses, onSubmit, onCancel }: AddProjectFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    courseId: '',
    startDate: '',
    endDate: '',
    progressPercentage: 0
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    onSubmit({
      ...formData,
      progressPercentage: parseInt(formData.progressPercentage.toString()),
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Project Title *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="input"
          placeholder="e.g., Research Paper, Group Project"
          required
        />
      </div>

      <div>
        <label className="label">Course</label>
        <select
          value={formData.courseId}
          onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
          className="input"
        >
          <option value="">Select a course (optional)</option>
          {courses.map(course => (
            <option key={course.id} value={course.id}>{course.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Start Date</label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="input"
          />
        </div>

        <div>
          <label className="label">End Date</label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="input"
          />
        </div>
      </div>

      <div>
        <label className="label">Progress (%)</label>
        <input
          type="number"
          min="0"
          max="100"
          value={formData.progressPercentage}
          onChange={(e) => setFormData({ ...formData, progressPercentage: parseInt(e.target.value) || 0 })}
          className="input"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button type="submit" className="btn btn-primary">
          Add Project
        </button>
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  )
}
