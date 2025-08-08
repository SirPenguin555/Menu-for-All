import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'

export interface UseSessionResult {
  isAuthenticated: boolean
  isLoading: boolean
  user: ReturnType<typeof useAuth>['user']
  session: ReturnType<typeof useAuth>['session']
  refreshSession: ReturnType<typeof useAuth>['refreshSession']
}

/**
 * Hook for managing user session state
 * Provides convenient booleans and session data
 */
export function useSession(): UseSessionResult {
  const { user, session, loading, refreshSession } = useAuth()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    setIsAuthenticated(!!user && !!session)
  }, [user, session])

  return {
    isAuthenticated,
    isLoading: loading,
    user,
    session,
    refreshSession
  }
}

/**
 * Hook for components that require authentication
 * Returns loading state until authentication is determined
 */
export function useRequireAuth(): UseSessionResult & { requiresAuth: true } {
  const sessionResult = useSession()
  
  return {
    ...sessionResult,
    requiresAuth: true as const
  }
}

/**
 * Hook to check if user has specific permissions
 * Can be extended later for role-based access control
 */
export function usePermissions() {
  const { user, isAuthenticated } = useSession()
  
  return {
    canCreateRecipes: isAuthenticated,
    canSaveRecipes: isAuthenticated,
    canManagePantry: isAuthenticated,
    canAccessProfile: isAuthenticated,
    isAdmin: false, // Future: check user role
    isModerator: false // Future: check user role
  }
}