import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import { AuthModal, useAuthModal } from './AuthModal'

// Mock the auth context
const mockAuth = {
  signIn: vi.fn(),
  signUp: vi.fn(),
  user: null,
  session: null,
  loading: false,
  signOut: vi.fn(),
  refreshSession: vi.fn()
}

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuth
}))

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render login form fields', () => {
    render(<LoginForm />)
    
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('should validate required fields', async () => {
    render(<LoginForm />)
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
      expect(screen.getByText('Password is required')).toBeInTheDocument()
    })
  })

  it('should call signIn on valid form submission', async () => {
    mockAuth.signIn.mockResolvedValue({ success: true })
    const onSuccess = vi.fn()
    
    render(<LoginForm onSuccess={onSuccess} />)
    
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(mockAuth.signIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  it('should display error on failed login', async () => {
    mockAuth.signIn.mockResolvedValue({ 
      success: false, 
      error: 'Invalid credentials' 
    })
    
    render(<LoginForm />)
    
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrongpassword' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })

  it('should call onSwitchToRegister when register link is clicked', () => {
    const onSwitchToRegister = vi.fn()
    
    render(<LoginForm onSwitchToRegister={onSwitchToRegister} />)
    
    fireEvent.click(screen.getByText('Create one here'))
    
    expect(onSwitchToRegister).toHaveBeenCalled()
  })
})

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render register form fields', () => {
    render(<RegisterForm />)
    
    expect(screen.getByLabelText('Display Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('should validate password confirmation', async () => {
    render(<RegisterForm />)
    
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'Test User' }
    })
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    })
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'differentpassword' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    
    await waitFor(() => {
      expect(screen.getByText("Passwords don't match")).toBeInTheDocument()
    })
  })

  it('should call signUp on valid form submission', async () => {
    mockAuth.signUp.mockResolvedValue({ success: true })
    const onSuccess = vi.fn()
    
    render(<RegisterForm onSuccess={onSuccess} />)
    
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'Test User' }
    })
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    })
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'password123' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    
    await waitFor(() => {
      expect(mockAuth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User'
      })
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  it('should display success message on successful registration', async () => {
    mockAuth.signUp.mockResolvedValue({ success: true })
    
    render(<RegisterForm />)
    
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'Test User' }
    })
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    })
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'password123' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/Account created successfully/)).toBeInTheDocument()
    })
  })
})

describe('AuthModal', () => {
  it('should not render when closed', () => {
    render(<AuthModal isOpen={false} onClose={vi.fn()} />)
    
    expect(screen.queryByText('Sign In')).not.toBeInTheDocument()
    expect(screen.queryByText('Create Account')).not.toBeInTheDocument()
  })

  it('should render login form by default', () => {
    render(<AuthModal isOpen={true} onClose={vi.fn()} />)
    
    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Create Account' })).not.toBeInTheDocument()
  })

  it('should render register form when defaultMode is register', () => {
    render(<AuthModal isOpen={true} onClose={vi.fn()} defaultMode="register" />)
    
    expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Sign In' })).not.toBeInTheDocument()
  })

  it('should call onClose when backdrop is clicked', () => {
    const onClose = vi.fn()
    render(<AuthModal isOpen={true} onClose={onClose} />)
    
    const backdrop = document.querySelector('.bg-black.bg-opacity-50')
    fireEvent.click(backdrop!)
    
    expect(onClose).toHaveBeenCalled()
  })

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(<AuthModal isOpen={true} onClose={onClose} />)
    
    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)
    
    expect(onClose).toHaveBeenCalled()
  })
})

// Test component for useAuthModal hook
function TestAuthModalHook() {
  const { isOpen, mode, openLogin, openRegister, close } = useAuthModal()
  
  return (
    <div>
      <div data-testid="modal-state">{isOpen ? 'open' : 'closed'}</div>
      <div data-testid="modal-mode">{mode}</div>
      <button onClick={openLogin}>Open Login</button>
      <button onClick={openRegister}>Open Register</button>
      <button onClick={close}>Close</button>
    </div>
  )
}

describe('useAuthModal', () => {
  it('should manage modal state correctly', () => {
    render(<TestAuthModalHook />)
    
    expect(screen.getByTestId('modal-state')).toHaveTextContent('closed')
    expect(screen.getByTestId('modal-mode')).toHaveTextContent('login')
    
    fireEvent.click(screen.getByText('Open Login'))
    expect(screen.getByTestId('modal-state')).toHaveTextContent('open')
    expect(screen.getByTestId('modal-mode')).toHaveTextContent('login')
    
    fireEvent.click(screen.getByText('Close'))
    expect(screen.getByTestId('modal-state')).toHaveTextContent('closed')
    
    fireEvent.click(screen.getByText('Open Register'))
    expect(screen.getByTestId('modal-state')).toHaveTextContent('open')
    expect(screen.getByTestId('modal-mode')).toHaveTextContent('register')
  })
})