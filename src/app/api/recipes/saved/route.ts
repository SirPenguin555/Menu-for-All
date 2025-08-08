import { NextRequest, NextResponse } from 'next/server'
import { RecipeService } from '@/lib/recipes/recipe.service'
import { AuthService } from '@/lib/auth'

// GET /api/recipes/saved - Get user's saved recipes
export async function GET(request: NextRequest) {
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

    const recipeService = new RecipeService()
    const result = await recipeService.getUserSavedRecipes(authResult.user.id)

    if (result.error) {
      console.error('Error fetching saved recipes:', result.error)
      return NextResponse.json(
        { error: 'Failed to fetch saved recipes' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      savedRecipes: result.data || [],
      count: result.data?.length || 0,
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/recipes/saved:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/recipes/saved - Save a recipe for the authenticated user
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

    // Parse request body
    const body = await request.json()
    const { recipeId } = body

    if (!recipeId) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      )
    }

    // Validate that the recipe exists
    const recipeService = new RecipeService()
    const recipeResult = await recipeService.getRecipeById(recipeId)
    
    if (recipeResult.error) {
      console.error('Error validating recipe:', recipeResult.error)
      return NextResponse.json(
        { error: 'Failed to validate recipe' },
        { status: 500 }
      )
    }

    if (!recipeResult.data) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      )
    }

    // Save the recipe for the user
    const saveResult = await recipeService.saveRecipe(authResult.user.id, recipeId)

    if (saveResult.error) {
      // Check if it's a duplicate error
      if (saveResult.error.message?.includes('duplicate key')) {
        return NextResponse.json(
          { error: 'Recipe is already saved' },
          { status: 409 }
        )
      }
      
      console.error('Error saving recipe:', saveResult.error)
      return NextResponse.json(
        { error: 'Failed to save recipe' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Recipe saved successfully',
      savedRecipe: saveResult.data,
    }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/recipes/saved:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}