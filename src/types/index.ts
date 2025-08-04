// User types
export interface User {
  id: string
  email: string
  displayName?: string
  photoURL?: string
  preferences: UserPreferences
  createdAt: Date
  updatedAt: Date
}

export interface UserPreferences {
  language: string
  dietaryRestrictions: string[]
  allergies: string[]
  accessibilityNeeds: string[]
  darkMode: boolean
}

// Restaurant types
export interface Restaurant {
  id: string
  name: string
  description: string
  address: Address
  cuisine: string[]
  priceRange: 1 | 2 | 3 | 4 | 5
  rating: number
  totalReviews: number
  imageUrl?: string
  menuId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  coordinates?: {
    latitude: number
    longitude: number
  }
}

// Menu types
export interface Menu {
  id: string
  restaurantId: string
  name: string
  description?: string
  categories: MenuCategory[]
  languages: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface MenuCategory {
  id: string
  name: string
  description?: string
  items: MenuItem[]
  order: number
}

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  currency: string
  ingredients: string[]
  allergens: string[]
  dietaryTags: DietaryTag[]
  nutritionalInfo?: NutritionalInfo
  imageUrl?: string
  isAvailable: boolean
  order: number
}

export interface NutritionalInfo {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sodium: number
}

export type DietaryTag = 
  | 'vegetarian'
  | 'vegan'
  | 'gluten-free'
  | 'dairy-free'
  | 'nut-free'
  | 'halal'
  | 'kosher'
  | 'keto'
  | 'low-carb'
  | 'low-sodium'

// API response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Form types
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  email: string
  password: string
  confirmPassword: string
  displayName: string
}