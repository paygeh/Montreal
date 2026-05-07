import { supabase } from './lib/supabase'
import { Task, Course, StudySession, GPARecord, BurnoutAlert } from './types'

const API_BASE = import.meta.env.VITE_API_BASE as string

// ─── Mappers: DB (snake_case) → Frontend (camelCase) ──────────────────────────

const mapCourse = (row: any): Course => ({
  id: row.course_id,
  name: row.course_name,
  code: row.course_code ?? undefined,
  color: row.color ?? '#6366f1',
  instructor: row.professor_name ?? undefined,
  credits: row.credits ?? 0,
  maxGrade: 100,
  currentGrade: row.current_grade != null ? String(row.current_grade) : undefined,
  taskCount: row.task_count ?? 0,
  completedTasks: row.completed_tasks ?? 0,
})

const dbStatus = (s: string): Task['status'] => {
  if (s === 'in progress' || s === 'in_progress' || s === 'started') return 'in_progress'
  if (s === 'completed') return 'completed'
  return 'pending'
}

const mapTask = (row: any): Task => ({
  id: row.assignment_id,
  title: row.title,
  description: row.description ?? undefined,
  courseId: row.course_id,
  courseName: row.courses?.course_name ?? undefined,
  priority: row.priority_level ?? 'medium',
  status: dbStatus(row.status ?? 'pending'),
  dueDate: row.due_date ?? undefined,
  estimatedTime: row.estimated_time ?? undefined,
  actualTime: row.actual_time ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at ?? row.created_at,
})

const mapSession = (row: any): StudySession => ({
  id: row.session_id,
  title: row.title ?? 'Study Session',
  courseId: row.course_id,
  startTime: row.start_time,
  endTime: row.end_time ?? row.start_time,
  duration: row.duration_minutes ?? undefined,
  topic: row.topic ?? undefined,
  notes: row.notes ?? undefined,
  location: row.location ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at ?? row.created_at,
})

const mapGPARecord = (row: any): GPARecord => ({
  id: row.gpa_record_id,
  semester: row.semester,
  year: row.year,
  semesterGPA: row.gpa_value,
  cumulativeGPA: row.cumulative_gpa ?? row.gpa_value,
  goalGPA: row.goal_gpa ?? undefined,
  credits: row.courses?.credits ?? 0,
  courses: [],
  createdAt: row.created_at,
  updatedAt: row.updated_at ?? row.created_at,
})

const mapBurnoutAlert = (row: any): BurnoutAlert => ({
  id: row.alert_id,
  alertType: row.severity_level === 'critical' ? 'critical' : row.severity_level === 'high' ? 'warning' : 'info',
  title: row.alert_type ?? 'Alert',
  message: row.message,
  description: row.description ?? undefined,
  triggerFactors: row.trigger_factors ?? [],
  recommendations: row.recommendations ?? [],
  status: row.status ?? 'active',
  priority: row.severity_level === 'critical' ? 3 : row.severity_level === 'high' ? 2 : 1,
  createdAt: row.created_at,
  updatedAt: row.updated_at ?? row.created_at,
})

// ─── Courses ──────────────────────────────────────────────────────────────────

export const fetchCourses = async (): Promise<Course[]> => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapCourse)
}

export const createCourse = async (course: { name: string; instructor?: string; semester?: string; currentGrade?: number }): Promise<Course> => {
  const { data, error } = await supabase
    .from('courses')
    .insert([{ course_name: course.name, professor_name: course.instructor, semester: course.semester, current_grade: course.currentGrade }])
    .select()
    .single()
  if (error) throw error
  return mapCourse(data)
}

export const updateCourse = async (id: string, updates: Partial<Course>): Promise<Course> => {
  const { data, error } = await supabase
    .from('courses')
    .update({
      course_name: updates.name,
      professor_name: updates.instructor,
      current_grade: updates.currentGrade != null ? Number(updates.currentGrade) : undefined,
    })
    .eq('course_id', id)
    .select()
    .single()
  if (error) throw error
  return mapCourse(data)
}

export const deleteCourse = async (id: string): Promise<void> => {
  const { error } = await supabase.from('courses').delete().eq('course_id', id)
  if (error) throw error
}

// ─── Tasks (Assignments) ──────────────────────────────────────────────────────

export const fetchTasks = async (): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('assignments')
    .select('*, courses(course_name)')
    .order('due_date', { ascending: true })
  if (error) throw error
  return (data ?? []).map(mapTask)
}

export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
  const { data, error } = await supabase
    .from('assignments')
    .insert([{
      course_id: task.courseId,
      title: task.title,
      description: task.description,
      due_date: task.dueDate,
      estimated_time: task.estimatedTime,
      priority_level: task.priority,
      status: task.status === 'in_progress' ? 'in progress' : task.status,
    }])
    .select('*, courses(course_name)')
    .single()
  if (error) throw error
  return mapTask(data)
}

export const updateTask = async (task: Task): Promise<Task> => {
  const { data, error } = await supabase
    .from('assignments')
    .update({
      title: task.title,
      description: task.description,
      due_date: task.dueDate,
      estimated_time: task.estimatedTime,
      priority_level: task.priority,
      status: task.status === 'in_progress' ? 'in progress' : task.status,
    })
    .eq('assignment_id', task.id)
    .select('*, courses(course_name)')
    .single()
  if (error) throw error
  return mapTask(data)
}

export const deleteTask = async (id: string): Promise<void> => {
  const { error } = await supabase.from('assignments').delete().eq('assignment_id', id)
  if (error) throw error
}

// ─── Study Sessions ───────────────────────────────────────────────────────────

export const fetchStudySessions = async (): Promise<StudySession[]> => {
  const { data, error } = await supabase
    .from('study_sessions')
    .select('*')
    .order('start_time', { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapSession)
}

export const createStudySession = async (session: Omit<StudySession, 'id' | 'createdAt' | 'updatedAt'>): Promise<StudySession> => {
  const { data, error } = await supabase
    .from('study_sessions')
    .insert([{
      course_id: session.courseId,
      title: session.title,
      start_time: session.startTime,
      end_time: session.endTime,
      duration_minutes: session.duration,
      topic: session.topic,
      notes: session.notes,
      location: session.location,
    }])
    .select()
    .single()
  if (error) throw error
  return mapSession(data)
}

export const updateStudySession = async (session: StudySession): Promise<StudySession> => {
  const { data, error } = await supabase
    .from('study_sessions')
    .update({
      title: session.title,
      start_time: session.startTime,
      end_time: session.endTime,
      duration_minutes: session.duration,
      topic: session.topic,
      notes: session.notes,
    })
    .eq('session_id', session.id)
    .select()
    .single()
  if (error) throw error
  return mapSession(data)
}

export const deleteStudySession = async (id: string): Promise<void> => {
  const { error } = await supabase.from('study_sessions').delete().eq('session_id', id)
  if (error) throw error
}

// ─── GPA Records ──────────────────────────────────────────────────────────────

export const fetchGPARecords = async (): Promise<GPARecord[]> => {
  const { data, error } = await supabase
    .from('gpa_records')
    .select('*, courses(course_id, course_name, credits)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapGPARecord)
}

export const createGPARecord = async (record: {
  gpa_value: number
  goal_gpa: number
  semester: string
  year: number
  course_id?: string
}): Promise<GPARecord> => {
  const { data, error } = await supabase
    .from('gpa_records')
    .insert([record])
    .select('*, courses(course_id, course_name, credits)')
    .single()
  if (error) throw error
  return mapGPARecord(data)
}

// ─── Burnout Alerts ───────────────────────────────────────────────────────────

export const fetchBurnoutAlerts = async (): Promise<BurnoutAlert[]> => {
  const { data, error } = await supabase
    .from('burnout_alerts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return (data ?? []).map(mapBurnoutAlert)
}

export const updateBurnoutAlertStatus = async (id: string, status: 'active' | 'acknowledged' | 'resolved'): Promise<BurnoutAlert> => {
  const { data, error } = await supabase
    .from('burnout_alerts')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('alert_id', id)
    .select()
    .single()
  if (error) throw error
  return mapBurnoutAlert(data)
}
