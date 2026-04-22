import React, { useState } from 'react'
import { User, Settings, Bell, Target, Calendar, Award, Edit2, Save, X } from 'lucide-react'
import { useAuth } from '../Auth/AuthManager'
import { WeeklyGoal, ProgressReflection } from '../../types'

export default function UserProfile() {
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'goals' | 'reflections'>('profile')
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || ''
  })
  const [notificationSettings, setNotificationSettings] = useState(user?.preferences.notifications || {
    assignmentDueSoon: true,
    studySessionReminders: true,
    weeklyProgressUpdates: true,
    gpaUpdates: true,
    workloadSpikes: true,
    burnoutAlerts: true
  })

  const handleProfileSave = () => {
    if (user) {
      updateUser({
        ...profileData,
        updatedAt: new Date().toISOString()
      })
      setIsEditingProfile(false)
    }
  }

  const handleNotificationToggle = (setting: keyof typeof notificationSettings) => {
    const newSettings = { ...notificationSettings, [setting]: !notificationSettings[setting] }
    setNotificationSettings(newSettings)
    
    if (user) {
      updateUser({
        preferences: {
          ...user.preferences,
          notifications: newSettings
        },
        updatedAt: new Date().toISOString()
      })
    }
  }

  const weeklyGoals: WeeklyGoal[] = [
    {
      id: '1',
      week: '2026-W16',
      goals: [
        { type: 'study_hours', target: 20, current: 15, unit: 'hours' },
        { type: 'tasks_completed', target: 8, current: 6, unit: 'tasks' },
        { type: 'gpa_target', target: 3.8, current: 3.7, unit: 'GPA' }
      ],
      completed: false,
      createdAt: '2026-04-15T10:00:00Z',
      updatedAt: '2026-04-21T10:00:00Z'
    }
  ]

  const progressReflections: ProgressReflection[] = [
    {
      id: '1',
      userId: user?.id || '',
      week: '2026-W15',
      academicPerformance: {
        gpa: 3.7,
        completedAssignments: 6,
        studyHours: 18
      },
      personalReflection: {
        highlights: ['Completed calculus midterm', 'Started research paper'],
        challenges: ['Balancing multiple deadlines', 'Time management'],
        improvements: ['Better planning', 'Earlier start on assignments']
      },
      nextWeekGoals: ['Complete physics lab report', 'Start studying for finals'],
      createdAt: '2026-04-14T10:00:00Z',
      updatedAt: '2026-04-14T10:00:00Z'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">User Experience</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'profile' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'settings' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Settings
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'goals' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Weekly Goals
            </button>
            <button
              onClick={() => setActiveTab('reflections')}
              className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'reflections' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Reflections
            </button>
          </div>
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="btn btn-secondary"
            >
              {isEditingProfile ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </>
              )}
            </button>
          </div>

          <div className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center space-x-6">
              <div className="h-24 w-24 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="h-12 w-12 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{user?.username}</h3>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>

            {/* Profile Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Username</label>
                <input
                  type="text"
                  value={profileData.username}
                  onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                  className="input"
                  disabled={!isEditingProfile}
                />
              </div>

              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  className="input"
                  disabled
                />
              </div>

              <div>
                <label className="label">First Name</label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  className="input"
                  disabled={!isEditingProfile}
                />
              </div>

              <div>
                <label className="label">Last Name</label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  className="input"
                  disabled={!isEditingProfile}
                />
              </div>

              <div className="md:col-span-2">
                <label className="label">Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  className="input"
                  rows={4}
                  placeholder="Tell us about yourself..."
                  disabled={!isEditingProfile}
                />
              </div>
            </div>

            {isEditingProfile && (
              <div className="flex justify-end">
                <button
                  onClick={handleProfileSave}
                  className="btn btn-primary"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-blue-500" />
                <div>
                  <h3 className="font-medium text-gray-900">Assignment Due Soon</h3>
                  <p className="text-sm text-gray-600">Get notified when assignments are due soon</p>
                </div>
              </div>
              <button
                onClick={() => handleNotificationToggle('assignmentDueSoon')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.assignmentDueSoon ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notificationSettings.assignmentDueSoon ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-green-500" />
                <div>
                  <h3 className="font-medium text-gray-900">Study Session Reminders</h3>
                  <p className="text-sm text-gray-600">Remind yourself about scheduled study sessions</p>
                </div>
              </div>
              <button
                onClick={() => handleNotificationToggle('studySessionReminders')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.studySessionReminders ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notificationSettings.studySessionReminders ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Award className="h-5 w-5 text-purple-500" />
                <div>
                  <h3 className="font-medium text-gray-900">Weekly Progress Updates</h3>
                  <p className="text-sm text-gray-600">Receive weekly summaries of your progress</p>
                </div>
              </div>
              <button
                onClick={() => handleNotificationToggle('weeklyProgressUpdates')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.weeklyProgressUpdates ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notificationSettings.weeklyProgressUpdates ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Target className="h-5 w-5 text-orange-500" />
                <div>
                  <h3 className="font-medium text-gray-900">GPA Updates</h3>
                  <p className="text-sm text-gray-600">Get notified about GPA changes and milestones</p>
                </div>
              </div>
              <button
                onClick={() => handleNotificationToggle('gpaUpdates')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.gpaUpdates ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notificationSettings.gpaUpdates ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Target className="h-5 w-5 text-red-500" />
                <div>
                  <h3 className="font-medium text-gray-900">Workload Spikes</h3>
                  <p className="text-sm text-gray-600">Alert when workload becomes unusually high</p>
                </div>
              </div>
              <button
                onClick={() => handleNotificationToggle('workloadSpikes')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.workloadSpikes ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notificationSettings.workloadSpikes ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Target className="h-5 w-5 text-yellow-500" />
                <div>
                  <h3 className="font-medium text-gray-900">Burnout Alerts</h3>
                  <p className="text-sm text-gray-600">Get warnings about potential burnout risks</p>
                </div>
              </div>
              <button
                onClick={() => handleNotificationToggle('burnoutAlerts')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.burnoutAlerts ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notificationSettings.burnoutAlerts ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Goals Tab */}
      {activeTab === 'goals' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Weekly Goals</h2>
            <button className="btn btn-primary">
              <Target className="h-4 w-4 mr-2" />
              Add Goal
            </button>
          </div>

          <div className="space-y-4">
            {weeklyGoals.map(goal => (
              <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-gray-900">Week {goal.week.split('-W')[1]}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    goal.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {goal.completed ? 'Completed' : 'In Progress'}
                  </span>
                </div>

                <div className="space-y-3">
                  {goal.goals.map((goalItem, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 capitalize">
                          {goalItem.type.replace('_', ' ')}
                        </div>
                        <div className="text-sm text-gray-600">
                          {typeof goalItem.current === 'number' && typeof goalItem.target === 'number'
                            ? `${goalItem.current} / ${goalItem.target} ${goalItem.unit}`
                            : `${goalItem.target} ${goalItem.unit}`
                          }
                        </div>
                      </div>
                      <div className="w-32">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{
                              width: typeof goalItem.current === 'number' && typeof goalItem.target === 'number'
                                ? `${Math.min((goalItem.current / goalItem.target) * 100, 100)}%`
                                : '0%'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Reflections Tab */}
      {activeTab === 'reflections' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Progress Reflections</h2>
            <button className="btn btn-primary">
              <Award className="h-4 w-4 mr-2" />
              Add Reflection
            </button>
          </div>

          <div className="space-y-4">
            {progressReflections.map(reflection => (
              <div key={reflection.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-gray-900">Week {reflection.week.split('-W')[1]} Reflection</h3>
                  <span className="text-sm text-gray-600">
                    {new Date(reflection.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">
                      {reflection.academicPerformance.gpa.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">GPA</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {reflection.academicPerformance.completedAssignments}
                    </div>
                    <div className="text-sm text-gray-600">Assignments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {reflection.academicPerformance.studyHours}h
                    </div>
                    <div className="text-sm text-gray-600">Study Time</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Highlights</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {reflection.personalReflection.highlights.map((highlight, index) => (
                        <li key={index}>{highlight}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Challenges</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {reflection.personalReflection.challenges.map((challenge, index) => (
                        <li key={index}>{challenge}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Areas for Improvement</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {reflection.personalReflection.improvements.map((improvement, index) => (
                        <li key={index}>{improvement}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Next Week Goals</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {reflection.nextWeekGoals.map((goal, index) => (
                        <li key={index}>{goal}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
