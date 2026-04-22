import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, AuthState } from '../../types'

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, username: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  })

  useEffect(() => {
    // Check for existing auth state in localStorage
    const storedUser = localStorage.getItem('studysphere_user')
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        })
      } catch (error) {
        localStorage.removeItem('studysphere_user')
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        })
      }
    } else {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      })
    }
  }, [])

  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      // Simulate API call - in real app, this would be an actual API request
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock user data - in real app, this would come from the API
      const mockUser: User = {
        id: '1',
        email: email.toLowerCase(),
        username: email.split('@')[0],
        preferences: {
          notifications: {
            assignmentDueSoon: true,
            studySessionReminders: true,
            weeklyProgressUpdates: true,
            gpaUpdates: true,
            workloadSpikes: true,
            burnoutAlerts: true
          },
          theme: 'light',
          timezone: 'UTC',
          language: 'en'
        },
        weeklyGoals: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      localStorage.setItem('studysphere_user', JSON.stringify(mockUser))
      
      setAuthState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        error: null
      })
    } catch (error) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Login failed. Please check your credentials.'
      })
    }
  }

  const signup = async (email: string, username: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock user creation
      const newUser: User = {
        id: Date.now().toString(),
        email: email.toLowerCase(),
        username: username,
        preferences: {
          notifications: {
            assignmentDueSoon: true,
            studySessionReminders: true,
            weeklyProgressUpdates: true,
            gpaUpdates: true,
            workloadSpikes: true,
            burnoutAlerts: true
          },
          theme: 'light',
          timezone: 'UTC',
          language: 'en'
        },
        weeklyGoals: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      localStorage.setItem('studysphere_user', JSON.stringify(newUser))
      
      setAuthState({
        user: newUser,
        isAuthenticated: true,
        isLoading: false,
        error: null
      })
    } catch (error) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Signup failed. Please try again.'
      })
    }
  }

  const logout = () => {
    localStorage.removeItem('studysphere_user')
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    })
  }

  const updateUser = (userData: Partial<User>) => {
    if (authState.user) {
      const updatedUser = { ...authState.user, ...userData, updatedAt: new Date().toISOString() }
      localStorage.setItem('studysphere_user', JSON.stringify(updatedUser))
      setAuthState(prev => ({ ...prev, user: updatedUser }))
    }
  }

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      signup,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}
