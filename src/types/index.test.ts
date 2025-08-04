import { describe, it, expect } from 'vitest'
import type { User, Restaurant, Menu, MenuItem, DietaryTag } from './index'

describe('Type Definitions', () => {
  it('User interface has required properties', () => {
    const user: User = {
      id: 'user123',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: 'https://example.com/photo.jpg',
      preferences: {
        language: 'en',
        dietaryRestrictions: ['vegetarian'],
        allergies: ['nuts'],
        accessibilityNeeds: ['large-text'],
        darkMode: false,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    expect(user.id).toBe('user123')
    expect(user.email).toBe('test@example.com')
    expect(user.preferences.language).toBe('en')
  })

  it('Restaurant interface has required properties', () => {
    const restaurant: Restaurant = {
      id: 'rest123',
      name: 'Test Restaurant',
      description: 'A test restaurant',
      address: {
        street: '123 Main St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        country: 'USA',
      },
      cuisine: ['Italian'],
      priceRange: 3,
      rating: 4.5,
      totalReviews: 100,
      menuId: 'menu123',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    expect(restaurant.id).toBe('rest123')
    expect(restaurant.priceRange).toBe(3)
    expect(restaurant.address.city).toBe('Test City')
  })

  it('MenuItem interface supports dietary tags', () => {
    const menuItem: MenuItem = {
      id: 'item123',
      name: 'Veggie Burger',
      description: 'Plant-based burger',
      price: 12.99,
      currency: 'USD',
      ingredients: ['plant-based patty', 'bun', 'lettuce'],
      allergens: ['gluten'],
      dietaryTags: ['vegetarian', 'vegan'],
      isAvailable: true,
      order: 1,
    }

    expect(menuItem.dietaryTags).toContain('vegetarian')
    expect(menuItem.dietaryTags).toContain('vegan')
    expect(menuItem.price).toBe(12.99)
  })

  it('DietaryTag type accepts valid values', () => {
    const validTags: DietaryTag[] = [
      'vegetarian',
      'vegan',
      'gluten-free',
      'dairy-free',
      'nut-free',
      'halal',
      'kosher',
      'keto',
      'low-carb',
      'low-sodium',
    ]

    validTags.forEach(tag => {
      expect(typeof tag).toBe('string')
      expect(tag.length).toBeGreaterThan(0)
    })
  })
})