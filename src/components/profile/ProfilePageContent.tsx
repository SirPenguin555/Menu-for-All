'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { UserProfile } from './UserProfile'

export function ProfilePageContent() {
  console.log('ProfilePageContent rendering')
  return (
    <div>
      <h2>ProfilePageContent Test</h2>
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-8">
          <h3>Inside ProtectedRoute</h3>
          <UserProfile />
        </div>
      </ProtectedRoute>
    </div>
  )
}