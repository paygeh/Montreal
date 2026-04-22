import React, { useState } from 'react'
import { Calendar, TrendingUp, AlertTriangle, Clock, BarChart3, Plus, Filter, ChevronRight, Project, Target } from 'lucide-react'
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
  const [selectedWeek, setSelectedWeek] = useState<string>(new Date().toISOString().split('T')[0])
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

  const getCalendarData = () => {
    const data = []
    const today = new Date()
    
    for (let i = 0; i < 35; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - (today.getDay() - 1) + i)
      
      const dayTasks = tasks.filter(task => {
        if (!task.dueDate) return false
        const dueDate = new Date(task.dueDate)
        return dueDate.toDateString() === date.toDateString()
      })
      
      const totalMinutes = dayTasks.reduce((sum, task) => sum + (task.estimatedTime || 0), 0)
      const totalHours = totalMinutes / 60
      
      data.push({
        date: date.getDate(),
        fullDate: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en', { weekday: 'short' }),
        hours: totalHours,
        tasks: dayTasks.length,
        intensity: totalHours > 4 ? 'high' : totalHours > 2 ? 'medium' : 'light'
      })
    }
    
    return data
  }

  const currentWeekTasks = getCurrentWeekTasks()
  const workloadSpikes = detectWorkloadSpikes()
  const weeklyComparison = getWeeklyComparisonData()
  const courseWorkload = getCourseWorkload()
  const calendarData = getCalendarData()

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
              onClick={() => setActiveTab('calendar')}
              className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'calendar' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Calendar
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Week Homework */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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

          {/* Ongoing Projects Sidebar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Ongoing Projects</h3>
              <button
                onClick={() => setShowAddProject(true)}
                className="btn btn-primary text-sm"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </button>
            </div>

            <div className="space-y-3">
              {ongoingProjects.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No ongoing projects.
                </div>
              ) : (
                ongoingProjects.map(project => {
                  const progress = project.progressPercentage || 0
                  const daysUntilDue = project.endDate ? Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0
                  
                  return (
                    <div key={project.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">{project.title}</h4>
                        <button
                          onClick={() => onProjectDelete(project.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                      <div className="text-xs text-gray-600 mb-2">
                        {project.courseId ? courses.find(c => c.id === project.courseId)?.name : 'No course'}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>Progress: {progress}%</span>
                          <span>{daysUntilDue > 0 ? `${daysUntilDue} days left` : 'Overdue'}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${progress}%` }}
                          />
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

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar View */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Workload Calendar</h3>
            
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {calendarData.map((day, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-2 min-h-[80px] cursor-pointer hover:shadow-md transition-shadow ${
                    day.intensity === 'extreme' ? 'border-red-300 bg-red-50' :
                    day.intensity === 'high' ? 'border-orange-300 bg-orange-50' :
                    day.intensity === 'medium' ? 'border-yellow-300 bg-yellow-50' :
                    'border-gray-200 bg-white'
                  }`}
                >
                  <div className="text-sm font-medium mb-1">{day.date}</div>
                  {day.tasks > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs text-gray-600">{day.tasks} tasks</div>
                      <div className="text-xs font-medium">{day.hours.toFixed(1)}h</div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
                <span>Light (&lt;2h)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-50 border border-yellow-200 rounded"></div>
                <span>Medium (2-4h)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-50 border border-orange-200 rounded"></div>
                <span>High (4-6h)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
                <span>Extreme (&gt;6h)</span>
              </div>
            </div>
          </div>

          {/* Workload Spike Detection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Workload Spike Detection</h3>
            
            <div className="space-y-3">
              {workloadSpikes.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No workload spikes detected.
                </div>
              ) : (
                workloadSpikes.map((spike, index) => (
                  <div key={index} className="border border-red-200 rounded-lg p-3 bg-red-50">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="font-medium text-red-900">Heavy Week Detected</span>
                    </div>
                    <div className="text-sm text-gray-700">
                      <div>Week of {new Date(spike.weekStart).toLocaleDateString()}</div>
                      <div>{spike.tasks} tasks, {spike.totalHours.toFixed(1)} hours</div>
                      <div className="mt-2 text-xs text-red-600">
                        Consider redistributing work or starting earlier
                      </div>
                    </div>
                  </div>
                ))
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ongoingProjects.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                No ongoing projects. Add your first project to get started!
              </div>
            ) : (
              ongoingProjects.map(project => {
                const progress = project.progressPercentage || 0
                const daysUntilDue = project.endDate ? Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0
                
                return (
                  <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{project.title}</h4>
                      <button
                        onClick={() => onProjectDelete(project.id)}
                        className="text-red-500 hover:text-red-700"
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

      {/* Weekly Comparison Chart */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Workload Comparison */}
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

          {/* Course Workload Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Course Workload Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={courseWorkload}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" fill="#10b981" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>
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
