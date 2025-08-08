import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ProtectedRoute, GuestOnlyRoute, withAuth } from './ProtectedRoute'

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

// Mock the session hook
const mockSession = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  session: null,
  refreshSession: vi.fn()
}

vi.mock('@/hooks/useSession', () => ({
  useSession: () => mockSession
}))

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSession.isAuthenticated = false
    mockSession.isLoading = false
  })

  it('should show loading when session is loading', () => {
    mockSession.isLoading = true
    
    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )
    
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('should redirect unauthenticated users', async () => {
    mockSession.isAuthenticated = false
    mockSession.isLoading = false
    
    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth')
    })
    
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should show fallback for unauthenticated users when provided', () => {
    mockSession.isAuthenticated = false
    mockSession.isLoading = false
    
    render(
      <ProtectedRoute fallback={<div>Please sign in</div>}>
        <div>Protected Content</div>
      </ProtectedRoute>
    )
    
    expect(screen.getByText('Please sign in')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should render children when authenticated', () => {
    mockSession.isAuthenticated = true
    mockSession.isLoading = false
    
    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('should render children when requireAuth is false', () => {
    mockSession.isAuthenticated = false
    mockSession.isLoading = false
    
    render(
      <ProtectedRoute requireAuth={false}>
        <div>Public Content</div>
      </ProtectedRoute>
    )
    
    expect(screen.getByText('Public Content')).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('should use custom redirect path', async () => {
    mockSession.isAuthenticated = false
    mockSession.isLoading = false
    
    render(
      <ProtectedRoute redirectTo="/login">
        <div>Protected Content</div>
      </ProtectedRoute>
    )
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })
})

describe('GuestOnlyRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSession.isAuthenticated = false
    mockSession.isLoading = false
  })

  it('should show loading when session is loading', () => {
    mockSession.isLoading = true
    
    render(
      <GuestOnlyRoute>
        <div>Guest Content</div>
      </GuestOnlyRoute>
    )
    
    expect(screen.queryByText('Guest Content')).not.toBeInTheDocument()
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('should redirect authenticated users', async () => {
    mockSession.isAuthenticated = true
    mockSession.isLoading = false
    
    render(
      <GuestOnlyRoute>
        <div>Guest Content</div>
      </GuestOnlyRoute>
    )
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
    })
    
    expect(screen.queryByText('Guest Content')).not.toBeInTheDocument()
  })

  it('should render children when not authenticated', () => {
    mockSession.isAuthenticated = false
    mockSession.isLoading = false
    
    render(
      <GuestOnlyRoute>
        <div>Guest Content</div>
      </GuestOnlyRoute>
    )
    
    expect(screen.getByText('Guest Content')).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('should use custom redirect path', async () => {
    mockSession.isAuthenticated = true
    mockSession.isLoading = false
    
    render(
      <GuestOnlyRoute redirectTo="/dashboard">
        <div>Guest Content</div>
      </GuestOnlyRoute>
    )
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })
})

describe('withAuth HOC', () => {
  function TestComponent({ message }: { message: string }) {
    return <div>{message}</div>
  }

  it('should wrap component with ProtectedRoute', () => {
    mockSession.isAuthenticated = true
    mockSession.isLoading = false
    
    const WrappedComponent = withAuth(TestComponent)
    
    render(<WrappedComponent message="Hello World" />)
    
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('should pass through props to wrapped component', () => {
    mockSession.isAuthenticated = true
    mockSession.isLoading = false
    
    const WrappedComponent = withAuth(TestComponent)
    
    render(<WrappedComponent message="Test Message" />)
    
    expect(screen.getByText('Test Message')).toBeInTheDocument()
  })

  it('should set correct display name', () => {
    const WrappedComponent = withAuth(TestComponent)
    
    expect(WrappedComponent.displayName).toBe('withAuth(TestComponent)')
  })

  it('should handle component without display name', () => {
    const AnonymousComponent = ({ message }: { message: string }) => <div>{message}</div>
    const WrappedComponent = withAuth(AnonymousComponent)
    
    // Should use the function name or fallback
    expect(WrappedComponent.displayName).toMatch(/withAuth\(/)
  })

  it('should redirect unauthenticated users', async () => {
    mockSession.isAuthenticated = false
    mockSession.isLoading = false
    
    const WrappedComponent = withAuth(TestComponent)
    
    render(<WrappedComponent message="Hello World" />)
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth')
    })
    
    expect(screen.queryByText('Hello World')).not.toBeInTheDocument()
  })
})