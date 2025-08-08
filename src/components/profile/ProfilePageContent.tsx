'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { UserProfile } from './UserProfile'

export function ProfilePageContent() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <UserProfile />
      </div>
    </ProtectedRoute>
  )
}