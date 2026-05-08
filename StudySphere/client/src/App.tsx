import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import { BookOpen, TrendingUp, Clock, BarChart3, AlertTriangle, User, LogOut, X, Zap, Menu, Home } from 'lucide-react'
import TaskList from './components/TaskList'
import GPATracker from './components/GPATracker'
import StudyTimeTracker from './components/StudyTimeTracker'
import WorkloadAnalyzer from './components/WorkloadAnalyzer'
import BurnoutMonitor from './components/BurnoutMonitor'
import UserProfile from './components/User/UserProfile'
import AuthWrapper from './components/Auth/AuthWrapper'
import { useAuth } from './components/Auth/AuthManager'
import { Task, Course, GPARecord, StudySession, WorkloadRecord, OngoingProject, BurnoutAlert, CourseGrade } from './types'
import {
  fetchTasks, createTask, updateTask, deleteTask,
  fetchCourses, createCourse,
  fetchStudySessions, createStudySession, updateStudySession, deleteStudySession,
  fetchGPARecords,
  fetchBurnoutAlerts, updateBurnoutAlertStatus,
} from './api'

function AppContent() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const quickActions = [
    { label: 'Manage Tasks',      desc: 'Organize assignments & priorities',  path: '/features/manage-academic-tasks',       icon: BookOpen,      color: 'text-primary-600', bg: 'bg-primary-100',  hover: 'hover:bg-primary-50 hover:border-primary-300' },
    { label: 'Track GPA',         desc: 'Monitor academic performance',        path: '/features/track-academic-performance',  icon: TrendingUp,    color: 'text-green-600',   bg: 'bg-green-100',    hover: 'hover:bg-green-50 hover:border-green-300' },
    { label: 'Study Schedule',    desc: 'Plan & log study time',              path: '/features/plan-study-time',             icon: Clock,         color: 'text-purple-600',  bg: 'bg-purple-100',   hover: 'hover:bg-purple-50 hover:border-purple-300' },
    { label: 'Analyze Workload',  desc: 'Visualize intensity spikes',         path: '/features/analyze-workload',            icon: BarChart3,     color: 'text-blue-600',    bg: 'bg-blue-100',     hover: 'hover:bg-blue-50 hover:border-blue-300' },
    { label: 'Burnout Monitor',   desc: 'Prevent academic burnout',           path: '/features/monitor-burnout',             icon: AlertTriangle, color: 'text-orange-600',  bg: 'bg-orange-100',   hover: 'hover:bg-orange-50 hover:border-orange-300' },
    { label: 'User Profile',      desc: 'Customize settings & goals',        path: '/features/manage-user-experience',      icon: User,          color: 'text-indigo-600',  bg: 'bg-indigo-100',   hover: 'hover:bg-indigo-50 hover:border-indigo-300' },
  ]

  const [tasks, setTasks] = useState<Task[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [gpaRecords, setGpaRecords] = useState<GPARecord[]>([])
  const [studySessions, setStudySessions] = useState<StudySession[]>([])

  useEffect(() => {
    fetchTasks().then(setTasks).catch(console.error)
    fetchCourses().then(setCourses).catch(console.error)
    fetchGPARecords().then(setGpaRecords).catch(console.error)
    fetchStudySessions().then(setStudySessions).catch(console.error)
    fetchBurnoutAlerts().then(setBurnoutAlerts).catch(console.error)
  }, [])

  const [workloadRecords] = useState<WorkloadRecord[]>([])

  const [ongoingProjects] = useState<OngoingProject[]>([])

  const [burnoutAlerts, setBurnoutAlerts] = useState<BurnoutAlert[]>([])

  const [courseGrades] = useState<CourseGrade[]>([])

  const handleTaskUpdate = async (updatedTask: Task) => {
    try {
      const saved = await updateTask(updatedTask)
      setTasks(prev => prev.map(t => t.id === saved.id ? saved : t))
    } catch (err) { console.error('[handleTaskUpdate]', err); setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t)) }
  }

  const handleTaskDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId)
    } catch (err) { console.error('[handleTaskDelete]', err) } finally {
      setTasks(prev => prev.filter(t => t.id !== taskId))
    }
  }

  const handleTaskCreate = async (newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const saved = await createTask(newTask)
      setTasks(prev => [...prev, saved])
    } catch (err) {
      console.error('[handleTaskCreate]', err)
      const fallback: Task = { ...newTask, id: Date.now().toString(), status: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      setTasks(prev => [...prev, fallback])
    }
  }

  const handleCourseAdd = async (course: { name: string; instructor?: string; semester?: string }) => {
    try {
      const saved = await createCourse(course)
      setCourses(prev => [...prev, saved])
    } catch (err) {
      console.error('[handleCourseAdd]', err)
      const fallback: Course = { ...course, id: Date.now().toString(), taskCount: 0, completedTasks: 0 }
      setCourses(prev => [...prev, fallback])
    }
  }

  const handleGradeAdd = (courseId: string, grade: { grade: string; weight: number; maxGrade: number }) => {
    const updatedCourses = courses.map(course => 
      course.id === courseId ? { ...course, currentGrade: grade } : course
    )
    // setCourses(updatedCourses)
  }

  const handleGPARecordAdd = (record: Omit<GPARecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRecord: GPARecord = {
      ...record,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    // setGPARecords([...gpaRecords, newRecord])
  }

  const handleSessionAdd = async (session: Omit<StudySession, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const saved = await createStudySession(session)
      setStudySessions(prev => [saved, ...prev])
    } catch { console.error('Failed to create session') }
  }

  const handleSessionUpdate = async (updatedSession: StudySession) => {
    try {
      const saved = await updateStudySession(updatedSession)
      setStudySessions(prev => prev.map(s => s.id === saved.id ? saved : s))
    } catch { setStudySessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s)) }
  }

  const handleSessionDelete = async (sessionId: string) => {
    try { await deleteStudySession(sessionId) } catch { /* ignore */ } finally {
      setStudySessions(prev => prev.filter(s => s.id !== sessionId))
    }
  }

  const handleWorkloadRecordAdd = (record: Omit<WorkloadRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRecord: WorkloadRecord = {
      ...record,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    // setWorkloadRecords([...workloadRecords, newRecord])
  }

  const handleProjectAdd = (project: Omit<OngoingProject, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProject: OngoingProject = {
      ...project,
      id: Date.now().toString(),
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    // setOngoingProjects([...ongoingProjects, newProject])
  }

  const handleProjectUpdate = (updatedProject: OngoingProject) => {
    // setOngoingProjects(ongoingProjects.map(project => project.id === updatedProject.id ? updatedProject : project))
  }

  const handleProjectDelete = (projectId: string) => {
    // setOngoingProjects(ongoingProjects.filter(project => project.id !== projectId))
  }

  const handleAlertCreate = (alert: Omit<BurnoutAlert, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAlert: BurnoutAlert = { ...alert, id: Date.now().toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    setBurnoutAlerts(prev => [newAlert, ...prev])
  }

  const handleAlertUpdate = async (updatedAlert: BurnoutAlert) => {
    try {
      const saved = await updateBurnoutAlertStatus(updatedAlert.id, updatedAlert.status)
      setBurnoutAlerts(prev => prev.map(a => a.id === saved.id ? saved : a))
    } catch { setBurnoutAlerts(prev => prev.map(a => a.id === updatedAlert.id ? updatedAlert : a)) }
  }

  const handleAlertDelete = (alertId: string) => {
    setBurnoutAlerts(prev => prev.filter(a => a.id !== alertId))
  }

  const handleCourseGradeAdd = (grade: Omit<CourseGrade, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCourseGrade: CourseGrade = {
      ...grade,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    // setCourseGrades([...courseGrades, newCourseGrade])
  }

  const handleCourseGradeUpdate = (updatedGrade: CourseGrade) => {
    // setCourseGrades(courseGrades.map(grade => grade.id === updatedGrade.id ? updatedGrade : grade))
  }

  const handleCourseGradeDelete = (gradeId: string) => {
    // setCourseGrades(courseGrades.filter(grade => grade.id !== gradeId))
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Directory floating button — desktop only */}
      <div className="hidden sm:block fixed top-6 left-6 z-40">
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-5 py-3 rounded-full shadow-lg transition-all hover:scale-105"
        >
          <Zap className="h-5 w-5" />
          Directory
        </button>
      </div>

      {/* Backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Slide-out drawer */}
      <div className={`fixed top-0 left-0 h-full w-full sm:w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        drawerOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-bold text-gray-900">Directory</h2>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 space-y-2 overflow-y-auto h-[calc(100%-73px)]">
          {quickActions.map(({ label, desc, path, icon: Icon, color, bg, hover }) => (
            <button
              key={path}
              onClick={() => { setDrawerOpen(false); navigate(path) }}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 ${hover} transition-all group text-left`}
            >
              <div className={`p-3 ${bg} rounded-xl shrink-0`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 text-sm">{label}</div>
                <div className="text-xs text-gray-500 truncate">{desc}</div>
              </div>
              <span className={`${color} opacity-0 group-hover:opacity-100 transition-opacity text-lg`}>→</span>
            </button>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Mobile: hamburger | Desktop: logo area */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDrawerOpen(true)}
                className="sm:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <Link to="/" className="flex items-center gap-1">
                <h1 className="text-xl sm:text-2xl font-bold text-primary-600">StudySphere</h1>
              </Link>
            </div>
            {/* Desktop nav */}
            <nav className="hidden sm:flex space-x-8">
              <Link to="/" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                Dashboard
              </Link>
            </nav>
            {/* Right side */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:flex items-center space-x-2">
                <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-600" />
                </div>
                <span className="text-sm font-medium text-gray-900">{user?.username || 'User'}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-gray-900 p-2 sm:px-3 sm:py-2 rounded-md text-sm font-medium"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 sm:pb-8">
        <Routes>
          <Route path="/" element={<Dashboard tasks={tasks} courses={courses} />} />
          <Route path="/features" element={<Features />} />
          <Route 
            path="/features/manage-academic-tasks" 
            element={
              <TaskList
                tasks={tasks}
                courses={courses}
                onTaskUpdate={handleTaskUpdate}
                onTaskDelete={handleTaskDelete}
                onTaskCreate={handleTaskCreate}
                onCourseCreate={handleCourseAdd}
              />
            } 
          />
          <Route 
            path="/features/track-academic-performance" 
            element={
              <GPATracker
                courses={courses}
                gpaRecords={gpaRecords}
                courseGrades={courseGrades}
                onCourseGradeAdd={handleCourseGradeAdd}
                onCourseGradeUpdate={handleCourseGradeUpdate}
                onCourseGradeDelete={handleCourseGradeDelete}
              />
            } 
          />
          <Route 
            path="/features/plan-study-time" 
            element={
              <StudyTimeTracker
                studySessions={studySessions}
                courses={courses}
                onSessionAdd={handleSessionAdd}
                onSessionUpdate={handleSessionUpdate}
                onSessionDelete={handleSessionDelete}
              />
            } 
          />
          <Route 
            path="/features/analyze-workload" 
            element={
              <WorkloadAnalyzer
                tasks={tasks}
                courses={courses}
                workloadRecords={workloadRecords}
                ongoingProjects={ongoingProjects}
                onWorkloadRecordAdd={handleWorkloadRecordAdd}
                onProjectAdd={handleProjectAdd}
                onProjectUpdate={handleProjectUpdate}
                onProjectDelete={handleProjectDelete}
              />
            } 
          />
          <Route 
            path="/features/monitor-burnout" 
            element={
              <BurnoutMonitor
                tasks={tasks}
                courses={courses}
                studySessions={studySessions}
                burnoutAlerts={burnoutAlerts}
                onAlertCreate={handleAlertCreate}
                onAlertUpdate={handleAlertUpdate}
                onAlertDelete={handleAlertDelete}
              />
            } 
          />
          <Route path="/features/manage-user-experience" element={<UserProfile tasks={tasks} courses={courses} studySessions={studySessions} />} />
        </Routes>
      </main>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 flex">
        {[
          { label: 'Home',     path: '/',                                    icon: Home },
          { label: 'Tasks',    path: '/features/manage-academic-tasks',      icon: BookOpen },
          { label: 'GPA',      path: '/features/track-academic-performance', icon: TrendingUp },
          { label: 'Study',    path: '/features/plan-study-time',            icon: Clock },
          { label: 'More',     path: null,                                   icon: Menu },
        ].map(({ label, path, icon: Icon }) => (
          <button
            key={label}
            onClick={() => path ? navigate(path) : setDrawerOpen(true)}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-gray-500 hover:text-primary-600 active:text-primary-600 transition-colors"
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

function App() {
  return (
    <AuthWrapper>
      <AppContent />
    </AuthWrapper>
  )
}

interface DashboardProps {
  tasks?: Task[]
  courses?: Course[]
}

function Dashboard({ tasks = [], courses = [] }: DashboardProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const overdueTasks = tasks.filter(t =>
    t.status !== 'completed' &&
    t.dueDate &&
    new Date(t.dueDate) < new Date()
  ).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())

  const quickActions = [
    { label: 'Manage Tasks',      desc: 'Organize assignments & priorities',  path: '/features/manage-academic-tasks',       icon: BookOpen,      color: 'text-primary-600', bg: 'bg-primary-100',  hover: 'hover:bg-primary-50 hover:border-primary-300' },
    { label: 'Track GPA',         desc: 'Monitor academic performance',        path: '/features/track-academic-performance',  icon: TrendingUp,    color: 'text-green-600',   bg: 'bg-green-100',    hover: 'hover:bg-green-50 hover:border-green-300' },
    { label: 'Study Schedule',    desc: 'Plan & log study time',              path: '/features/plan-study-time',             icon: Clock,         color: 'text-purple-600',  bg: 'bg-purple-100',   hover: 'hover:bg-purple-50 hover:border-purple-300' },
    { label: 'Analyze Workload',  desc: 'Visualize intensity spikes',         path: '/features/analyze-workload',            icon: BarChart3,     color: 'text-blue-600',    bg: 'bg-blue-100',     hover: 'hover:bg-blue-50 hover:border-blue-300' },
    { label: 'Burnout Monitor',   desc: 'Prevent academic burnout',           path: '/features/monitor-burnout',             icon: AlertTriangle, color: 'text-orange-600',  bg: 'bg-orange-100',   hover: 'hover:bg-orange-50 hover:border-orange-300' },
    { label: 'User Profile',      desc: 'Customize settings & goals',        path: '/features/manage-user-experience',      icon: User,          color: 'text-indigo-600',  bg: 'bg-indigo-100',   hover: 'hover:bg-indigo-50 hover:border-indigo-300' },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-5 sm:p-8 text-white">
        <h1 className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2">Welcome back, {user?.username || 'Student'}!</h1>
        <p className="text-primary-100 text-sm sm:text-lg">Ready to boost your academic performance today?</p>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Active Tasks</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">12</div>
          <div className="text-sm text-green-600 mt-1">+3 this week</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Current GPA</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">3.7</div>
          <div className="text-sm text-green-600 mt-1">On track</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Study Hours</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">24.5</div>
          <div className="text-sm text-gray-600 mt-1">This week</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <span className="text-sm text-gray-500">Workload</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">Medium</div>
          <div className="text-sm text-orange-600 mt-1">Manageable</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Tasks</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">Math Assignment</p>
                  <p className="text-sm text-gray-600">Due in 2 days</p>
                </div>
              </div>
              <span className="text-sm text-green-600 font-medium">High</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">Physics Lab Report</p>
                  <p className="text-sm text-gray-600">Due in 5 days</p>
                </div>
              </div>
              <span className="text-sm text-yellow-600 font-medium">Medium</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">Essay Draft</p>
                  <p className="text-sm text-gray-600">Due in 1 week</p>
                </div>
              </div>
              <span className="text-sm text-blue-600 font-medium">Low</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Study Sessions</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Calculus Study</p>
                  <p className="text-sm text-gray-600">2.5 hours • Today</p>
                </div>
              </div>
              <span className="text-sm text-purple-600 font-medium">Completed</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Physics Review</p>
                  <p className="text-sm text-gray-600">1.5 hours • Yesterday</p>
                </div>
              </div>
              <span className="text-sm text-blue-600 font-medium">Completed</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">English Essay</p>
                  <p className="text-sm text-gray-600">3 hours • 2 days ago</p>
                </div>
              </div>
              <span className="text-sm text-green-600 font-medium">Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Assignments */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-red-100">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900">Overdue Assignments</h2>
          {overdueTasks.length > 0 && (
            <span className="ml-auto bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
              {overdueTasks.length}
            </span>
          )}
        </div>
        {overdueTasks.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <div className="text-2xl mb-1">✅</div>
            <p className="text-sm">No overdue assignments — great work!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {overdueTasks.map(task => {
              const course = courses.find(c => c.id === task.courseId)
              const daysOverdue = Math.floor((new Date().getTime() - new Date(task.dueDate!).getTime()) / (1000 * 60 * 60 * 24))
              return (
                <div key={task.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{task.title}</p>
                      <p className="text-xs text-gray-500">
                        {course?.name ?? 'No course'} · Due {new Date(task.dueDate!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      daysOverdue >= 7 ? 'bg-red-200 text-red-800' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {daysOverdue === 0 ? 'Due today' : `${daysOverdue}d overdue`}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function Features() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Features</h2>
        <p className="mt-2 text-gray-600">Explore all StudySphere features</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/features/manage-academic-tasks" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <BookOpen className="h-8 w-8 text-primary-600 mr-3" />
            <h3 className="text-lg font-semibold">Manage Academic Tasks</h3>
          </div>
          <p className="text-gray-600">Organize coursework, set priorities, track completion</p>
        </Link>

        <Link to="/features/track-academic-performance" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-8 w-8 text-success-600 mr-3" />
            <h3 className="text-lg font-semibold">Track Academic Performance</h3>
          </div>
          <p className="text-gray-600">Monitor GPA, calculate grades, set goals</p>
        </Link>

        <Link to="/features/plan-study-time" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <Clock className="h-8 w-8 text-warning-600 mr-3" />
            <h3 className="text-lg font-semibold">Plan and Log Study Time</h3>
          </div>
          <p className="text-gray-600">Schedule sessions, analyze patterns</p>
        </Link>

        <Link to="/features/analyze-workload" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-8 w-8 text-secondary-600 mr-3" />
            <h3 className="text-lg font-semibold">Analyze Workload</h3>
          </div>
          <p className="text-gray-600">Visualize workload, detect spikes</p>
        </Link>

        <Link to="/features/monitor-burnout" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-8 w-8 text-error-600 mr-3" />
            <h3 className="text-lg font-semibold">Monitor Burnout</h3>
          </div>
          <p className="text-gray-600">Prevent burnout with alerts</p>
        </Link>

        <Link to="/features/manage-user-experience" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <User className="h-8 w-8 text-primary-600 mr-3" />
            <h3 className="text-lg font-semibold">Manage User Experience</h3>
          </div>
          <p className="text-gray-600">Customize profile, set goals</p>
        </Link>
      </div>
    </div>
  )
}

function ManageAcademicTasks() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Manage Academic Tasks</h2>
        <p className="mt-2 text-gray-600">Organize your coursework effectively</p>
      </div>

      <div className="card">
        <h3 className="text-xl font-semibold mb-4">Feature Overview</h3>
        <p className="text-gray-600 mb-6">
          The Manage Academic Tasks feature allows students to organize their coursework by assigning tasks to specific courses, 
          setting priorities, estimating time requirements, and tracking completion status.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2">Key Features:</h4>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Task assignment to courses</li>
              <li>Priority setting (High, Medium, Low)</li>
              <li>Time estimation and tracking</li>
              <li>Task completion tracking</li>
              <li>Canvas integration</li>
              <li>Course-based task views</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">User Stories:</h4>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Assign tasks to specific courses</li>
              <li>Set priority levels for assignments</li>
              <li>Estimate assignment duration</li>
              <li>Mark assignments as complete</li>
              <li>Import assignments from Canvas</li>
            </ul>
          </div>
        </div>

        <div className="mt-6">
          <button className="btn btn-primary mr-3">Start Using This Feature</button>
          <Link to="/features" className="btn btn-secondary">Back to Features</Link>
        </div>
      </div>
    </div>
  )
}

function TrackAcademicPerformance() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Track Academic Performance</h2>
        <p className="mt-2 text-gray-600">Monitor your academic progress</p>
      </div>

      <div className="card">
        <h3 className="text-xl font-semibold mb-4">Feature Overview</h3>
        <p className="text-gray-600 mb-6">
          The Track Academic Performance feature enables students to monitor their academic progress through GPA calculation, 
          course grade tracking, goal setting, and performance analytics.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2">Key Features:</h4>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Cumulative GPA calculation</li>
              <li>Grade requirement calculator</li>
              <li>GPA goal setting</li>
              <li>Course grade management</li>
              <li>Weekly GPA updates</li>
              <li>GPA progress visualization</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">User Stories:</h4>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Calculate cumulative GPA</li>
              <li>Calculate required scores for target grades</li>
              <li>Set and track GPA goals</li>
              <li>Enter course grades</li>
              <li>Generate weekly GPA updates</li>
            </ul>
          </div>
        </div>

        <div className="mt-6">
          <button className="btn btn-primary mr-3">Start Using This Feature</button>
          <Link to="/features" className="btn btn-secondary">Back to Features</Link>
        </div>
      </div>
    </div>
  )
}

function PlanStudyTime() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Plan and Log Study Time</h2>
        <p className="mt-2 text-gray-600">Schedule and track your study sessions</p>
      </div>

      <div className="card">
        <h3 className="text-xl font-semibold mb-4">Feature Overview</h3>
        <p className="text-gray-600 mb-6">
          The Plan and Log Study Time feature enables students to schedule study sessions, track actual study time, 
          analyze study patterns, and correlate study effort with academic performance.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2">Key Features:</h4>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Study session scheduling</li>
              <li>Study time logging</li>
              <li>Course-based study analysis</li>
              <li>Study vs performance correlation</li>
              <li>Study session management</li>
              <li>Study analytics and insights</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">User Stories:</h4>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Schedule study sessions</li>
              <li>Log actual study time</li>
              <li>View study time by course</li>
              <li>See study vs performance graphs</li>
              <li>Manage study sessions</li>
            </ul>
          </div>
        </div>

        <div className="mt-6">
          <button className="btn btn-primary mr-3">Start Using This Feature</button>
          <Link to="/features" className="btn btn-secondary">Back to Features</Link>
        </div>
      </div>
    </div>
  )
}

function AnalyzeWorkload() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Analyze Workload</h2>
        <p className="mt-2 text-gray-600">Understand and manage your academic workload</p>
      </div>

      <div className="card">
        <h3 className="text-xl font-semibold mb-4">Feature Overview</h3>
        <p className="text-gray-600 mb-6">
          The Analyze Workload feature provides students with comprehensive insights into their academic workload through 
          weekly analysis, cross-week comparisons, spike detection, and calendar visualization.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2">Key Features:</h4>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Weekly workload display</li>
              <li>Cross-week workload comparison</li>
              <li>Workload spike detection</li>
              <li>Heavy week highlighting</li>
              <li>Ongoing projects display</li>
              <li>Calendar integration</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">User Stories:</h4>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Display weekly workload</li>
              <li>Compare workload across weeks</li>
              <li>Detect workload spikes</li>
              <li>Highlight heavy weeks</li>
              <li>View ongoing projects</li>
            </ul>
          </div>
        </div>

        <div className="mt-6">
          <button className="btn btn-primary mr-3">Start Using This Feature</button>
          <Link to="/features" className="btn btn-secondary">Back to Features</Link>
        </div>
      </div>
    </div>
  )
}

function MonitorBurnout() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Monitor Burnout</h2>
        <p className="mt-2 text-gray-600">Prevent academic burnout with proactive monitoring</p>
      </div>

      <div className="card">
        <h3 className="text-xl font-semibold mb-4">Feature Overview</h3>
        <p className="text-gray-600 mb-6">
          The Monitor Burnout feature helps students prevent academic burnout by analyzing workload intensity, 
          detecting unhealthy patterns, identifying time allocation imbalances, and providing proactive alerts.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2">Key Features:</h4>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Workload intensity analysis</li>
              <li>Workload spike detection</li>
              <li>Time allocation imbalance detection</li>
              <li>Burnout alert generation</li>
              <li>Task focus recommendations</li>
              <li>Burnout prevention features</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">User Stories:</h4>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Analyze workload intensity</li>
              <li>Detect workload spikes</li>
              <li>Detect time imbalance</li>
              <li>Receive burnout alerts</li>
              <li>Get task focus recommendations</li>
            </ul>
          </div>
        </div>

        <div className="mt-6">
          <button className="btn btn-primary mr-3">Start Using This Feature</button>
          <Link to="/features" className="btn btn-secondary">Back to Features</Link>
        </div>
      </div>
    </div>
  )
}

function ManageUserExperience() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Manage User Experience</h2>
        <p className="mt-2 text-gray-600">Personalize your StudySphere experience</p>
      </div>

      <div className="card">
        <h3 className="text-xl font-semibold mb-4">Feature Overview</h3>
        <p className="text-gray-600 mb-6">
          The Manage User Experience feature encompasses account management, authentication, profile customization, 
          notification preferences, goal setting, and progress reflection.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2">Key Features:</h4>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Account creation and management</li>
              <li>Login/logout functionality</li>
              <li>Profile management</li>
              <li>Notification preferences</li>
              <li>Weekly goal setting</li>
              <li>Progress reflection</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">User Stories:</h4>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Create and manage account</li>
              <li>Log in and out securely</li>
              <li>Edit profile</li>
              <li>Set notification preferences</li>
              <li>Set weekly goals</li>
              <li>Reflect on progress</li>
            </ul>
          </div>
        </div>

        <div className="mt-6">
          <button className="btn btn-primary mr-3">Start Using This Feature</button>
          <Link to="/features" className="btn btn-secondary">Back to Features</Link>
        </div>
      </div>
    </div>
  )
}

export default App;
