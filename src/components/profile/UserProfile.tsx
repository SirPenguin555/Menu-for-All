'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { UserService, type DietaryRestriction } from '@/lib/auth'
import type { User } from '@/types/database'

export function UserProfile() {
  const { user } = useAuth()
  const [userService] = useState(() => new UserService())
  const [profile, setProfile] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')
  
  const [formData, setFormData] = useState({
    display_name: '',
    email: '',
    dietary_restrictions: [] as string[]
  })

  // Load user profile on mount
  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) return
      
      setLoading(true)
      try {
        const result = await userService.getUserProfile(user.id)
        if (result.success && result.user) {
          setProfile(result.user)
          setFormData({
            display_name: result.user.display_name || '',
            email: result.user.email,
            dietary_restrictions: result.user.dietary_restrictions || []
          })
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user?.id, userService])

  const availableDietaryRestrictions = userService.getValidDietaryRestrictions()

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    
    // Clear success message when editing
    if (successMessage) {
      setSuccessMessage('')
    }
  }

  const handleDietaryRestrictionToggle = (restriction: string) => {
    setFormData(prev => ({
      ...prev,
      dietary_restrictions: prev.dietary_restrictions.includes(restriction)
        ? prev.dietary_restrictions.filter(r => r !== restriction)
        : [...prev.dietary_restrictions, restriction]
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.display_name.trim()) {
      newErrors.display_name = 'Display name is required'
    } else if (formData.display_name.length > 100) {
      newErrors.display_name = 'Display name cannot exceed 100 characters'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!user?.id || !validateForm()) return
    
    setSaving(true)
    setErrors({})
    
    try {
      const result = await userService.updateUserProfile(user.id, {
        display_name: formData.display_name,
        dietary_restrictions: formData.dietary_restrictions
      })
      
      if (result.success && result.user) {
        setProfile(result.user)
        setIsEditing(false)
        setSuccessMessage('Profile updated successfully!')
      } else {
        setErrors({ form: result.error || 'Failed to update profile' })
      }
    } catch (error) {
      setErrors({ form: 'An unexpected error occurred' })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        email: profile.email,
        dietary_restrictions: profile.dietary_restrictions || []
      })
    }
    setIsEditing(false)
    setErrors({})
    setSuccessMessage('')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">Unable to load profile</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Edit Profile
            </button>
          )}
        </div>

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}

        {errors.form && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.form}
          </div>
        )}

        <div className="space-y-6">
          {/* Display Name */}
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            {isEditing ? (
              <input
                id="displayName"
                type="text"
                value={formData.display_name}
                onChange={(e) => handleInputChange('display_name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.display_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your display name"
              />
            ) : (
              <p className="text-gray-900 py-2">{profile.display_name || 'Not set'}</p>
            )}
            {errors.display_name && (
              <p className="mt-1 text-sm text-red-600">{errors.display_name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <p className="text-gray-900 py-2">{profile.email}</p>
            {!isEditing && (
              <p className="text-sm text-gray-500">Email cannot be changed here. Contact support if needed.</p>
            )}
          </div>

          {/* Dietary Restrictions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Dietary Restrictions
            </label>
            
            {isEditing ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableDietaryRestrictions.map((restriction) => (
                  <label key={restriction} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.dietary_restrictions.includes(restriction)}
                      onChange={() => handleDietaryRestrictionToggle(restriction)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">
                      {restriction.replace('-', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <div>
                {profile.dietary_restrictions && profile.dietary_restrictions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.dietary_restrictions.map((restriction) => (
                      <span
                        key={restriction}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full capitalize"
                      >
                        {restriction.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No dietary restrictions selected</p>
                )}
              </div>
            )}
          </div>

          {/* Account Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Member Since
                </label>
                <p className="text-gray-900">
                  {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Last Updated
                </label>
                <p className="text-gray-900">
                  {new Date(profile.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}