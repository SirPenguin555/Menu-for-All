import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'
import type { User, Session } from '@supabase/supabase-js'

// Mock the auth service
const mockAuthService = {
  getCurrentSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  signUp: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn()
}

vi.mock('@/lib/auth', () => ({
  AuthService: vi.fn(() => mockAuthService)
}))

// Test component that uses the auth hook
function TestComponent() {
  const { user, session, loading, signIn, signOut, signUp } = useAuth()
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="user">{user ? user.email : 'no-user'}</div>
      <div data-testid="session">{session ? 'has-session' : 'no-session'}</div>
      <button onClick={() => signIn({ email: 'test@example.com', password: 'password' })}>
        Sign In
      </button>
      <button onClick={() => signUp({ email: 'test@example.com', password: 'password' })}>
        Sign Up
      </button>
      <button onClick={() => signOut()}>
        Sign Out
      </button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default mock implementations
    mockAuthService.getCurrentSession.mockResolvedValue({
      success: true,
      session: null
    })
    
    mockAuthService.onAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn()
        }
      }
    })
  })

  it('should throw error when useAuth is used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => {
      render(<TestComponent />)
    }).toThrow('useAuth must be used within an AuthProvider')
    
    consoleSpy.mockRestore()
  })

  it('should provide initial auth state', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Initially should be loading
    expect(screen.getByTestId('loading')).toHaveTextContent('loading')
    
    // Wait for initial session check to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
    })
    
    expect(screen.getByTestId('user')).toHaveTextContent('no-user')
    expect(screen.getByTestId('session')).toHaveTextContent('no-session')
  })

  it('should handle existing session on mount', async () => {
    const mockUser: Partial<User> = {
      id: 'test-user-id',
      email: 'test@example.com'
    }
    
    const mockSession: Partial<Session> = {
      user: mockUser as User,
      access_token: 'test-token'
    }

    mockAuthService.getCurrentSession.mockResolvedValue({
      success: true,
      session: mockSession
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
    })
    
    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
    expect(screen.getByTestId('session')).toHaveTextContent('has-session')
  })

  it('should handle sign in', async () => {
    const mockUser: Partial<User> = {
      id: 'test-user-id',
      email: 'test@example.com'
    }
    
    const mockSession: Partial<Session> = {
      user: mockUser as User,
      access_token: 'test-token'
    }

    mockAuthService.signIn.mockResolvedValue({
      success: true,
      user: mockUser,
      session: mockSession
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
    })

    // Click sign in
    await act(async () => {
      screen.getByText('Sign In').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
      expect(screen.getByTestId('session')).toHaveTextContent('has-session')
    })
  })

  it('should handle sign up', async () => {
    mockAuthService.signUp.mockResolvedValue({
      success: true,
      user: { id: 'test-user-id', email: 'test@example.com' }
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
    })

    // Click sign up
    await act(async () => {
      screen.getByText('Sign Up').click()
    })

    expect(mockAuthService.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password'
    })
  })

  it('should handle sign out', async () => {
    // Start with a signed-in user
    const mockUser: Partial<User> = {
      id: 'test-user-id',
      email: 'test@example.com'
    }
    
    const mockSession: Partial<Session> = {
      user: mockUser as User,
      access_token: 'test-token'
    }

    mockAuthService.getCurrentSession.mockResolvedValue({
      success: true,
      session: mockSession
    })

    mockAuthService.signOut.mockResolvedValue({
      success: true
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Wait for initial session load
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
    })

    // Click sign out
    await act(async () => {
      screen.getByText('Sign Out').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('no-user')
      expect(screen.getByTestId('session')).toHaveTextContent('no-session')
    })
  })

  it('should handle auth state changes', async () => {
    let authStateCallback: (event: string, session: Session | null) => void = () => {}
    
    mockAuthService.onAuthStateChange.mockImplementation((callback) => {
      authStateCallback = callback
      return {
        data: {
          subscription: {
            unsubscribe: vi.fn()
          }
        }
      }
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
    })

    // Simulate auth state change
    const mockUser: Partial<User> = {
      id: 'test-user-id',
      email: 'test@example.com'
    }
    
    const mockSession: Partial<Session> = {
      user: mockUser as User,
      access_token: 'test-token'
    }

    await act(async () => {
      authStateCallback('SIGNED_IN', mockSession as Session)
    })

    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
    expect(screen.getByTestId('session')).toHaveTextContent('has-session')
  })
})