import React, { useState } from 'react'
import { AuthProvider, useAuth } from './AuthManager'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'

interface AuthWrapperProps {
  children: React.ReactNode
}

function AuthContent({ children }: AuthWrapperProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const [isLoginMode, setIsLoginMode] = useState(true)

  const toggleMode = () => setIsLoginMode(!isLoginMode)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary-600 rounded-full flex items-center justify-center animate-pulse">
            <div className="h-6 w-6 bg-white rounded-full animate-ping" />
          </div>
          <p className="mt-4 text-gray-600">Loading StudySphere...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return isLoginMode ? (
      <LoginForm onToggleMode={toggleMode} />
    ) : (
      <SignupForm onToggleMode={toggleMode} />
    )
  }

  return <>{children}</>
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  return (
    <AuthProvider>
      <AuthContent>{children}</AuthContent>
    </AuthProvider>
  )
}
