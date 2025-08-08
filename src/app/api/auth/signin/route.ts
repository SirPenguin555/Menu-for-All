import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { z } from 'zod'

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validationResult = signInSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: validationResult.error.errors[0]?.message || 'Invalid input data' 
        },
        { status: 400 }
      )
    }

    const { email, password } = validationResult.data
    
    // Create auth service instance
    const authService = new AuthService()
    
    // Attempt to sign in the user
    const result = await authService.signIn({
      email,
      password
    })

    if (!result.success) {
      // Return generic error message for security
      return NextResponse.json(
        { 
          success: false, 
          error: result.error === 'Invalid login credentials' 
            ? 'Invalid email or password' 
            : result.error 
        },
        { status: 401 }
      )
    }

    // Return success response with user data (no sensitive info)
    return NextResponse.json({
      success: true,
      message: 'Signed in successfully',
      user: {
        id: result.user?.id,
        email: result.user?.email,
        displayName: result.user?.user_metadata?.display_name
      },
      session: {
        access_token: result.session?.access_token ? 'present' : null,
        expires_at: result.session?.expires_at
      }
    })

  } catch (error) {
    console.error('Signin API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred during signin' 
      },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}