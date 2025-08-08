import { createClient } from '@/lib/supabase/client'
import type { User, UserUpdate } from '@/types/database'

export interface UserResult {
  success: boolean
  user?: User | null
  error?: string
}

export interface BasicResult {
  success: boolean
  error?: string
}

// Valid dietary restrictions that can be selected
const VALID_DIETARY_RESTRICTIONS = [
  'gluten-free',
  'dairy-free',
  'vegan',
  'vegetarian',
  'nut-free',
  'soy-free',
  'egg-free',
  'fish-free',
  'shellfish-free',
  'low-carb',
  'keto',
  'paleo',
  'whole30',
  'low-sodium',
  'sugar-free'
] as const

export type DietaryRestriction = typeof VALID_DIETARY_RESTRICTIONS[number]

export class UserService {
  private supabase = createClient()

  async getUserProfile(userId: string): Promise<UserResult> {
    try {
      if (!userId) {
        return {
          success: false,
          error: 'User ID is required'
        }
      }

      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        return {
          success: false,
          error: error.message
        }
      }

      return {
        success: true,
        user: data
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    }
  }

  async updateUserProfile(userId: string, updates: Partial<UserUpdate>): Promise<UserResult> {
    try {
      if (!userId) {
        return {
          success: false,
          error: 'User ID is required'
        }
      }

      // Validate dietary restrictions if provided
      if (updates.dietary_restrictions) {
        if (!this.validateDietaryRestrictions(updates.dietary_restrictions)) {
          return {
            success: false,
            error: 'Invalid dietary restriction provided. Please select from the available options.'
          }
        }
      }

      // Validate display name if provided
      if (updates.display_name !== undefined) {
        if (typeof updates.display_name === 'string' && updates.display_name.length > 100) {
          return {
            success: false,
            error: 'Display name cannot exceed 100 characters'
          }
        }
      }

      const { data, error } = await this.supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()

      if (error) {
        return {
          success: false,
          error: error.message
        }
      }

      if (!data || data.length === 0) {
        return {
          success: false,
          error: 'User not found or update failed'
        }
      }

      return {
        success: true,
        user: data[0]
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    }
  }

  async deleteUserProfile(userId: string): Promise<BasicResult> {
    try {
      if (!userId) {
        return {
          success: false,
          error: 'User ID is required'
        }
      }

      const { error } = await this.supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (error) {
        return {
          success: false,
          error: error.message
        }
      }

      return {
        success: true
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    }
  }

  validateDietaryRestrictions(restrictions: string[]): boolean {
    if (!Array.isArray(restrictions)) {
      return false
    }

    return restrictions.every(restriction => 
      VALID_DIETARY_RESTRICTIONS.includes(restriction as DietaryRestriction)
    )
  }

  getValidDietaryRestrictions(): readonly string[] {
    return VALID_DIETARY_RESTRICTIONS
  }

  async createUserProfile(userData: {
    id: string
    email: string
    display_name?: string
    dietary_restrictions?: string[]
  }): Promise<UserResult> {
    try {
      // Validate dietary restrictions if provided
      if (userData.dietary_restrictions) {
        if (!this.validateDietaryRestrictions(userData.dietary_restrictions)) {
          return {
            success: false,
            error: 'Invalid dietary restriction provided'
          }
        }
      }

      const { data, error } = await this.supabase
        .from('users')
        .insert({
          id: userData.id,
          email: userData.email,
          display_name: userData.display_name || null,
          dietary_restrictions: userData.dietary_restrictions || []
        })
        .select()

      if (error) {
        return {
          success: false,
          error: error.message
        }
      }

      if (!data || data.length === 0) {
        return {
          success: false,
          error: 'User profile creation failed'
        }
      }

      return {
        success: true,
        user: data[0]
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    }
  }
}