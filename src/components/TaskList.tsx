import React, { useState } from 'react'
import { Clock, Calendar, AlertCircle, CheckCircle2, Plus, Filter } from 'lucide-react'
import { Task, Course } from '../types'

interface TaskListProps {
  tasks: Task[]
  courses: Course[]
  onTaskUpdate: (task: Task) => void
  onTaskDelete: (taskId: string) => void
  onTaskCreate: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
}

export default function TaskList({ tasks, courses, onTaskUpdate, onTaskDelete, onTaskCreate }: TaskListProps) {
  const [showNewTaskForm, setShowNewTaskForm] = useState(false)
  const [filter, setFilter] = useState<'all' | 'course' | 'priority'>('all')
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [selectedPriority, setSelectedPriority] = useState<string>('')

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true
    if (filter === 'course' && selectedCourse) return task.courseId === selectedCourse
    if (filter === 'priority' && selectedPriority) return task.priority === selectedPriority
    return true
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
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

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Academic Tasks</h2>
          
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
                }}
                className="input w-40"
              >
                <option value="all">All Tasks</option>
                <option value="course">By Course</option>
                <option value="priority">By Priority</option>
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

      {/* New Task Form */}
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

      {/* Tasks List */}
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
                    <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
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

                  {/* Progress Bar */}
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
                    onClick={() => {/* TODO: Open edit modal */}}
                    className="btn btn-secondary text-sm"
                  >
                    Edit
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
    </div>
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
