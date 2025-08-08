import { z } from 'zod'
import type { Recipe, NewRecipe, RecipeUpdate } from './database'

// Enhanced ingredient and instruction types
export interface RecipeIngredient {
  name: string
  amount: string
  unit?: string
  notes?: string
}

export interface RecipeInstruction {
  step: number
  text: string
  time_minutes?: number
}

// Recipe filter and pagination types
export interface RecipeFilters {
  search?: string
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert'
  dietaryTags?: string[]
  difficulty?: 'easy' | 'medium' | 'hard'
  maxCookTime?: number
  maxPrepTime?: number
  cuisine?: string
  servings?: number
}

export interface RecipePagination {
  page: number
  limit: number
}

export interface RecipeQueryOptions extends RecipeFilters, RecipePagination {
  sortBy?: 'created_at' | 'title' | 'cook_time_minutes' | 'difficulty_level'
  sortOrder?: 'asc' | 'desc'
}

// Service response types
export interface ServiceResponse<T> {
  data: T | null
  error: any
}

export interface RecipeListResponse {
  recipes: Recipe[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Extended recipe type with computed properties
export interface RecipeWithSaved extends Recipe {
  is_saved?: boolean
  total_time_minutes?: number
}

// User saved recipe with full recipe data
export interface UserSavedRecipeWithRecipe {
  id: string
  user_id: string
  recipe_id: string
  created_at: string
  recipes: Recipe
}

// Zod validation schemas
export const RecipeIngredientSchema = z.object({
  name: z.string().min(1, 'Ingredient name is required'),
  amount: z.string().min(1, 'Amount is required'),
  unit: z.string().optional(),
  notes: z.string().optional(),
})

export const RecipeInstructionSchema = z.object({
  step: z.number().min(1, 'Step number must be at least 1'),
  text: z.string().min(1, 'Instruction text is required'),
  time_minutes: z.number().min(0).optional(),
})

export const CreateRecipeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().max(1000, 'Description is too long').optional(),
  ingredients: z.array(RecipeIngredientSchema).min(1, 'At least one ingredient is required'),
  instructions: z.array(RecipeInstructionSchema).min(1, 'At least one instruction is required'),
  prep_time_minutes: z.number().min(0).max(1440).optional(),
  cook_time_minutes: z.number().min(0).max(1440).optional(),
  servings: z.number().min(1).max(50).optional(),
  difficulty_level: z.enum(['easy', 'medium', 'hard']).optional(),
  cuisine_type: z.string().max(100).optional(),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'dessert']).optional(),
  dietary_tags: z.array(z.string()).optional(),
  source_url: z.string().url('Invalid URL').optional(),
  source_name: z.string().max(200).optional(),
  image_url: z.string().url('Invalid image URL').optional(),
})

export const UpdateRecipeSchema = CreateRecipeSchema.partial()

export const RecipeFiltersSchema = z.object({
  search: z.string().optional(),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'dessert']).optional(),
  dietaryTags: z.array(z.string()).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  maxCookTime: z.number().min(0).max(1440).optional(),
  maxPrepTime: z.number().min(0).max(1440).optional(),
  cuisine: z.string().optional(),
  servings: z.number().min(1).max(50).optional(),
})

export const RecipePaginationSchema = z.object({
  page: z.number().min(1, 'Page must be at least 1'),
  limit: z.number().min(1).max(100, 'Limit must be between 1 and 100'),
})

export const RecipeQuerySchema = RecipeFiltersSchema.extend({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['created_at', 'title', 'cook_time_minutes', 'difficulty_level']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// Type guards
export const isValidRecipeIngredient = (obj: any): obj is RecipeIngredient => {
  return RecipeIngredientSchema.safeParse(obj).success
}

export const isValidRecipeInstruction = (obj: any): obj is RecipeInstruction => {
  return RecipeInstructionSchema.safeParse(obj).success
}

// Helper functions
export const calculateTotalTime = (recipe: Recipe): number => {
  const prepTime = recipe.prep_time_minutes || 0
  const cookTime = recipe.cook_time_minutes || 0
  return prepTime + cookTime
}

export const formatCookingTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  return `${hours}h ${remainingMinutes}m`
}

export const getDifficultyColor = (difficulty: string | null): string => {
  switch (difficulty) {
    case 'easy':
      return 'green'
    case 'medium':
      return 'yellow'
    case 'hard':
      return 'red'
    default:
      return 'gray'
  }
}

export const getMealTypeEmoji = (mealType: string | null): string => {
  switch (mealType) {
    case 'breakfast':
      return '🥞'
    case 'lunch':
      return '🥪'
    case 'dinner':
      return '🍽️'
    case 'snack':
      return '🍿'
    case 'dessert':
      return '🍰'
    default:
      return '🍴'
  }
}

// Common dietary tags for filtering
export const COMMON_DIETARY_TAGS = [
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free',
  'nut-free',
  'low-carb',
  'keto',
  'paleo',
  'low-sodium',
  'sugar-free',
  'high-protein',
  'low-fat',
] as const

export type DietaryTag = typeof COMMON_DIETARY_TAGS[number]

// Common cuisine types
export const COMMON_CUISINES = [
  'American',
  'Italian',
  'Mexican',
  'Asian',
  'Indian',
  'Mediterranean',
  'French',
  'Chinese',
  'Japanese',
  'Thai',
  'Greek',
  'Spanish',
  'Middle Eastern',
  'Other',
] as const

export type CuisineType = typeof COMMON_CUISINES[number]