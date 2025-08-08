import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSession, useRequireAuth, usePermissions } from './useSession'
import type { User, Session } from '@supabase/supabase-js'

// Mock the auth context
const mockAuthContext = {
  user: null as User | null,
  session: null as Session | null,
  loading: false,
  signUp: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  refreshSession: vi.fn()
}

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext
}))

describe('useSession', () => {
  it('should return not authenticated when no user or session', () => {
    mockAuthContext.user = null
    mockAuthContext.session = null
    mockAuthContext.loading = false

    const { result } = renderHook(() => useSession())

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.user).toBeNull()
    expect(result.current.session).toBeNull()
  })

  it('should return authenticated when user and session exist', () => {
    const mockUser: Partial<User> = {
      id: 'test-user-id',
      email: 'test@example.com'
    }
    
    const mockSession: Partial<Session> = {
      user: mockUser as User,
      access_token: 'test-token'
    }

    mockAuthContext.user = mockUser as User
    mockAuthContext.session = mockSession as Session
    mockAuthContext.loading = false

    const { result } = renderHook(() => useSession())

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.user).toEqual(mockUser)
    expect(result.current.session).toEqual(mockSession)
  })

  it('should return loading state', () => {
    mockAuthContext.user = null
    mockAuthContext.session = null
    mockAuthContext.loading = true

    const { result } = renderHook(() => useSession())

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isLoading).toBe(true)
  })

  it('should not be authenticated with user but no session', () => {
    const mockUser: Partial<User> = {
      id: 'test-user-id',
      email: 'test@example.com'
    }

    mockAuthContext.user = mockUser as User
    mockAuthContext.session = null
    mockAuthContext.loading = false

    const { result } = renderHook(() => useSession())

    expect(result.current.isAuthenticated).toBe(false)
  })

  it('should not be authenticated with session but no user', () => {
    const mockSession: Partial<Session> = {
      access_token: 'test-token'
    }

    mockAuthContext.user = null
    mockAuthContext.session = mockSession as Session
    mockAuthContext.loading = false

    const { result } = renderHook(() => useSession())

    expect(result.current.isAuthenticated).toBe(false)
  })
})

describe('useRequireAuth', () => {
  it('should return session data with requiresAuth flag', () => {
    mockAuthContext.user = null
    mockAuthContext.session = null
    mockAuthContext.loading = false

    const { result } = renderHook(() => useRequireAuth())

    expect(result.current.requiresAuth).toBe(true)
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isLoading).toBe(false)
  })
})

describe('usePermissions', () => {
  it('should return no permissions when not authenticated', () => {
    mockAuthContext.user = null
    mockAuthContext.session = null
    mockAuthContext.loading = false

    const { result } = renderHook(() => usePermissions())

    expect(result.current.canCreateRecipes).toBe(false)
    expect(result.current.canSaveRecipes).toBe(false)
    expect(result.current.canManagePantry).toBe(false)
    expect(result.current.canAccessProfile).toBe(false)
    expect(result.current.isAdmin).toBe(false)
    expect(result.current.isModerator).toBe(false)
  })

  it('should return basic permissions when authenticated', () => {
    const mockUser: Partial<User> = {
      id: 'test-user-id',
      email: 'test@example.com'
    }
    
    const mockSession: Partial<Session> = {
      user: mockUser as User,
      access_token: 'test-token'
    }

    mockAuthContext.user = mockUser as User
    mockAuthContext.session = mockSession as Session
    mockAuthContext.loading = false

    const { result } = renderHook(() => usePermissions())

    expect(result.current.canCreateRecipes).toBe(true)
    expect(result.current.canSaveRecipes).toBe(true)
    expect(result.current.canManagePantry).toBe(true)
    expect(result.current.canAccessProfile).toBe(true)
    expect(result.current.isAdmin).toBe(false)
    expect(result.current.isModerator).toBe(false)
  })
})