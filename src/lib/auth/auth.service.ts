import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

export interface SignUpData {
  email: string
  password: string
  displayName?: string
}

export interface SignInData {
  email: string
  password: string
}

export interface UpdateProfileData {
  displayName?: string
  email?: string
}

export interface AuthResult {
  success: boolean
  user?: User | null
  session?: Session | null
  error?: string
}

export class AuthService {
  private supabase = createClient()

  async signUp(data: SignUpData): Promise<AuthResult> {
    try {
      // Validate input
      if (!data.email || !data.password) {
        return {
          success: false,
          error: 'Email and password are required'
        }
      }

      if (data.password.length < 6) {
        return {
          success: false,
          error: 'Password must be at least 6 characters long'
        }
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.email)) {
        return {
          success: false,
          error: 'Please enter a valid email address'
        }
      }

      const { data: authData, error } = await this.supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            display_name: data.displayName || ''
          }
        }
      })

      if (error) {
        return {
          success: false,
          error: error.message
        }
      }

      return {
        success: true,
        user: authData.user,
        session: authData.session
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    }
  }

  async signIn(data: SignInData): Promise<AuthResult> {
    try {
      // Validate input
      if (!data.email || !data.password) {
        return {
          success: false,
          error: 'Email and password are required'
        }
      }

      const { data: authData, error } = await this.supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      })

      if (error) {
        return {
          success: false,
          error: error.message
        }
      }

      return {
        success: true,
        user: authData.user,
        session: authData.session
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    }
  }

  async signOut(): Promise<AuthResult> {
    try {
      const { error } = await this.supabase.auth.signOut()

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

  async getCurrentUser(): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.getUser()

      if (error) {
        return {
          success: false,
          error: error.message
        }
      }

      return {
        success: true,
        user: data.user
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    }
  }

  async getCurrentSession(): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.getSession()

      if (error) {
        return {
          success: false,
          error: error.message
        }
      }

      return {
        success: true,
        session: data.session,
        user: data.session?.user || null
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    }
  }

  async updateUserProfile(data: UpdateProfileData): Promise<AuthResult> {
    try {
      const updateData: any = {}

      if (data.displayName !== undefined) {
        updateData.display_name = data.displayName
      }

      if (data.email !== undefined) {
        updateData.email = data.email
      }

      const { data: authData, error } = await this.supabase.auth.updateUser({
        data: updateData
      })

      if (error) {
        return {
          success: false,
          error: error.message
        }
      }

      return {
        success: true,
        user: authData.user
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    }
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback)
  }
}