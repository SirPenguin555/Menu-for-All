'use client'

import { GuestOnlyRoute } from './ProtectedRoute'
import { AuthModal } from './AuthModal'
import { useRouter } from 'next/navigation'

export function AuthPageContent() {
  const router = useRouter()
  
  return (
    <GuestOnlyRoute>
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <AuthModal 
            isOpen={true} 
            onClose={() => {
              // Redirect to home page since we can't close the page modal
              router.push('/')
            }}
            defaultMode="login"
          />
        </div>
      </div>
    </GuestOnlyRoute>
  )
}