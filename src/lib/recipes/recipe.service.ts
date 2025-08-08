import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import type { 
  Recipe, 
  NewRecipe, 
  RecipeUpdate,
  UserSavedRecipe,
} from '@/types/database'
import type {
  RecipeQueryOptions,
  RecipeListResponse,
  ServiceResponse,
  UserSavedRecipeWithRecipe,
  RecipeWithSaved,
  RecipeFilters,
} from '@/types/recipe.types'

export class RecipeService {
  private supabase

  constructor() {
    // Use environment variables for Supabase configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey)
  }

  /**
   * Get all recipes with filtering and pagination
   */
  async getAllRecipes(options: RecipeQueryOptions): Promise<ServiceResponse<RecipeListResponse>> {
    try {
      let query = this.supabase
        .from('recipes')
        .select('*', { count: 'exact' })

      // Apply filters
      if (options.search) {
        query = query.ilike('title', `%${options.search}%`)
      }

      if (options.mealType) {
        query = query.eq('meal_type', options.mealType)
      }

      if (options.dietaryTags && options.dietaryTags.length > 0) {
        query = query.contains('dietary_tags', options.dietaryTags)
      }

      if (options.difficulty) {
        query = query.eq('difficulty_level', options.difficulty)
      }

      if (options.maxCookTime) {
        query = query.lte('cook_time_minutes', options.maxCookTime)
      }

      if (options.maxPrepTime) {
        query = query.lte('prep_time_minutes', options.maxPrepTime)
      }

      if (options.cuisine) {
        query = query.eq('cuisine_type', options.cuisine)
      }

      if (options.servings) {
        query = query.eq('servings', options.servings)
      }

      // Apply sorting
      const sortBy = options.sortBy || 'created_at'
      const ascending = options.sortOrder === 'asc'
      query = query.order(sortBy, { ascending })

      // Apply pagination
      const from = (options.page - 1) * options.limit
      const to = from + options.limit - 1
      query = query.range(from, to)

      const { data: recipes, count, error } = await query

      if (error) {
        return { data: null, error }
      }

      const totalPages = Math.ceil((count || 0) / options.limit)

      return {
        data: {
          recipes: recipes || [],
          total: count || 0,
          page: options.page,
          limit: options.limit,
          totalPages,
        },
        error: null,
      }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Get a single recipe by ID
   */
  async getRecipeById(id: string): Promise<ServiceResponse<Recipe>> {
    try {
      const { data, error } = await this.supabase
        .from('recipes')
        .select('*')
        .eq('id', id)

      if (error) {
        return { data: null, error }
      }

      return {
        data: data && data.length > 0 ? data[0] : null,
        error: null,
      }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Get recipes with saved status for a user
   */
  async getRecipesWithSavedStatus(
    userId: string, 
    options: RecipeQueryOptions
  ): Promise<ServiceResponse<RecipeListResponse & { recipesWithSaved: RecipeWithSaved[] }>> {
    try {
      // First get the regular recipes
      const recipesResponse = await this.getAllRecipes(options)
      
      if (recipesResponse.error || !recipesResponse.data) {
        return recipesResponse as any
      }

      // Get user's saved recipe IDs
      const { data: savedRecipes, error: savedError } = await this.supabase
        .from('user_saved_recipes')
        .select('recipe_id')
        .eq('user_id', userId)

      if (savedError) {
        return { data: null, error: savedError }
      }

      const savedRecipeIds = new Set(savedRecipes?.map(sr => sr.recipe_id) || [])

      // Add saved status to recipes
      const recipesWithSaved: RecipeWithSaved[] = recipesResponse.data.recipes.map(recipe => ({
        ...recipe,
        is_saved: savedRecipeIds.has(recipe.id),
        total_time_minutes: (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0),
      }))

      return {
        data: {
          ...recipesResponse.data,
          recipesWithSaved,
        },
        error: null,
      }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Create a new recipe
   */
  async createRecipe(recipe: NewRecipe): Promise<ServiceResponse<Recipe>> {
    try {
      const { data, error } = await this.supabase
        .from('recipes')
        .insert(recipe)
        .select('*')

      if (error) {
        return { data: null, error }
      }

      return {
        data: data && data.length > 0 ? data[0] : null,
        error: null,
      }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Update an existing recipe
   */
  async updateRecipe(id: string, updates: RecipeUpdate): Promise<ServiceResponse<Recipe>> {
    try {
      const { data, error } = await this.supabase
        .from('recipes')
        .update(updates)
        .eq('id', id)
        .select('*')

      if (error) {
        return { data: null, error }
      }

      return {
        data: data && data.length > 0 ? data[0] : null,
        error: null,
      }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Delete a recipe
   */
  async deleteRecipe(id: string): Promise<ServiceResponse<null>> {
    try {
      const { error } = await this.supabase
        .from('recipes')
        .delete()
        .eq('id', id)

      return { data: null, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Get user's saved recipes
   */
  async getUserSavedRecipes(userId: string): Promise<ServiceResponse<UserSavedRecipeWithRecipe[]>> {
    try {
      const { data, error } = await this.supabase
        .from('user_saved_recipes')
        .select(`
          *,
          recipes (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        return { data: null, error }
      }

      return {
        data: data as UserSavedRecipeWithRecipe[] || [],
        error: null,
      }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Save a recipe for a user
   */
  async saveRecipe(userId: string, recipeId: string): Promise<ServiceResponse<UserSavedRecipe>> {
    try {
      const { data, error } = await this.supabase
        .from('user_saved_recipes')
        .insert({
          user_id: userId,
          recipe_id: recipeId,
        })
        .select('*')

      if (error) {
        return { data: null, error }
      }

      return {
        data: data && data.length > 0 ? data[0] : null,
        error: null,
      }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Remove a saved recipe for a user
   */
  async unsaveRecipe(userId: string, recipeId: string): Promise<ServiceResponse<null>> {
    try {
      const { error } = await this.supabase
        .from('user_saved_recipes')
        .delete()
        .eq('user_id', userId)
        .eq('recipe_id', recipeId)

      return { data: null, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Check if a user has saved a specific recipe
   */
  async isRecipeSaved(userId: string, recipeId: string): Promise<ServiceResponse<boolean>> {
    try {
      const { data, error } = await this.supabase
        .from('user_saved_recipes')
        .select('id')
        .eq('user_id', userId)
        .eq('recipe_id', recipeId)

      if (error) {
        return { data: null, error }
      }

      return {
        data: data !== null && data.length > 0,
        error: null,
      }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Get recipes by multiple filters (helper method for complex queries)
   */
  async getRecipesByFilters(filters: RecipeFilters): Promise<ServiceResponse<Recipe[]>> {
    try {
      let query = this.supabase
        .from('recipes')
        .select('*')

      // Apply each filter
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          switch (key) {
            case 'search':
              query = query.or(`title.ilike.%${value}%,description.ilike.%${value}%`)
              break
            case 'mealType':
              query = query.eq('meal_type', value)
              break
            case 'dietaryTags':
              if (Array.isArray(value) && value.length > 0) {
                query = query.contains('dietary_tags', value)
              }
              break
            case 'difficulty':
              query = query.eq('difficulty_level', value)
              break
            case 'maxCookTime':
              query = query.lte('cook_time_minutes', value)
              break
            case 'maxPrepTime':
              query = query.lte('prep_time_minutes', value)
              break
            case 'cuisine':
              query = query.eq('cuisine_type', value)
              break
            case 'servings':
              query = query.eq('servings', value)
              break
          }
        }
      })

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        return { data: null, error }
      }

      return {
        data: data || [],
        error: null,
      }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Search recipes by title and description
   */
  async searchRecipes(searchTerm: string, limit = 20): Promise<ServiceResponse<Recipe[]>> {
    try {
      const { data, error } = await this.supabase
        .from('recipes')
        .select('*')
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        return { data: null, error }
      }

      return {
        data: data || [],
        error: null,
      }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Get popular recipes (most saved)
   */
  async getPopularRecipes(limit = 10): Promise<ServiceResponse<Recipe[]>> {
    try {
      // This would be better with a view or materialized view in production
      const { data, error } = await this.supabase
        .from('recipes')
        .select(`
          *,
          user_saved_recipes(count)
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        return { data: null, error }
      }

      return {
        data: data as Recipe[] || [],
        error: null,
      }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Get recipe count by filters (useful for pagination)
   */
  async getRecipeCount(filters: RecipeFilters = {}): Promise<ServiceResponse<number>> {
    try {
      let query = this.supabase
        .from('recipes')
        .select('*', { count: 'exact', head: true })

      // Apply filters (same logic as getRecipesByFilters)
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          switch (key) {
            case 'search':
              query = query.or(`title.ilike.%${value}%,description.ilike.%${value}%`)
              break
            case 'mealType':
              query = query.eq('meal_type', value)
              break
            case 'dietaryTags':
              if (Array.isArray(value) && value.length > 0) {
                query = query.contains('dietary_tags', value)
              }
              break
            case 'difficulty':
              query = query.eq('difficulty_level', value)
              break
            case 'maxCookTime':
              query = query.lte('cook_time_minutes', value)
              break
            case 'maxPrepTime':
              query = query.lte('prep_time_minutes', value)
              break
            case 'cuisine':
              query = query.eq('cuisine_type', value)
              break
            case 'servings':
              query = query.eq('servings', value)
              break
          }
        }
      })

      const { count, error } = await query

      if (error) {
        return { data: null, error }
      }

      return {
        data: count || 0,
        error: null,
      }
    } catch (error) {
      return { data: null, error }
    }
  }
}

// Export a singleton instance
export const recipeService = new RecipeService()