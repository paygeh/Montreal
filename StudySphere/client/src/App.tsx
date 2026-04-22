import React, { useState } from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import { BookOpen, TrendingUp, Clock, BarChart3, AlertTriangle, User, LogOut } from 'lucide-react'
import TaskList from './components/TaskList'
import GPATracker from './components/GPATracker'
import StudyTimeTracker from './components/StudyTimeTracker'
import WorkloadAnalyzer from './components/WorkloadAnalyzer'
import BurnoutMonitor from './components/BurnoutMonitor'
import UserProfile from './components/User/UserProfile'
import AuthWrapper from './components/Auth/AuthWrapper'
import { useAuth } from './components/Auth/AuthManager'
import { Task, Course, GPARecord, StudySession, WorkloadRecord, OngoingProject, BurnoutAlert, CourseGrade } from './types'

function AppContent() {
  const { user, logout } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Complete Math Assignment',
      description: 'Finish calculus homework chapter 3',
      courseId: '1',
      courseName: 'Calculus I',
      priority: 'high',
      status: 'completed',
      dueDate: '2026-04-25T23:59:59Z',
      estimatedTime: 120,
      actualTime: 115,
      createdAt: '2026-04-21T10:00:00Z',
      updatedAt: '2026-04-21T10:00:00Z'
    },
    {
      id: '2',
      title: 'Study for Physics Quiz',
      description: 'Review chapters 1-5 for upcoming quiz',
      courseId: '2',
      courseName: 'Physics II',
      priority: 'medium',
      status: 'completed',
      dueDate: '2026-04-23T23:59:59Z',
      estimatedTime: 90,
      actualTime: 85,
      createdAt: '2026-04-20T10:00:00Z',
      updatedAt: '2026-04-21T10:00:00Z'
    },
    {
      id: '3',
      title: 'Write Essay Draft',
      description: 'First draft of English literature essay',
      courseId: '3',
      courseName: 'English Literature',
      priority: 'low',
      status: 'completed',
      dueDate: '2026-04-22T23:59:59Z',
      estimatedTime: 180,
      actualTime: 160,
      createdAt: '2026-04-19T10:00:00Z',
      updatedAt: '2026-04-21T10:00:00Z'
    }
  ])

  const [courses] = useState<Course[]>([
    { id: '1', name: 'Calculus I', code: 'MATH101', color: '#3b82f6', credits: 4, maxGrade: 100, currentGrade: '92', taskCount: 5, completedTasks: 2 },
    { id: '2', name: 'Physics II', code: 'PHYS201', color: '#10b981', credits: 3, maxGrade: 100, currentGrade: '88', taskCount: 3, completedTasks: 1 },
    { id: '3', name: 'English Literature', code: 'ENG201', color: '#8b5cf6', credits: 3, maxGrade: 100, currentGrade: '95', taskCount: 4, completedTasks: 2 }
  ])

  const [gpaRecords] = useState<GPARecord[]>([
    {
      id: '1',
      semester: 'Spring',
      year: 2026,
      semesterGPA: 3.7,
      cumulativeGPA: 3.7,
      goalGPA: 4.0,
      credits: 10,
      courses: [
        { name: 'Calculus I', credits: 4, grade: '92' },
        { name: 'Physics II', credits: 3, grade: '88' }
      ],
      createdAt: '2026-04-15T10:00:00Z',
      updatedAt: '2026-04-15T10:00:00Z'
    }
  ])

  const [studySessions] = useState<StudySession[]>([
    {
      id: '1',
      title: 'Calculus Chapter 5 Review',
      courseId: '1',
      startTime: '2026-04-21T14:00:00Z',
      endTime: '2026-04-21T16:00:00Z',
      location: 'Library Study Room A',
      topic: 'Derivatives and Integrals',
      notes: 'Reviewed chain rule and integration by parts',
      duration: 120,
      createdAt: '2026-04-21T10:00:00Z',
      updatedAt: '2026-04-21T10:00:00Z'
    },
    {
      id: '2',
      title: 'Physics Lab Report Writing',
      courseId: '2',
      startTime: '2026-04-20T16:00:00Z',
      endTime: '2026-04-20T18:30:00Z',
      location: 'Science Building Lab 201',
      topic: 'Thermodynamics Experiment',
      notes: 'Completed data analysis and started writing conclusions',
      duration: 150,
      createdAt: '2026-04-20T10:00:00Z',
      updatedAt: '2026-04-20T10:00:00Z'
    },
    {
      id: '3',
      title: 'English Essay Research',
      courseId: '3',
      startTime: '2026-04-19T10:00:00Z',
      endTime: '2026-04-19T12:30:00Z',
      location: 'Student Union',
      topic: 'Shakespeare Analysis',
      notes: 'Found 5 academic sources for the essay',
      duration: 90,
      createdAt: '2026-04-19T10:00:00Z',
      updatedAt: '2026-04-19T10:00:00Z'
    },
    {
      id: '4',
      title: 'Calculus Problem Set',
      courseId: '1',
      startTime: '2026-04-18T19:00:00Z',
      endTime: '2026-04-18T21:00:00Z',
      location: 'Dorm Room',
      topic: 'Optimization Problems',
      notes: 'Completed 8 out of 10 problems',
      duration: 120,
      createdAt: '2026-04-18T10:00:00Z',
      updatedAt: '2026-04-18T10:00:00Z'
    }
  ])

  const [workloadRecords] = useState<WorkloadRecord[]>([
    {
      id: '1',
      weekStartDate: '2026-04-20',
      totalEstimatedTime: 480,
      workloadIntensity: 'high',
      createdAt: '2026-04-20T10:00:00Z',
      updatedAt: '2026-04-20T10:00:00Z'
    },
    {
      id: '2',
      weekStartDate: '2026-04-13',
      totalEstimatedTime: 720,
      workloadIntensity: 'extreme',
      createdAt: '2026-04-13T10:00:00Z',
      updatedAt: '2026-04-13T10:00:00Z'
    }
  ])

  const [ongoingProjects] = useState<OngoingProject[]>([
    {
      id: '1',
      title: 'Research Paper on Climate Change',
      courseId: '3',
      startDate: '2026-04-01',
      endDate: '2026-05-15',
      progressPercentage: 65,
      status: 'active',
      createdAt: '2026-04-01T10:00:00Z',
      updatedAt: '2026-04-21T10:00:00Z'
    },
    {
      id: '2',
      title: 'Physics Lab Final Project',
      courseId: '2',
      startDate: '2026-04-10',
      endDate: '2026-05-10',
      progressPercentage: 40,
      status: 'active',
      createdAt: '2026-04-10T10:00:00Z',
      updatedAt: '2026-04-21T10:00:00Z'
    },
    {
      id: '3',
      title: 'Calculus Study Group Presentations',
      courseId: '1',
      startDate: '2026-04-15',
      endDate: '2026-05-01',
      progressPercentage: 85,
      status: 'active',
      createdAt: '2026-04-15T10:00:00Z',
      updatedAt: '2026-04-21T10:00:00Z'
    }
  ])

  const [burnoutAlerts] = useState<BurnoutAlert[]>([
    {
      id: '1',
      alertType: 'warning',
      title: 'High Study Intensity Detected',
      message: 'You\'ve been studying for 8.5 hours today',
      description: 'Extended study sessions may lead to burnout. Consider taking a break.',
      triggerFactors: ['Study Duration', 'Session Count'],
      recommendations: ['Take a 30-minute break', 'Hydrate and stretch', 'Review study schedule'],
      status: 'active',
      priority: 2,
      createdAt: '2026-04-21T14:00:00Z',
      updatedAt: '2026-04-21T14:00:00Z'
    },
    {
      id: '2',
      alertType: 'critical',
      title: 'Workload Spike Alert',
      message: 'Next week has 12 tasks due',
      description: 'Heavy workload detected for the upcoming week. Plan accordingly.',
      triggerFactors: ['Task Volume', 'Due Date Proximity'],
      recommendations: ['Start assignments early', 'Prioritize high-value tasks', 'Consider deadline extensions'],
      status: 'active',
      priority: 1,
      createdAt: '2026-04-21T10:00:00Z',
      updatedAt: '2026-04-21T10:00:00Z'
    }
  ])

  const [courseGrades] = useState<CourseGrade[]>([
    {
      id: '1',
      courseId: '1',
      courseName: 'Calculus I',
      grade: '92.5',
      letterGrade: 'A-',
      credits: 4,
      semester: 'Fall 2025',
      gpaPoints: 3.7,
      createdAt: '2025-12-15T10:00:00Z',
      updatedAt: '2025-12-15T10:00:00Z'
    },
    {
      id: '2',
      courseId: '2',
      courseName: 'Physics II',
      grade: '88.0',
      letterGrade: 'B+',
      credits: 3,
      semester: 'Fall 2025',
      gpaPoints: 3.3,
      createdAt: '2025-12-15T10:00:00Z',
      updatedAt: '2025-12-15T10:00:00Z'
    },
    {
      id: '3',
      courseId: '3',
      courseName: 'English Literature',
      grade: '95.0',
      letterGrade: 'A',
      credits: 3,
      semester: 'Fall 2025',
      gpaPoints: 4.0,
      createdAt: '2025-12-15T10:00:00Z',
      updatedAt: '2025-12-15T10:00:00Z'
    }
  ])

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task))
  }

  const handleTaskDelete = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId))
  }

  const handleTaskCreate = (newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setTasks([...tasks, task])
  }

  const handleCourseAdd = (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCourse: Course = {
      ...course,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    // setCourses([...courses, newCourse])
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

  const handleSessionAdd = (session: Omit<StudySession, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSession: StudySession = {
      ...session,
      id: Date.now().toString(),
      duration: Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    // setStudySessions([...studySessions, newSession])
  }

  const handleSessionUpdate = (updatedSession: StudySession) => {
    // setStudySessions(studySessions.map(session => session.id === updatedSession.id ? updatedSession : session))
  }

  const handleSessionDelete = (sessionId: string) => {
    // setStudySessions(studySessions.filter(session => session.id !== sessionId))
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
    const newAlert: BurnoutAlert = {
      ...alert,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    // setBurnoutAlerts([...burnoutAlerts, newAlert])
  }

  const handleAlertUpdate = (updatedAlert: BurnoutAlert) => {
    // setBurnoutAlerts(burnoutAlerts.map(alert => alert.id === updatedAlert.id ? updatedAlert : alert))
  }

  const handleAlertDelete = (alertId: string) => {
    // setBurnoutAlerts(burnoutAlerts.filter(alert => alert.id !== alertId))
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">StudySphere</h1>
            </div>
            <nav className="flex space-x-8">
              <Link to="/" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                Dashboard
              </Link>
              <Link to="/features" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                Features
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-600" />
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {user?.username || 'User'}
                </span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
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
          <Route path="/features/manage-user-experience" element={<UserProfile />} />
        </Routes>
      </main>
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

function Dashboard() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Welcome to StudySphere</h2>
        <p className="mt-2 text-gray-600">Your comprehensive academic planning system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center mb-4">
            <BookOpen className="h-8 w-8 text-primary-600 mr-3" />
            <h3 className="text-lg font-semibold">Manage Academic Tasks</h3>
          </div>
          <p className="text-gray-600 mb-4">Organize assignments, set priorities, and track completion</p>
          <Link to="/features/manage-academic-tasks" className="btn btn-primary">
            Get Started
          </Link>
        </div>

        <div className="card">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-8 w-8 text-success-600 mr-3" />
            <h3 className="text-lg font-semibold">Track Academic Performance</h3>
          </div>
          <p className="text-gray-600 mb-4">Monitor GPA, calculate grades, and set academic goals</p>
          <Link to="/features/track-academic-performance" className="btn btn-primary">
            Get Started
          </Link>
        </div>

        <div className="card">
          <div className="flex items-center mb-4">
            <Clock className="h-8 w-8 text-warning-600 mr-3" />
            <h3 className="text-lg font-semibold">Plan and Log Study Time</h3>
          </div>
          <p className="text-gray-600 mb-4">Schedule sessions and analyze study patterns</p>
          <Link to="/features/plan-study-time" className="btn btn-primary">
            Get Started
          </Link>
        </div>

        <div className="card">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-8 w-8 text-secondary-600 mr-3" />
            <h3 className="text-lg font-semibold">Analyze Workload</h3>
          </div>
          <p className="text-gray-600 mb-4">Visualize workload and detect intensity spikes</p>
          <Link to="/features/analyze-workload" className="btn btn-primary">
            Get Started
          </Link>
        </div>

        <div className="card">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-8 w-8 text-error-600 mr-3" />
            <h3 className="text-lg font-semibold">Monitor Burnout</h3>
          </div>
          <p className="text-gray-600 mb-4">Prevent burnout with alerts and recommendations</p>
          <Link to="/features/monitor-burnout" className="btn btn-primary">
            Get Started
          </Link>
        </div>

        <div className="card">
          <div className="flex items-center mb-4">
            <User className="h-8 w-8 text-primary-600 mr-3" />
            <h3 className="text-lg font-semibold">Manage User Experience</h3>
          </div>
          <p className="text-gray-600 mb-4">Customize profile, set goals, and track progress</p>
          <Link to="/features/manage-user-experience" className="btn btn-primary">
            Get Started
          </Link>
        </div>
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
