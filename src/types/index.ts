export interface Task {
  id: string
  title: string
  description?: string
  courseId: string
  courseName?: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in_progress' | 'completed'
  dueDate?: string
  estimatedTime?: number
  actualTime?: number
  createdAt: string
  updatedAt: string
  tags?: string[]
}

export interface Course {
  id: string
  name: string
  code?: string
  color?: string
  instructor?: string
  credits?: number
  maxGrade?: number
  currentGrade?: string
  taskCount: number
  completedTasks: number
}

export interface GPARecord {
  id: string
  semester: string
  year: number
  semesterGPA: number
  cumulativeGPA: number
  goalGPA?: number
  credits: number
  courses: Array<{
    name: string
    credits: number
    grade: string
  }>
  createdAt: string
  updatedAt: string
}

export interface StudySession {
  id: string
  title: string
  courseId: string
  startTime: string
  endTime: string
  location?: string
  topic?: string
  notes?: string
  duration?: number // in minutes
  createdAt: string
  updatedAt: string
}

export interface WorkloadRecord {
  id: string
  weekStartDate: string
  totalEstimatedTime: number // in minutes
  workloadIntensity: 'light' | 'medium' | 'high' | 'extreme'
  courseId?: string
  createdAt: string
  updatedAt: string
}

export interface OngoingProject {
  id: string
  title: string
  courseId?: string
  startDate?: string
  endDate?: string
  progressPercentage: number
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export interface BurnoutAlert {
  id: string
  alertType: 'info' | 'warning' | 'critical'
  title: string
  message: string
  description?: string
  triggerFactors: string[]
  recommendations: string[]
  status: 'active' | 'acknowledged' | 'resolved'
  priority: number
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  username: string
  firstName?: string
  lastName?: string
  bio?: string
  avatar?: string
  preferences: UserPreferences
  weeklyGoals: WeeklyGoal[]
  createdAt: string
  updatedAt: string
}

export interface UserPreferences {
  notifications: NotificationPreferences
  theme: 'light' | 'dark' | 'auto'
  timezone: string
  language: string
}

export interface NotificationPreferences {
  assignmentDueSoon: boolean
  studySessionReminders: boolean
  weeklyProgressUpdates: boolean
  gpaUpdates: boolean
  workloadSpikes: boolean
  burnoutAlerts: boolean
}

export interface WeeklyGoal {
  id: string
  week: string
  goals: {
    type: 'study_hours' | 'tasks_completed' | 'gpa_target' | 'courses_focus'
    target: number | string
    current: number | string
    unit: string
  }[]
  reflection?: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

export interface ProgressReflection {
  id: string
  userId: string
  week: string
  academicPerformance: {
    gpa: number
    completedAssignments: number
    studyHours: number
  }
  personalReflection: {
    highlights: string[]
    challenges: string[]
    improvements: string[]
  }
  nextWeekGoals: string[]
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface CourseGrade {
  id: string
  courseId: string
  courseName: string
  grade: string
  letterGrade: string
  credits: number
  semester: string
  gpaPoints: number
  createdAt: string
  updatedAt: string
}
