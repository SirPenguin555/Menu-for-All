import { NextRequest, NextResponse } from 'next/server'
import { RecipeService } from '@/lib/recipes/recipe.service'
import { CreateRecipeSchema, RecipeQuerySchema } from '@/types/recipe.types'
import { AuthService } from '@/lib/auth'

// GET /api/recipes - Get all recipes with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse and validate query parameters
    const queryParams = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      search: searchParams.get('search') || undefined,
      mealType: searchParams.get('mealType') || undefined,
      dietaryTags: searchParams.get('dietaryTags')?.split(',') || undefined,
      difficulty: searchParams.get('difficulty') || undefined,
      maxCookTime: searchParams.get('maxCookTime') ? parseInt(searchParams.get('maxCookTime')!) : undefined,
      maxPrepTime: searchParams.get('maxPrepTime') ? parseInt(searchParams.get('maxPrepTime')!) : undefined,
      cuisine: searchParams.get('cuisine') || undefined,
      servings: searchParams.get('servings') ? parseInt(searchParams.get('servings')!) : undefined,
      sortBy: searchParams.get('sortBy') || 'created_at',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    }

    // Validate query parameters
    const validationResult = RecipeQuerySchema.safeParse(queryParams)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const recipeService = new RecipeService()
    const result = await recipeService.getAllRecipes(validationResult.data)

    if (result.error) {
      console.error('Error fetching recipes:', result.error)
      return NextResponse.json(
        { error: 'Failed to fetch recipes' },
        { status: 500 }
      )
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error('Unexpected error in GET /api/recipes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/recipes - Create a new recipe (authenticated users only)
export async function POST(request: NextRequest) {
  try {
    const authService = new AuthService()
    
    // Check if user is authenticated
    const authResult = await authService.getCurrentUser()
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = CreateRecipeSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid recipe data', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const recipeService = new RecipeService()
    const result = await recipeService.createRecipe(validationResult.data)

    if (result.error) {
      console.error('Error creating recipe:', result.error)
      return NextResponse.json(
        { error: 'Failed to create recipe' },
        { status: 500 }
      )
    }

    return NextResponse.json(result.data, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/recipes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}