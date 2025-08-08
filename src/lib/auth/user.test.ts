import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import type { User } from '@/types/database'

// Mock environment variables
beforeAll(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test'
})

// Mock Supabase client
const mockSupabaseClient = {
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

import { UserService } from './user.service'

describe('UserService', () => {
  let userService: UserService
  
  beforeEach(() => {
    vi.clearAllMocks()
    userService = new UserService()
  })

  describe('getUserProfile', () => {
    it('should get user profile successfully', async () => {
      const mockUser: User = {
        id: 'test-user-id',
        email: 'test@example.com',
        display_name: 'Test User',
        dietary_restrictions: ['gluten-free'],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      const mockQuery = {
        single: vi.fn().mockResolvedValue({
          data: mockUser,
          error: null
        })
      }

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue(mockQuery)
        })
      } as any)

      const result = await userService.getUserProfile('test-user-id')

      expect(result.success).toBe(true)
      expect(result.user).toEqual(mockUser)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users')
    })

    it('should handle user not found', async () => {
      const mockQuery = {
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'User not found' }
        })
      }

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue(mockQuery)
        })
      } as any)

      const result = await userService.getUserProfile('nonexistent-id')

      expect(result.success).toBe(false)
      expect(result.error).toBe('User not found')
    })
  })

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      const updatedUser: User = {
        id: 'test-user-id',
        email: 'test@example.com',
        display_name: 'Updated Name',
        dietary_restrictions: ['vegan'],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z'
      }

      const mockSelect = vi.fn().mockResolvedValue({
        data: [updatedUser],
        error: null
      })

      const mockEq = vi.fn().mockReturnValue({
        select: mockSelect
      })

      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockEq
      })

      mockSupabaseClient.from.mockReturnValue({
        update: mockUpdate
      } as any)

      const result = await userService.updateUserProfile('test-user-id', {
        display_name: 'Updated Name',
        dietary_restrictions: ['vegan']
      })

      expect(result.success).toBe(true)
      expect(result.user).toEqual(updatedUser)
    })

    it('should handle update errors', async () => {
      const mockSelect = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Update failed' }
      })

      const mockEq = vi.fn().mockReturnValue({
        select: mockSelect
      })

      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockEq
      })

      mockSupabaseClient.from.mockReturnValue({
        update: mockUpdate
      } as any)

      const result = await userService.updateUserProfile('test-user-id', {
        display_name: 'Updated Name'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Update failed')
    })

    it('should validate dietary restrictions', async () => {
      const result = await userService.updateUserProfile('test-user-id', {
        dietary_restrictions: ['invalid-restriction']
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid dietary restriction')
    })
  })

  describe('deleteUserProfile', () => {
    it('should delete user profile successfully', async () => {
      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: null
      })

      const mockDelete = vi.fn().mockReturnValue({
        eq: mockEq
      })

      mockSupabaseClient.from.mockReturnValue({
        delete: mockDelete
      } as any)

      const result = await userService.deleteUserProfile('test-user-id')

      expect(result.success).toBe(true)
    })

    it('should handle delete errors', async () => {
      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Delete failed' }
      })

      const mockDelete = vi.fn().mockReturnValue({
        eq: mockEq
      })

      mockSupabaseClient.from.mockReturnValue({
        delete: mockDelete
      } as any)

      const result = await userService.deleteUserProfile('test-user-id')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Delete failed')
    })
  })

  describe('validateDietaryRestrictions', () => {
    it('should validate valid dietary restrictions', () => {
      const validRestrictions = ['gluten-free', 'dairy-free', 'vegan', 'vegetarian', 'nut-free']
      
      validRestrictions.forEach(restriction => {
        expect(userService.validateDietaryRestrictions([restriction])).toBe(true)
      })
    })

    it('should reject invalid dietary restrictions', () => {
      const invalidRestrictions = ['invalid', 'unknown-restriction']
      
      invalidRestrictions.forEach(restriction => {
        expect(userService.validateDietaryRestrictions([restriction])).toBe(false)
      })
    })

    it('should handle empty array', () => {
      expect(userService.validateDietaryRestrictions([])).toBe(true)
    })

    it('should handle mixed valid and invalid restrictions', () => {
      expect(userService.validateDietaryRestrictions(['gluten-free', 'invalid'])).toBe(false)
    })
  })
})