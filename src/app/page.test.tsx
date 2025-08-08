import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import HomePage from './page'

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

// Mock the auth context completely
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    session: null,
    loading: false,
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    refreshSession: vi.fn()
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children
}))

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSession.isAuthenticated = false
    mockSession.isLoading = false
  })

  it('renders the main heading', () => {
    render(<HomePage />)
    
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Welcome to Menu for All')
  })

  it('renders the description', () => {
    render(<HomePage />)
    
    const description = screen.getByText(/Making restaurant menus accessible to everyone/)
    expect(description).toBeInTheDocument()
  })

  it('renders Get Started button when not authenticated', () => {
    mockSession.isAuthenticated = false
    
    render(<HomePage />)
    
    const getStartedButton = screen.getByRole('button', { name: /get started/i })
    expect(getStartedButton).toBeInTheDocument()
    expect(getStartedButton).toHaveClass('btn-primary')
  })

  it('renders Go to Profile button when authenticated', () => {
    mockSession.isAuthenticated = true
    
    render(<HomePage />)
    
    const profileButton = screen.getByRole('button', { name: /go to profile/i })
    expect(profileButton).toBeInTheDocument()
    expect(profileButton).toHaveClass('btn-primary')
  })

  it('renders Learn More button', () => {
    render(<HomePage />)
    
    const learnMoreButton = screen.getByRole('button', { name: /learn more/i })
    expect(learnMoreButton).toBeInTheDocument()
    expect(learnMoreButton).toHaveClass('btn-secondary')
  })

  it('has proper responsive classes', () => {
    render(<HomePage />)
    
    const main = screen.getByRole('main')
    expect(main).toHaveClass('min-h-screen')
    
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveClass('text-4xl', 'sm:text-5xl', 'lg:text-6xl')
  })
})