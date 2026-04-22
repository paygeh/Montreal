import React, { useState } from 'react'
import { Calendar, Clock, MapPin, BookOpen, TrendingUp, Plus, Filter, BarChart3, LineChart } from 'lucide-react'
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart as RechartsBarChart, Bar } from 'recharts'
import { StudySession, Course } from '../types'

interface StudyTimeTrackerProps {
  studySessions: StudySession[]
  courses: Course[]
  onSessionAdd: (session: Omit<StudySession, 'id' | 'createdAt' | 'updatedAt'>) => void
  onSessionUpdate: (session: StudySession) => void
  onSessionDelete: (sessionId: string) => void
}

export default function StudyTimeTracker({ studySessions, courses, onSessionAdd, onSessionUpdate, onSessionDelete }: StudyTimeTrackerProps) {
  const [activeTab, setActiveTab] = useState<'calendar' | 'analysis' | 'performance'>('calendar')
  const [showAddSession, setShowAddSession] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [filter, setFilter] = useState<'all' | 'course'>('all')
  const [selectedCourse, setSelectedCourse] = useState<string>('')

  const filteredSessions = studySessions.filter(session => {
    if (filter === 'all') return true
    if (filter === 'course' && selectedCourse) return session.courseId === selectedCourse
    return true
  })

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId)
    return course?.name || 'Unknown Course'
  }

  const getCourseColor = (courseId: string) => {
    const course = courses.find(c => c.id === courseId)
    return course?.color || '#3b82f6'
  }

  const getStudyTimeByCourse = () => {
    return courses.map(course => {
      const courseSessions = studySessions.filter(s => s.courseId === course.id)
      const totalMinutes = courseSessions.reduce((sum, session) => sum + (session.duration || 0), 0)
      return {
        name: course.name,
        hours: Math.round(totalMinutes / 60 * 10) / 10,
        sessions: courseSessions.length
      }
    })
  }

  const getStudyVsPerformanceData = () => {
    return courses.map(course => {
      const courseSessions = studySessions.filter(s => s.courseId === course.id)
      const totalMinutes = courseSessions.reduce((sum, session) => sum + (session.duration || 0), 0)
      const hours = Math.round(totalMinutes / 60 * 10) / 10
      const grade = parseFloat(course.currentGrade || '0')
      
      return {
        name: course.name,
        studyHours: hours,
        grade: grade,
        efficiency: grade > 0 ? Math.round((grade / hours) * 100) / 100 : 0
      }
    })
  }

  const getWeeklyStudyData = () => {
    const weekData = []
    const today = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const daySessions = studySessions.filter(s => s.startTime.startsWith(dateStr))
      const totalMinutes = daySessions.reduce((sum, session) => sum + (session.duration || 0), 0)
      
      weekData.push({
        date: date.toLocaleDateString('en', { weekday: 'short' }),
        hours: Math.round(totalMinutes / 60 * 10) / 10,
        sessions: daySessions.length
      })
    }
    
    return weekData
  }

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Study Time Tracker</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'calendar' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Calendar
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'analysis' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Analysis
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'performance' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Performance
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">
              {Math.round(studySessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60)}
            </div>
            <div className="text-sm text-gray-600">Total Study Hours</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success-600">
              {studySessions.length}
            </div>
            <div className="text-sm text-gray-600">Study Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {studySessions.length > 0 ? Math.round(studySessions.reduce((sum, s) => sum + (s.duration || 0), 0) / studySessions.length) : 0}
            </div>
            <div className="text-sm text-gray-600">Avg Session (min)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {courses.length}
            </div>
            <div className="text-sm text-gray-600">Active Courses</div>
          </div>
        </div>
      </div>

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Study Session Calendar</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value as any)
                    setSelectedCourse('')
                  }}
                  className="input w-40"
                >
                  <option value="all">All Courses</option>
                  <option value="course">By Course</option>
                </select>
              </div>

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

              <button
                onClick={() => setShowAddSession(true)}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Session
              </button>
            </div>
          </div>

          {/* Date Selector */}
          <div className="mb-6">
            <label className="label">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input w-48"
            />
          </div>

          {/* Sessions List */}
          <div className="space-y-4">
            {filteredSessions
              .filter(session => session.startTime.startsWith(selectedDate))
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map(session => (
                <div key={session.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: getCourseColor(session.courseId) }}
                        />
                        <h4 className="font-semibold text-gray-900">{session.title}</h4>
                        <span className="text-sm text-gray-500">{getCourseName(session.courseId)}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(session.startTime).toLocaleTimeString()} - {new Date(session.endTime).toLocaleTimeString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {session.location || 'No location'}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {session.topic || 'No topic'}
                        </span>
                      </div>

                      {session.notes && (
                        <p className="text-gray-600 text-sm">{session.notes}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {/* TODO: Open edit modal */}}
                        className="btn btn-secondary text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onSessionDelete(session.id)}
                        className="btn btn-error text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}

            {filteredSessions.filter(session => session.startTime.startsWith(selectedDate)).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No study sessions scheduled for {new Date(selectedDate).toLocaleDateString()}.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analysis Tab */}
      {activeTab === 'analysis' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Study Time by Course */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Study Time by Course</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={getStudyTimeByCourse()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" fill="#3b82f6" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly Study Pattern */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Weekly Study Pattern</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart data={getWeeklyStudyData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="hours" stroke="#10b981" strokeWidth={2} />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>

          {/* Course Comparison Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Course-Based Study Analysis</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sessions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Session
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Grade
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getStudyTimeByCourse().map(course => {
                    const courseData = courses.find(c => c.name === course.name)
                    return (
                      <tr key={course.name}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: getCourseColor(courseData?.id || '') }}
                            />
                            <div className="text-sm font-medium text-gray-900">{course.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{course.hours}h</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{course.sessions}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {course.sessions > 0 ? Math.round((course.hours / course.sessions) * 60) : 0}min
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {courseData?.currentGrade || 'Not graded'}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Study vs Performance Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Study Time vs Grade Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart data={getStudyVsPerformanceData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="studyHours" stroke="#3b82f6" name="Study Hours" />
                <Line yAxisId="right" type="monotone" dataKey="grade" stroke="#10b981" name="Grade" />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>

          {/* Study Efficiency */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Study Efficiency Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={getStudyVsPerformanceData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="efficiency" fill="#8b5cf6" name="Grade per Hour" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Insights */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Performance Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getStudyVsPerformanceData()
                .sort((a, b) => b.efficiency - a.efficiency)
                .slice(0, 3)
                .map((course, index) => (
                  <div key={course.name} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{course.name}</h4>
                      <span className={`text-sm font-medium ${
                        index === 0 ? 'text-green-600' : index === 1 ? 'text-blue-600' : 'text-yellow-600'
                      }`}>
                        #{index + 1}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Study Time: {course.studyHours}h</div>
                      <div>Grade: {course.grade}%</div>
                      <div>Efficiency: {course.efficiency} grade/hour</div>
                    </div>
                  </div>
                ))}
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Study Recommendations</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>Focus on courses with lower study efficiency to improve time management</li>
                <li>Maintain consistent study schedules for better performance</li>
                <li>Consider increasing study time for courses where you want to improve grades</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Add Session Modal */}
      {showAddSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Add Study Session</h3>
            <AddStudySessionForm
              courses={courses}
              selectedDate={selectedDate}
              onSubmit={(sessionData) => {
                onSessionAdd(sessionData)
                setShowAddSession(false)
              }}
              onCancel={() => setShowAddSession(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

interface AddStudySessionFormProps {
  courses: Course[]
  selectedDate: string
  onSubmit: (session: Omit<StudySession, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

function AddStudySessionForm({ courses, selectedDate, onSubmit, onCancel }: AddStudySessionFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    courseId: '',
    startTime: '',
    endTime: '',
    location: '',
    topic: '',
    notes: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.startTime || !formData.endTime) return

    const session = {
      ...formData,
      startTime: `${selectedDate}T${formData.startTime}:00`,
      endTime: `${selectedDate}T${formData.endTime}:00`
    }
    
    onSubmit(session)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Session Title *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="input"
          placeholder="e.g., Math Chapter 5 Review"
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Start Time *</label>
          <input
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            className="input"
            required
          />
        </div>

        <div>
          <label className="label">End Time *</label>
          <input
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            className="input"
            required
          />
        </div>
      </div>

      <div>
        <label className="label">Location</label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="input"
          placeholder="e.g., Library, Room 201"
        />
      </div>

      <div>
        <label className="label">Topic</label>
        <input
          type="text"
          value={formData.topic}
          onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
          className="input"
          placeholder="e.g., Calculus, Physics, Essay Writing"
        />
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="input"
          rows={3}
          placeholder="Additional notes about this study session"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button type="submit" className="btn btn-primary">
          Add Session
        </button>
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  )
}
