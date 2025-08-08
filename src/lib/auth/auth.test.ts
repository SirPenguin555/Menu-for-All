import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import type { User, Session } from '@supabase/supabase-js'

// Mock environment variables
beforeAll(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test'
})

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    getUser: vi.fn(),
    onAuthStateChange: vi.fn(),
    updateUser: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn()
      }))
    })),
    insert: vi.fn(),
    update: vi.fn(() => ({
      eq: vi.fn()
    })),
    delete: vi.fn(() => ({
      eq: vi.fn()
    }))
  }))
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient
}))

import { AuthService } from './auth.service'

describe('AuthService', () => {
  let authService: AuthService
  
  beforeEach(() => {
    vi.clearAllMocks()
    authService = new AuthService()
  })

  describe('signUp', () => {
    it('should sign up a new user successfully', async () => {
      const mockUser: Partial<User> = {
        id: 'test-user-id',
        email: 'test@example.com'
      }
      
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null
      })

      const result = await authService.signUp({
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User'
      })

      expect(result.success).toBe(true)
      expect(result.user).toEqual(mockUser)
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            display_name: 'Test User'
          }
        }
      })
    })

    it('should handle sign up errors', async () => {
      const mockError = { message: 'Email already exists' }
      
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError
      })

      const result = await authService.signUp({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email already exists')
    })

    it('should validate required fields', async () => {
      const result = await authService.signUp({
        email: '',
        password: 'password123'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email and password are required')
    })

    it('should validate password strength', async () => {
      const result = await authService.signUp({
        email: 'test@example.com',
        password: '123'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Password must be at least 6 characters long')
    })
  })

  describe('signIn', () => {
    it('should sign in user successfully', async () => {
      const mockUser: Partial<User> = {
        id: 'test-user-id',
        email: 'test@example.com'
      }
      const mockSession: Partial<Session> = {
        user: mockUser as User,
        access_token: 'test-token'
      }

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      })

      const result = await authService.signIn({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(result.success).toBe(true)
      expect(result.user).toEqual(mockUser)
      expect(result.session).toEqual(mockSession)
    })

    it('should handle invalid credentials', async () => {
      const mockError = { message: 'Invalid login credentials' }
      
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError
      })

      const result = await authService.signIn({
        email: 'test@example.com',
        password: 'wrongpassword'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid login credentials')
    })
  })

  describe('signOut', () => {
    it('should sign out user successfully', async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: null
      })

      const result = await authService.signOut()

      expect(result.success).toBe(true)
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled()
    })

    it('should handle sign out errors', async () => {
      const mockError = { message: 'Sign out failed' }
      
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: mockError
      })

      const result = await authService.signOut()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Sign out failed')
    })
  })

  describe('getCurrentUser', () => {
    it('should get current user successfully', async () => {
      const mockUser: Partial<User> = {
        id: 'test-user-id',
        email: 'test@example.com'
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const result = await authService.getCurrentUser()

      expect(result.success).toBe(true)
      expect(result.user).toEqual(mockUser)
    })

    it('should handle no user found', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })

      const result = await authService.getCurrentUser()

      expect(result.success).toBe(true)
      expect(result.user).toBeNull()
    })
  })

  describe('getCurrentSession', () => {
    it('should get current session successfully', async () => {
      const mockSession: Partial<Session> = {
        access_token: 'test-token',
        user: { id: 'test-user-id' } as User
      }

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      const result = await authService.getCurrentSession()

      expect(result.success).toBe(true)
      expect(result.session).toEqual(mockSession)
    })
  })

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      const mockUser: Partial<User> = {
        id: 'test-user-id',
        email: 'test@example.com'
      }

      mockSupabaseClient.auth.updateUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const result = await authService.updateUserProfile({
        displayName: 'Updated Name'
      })

      expect(result.success).toBe(true)
      expect(result.user).toEqual(mockUser)
      expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
        data: {
          display_name: 'Updated Name'
        }
      })
    })

    it('should handle profile update errors', async () => {
      const mockError = { message: 'Update failed' }
      
      mockSupabaseClient.auth.updateUser.mockResolvedValue({
        data: { user: null },
        error: mockError
      })

      const result = await authService.updateUserProfile({
        displayName: 'Updated Name'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Update failed')
    })
  })
})