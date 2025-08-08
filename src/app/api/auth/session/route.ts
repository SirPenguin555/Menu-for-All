import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Create auth service instance
    const authService = new AuthService()
    
    // Get current session
    const result = await authService.getCurrentSession()

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    // Return session data (no sensitive info)
    return NextResponse.json({
      success: true,
      session: result.session ? {
        user: {
          id: result.session.user?.id,
          email: result.session.user?.email,
          displayName: result.session.user?.user_metadata?.display_name
        },
        expires_at: result.session.expires_at
      } : null
    })

  } catch (error) {
    console.error('Session API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred while getting session' 
      },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function POST() {
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