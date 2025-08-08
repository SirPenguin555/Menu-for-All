import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import type { RecipeFilters, RecipeQueryOptions } from '@/types/recipe.types'

type DbClient = SupabaseClient<Database>

/**
 * Database query builder helpers for recipes
 */
export class RecipeQueryBuilder {
  private client: DbClient

  constructor(client: DbClient) {
    this.client = client
  }

  /**
   * Build a base query for recipes with optional filters
   */
  buildRecipeQuery(filters: RecipeFilters = {}) {
    let query = this.client.from('recipes').select('*')

    // Apply search filter
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    // Apply meal type filter
    if (filters.mealType) {
      query = query.eq('meal_type', filters.mealType)
    }

    // Apply dietary tags filter
    if (filters.dietaryTags && filters.dietaryTags.length > 0) {
      query = query.contains('dietary_tags', filters.dietaryTags)
    }

    // Apply difficulty filter
    if (filters.difficulty) {
      query = query.eq('difficulty_level', filters.difficulty)
    }

    // Apply cooking time filters
    if (filters.maxCookTime !== undefined) {
      query = query.lte('cook_time_minutes', filters.maxCookTime)
    }

    if (filters.maxPrepTime !== undefined) {
      query = query.lte('prep_time_minutes', filters.maxPrepTime)
    }

    // Apply cuisine filter
    if (filters.cuisine) {
      query = query.eq('cuisine_type', filters.cuisine)
    }

    // Apply servings filter
    if (filters.servings) {
      query = query.eq('servings', filters.servings)
    }

    return query
  }

  /**
   * Build paginated recipe query with sorting
   */
  buildPaginatedRecipeQuery(options: RecipeQueryOptions) {
    let query = this.buildRecipeQuery(options)

    // Apply sorting
    const sortBy = options.sortBy || 'created_at'
    const ascending = options.sortOrder === 'asc'
    query = query.order(sortBy, { ascending })

    // Apply pagination
    const from = (options.page - 1) * options.limit
    const to = from + options.limit - 1
    query = query.range(from, to)

    return query
  }

  /**
   * Build query for recipes with saved status for a specific user
   */
  buildRecipesWithSavedQuery(userId: string, filters: RecipeFilters = {}) {
    // This is a more complex query that joins recipes with user_saved_recipes
    let query = this.client
      .from('recipes')
      .select(`
        *,
        user_saved_recipes!left(id, user_id, created_at)
      `)

    // Apply the same filters as regular recipe query
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    if (filters.mealType) {
      query = query.eq('meal_type', filters.mealType)
    }

    if (filters.dietaryTags && filters.dietaryTags.length > 0) {
      query = query.contains('dietary_tags', filters.dietaryTags)
    }

    if (filters.difficulty) {
      query = query.eq('difficulty_level', filters.difficulty)
    }

    if (filters.maxCookTime !== undefined) {
      query = query.lte('cook_time_minutes', filters.maxCookTime)
    }

    if (filters.maxPrepTime !== undefined) {
      query = query.lte('prep_time_minutes', filters.maxPrepTime)
    }

    if (filters.cuisine) {
      query = query.eq('cuisine_type', filters.cuisine)
    }

    if (filters.servings) {
      query = query.eq('servings', filters.servings)
    }

    return query
  }

  /**
   * Build query for user's saved recipes
   */
  buildUserSavedRecipesQuery(userId: string) {
    return this.client
      .from('user_saved_recipes')
      .select(`
        *,
        recipes (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
  }

  /**
   * Build query to check if a recipe is saved by a user
   */
  buildIsSavedQuery(userId: string, recipeId: string) {
    return this.client
      .from('user_saved_recipes')
      .select('id')
      .eq('user_id', userId)
      .eq('recipe_id', recipeId)
  }

  /**
   * Build count query for recipes with filters
   */
  buildRecipeCountQuery(filters: RecipeFilters = {}) {
    let query = this.client
      .from('recipes')
      .select('*', { count: 'exact', head: true })

    // Apply the same filters as regular recipe query
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    if (filters.mealType) {
      query = query.eq('meal_type', filters.mealType)
    }

    if (filters.dietaryTags && filters.dietaryTags.length > 0) {
      query = query.contains('dietary_tags', filters.dietaryTags)
    }

    if (filters.difficulty) {
      query = query.eq('difficulty_level', filters.difficulty)
    }

    if (filters.maxCookTime !== undefined) {
      query = query.lte('cook_time_minutes', filters.maxCookTime)
    }

    if (filters.maxPrepTime !== undefined) {
      query = query.lte('prep_time_minutes', filters.maxPrepTime)
    }

    if (filters.cuisine) {
      query = query.eq('cuisine_type', filters.cuisine)
    }

    if (filters.servings) {
      query = query.eq('servings', filters.servings)
    }

    return query
  }
}

/**
 * Database helper functions for common recipe operations
 */
export class RecipeDbHelpers {
  private client: DbClient
  private queryBuilder: RecipeQueryBuilder

  constructor(client: DbClient) {
    this.client = client
    this.queryBuilder = new RecipeQueryBuilder(client)
  }

  /**
   * Get recipes with automatic pagination handling
   */
  async getPaginatedRecipes(options: RecipeQueryOptions) {
    const query = this.queryBuilder.buildPaginatedRecipeQuery(options)
    
    // Also get the count for pagination
    const countQuery = this.queryBuilder.buildRecipeCountQuery(options)
    
    const [recipesResult, countResult] = await Promise.all([
      query,
      countQuery,
    ])

    return {
      recipes: recipesResult,
      count: countResult,
    }
  }

  /**
   * Get recipes with their saved status for a user
   */
  async getRecipesWithSavedStatus(userId: string, options: RecipeQueryOptions) {
    const query = this.queryBuilder
      .buildRecipesWithSavedQuery(userId, options)
      .order(options.sortBy || 'created_at', { 
        ascending: options.sortOrder === 'asc' 
      })
      .range(
        (options.page - 1) * options.limit,
        options.page * options.limit - 1
      )

    return await query
  }

  /**
   * Bulk operations for recipes
   */
  async bulkInsertRecipes(recipes: any[]) {
    return await this.client
      .from('recipes')
      .insert(recipes)
      .select()
  }

  async bulkUpdateRecipes(updates: Array<{ id: string; [key: string]: any }>) {
    const promises = updates.map(({ id, ...updateData }) =>
      this.client
        .from('recipes')
        .update(updateData)
        .eq('id', id)
        .select()
    )

    return await Promise.all(promises)
  }

  /**
   * Advanced search queries
   */
  async searchRecipesByIngredients(ingredients: string[], limit = 20) {
    // This searches for recipes that contain any of the specified ingredients
    const ingredientQueries = ingredients.map(
      ingredient => `ingredients.cs."[{\"name\":\"${ingredient}\"}]"`
    )
    
    return await this.client
      .from('recipes')
      .select('*')
      .or(ingredientQueries.join(','))
      .limit(limit)
  }

  async searchRecipesByFullText(searchTerm: string, limit = 20) {
    return await this.client
      .from('recipes')
      .select('*')
      .textSearch('title', searchTerm)
      .limit(limit)
  }

  /**
   * Analytics and statistics helpers
   */
  async getRecipeStats() {
    const [totalCount, mealTypeStats, difficultyStats] = await Promise.all([
      this.client
        .from('recipes')
        .select('*', { count: 'exact', head: true }),
      
      this.client
        .from('recipes')
        .select('meal_type')
        .not('meal_type', 'is', null),
        
      this.client
        .from('recipes')
        .select('difficulty_level')
        .not('difficulty_level', 'is', null),
    ])

    return {
      totalCount: totalCount.count || 0,
      mealTypeDistribution: this.aggregateStats(mealTypeStats.data, 'meal_type'),
      difficultyDistribution: this.aggregateStats(difficultyStats.data, 'difficulty_level'),
    }
  }

  async getUserSavedStats(userId: string) {
    const result = await this.client
      .from('user_saved_recipes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    return {
      totalSaved: result.count || 0,
    }
  }

  private aggregateStats(data: any[] | null, field: string) {
    if (!data) return {}
    
    return data.reduce((acc, item) => {
      const value = item[field]
      if (value) {
        acc[value] = (acc[value] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)
  }

  /**
   * Recipe validation helpers
   */
  async validateRecipeExists(recipeId: string) {
    const { data, error } = await this.client
      .from('recipes')
      .select('id')
      .eq('id', recipeId)
      .single()

    return {
      exists: !!data && !error,
      error,
    }
  }

  async validateUniqueTitle(title: string, excludeId?: string) {
    let query = this.client
      .from('recipes')
      .select('id')
      .eq('title', title)

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data, error } = await query

    return {
      isUnique: !data || data.length === 0,
      error,
    }
  }

  /**
   * Recipe relationship helpers
   */
  async getRecipeWithRelations(recipeId: string) {
    return await this.client
      .from('recipes')
      .select(`
        *,
        user_saved_recipes (
          id,
          user_id,
          created_at
        )
      `)
      .eq('id', recipeId)
      .single()
  }

  async getPopularRecipes(limit = 10) {
    // Get recipes ordered by the number of times they've been saved
    return await this.client
      .from('recipes')
      .select(`
        *,
        user_saved_recipes (count)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)
  }
}

// Export factory function for easy instantiation
export const createRecipeQueryBuilder = (client: DbClient) => 
  new RecipeQueryBuilder(client)

export const createRecipeDbHelpers = (client: DbClient) => 
  new RecipeDbHelpers(client)