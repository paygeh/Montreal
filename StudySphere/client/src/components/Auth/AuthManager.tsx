import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, AuthState } from '../../types'
import { supabase } from '../../lib/supabase'

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

  const buildUser = (sbUser: any, profile: any): User => ({
    id: sbUser.id,
    email: sbUser.email ?? '',
    username: profile?.username ?? sbUser.email?.split('@')[0] ?? 'User',
    firstName: profile?.first_name ?? undefined,
    lastName: profile?.last_name ?? undefined,
    bio: profile?.bio ?? undefined,
    preferences: {
      notifications: {
        assignmentDueSoon: true,
        studySessionReminders: true,
        weeklyProgressUpdates: true,
        gpaUpdates: true,
        workloadSpikes: true,
        burnoutAlerts: true,
        breakReminders: true,
      },
      theme: 'light',
      timezone: 'UTC',
      language: 'en',
    },
    weeklyGoals: [],
    createdAt: sbUser.created_at ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  const resolveSession = async (sbUser: any) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', sbUser.id)
        .single()
      return buildUser(sbUser, profile)
    } catch {
      return buildUser(sbUser, null)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const user = await resolveSession(session.user)
        setAuthState({ user, isAuthenticated: true, isLoading: false, error: null })
      } else {
        setAuthState({ user: null, isAuthenticated: false, isLoading: false, error: null })
      }
    }).catch(() => {
      setAuthState({ user: null, isAuthenticated: false, isLoading: false, error: null })
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const user = await resolveSession(session.user)
        setAuthState({ user, isAuthenticated: true, isLoading: false, error: null })
      } else {
        setAuthState({ user: null, isAuthenticated: false, isLoading: false, error: null })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setAuthState(prev => ({ ...prev, isLoading: false, error: error.message }))
    } else if (data.user) {
      const user = await resolveSession(data.user)
      setAuthState({ user, isAuthenticated: true, isLoading: false, error: null })
    }
  }

  const signup = async (email: string, username: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } }
    })
    if (error) {
      setAuthState(prev => ({ ...prev, isLoading: false, error: error.message }))
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  const updateUser = (userData: Partial<User>) => {
    if (authState.user) {
      const updatedUser = { ...authState.user, ...userData, updatedAt: new Date().toISOString() }
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
