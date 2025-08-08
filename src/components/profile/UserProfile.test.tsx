import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UserProfile } from './UserProfile'
import type { User } from '@/types/database'

// Mock the auth context
const mockAuth = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com'
  },
  session: null,
  loading: false,
  signUp: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  refreshSession: vi.fn()
}

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuth
}))

// Mock the user service
const mockUserService = {
  getUserProfile: vi.fn(),
  updateUserProfile: vi.fn(),
  getValidDietaryRestrictions: vi.fn(() => [
    'gluten-free',
    'dairy-free',
    'vegan',
    'vegetarian',
    'nut-free'
  ])
}

vi.mock('@/lib/auth', () => ({
  UserService: vi.fn(() => mockUserService)
}))

describe('UserProfile', () => {
  const mockUser: User = {
    id: 'test-user-id',
    email: 'test@example.com',
    display_name: 'Test User',
    dietary_restrictions: ['gluten-free', 'vegan'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUserService.getUserProfile.mockResolvedValue({
      success: true,
      user: mockUser
    })
  })

  it('should show loading state initially', () => {
    mockUserService.getUserProfile.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    render(<UserProfile />)
    
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('should load and display user profile', async () => {
    render(<UserProfile />)
    
    await waitFor(() => {
      expect(screen.getByText('User Profile')).toBeInTheDocument()
    })
    
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
    expect(screen.getByText('gluten free')).toBeInTheDocument()
    expect(screen.getByText('vegan')).toBeInTheDocument()
  })

  it('should handle profile loading error', async () => {
    mockUserService.getUserProfile.mockResolvedValue({
      success: false,
      error: 'Failed to load profile'
    })

    render(<UserProfile />)
    
    await waitFor(() => {
      expect(screen.getByText('Unable to load profile')).toBeInTheDocument()
    })
  })

  it('should enter edit mode when edit button is clicked', async () => {
    render(<UserProfile />)
    
    await waitFor(() => {
      expect(screen.getByText('User Profile')).toBeInTheDocument()
    })
    
    fireEvent.click(screen.getByText('Edit Profile'))
    
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument()
    expect(screen.getByText('Save Changes')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('should update display name', async () => {
    mockUserService.updateUserProfile.mockResolvedValue({
      success: true,
      user: { ...mockUser, display_name: 'Updated Name' }
    })

    render(<UserProfile />)
    
    await waitFor(() => {
      expect(screen.getByText('User Profile')).toBeInTheDocument()
    })
    
    fireEvent.click(screen.getByText('Edit Profile'))
    
    const nameInput = screen.getByDisplayValue('Test User')
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } })
    
    fireEvent.click(screen.getByText('Save Changes'))
    
    await waitFor(() => {
      expect(mockUserService.updateUserProfile).toHaveBeenCalledWith(
        'test-user-id',
        {
          display_name: 'Updated Name',
          dietary_restrictions: ['gluten-free', 'vegan']
        }
      )
    })
    
    await waitFor(() => {
      expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument()
    })
  })

  it('should toggle dietary restrictions', async () => {
    render(<UserProfile />)
    
    await waitFor(() => {
      expect(screen.getByText('User Profile')).toBeInTheDocument()
    })
    
    fireEvent.click(screen.getByText('Edit Profile'))
    
    // Should have gluten-free and vegan checked
    const glutenFreeCheckbox = screen.getByRole('checkbox', { name: /gluten free/i })
    const dairyFreeCheckbox = screen.getByRole('checkbox', { name: /dairy free/i })
    
    expect(glutenFreeCheckbox).toBeChecked()
    expect(dairyFreeCheckbox).not.toBeChecked()
    
    // Toggle dairy-free on
    fireEvent.click(dairyFreeCheckbox)
    expect(dairyFreeCheckbox).toBeChecked()
    
    // Toggle gluten-free off
    fireEvent.click(glutenFreeCheckbox)
    expect(glutenFreeCheckbox).not.toBeChecked()
  })

  it('should validate required fields', async () => {
    render(<UserProfile />)
    
    await waitFor(() => {
      expect(screen.getByText('User Profile')).toBeInTheDocument()
    })
    
    fireEvent.click(screen.getByText('Edit Profile'))
    
    const nameInput = screen.getByDisplayValue('Test User')
    fireEvent.change(nameInput, { target: { value: '' } })
    
    fireEvent.click(screen.getByText('Save Changes'))
    
    await waitFor(() => {
      expect(screen.getByText('Display name is required')).toBeInTheDocument()
    })
    
    expect(mockUserService.updateUserProfile).not.toHaveBeenCalled()
  })

  it('should handle update errors', async () => {
    mockUserService.updateUserProfile.mockResolvedValue({
      success: false,
      error: 'Update failed'
    })

    render(<UserProfile />)
    
    await waitFor(() => {
      expect(screen.getByText('User Profile')).toBeInTheDocument()
    })
    
    fireEvent.click(screen.getByText('Edit Profile'))
    fireEvent.click(screen.getByText('Save Changes'))
    
    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument()
    })
  })

  it('should cancel editing', async () => {
    render(<UserProfile />)
    
    await waitFor(() => {
      expect(screen.getByText('User Profile')).toBeInTheDocument()
    })
    
    fireEvent.click(screen.getByText('Edit Profile'))
    
    const nameInput = screen.getByDisplayValue('Test User')
    fireEvent.change(nameInput, { target: { value: 'Changed Name' } })
    
    fireEvent.click(screen.getByText('Cancel'))
    
    // Should exit edit mode and revert changes
    expect(screen.queryByDisplayValue('Changed Name')).not.toBeInTheDocument()
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('Edit Profile')).toBeInTheDocument()
  })

  it('should display account information', async () => {
    render(<UserProfile />)
    
    await waitFor(() => {
      expect(screen.getByText('User Profile')).toBeInTheDocument()
    })
    
    expect(screen.getByText('Account Information')).toBeInTheDocument()
    expect(screen.getByText('Member Since')).toBeInTheDocument()
    expect(screen.getByText('Last Updated')).toBeInTheDocument()
    
    // Check that dates are displayed (format may vary)
    const dates = screen.getAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/)
    expect(dates).toHaveLength(2) // Should have two dates displayed
  })

  it('should handle empty dietary restrictions', async () => {
    const userWithoutRestrictions = {
      ...mockUser,
      dietary_restrictions: []
    }
    
    mockUserService.getUserProfile.mockResolvedValue({
      success: true,
      user: userWithoutRestrictions
    })

    render(<UserProfile />)
    
    await waitFor(() => {
      expect(screen.getByText('No dietary restrictions selected')).toBeInTheDocument()
    })
  })
})