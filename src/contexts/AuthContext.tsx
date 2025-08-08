'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthService, type SignUpData, type SignInData, type AuthResult } from '@/lib/auth'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (data: SignUpData) => Promise<AuthResult>
  signIn: (data: SignInData) => Promise<AuthResult>
  signOut: () => Promise<AuthResult>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [authService] = useState(() => new AuthService())

  // Initialize auth state on mount
  useEffect(() => {
    let mounted = true

    async function getInitialSession() {
      try {
        const result = await authService.getCurrentSession()
        
        if (mounted) {
          if (result.success && result.session) {
            setSession(result.session)
            setUser(result.session.user)
          } else {
            setSession(null)
            setUser(null)
          }
          setLoading(false)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
        if (mounted) {
          setSession(null)
          setUser(null)
          setLoading(false)
        }
      }
    }

    getInitialSession()

    return () => {
      mounted = false
    }
  }, [authService])

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email)
        
        setSession(session)
        setUser(session?.user ?? null)
        
        // If user signed out, ensure loading is false
        if (event === 'SIGNED_OUT') {
          setLoading(false)
        }
        
        // If user signed in, ensure loading is false
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setLoading(false)
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [authService])

  const signUp = async (data: SignUpData): Promise<AuthResult> => {
    setLoading(true)
    try {
      const result = await authService.signUp(data)
      
      if (result.success) {
        // Note: User will need to verify email, so they won't be automatically signed in
        console.log('User signed up successfully, verification email sent')
      }
      
      setLoading(false)
      return result
    } catch (error) {
      setLoading(false)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    }
  }

  const signIn = async (data: SignInData): Promise<AuthResult> => {
    setLoading(true)
    try {
      const result = await authService.signIn(data)
      
      if (result.success && result.session) {
        setSession(result.session)
        setUser(result.session.user)
      }
      
      setLoading(false)
      return result
    } catch (error) {
      setLoading(false)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    }
  }

  const signOut = async (): Promise<AuthResult> => {
    setLoading(true)
    try {
      const result = await authService.signOut()
      
      if (result.success) {
        setSession(null)
        setUser(null)
      }
      
      setLoading(false)
      return result
    } catch (error) {
      setLoading(false)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    }
  }

  const refreshSession = async (): Promise<void> => {
    try {
      const result = await authService.getCurrentSession()
      
      if (result.success && result.session) {
        setSession(result.session)
        setUser(result.session.user)
      } else {
        setSession(null)
        setUser(null)
      }
    } catch (error) {
      console.error('Error refreshing session:', error)
      setSession(null)
      setUser(null)
    }
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    refreshSession
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}