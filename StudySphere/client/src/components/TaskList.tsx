import React, { useState } from 'react'
import { Clock, Calendar, AlertCircle, CheckCircle2, Plus, Filter, Edit2, X } from 'lucide-react'
import { Task, Course } from '../types'

interface TaskListProps {
  tasks: Task[]
  courses: Course[]
  onTaskUpdate: (task: Task) => void
  onTaskDelete: (taskId: string) => void
  onTaskCreate: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCourseCreate?: (course: { name: string; instructor?: string; semester?: string }) => void
}

export default function TaskList({ tasks, courses, onTaskUpdate, onTaskDelete, onTaskCreate, onCourseCreate }: TaskListProps) {
  const [showNewTaskForm, setShowNewTaskForm] = useState(false)
  const [filter, setFilter] = useState<'all' | 'course' | 'priority' | 'dueDate'>('all')
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [selectedPriority, setSelectedPriority] = useState<string>('')
  const [selectedDueDate, setSelectedDueDate] = useState<string>('')
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'title'>('priority')
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showCourseForm, setShowCourseForm] = useState(false)

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true
    if (filter === 'course' && selectedCourse) return task.courseId === selectedCourse
    if (filter === 'priority' && selectedPriority) return task.priority === selectedPriority
    if (filter === 'dueDate' && selectedDueDate) {
      if (!task.dueDate) return false
      const taskDueDate = new Date(task.dueDate).toDateString()
      const filterDate = new Date(selectedDueDate).toDateString()
      return taskDueDate === filterDate
    }
    return true
  }).sort((a, b) => {
    // Sort by priority (high to low)
    if (sortBy === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]
    }
    
    // Sort by due date (earliest to latest)
    if (sortBy === 'dueDate') {
      if (!a.dueDate && !b.dueDate) return 0
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    }
    
    // Sort by title (alphabetical)
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title)
    }
    
    return 0
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getPriorityDisplay = (priority: string) => {
    switch (priority) {
      case 'high': return '!!! High'
      case 'medium': return '!! Medium'
      case 'low': return '! Low'
      default: return priority
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return '!!!'
      case 'medium': return '!!'
      case 'low': return '!'
      default: return ''
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId)
    return course?.name || 'Unknown Course'
  }

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toDateString()
    return filteredTasks.filter(task => {
      if (!task.dueDate) return false
      return new Date(task.dueDate).toDateString() === dateStr
    })
  }

  const [currentMonth, setCurrentMonth] = useState(new Date())

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">Academic Tasks</h2>
            
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>List</span>
                </div>
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'calendar' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Calendar</span>
                </div>
              </button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Filter Dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value as any)
                  setSelectedCourse('')
                  setSelectedPriority('')
                  setSelectedDueDate('')
                }}
                className="input w-40"
              >
                <option value="all">All Tasks</option>
                <option value="course">By Course</option>
                <option value="priority">By Priority</option>
                <option value="dueDate">By Due Date</option>
              </select>
            </div>

            {/* Course Filter */}
            {filter === 'course' && (
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="input w-48"
              >
                <option value="">All Courses</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </select>
            )}

            {/* Priority Filter */}
            {filter === 'priority' && (
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="input w-40"
              >
                <option value="">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            )}

            {/* Due Date Filter */}
            {filter === 'dueDate' && (
              <input
                type="date"
                value={selectedDueDate}
                onChange={(e) => setSelectedDueDate(e.target.value)}
                className="input w-48"
                placeholder="Select due date"
              />
            )}

            {/* Sort By */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="input w-32"
              >
                <option value="priority">Priority (High → Low)</option>
                <option value="dueDate">Due Date (Earliest → Latest)</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>

            {/* Add Course Button */}
            {onCourseCreate && (
              <button
                onClick={() => setShowCourseForm(true)}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Course
              </button>
            )}
            {/* Add Task Button */}
            <button
              onClick={() => setShowNewTaskForm(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{tasks.length}</div>
            <div className="text-sm text-gray-600">Total Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {tasks.filter(t => t.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {tasks.filter(t => t.status === 'in_progress').length}
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {tasks.filter(t => t.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
        </div>
      </div>

      {/* Add Course Modal */}
      {showCourseForm && onCourseCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Add Course</h3>
              <button onClick={() => setShowCourseForm(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <NewCourseForm
                onSubmit={(course) => {
                  onCourseCreate(course)
                  setShowCourseForm(false)
                }}
                onCancel={() => setShowCourseForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Edit Task</h3>
              <button onClick={() => setEditingTask(null)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <EditTaskForm
                task={editingTask}
                courses={courses}
                onSubmit={(updated) => {
                  onTaskUpdate(updated)
                  setEditingTask(null)
                }}
                onCancel={() => setEditingTask(null)}
              />
            </div>
          </div>
        </div>
      )}

      {showNewTaskForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Create New Task</h3>
          <NewTaskForm
            courses={courses}
            onSubmit={(taskData) => {
              onTaskCreate(taskData)
              setShowNewTaskForm(false)
            }}
            onCancel={() => setShowNewTaskForm(false)}
          />
        </div>
      )}

      {/* Tasks List or Calendar View */}
      {viewMode === 'list' ? (
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className="text-gray-500">
                {filter === 'all' ? 'No tasks found. Create your first task!' : 
                 filter === 'course' ? 'No tasks found for this course.' :
                 'No tasks found for this priority level.'}
              </div>
            </div>
          ) : (
            filteredTasks.map(task => (
              <div key={task.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(task.status)}
                      <h3 className="text-lg font-semibold text-gray-900">
                        <span className="font-bold mr-1">{getPriorityBadge(task.priority)}</span>{task.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {task.estimatedTime ? `${task.estimatedTime} min` : 'No estimate'}
                      </span>
                      <span className="flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {getCourseName(task.courseId)}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                    )}

                    {task.estimatedTime && task.actualTime && (
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${Math.min((task.actualTime / task.estimatedTime) * 100, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onTaskUpdate({ ...task, status: task.status === 'completed' ? 'pending' : 'completed' })}
                      className={`btn ${task.status === 'completed' ? 'btn-secondary' : 'btn-success'} text-sm`}
                    >
                      {task.status === 'completed' ? 'Mark Incomplete' : 'Mark Complete'}
                    </button>
                    <button
                      onClick={() => setEditingTask(task)}
                      className="btn btn-secondary text-sm"
                    >
                      <Edit2 className="h-3 w-3 mr-1" />Edit
                    </button>
                    <button
                      onClick={() => onTaskDelete(task.id)}
                      className="btn btn-error text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Calendar View with Task List */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-gray-600">← Previous</span>
                </button>
                <h3 className="text-lg font-semibold text-gray-900">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-gray-600">Next →</span>
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {getDaysInMonth(currentMonth).map((day, index) => {
                  const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                  const tasksForDay = day ? getTasksForDate(currentDate) : []
                  const isToday = day && currentDate.toDateString() === new Date().toDateString()
                  
                  return (
                    <div
                      key={index}
                      className={`min-h-[80px] p-2 border border-gray-200 rounded-lg ${
                        isToday ? 'bg-primary-50 border-primary-200' : 'bg-white'
                      }`}
                    >
                      {day && (
                        <>
                          <div className={`text-sm font-medium ${
                            isToday ? 'text-primary-600' : 'text-gray-900'
                          }`}>
                            {day}
                          </div>
                          {tasksForDay.length > 0 && (
                            <div className="mt-1 space-y-1">
                              {tasksForDay.slice(0, 2).map((task, taskIndex) => (
                                <div
                                  key={task.id}
                                  className={`text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 ${
                                    task.priority === 'high' ? 'bg-red-100 text-red-700' :
                                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700'
                                  }`}
                                  title={task.title}
                                >
                                  {getPriorityBadge(task.priority)} {task.title}
                                </div>
                              ))}
                              {tasksForDay.length > 2 && (
                                <div className="text-xs text-gray-500 text-center">
                                  +{tasksForDay.length - 2} more
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Task List Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks for {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
              
              {filteredTasks.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">No tasks found for this month</div>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {filteredTasks.map(task => (
                    <div key={task.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(task.status)}
                            <h4 className="font-medium text-gray-900">
                              <span className="font-bold mr-1">{getPriorityBadge(task.priority)}</span>{task.title}
                            </h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                            </span>
                            <span className="flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {getCourseName(task.courseId)}
                            </span>
                          </div>

                          {task.description && (
                            <p className="text-gray-600 text-sm">{task.description}</p>
                          )}

                          {/* Progress Bar */}
                          {task.estimatedTime && task.actualTime && (
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                              <div
                                className="bg-primary-600 h-1.5 rounded-full"
                                style={{ width: `${Math.min((task.actualTime / task.estimatedTime) * 100, 100)}%` }}
                              />
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onTaskUpdate({ ...task, status: task.status === 'completed' ? 'pending' : 'completed' })}
                            className={`btn ${task.status === 'completed' ? 'btn-secondary' : 'btn-success'} text-xs`}
                          >
                            {task.status === 'completed' ? '↺' : '✓'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface EditTaskFormProps {
  task: Task
  courses: Course[]
  onSubmit: (task: Task) => void
  onCancel: () => void
}

function EditTaskForm({ task, courses, onSubmit, onCancel }: EditTaskFormProps) {
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || '',
    courseId: task.courseId || '',
    priority: task.priority as 'high' | 'medium' | 'low',
    status: task.status as 'pending' | 'in_progress' | 'completed',
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    estimatedTime: task.estimatedTime ? String(task.estimatedTime) : ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return
    onSubmit({
      ...task,
      ...formData,
      estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : undefined,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
      updatedAt: new Date().toISOString()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Task Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="input"
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
            <option value="">No course</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Priority *</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
            className="input"
            required
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div>
          <label className="label">Status *</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            className="input"
            required
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label className="label">Due Date</label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className="input"
          />
        </div>

        <div>
          <label className="label">Estimated Time (minutes)</label>
          <input
            type="number"
            value={formData.estimatedTime}
            onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
            className="input"
            placeholder="60"
            min="1"
          />
        </div>

        <div className="md:col-span-2">
          <label className="label">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input"
            rows={3}
            placeholder="Enter task description (optional)"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn btn-primary">Save Changes</button>
        <button type="button" onClick={onCancel} className="btn btn-secondary">Cancel</button>
      </div>
    </form>
  )
}

interface NewTaskFormProps {
  courses: Course[]
  onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

function NewTaskForm({ courses, onSubmit, onCancel }: NewTaskFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    dueDate: '',
    estimatedTime: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    const taskData = {
      ...formData,
      estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : undefined,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined
    }
    onSubmit(taskData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Task Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="input"
            placeholder="Enter task title"
            required
          />
        </div>

        <div>
          <label className="label">Course *</label>
          <select
            value={formData.courseId}
            onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
            className="input"
            required
          >
            <option value="">Select a course</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Priority *</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
            className="input"
            required
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div>
          <label className="label">Due Date</label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className="input"
          />
        </div>

        <div>
          <label className="label">Estimated Time (minutes)</label>
          <input
            type="number"
            value={formData.estimatedTime}
            onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
            className="input"
            placeholder="60"
            min="1"
          />
        </div>

        <div className="md:col-span-2">
          <label className="label">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input"
            rows={3}
            placeholder="Enter task description (optional)"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button type="submit" className="btn btn-primary">
          Create Task
        </button>
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  )
}

interface NewCourseFormProps {
  onSubmit: (course: { name: string; instructor?: string; semester?: string }) => void
  onCancel: () => void
}

function NewCourseForm({ onSubmit, onCancel }: NewCourseFormProps) {
  const [formData, setFormData] = useState({ name: '', instructor: '', semester: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    onSubmit({
      name: formData.name.trim(),
      instructor: formData.instructor.trim() || undefined,
      semester: formData.semester.trim() || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Course Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="input"
          placeholder="e.g. Introduction to Psychology"
          required
          autoFocus
        />
      </div>
      <div>
        <label className="label">Professor <span className="text-gray-400 font-normal">(optional)</span></label>
        <input
          type="text"
          value={formData.instructor}
          onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
          className="input"
          placeholder="e.g. Dr. Smith"
        />
      </div>
      <div>
        <label className="label">Semester <span className="text-gray-400 font-normal">(optional)</span></label>
        <input
          type="text"
          value={formData.semester}
          onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
          className="input"
          placeholder="e.g. Fall 2025"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn btn-primary">Add Course</button>
        <button type="button" onClick={onCancel} className="btn btn-secondary">Cancel</button>
      </div>
    </form>
  )
}
