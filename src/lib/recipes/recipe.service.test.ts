import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest'
import type { Recipe, NewRecipe } from '@/types/database'

// Mock environment variables
beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://localhost:3000')
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'fake-anon-key')
})

// Create a mock chain that properly tracks all calls
const createMockChain = () => {
  const mockChain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
  }

  // Make each method return the same chain object to maintain chainability
  Object.keys(mockChain).forEach(method => {
    mockChain[method] = vi.fn().mockReturnValue(mockChain)
  })

  return mockChain
}

let mockQuery = createMockChain()

const mockSupabaseClient = {
  from: vi.fn(() => mockQuery),
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}))

const { RecipeService } = await import('./recipe.service')

describe('RecipeService', () => {
  let recipeService: RecipeService

  beforeEach(() => {
    vi.clearAllMocks()
    mockQuery = createMockChain()
    mockSupabaseClient.from.mockReturnValue(mockQuery)
    recipeService = new RecipeService()
  })

  describe('getAllRecipes', () => {
    it('should fetch recipes with pagination', async () => {
      const mockRecipes: Recipe[] = [
        {
          id: '1',
          title: 'Test Recipe',
          description: 'A test recipe',
          ingredients: [{ name: 'flour', amount: '1 cup' }],
          instructions: [{ step: 1, text: 'Mix ingredients' }],
          prep_time_minutes: 15,
          cook_time_minutes: 30,
          servings: 4,
          difficulty_level: 'easy',
          cuisine_type: 'Italian',
          meal_type: 'dinner',
          dietary_tags: ['vegetarian'],
          source_url: 'https://example.com',
          source_name: 'Example Site',
          image_url: 'https://example.com/image.jpg',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ]

      // Mock the final promise resolution
      mockQuery.range.mockResolvedValueOnce({
        data: mockRecipes,
        count: 1,
        error: null,
      })

      const result = await recipeService.getAllRecipes({
        page: 1,
        limit: 10,
      })

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('recipes')
      expect(mockQuery.select).toHaveBeenCalledWith('*', { count: 'exact' })
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(mockQuery.range).toHaveBeenCalledWith(0, 9)
      expect(result.data).toEqual({
        recipes: mockRecipes,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      })
    })

    it('should handle search filter', async () => {
      mockQuery.range.mockResolvedValueOnce({
        data: [],
        count: 0,
        error: null,
      })

      await recipeService.getAllRecipes({
        page: 1,
        limit: 10,
        search: 'pasta',
      })

      expect(mockQuery.ilike).toHaveBeenCalledWith('title', '%pasta%')
    })

    it('should handle meal type filter', async () => {
      mockQuery.range.mockResolvedValueOnce({
        data: [],
        count: 0,
        error: null,
      })

      await recipeService.getAllRecipes({
        page: 1,
        limit: 10,
        mealType: 'dinner',
      })

      expect(mockQuery.eq).toHaveBeenCalledWith('meal_type', 'dinner')
    })

    it('should handle dietary tags filter', async () => {
      mockQuery.range.mockResolvedValueOnce({
        data: [],
        count: 0,
        error: null,
      })

      await recipeService.getAllRecipes({
        page: 1,
        limit: 10,
        dietaryTags: ['vegetarian', 'gluten-free'],
      })

      expect(mockQuery.contains).toHaveBeenCalledWith('dietary_tags', ['vegetarian', 'gluten-free'])
    })

    it('should handle difficulty filter', async () => {
      mockQuery.range.mockResolvedValueOnce({
        data: [],
        count: 0,
        error: null,
      })

      await recipeService.getAllRecipes({
        page: 1,
        limit: 10,
        difficulty: 'easy',
      })

      expect(mockQuery.eq).toHaveBeenCalledWith('difficulty_level', 'easy')
    })

    it('should handle cooking time filter', async () => {
      mockQuery.range.mockResolvedValueOnce({
        data: [],
        count: 0,
        error: null,
      })

      await recipeService.getAllRecipes({
        page: 1,
        limit: 10,
        maxCookTime: 30,
      })

      expect(mockQuery.lte).toHaveBeenCalledWith('cook_time_minutes', 30)
    })
  })

  describe('getRecipeById', () => {
    it('should fetch single recipe by id', async () => {
      const mockRecipe: Recipe = {
        id: '1',
        title: 'Test Recipe',
        description: 'A test recipe',
        ingredients: [{ name: 'flour', amount: '1 cup' }],
        instructions: [{ step: 1, text: 'Mix ingredients' }],
        prep_time_minutes: 15,
        cook_time_minutes: 30,
        servings: 4,
        difficulty_level: 'easy',
        cuisine_type: 'Italian',
        meal_type: 'dinner',
        dietary_tags: ['vegetarian'],
        source_url: 'https://example.com',
        source_name: 'Example Site',
        image_url: 'https://example.com/image.jpg',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mockQuery.eq.mockResolvedValueOnce({
        data: [mockRecipe],
        error: null,
      })

      const result = await recipeService.getRecipeById('1')

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('recipes')
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1')
      expect(result).toEqual({
        data: mockRecipe,
        error: null,
      })
    })

    it('should return null when recipe not found', async () => {
      mockQuery.eq.mockResolvedValueOnce({
        data: [],
        error: null,
      })

      const result = await recipeService.getRecipeById('nonexistent')

      expect(result).toEqual({
        data: null,
        error: null,
      })
    })

    it('should handle database errors', async () => {
      const mockError = { message: 'Database error' }
      mockQuery.eq.mockResolvedValueOnce({
        data: null,
        error: mockError,
      })

      const result = await recipeService.getRecipeById('1')

      expect(result).toEqual({
        data: null,
        error: mockError,
      })
    })
  })

  describe('createRecipe', () => {
    it('should create a new recipe', async () => {
      const newRecipe: NewRecipe = {
        title: 'New Recipe',
        description: 'A new recipe',
        ingredients: [{ name: 'flour', amount: '1 cup' }],
        instructions: [{ step: 1, text: 'Mix ingredients' }],
        prep_time_minutes: 15,
        cook_time_minutes: 30,
        servings: 4,
        difficulty_level: 'easy',
        meal_type: 'dinner',
        dietary_tags: ['vegetarian'],
        source_url: 'https://example.com',
        source_name: 'Example Site',
      }

      const mockCreatedRecipe: Recipe = {
        ...newRecipe,
        id: 'new-id',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        cuisine_type: null,
        image_url: null,
      }

      mockQuery.select.mockResolvedValueOnce({
        data: [mockCreatedRecipe],
        error: null,
      })

      const result = await recipeService.createRecipe(newRecipe)

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('recipes')
      expect(mockQuery.insert).toHaveBeenCalledWith(newRecipe)
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(result).toEqual({
        data: mockCreatedRecipe,
        error: null,
      })
    })

    it('should handle creation errors', async () => {
      const newRecipe: NewRecipe = {
        title: 'New Recipe',
        ingredients: [],
        instructions: [],
      }

      const mockError = { message: 'Creation failed' }
      mockQuery.select.mockResolvedValueOnce({
        data: null,
        error: mockError,
      })

      const result = await recipeService.createRecipe(newRecipe)

      expect(result).toEqual({
        data: null,
        error: mockError,
      })
    })
  })

  describe('updateRecipe', () => {
    it('should update an existing recipe', async () => {
      const updateData = {
        title: 'Updated Recipe',
        description: 'Updated description',
      }

      const mockUpdatedRecipe: Recipe = {
        id: '1',
        title: 'Updated Recipe',
        description: 'Updated description',
        ingredients: [],
        instructions: [],
        prep_time_minutes: null,
        cook_time_minutes: null,
        servings: null,
        difficulty_level: null,
        cuisine_type: null,
        meal_type: null,
        dietary_tags: null,
        source_url: null,
        source_name: null,
        image_url: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mockQuery.select.mockResolvedValueOnce({
        data: [mockUpdatedRecipe],
        error: null,
      })

      const result = await recipeService.updateRecipe('1', updateData)

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('recipes')
      expect(mockQuery.update).toHaveBeenCalledWith(updateData)
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1')
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(result).toEqual({
        data: mockUpdatedRecipe,
        error: null,
      })
    })
  })

  describe('deleteRecipe', () => {
    it('should delete a recipe', async () => {
      mockQuery.eq.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      const result = await recipeService.deleteRecipe('1')

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('recipes')
      expect(mockQuery.delete).toHaveBeenCalled()
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1')
      expect(result).toEqual({
        data: null,
        error: null,
      })
    })
  })

  describe('getUserSavedRecipes', () => {
    it('should fetch user saved recipes', async () => {
      const mockSavedRecipes = [
        {
          id: '1',
          user_id: 'user-1',
          recipe_id: 'recipe-1',
          created_at: '2024-01-01T00:00:00Z',
          recipes: {
            id: 'recipe-1',
            title: 'Saved Recipe',
            description: 'A saved recipe',
            ingredients: [],
            instructions: [],
            prep_time_minutes: 15,
            cook_time_minutes: 30,
            servings: 4,
            difficulty_level: 'easy',
            cuisine_type: 'Italian',
            meal_type: 'dinner',
            dietary_tags: ['vegetarian'],
            source_url: 'https://example.com',
            source_name: 'Example Site',
            image_url: null,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        },
      ]

      mockQuery.order.mockResolvedValueOnce({
        data: mockSavedRecipes,
        error: null,
      })

      const result = await recipeService.getUserSavedRecipes('user-1')

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_saved_recipes')
      expect(mockQuery.select).toHaveBeenCalledWith(`
          *,
          recipes (*)
        `)
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', 'user-1')
      expect(result).toEqual({
        data: mockSavedRecipes,
        error: null,
      })
    })
  })

  describe('saveRecipe', () => {
    it('should save a recipe for user', async () => {
      const mockSavedRecipe = {
        id: 'saved-1',
        user_id: 'user-1',
        recipe_id: 'recipe-1',
        created_at: '2024-01-01T00:00:00Z',
      }

      mockQuery.select.mockResolvedValueOnce({
        data: [mockSavedRecipe],
        error: null,
      })

      const result = await recipeService.saveRecipe('user-1', 'recipe-1')

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_saved_recipes')
      expect(mockQuery.insert).toHaveBeenCalledWith({
        user_id: 'user-1',
        recipe_id: 'recipe-1',
      })
      expect(result).toEqual({
        data: mockSavedRecipe,
        error: null,
      })
    })
  })

  describe('unsaveRecipe', () => {
    it('should remove saved recipe for user', async () => {
      // Mock the delete operation chain - it calls eq twice, so we need to mock it properly
      const finalMock = {
        ...mockQuery,
        eq: vi.fn().mockResolvedValueOnce({
          data: null,
          error: null,
        })
      }
      
      mockQuery.eq.mockReturnValueOnce(finalMock)

      const result = await recipeService.unsaveRecipe('user-1', 'recipe-1')

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_saved_recipes')
      expect(mockQuery.delete).toHaveBeenCalled()
      expect(result).toEqual({
        data: null,
        error: null,
      })
    })
  })
})