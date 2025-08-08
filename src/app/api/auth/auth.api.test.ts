import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock the auth service
const mockAuthService = {
  signUp: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  getCurrentSession: vi.fn()
}

vi.mock('@/lib/auth', () => ({
  AuthService: vi.fn(() => mockAuthService)
}))

describe('Auth API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/auth/signup', () => {
    it('should create a new user successfully', async () => {
      // Mock successful signup
      mockAuthService.signUp.mockResolvedValue({
        success: true,
        user: {
          id: 'test-user-id',
          email: 'test@example.com'
        }
      })

      // Import the route handler
      const { POST } = await import('./signup/route')

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          displayName: 'Test User'
        })
      })

      // Call the route handler
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toContain('Account created successfully')
      expect(data.user.email).toBe('test@example.com')
    })

    it('should validate email format', async () => {
      const { POST } = await import('./signup/route')

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: 'invalid-email',
          password: 'password123'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('valid email')
    })

    it('should validate password length', async () => {
      const { POST } = await import('./signup/route')

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: '123'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('6 characters')
    })

    it('should handle signup errors', async () => {
      mockAuthService.signUp.mockResolvedValue({
        success: false,
        error: 'Email already exists'
      })

      const { POST } = await import('./signup/route')

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: 'existing@example.com',
          password: 'password123'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Email already exists')
    })
  })

  describe('POST /api/auth/signin', () => {
    it('should sign in user successfully', async () => {
      mockAuthService.signIn.mockResolvedValue({
        success: true,
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          user_metadata: {
            display_name: 'Test User'
          }
        },
        session: {
          access_token: 'test-token',
          expires_at: 1234567890
        }
      })

      const { POST } = await import('./signin/route')

      const request = new NextRequest('http://localhost:3000/api/auth/signin', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toContain('Signed in successfully')
      expect(data.user.email).toBe('test@example.com')
      expect(data.session.access_token).toBe('present')
    })

    it('should handle invalid credentials', async () => {
      mockAuthService.signIn.mockResolvedValue({
        success: false,
        error: 'Invalid login credentials'
      })

      const { POST } = await import('./signin/route')

      const request = new NextRequest('http://localhost:3000/api/auth/signin', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid email or password')
    })
  })

  describe('POST /api/auth/signout', () => {
    it('should sign out user successfully', async () => {
      mockAuthService.signOut.mockResolvedValue({
        success: true
      })

      const { POST } = await import('./signout/route')

      const request = new NextRequest('http://localhost:3000/api/auth/signout', {
        method: 'POST'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toContain('Signed out successfully')
    })

    it('should handle signout errors', async () => {
      mockAuthService.signOut.mockResolvedValue({
        success: false,
        error: 'Signout failed'
      })

      const { POST } = await import('./signout/route')

      const request = new NextRequest('http://localhost:3000/api/auth/signout', {
        method: 'POST'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Signout failed')
    })
  })

  describe('GET /api/auth/session', () => {
    it('should return current session', async () => {
      mockAuthService.getCurrentSession.mockResolvedValue({
        success: true,
        session: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            user_metadata: {
              display_name: 'Test User'
            }
          },
          expires_at: 1234567890
        }
      })

      const { GET } = await import('./session/route')

      const request = new NextRequest('http://localhost:3000/api/auth/session')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.session.user.email).toBe('test@example.com')
      expect(data.session.expires_at).toBe(1234567890)
    })

    it('should handle no session', async () => {
      mockAuthService.getCurrentSession.mockResolvedValue({
        success: true,
        session: null
      })

      const { GET } = await import('./session/route')

      const request = new NextRequest('http://localhost:3000/api/auth/session')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.session).toBeNull()
    })
  })
})