import React, { useState } from 'react'
import { TrendingUp, Target, Calculator, Award, AlertCircle, CheckCircle2, Plus, Bell, BellOff } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Course, GPARecord, CourseGrade } from '../types'

interface GPATrackerProps {
  courses: Course[]
  gpaRecords: GPARecord[]
  courseGrades: CourseGrade[]
  onCourseGradeAdd: (grade: Omit<CourseGrade, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCourseGradeUpdate: (grade: CourseGrade) => void
  onCourseGradeDelete: (gradeId: string) => void
}

export default function GPATracker({ 
  courses, 
  gpaRecords, 
  courseGrades, 
  onCourseGradeAdd,
  onCourseGradeUpdate,
  onCourseGradeDelete 
}: GPATrackerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'calculator'>('overview')
  const [gpaGoal, setGPAGoal] = useState<number>(4.0)
  const [showAddGrade, setShowAddGrade] = useState(false)
  const [weeklyGPAUpdates, setWeeklyGPAUpdates] = useState(true)
  const [calculatorTarget, setCalculatorTarget] = useState({
    courseId: '',
    targetGrade: '',
    currentGrade: '',
    remainingWeight: 100
  })
  const [newGrade, setNewGrade] = useState({
    courseId: '',
    grade: '',
    credits: 3,
    semester: 'Spring 2026'
  })

  const calculateGPA = (grades: CourseGrade[]) => {
    if (grades.length === 0) return 0
    
    const totalPoints = grades.reduce((sum, grade) => sum + (grade.gpaPoints * grade.credits), 0)
    const totalCredits = grades.reduce((sum, grade) => sum + grade.credits, 0)
    
    return totalCredits > 0 ? totalPoints / totalCredits : 0
  }

  const getLetterGrade = (grade: number): string => {
    if (grade >= 97) return 'A+'
    if (grade >= 93) return 'A'
    if (grade >= 90) return 'A-'
    if (grade >= 87) return 'B+'
    if (grade >= 83) return 'B'
    if (grade >= 80) return 'B-'
    if (grade >= 77) return 'C+'
    if (grade >= 73) return 'C'
    if (grade >= 70) return 'C-'
    if (grade >= 67) return 'D+'
    if (grade >= 63) return 'D'
    if (grade >= 60) return 'D-'
    return 'F'
  }

  const getGPAPoints = (letterGrade: string): number => {
    switch (letterGrade) {
      case 'A+': return 4.0
      case 'A': return 4.0
      case 'A-': return 3.7
      case 'B+': return 3.3
      case 'B': return 3.0
      case 'B-': return 2.7
      case 'C+': return 2.3
      case 'C': return 2.0
      case 'C-': return 1.7
      case 'D+': return 1.3
      case 'D': return 1.0
      case 'D-': return 0.7
      case 'F': return 0.0
      default: return 0.0
    }
  }

  const calculateRequiredGrade = () => {
    if (!calculatorTarget.courseId || !calculatorTarget.targetGrade || !calculatorTarget.currentGrade) return null
    
    const course = courses.find(c => c.id === calculatorTarget.courseId)
    if (!course) return null

    const remainingWeight = calculatorTarget.remainingWeight / 100
    const currentGradeValue = parseFloat(calculatorTarget.currentGrade)
    const targetGradeValue = parseFloat(calculatorTarget.targetGrade)
    
    if (remainingWeight <= 0) return null
    
    const requiredGrade = ((targetGradeValue - currentGradeValue * (1 - remainingWeight)) / remainingWeight).toFixed(2)
    return {
      requiredGrade: parseFloat(requiredGrade),
      isPossible: parseFloat(requiredGrade) <= (course.maxGrade || 100),
      course: course
    }
  }

  const getGPAProgressData = () => {
    return gpaRecords.map(record => ({
      semester: `${record.semester} ${record.year}`,
      gpa: record.semesterGPA,
      cumulative: record.cumulativeGPA,
      goal: record.goalGPA || gpaGoal
    }))
  }

  const handleAddGrade = () => {
    if (!newGrade.courseId || !newGrade.grade) return
    
    const course = courses.find(c => c.id === newGrade.courseId)
    if (!course) return
    
    const gradeValue = parseFloat(newGrade.grade)
    const letterGrade = getLetterGrade(gradeValue)
    const gpaPoints = getGPAPoints(letterGrade)
    
    onCourseGradeAdd({
      courseId: newGrade.courseId,
      courseName: course.name,
      grade: newGrade.grade,
      letterGrade,
      credits: newGrade.credits,
      semester: newGrade.semester,
      gpaPoints,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    
    setNewGrade({
      courseId: '',
      grade: '',
      credits: 3,
      semester: 'Spring 2026'
    })
    setShowAddGrade(false)
  }

  const calculatedGPA = calculateGPA(courseGrades)
  const gpaProgressData = getGPAProgressData()
  const gpaDifference = calculatedGPA - gpaGoal
  const isOnTrack = gpaDifference >= -0.1

  const getGPAColor = (gpa: number) => {
    if (gpa >= 3.7) return 'text-green-600'
    if (gpa >= 3.0) return 'text-blue-600'
    if (gpa >= 2.7) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getGradeColor = (grade: string) => {
    const gradeValue = parseFloat(grade)
    if (gradeValue >= 90) return 'text-green-600'
    if (gradeValue >= 80) return 'text-blue-600'
    if (gradeValue >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Header with GPA Goal Setting */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Track Academic Performance</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary-600" />
              <span className="text-sm text-gray-600">GPA Goal</span>
              <input
                type="number"
                step="0.1"
                min="0"
                max="4.0"
                value={gpaGoal}
                onChange={(e) => setGPAGoal(parseFloat(e.target.value))}
                className="input w-20"
              />
            </div>
            <div className="flex items-center gap-2">
              {weeklyGPAUpdates ? <Bell className="h-5 w-5 text-primary-600" /> : <BellOff className="h-5 w-5 text-gray-400" />}
              <button
                onClick={() => setWeeklyGPAUpdates(!weeklyGPAUpdates)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Weekly Updates
              </button>
            </div>
          </div>
        </div>

        {/* GPA Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className={`text-3xl font-bold ${getGPAColor(calculatedGPA)}`}>
              {calculatedGPA.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Current GPA</div>
            <div className={`text-xs mt-1 ${isOnTrack ? 'text-green-600' : 'text-orange-600'}`}>
              {isOnTrack ? 'On Track' : `${Math.abs(gpaDifference).toFixed(2)} from goal`}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-400">
              {gpaGoal.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">GPA Goal</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">
              {courseGrades.length}
            </div>
            <div className="text-sm text-gray-600">Courses Completed</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'overview' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            GPA Progress
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'courses' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Course Grades
          </button>
        </div>
      </div>

      {/* GPA Progress Tab — chart + calculator side by side */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">GPA Progress Chart</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={gpaProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="semester" />
                <YAxis domain={[0, 4]} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="cumulative" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Cumulative GPA" />
                <Area type="monotone" dataKey="goal" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="GPA Goal" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Grade Calculator */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary-600" />
              Grade Calculator
            </h3>
            <div className="space-y-3">
              <div>
                <label className="label">Course</label>
                <select
                  value={calculatorTarget.courseId}
                  onChange={(e) => setCalculatorTarget({ ...calculatorTarget, courseId: e.target.value })}
                  className="input"
                >
                  <option value="">Select a course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Target Grade (%)</label>
                <input
                  type="number"
                  step="0.1" min="0" max="100"
                  value={calculatorTarget.targetGrade}
                  onChange={(e) => setCalculatorTarget({ ...calculatorTarget, targetGrade: e.target.value })}
                  className="input"
                  placeholder="e.g., 85"
                />
              </div>
              <div>
                <label className="label">Current Grade (%)</label>
                <input
                  type="number"
                  step="0.1" min="0" max="100"
                  value={calculatorTarget.currentGrade}
                  onChange={(e) => setCalculatorTarget({ ...calculatorTarget, currentGrade: e.target.value })}
                  className="input"
                  placeholder="e.g., 78"
                />
              </div>
              <div>
                <label className="label">Remaining Weight (%)</label>
                <input
                  type="number"
                  step="1" min="0" max="100"
                  value={calculatorTarget.remainingWeight}
                  onChange={(e) => setCalculatorTarget({ ...calculatorTarget, remainingWeight: parseInt(e.target.value) })}
                  className="input"
                />
              </div>

              {calculateRequiredGrade() && (
                <div className={`p-3 rounded-lg border ${
                  calculateRequiredGrade()!.isPossible ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Calculator className="h-4 w-4" />
                    <span className="font-medium text-sm">
                      Required: {calculateRequiredGrade()!.requiredGrade.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {calculateRequiredGrade()!.isPossible
                      ? 'Achievable with remaining coursework.'
                      : 'May not be achievable. Adjust your goals.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Course Grades Tab */}
      {activeTab === 'courses' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Course Grades</h3>
            <button
              onClick={() => setShowAddGrade(true)}
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Grade
            </button>
          </div>

          <div className="space-y-4">
            {courseGrades.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No grades recorded yet. Add your first grade to get started!
              </div>
            ) : (
              courseGrades.map(grade => (
                <div key={grade.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-900">{grade.courseName}</h4>
                      <div className="text-sm text-gray-600">
                        {grade.semester} · {grade.credits} credits
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getGradeColor(grade.grade)}`}>
                        {grade.grade}
                      </div>
                      <div className="text-sm text-gray-600">
                        {grade.letterGrade} ({grade.gpaPoints.toFixed(1)} GPA points)
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}


      {/* Add Grade Modal */}
      {showAddGrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Add Course Grade</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Course</label>
                <select
                  value={newGrade.courseId}
                  onChange={(e) => setNewGrade({ ...newGrade, courseId: e.target.value })}
                  className="input"
                >
                  <option value="">Select a course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Grade (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={newGrade.grade}
                  onChange={(e) => setNewGrade({ ...newGrade, grade: e.target.value })}
                  className="input"
                  placeholder="e.g., 92.5"
                />
              </div>

              <div>
                <label className="label">Credits</label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={newGrade.credits}
                  onChange={(e) => setNewGrade({ ...newGrade, credits: parseInt(e.target.value) })}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Semester</label>
                <input
                  type="text"
                  value={newGrade.semester}
                  onChange={(e) => setNewGrade({ ...newGrade, semester: e.target.value })}
                  className="input"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={handleAddGrade} className="btn btn-primary">
                  Add Grade
                </button>
                <button onClick={() => setShowAddGrade(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
