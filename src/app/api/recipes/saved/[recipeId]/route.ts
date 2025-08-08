import { NextRequest, NextResponse } from 'next/server'
import { RecipeService } from '@/lib/recipes/recipe.service'
import { AuthService } from '@/lib/auth'

interface RouteParams {
  params: {
    recipeId: string
  }
}

// DELETE /api/recipes/saved/[recipeId] - Unsave a recipe for the authenticated user
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { recipeId } = params
    const authService = new AuthService()
    
    if (!recipeId) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      )
    }

    // Check if user is authenticated
    const authResult = await authService.getCurrentUser()
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const recipeService = new RecipeService()
    
    // Check if the recipe is actually saved by this user
    const isSavedResult = await recipeService.isRecipeSaved(authResult.user.id, recipeId)
    
    if (isSavedResult.error) {
      console.error('Error checking saved status:', isSavedResult.error)
      return NextResponse.json(
        { error: 'Failed to check saved status' },
        { status: 500 }
      )
    }

    if (!isSavedResult.data) {
      return NextResponse.json(
        { error: 'Recipe is not saved' },
        { status: 404 }
      )
    }

    // Unsave the recipe
    const unsaveResult = await recipeService.unsaveRecipe(authResult.user.id, recipeId)

    if (unsaveResult.error) {
      console.error('Error unsaving recipe:', unsaveResult.error)
      return NextResponse.json(
        { error: 'Failed to unsave recipe' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Recipe unsaved successfully',
    })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/recipes/saved/[recipeId]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/recipes/saved/[recipeId] - Check if a recipe is saved by the authenticated user
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { recipeId } = params
    const authService = new AuthService()
    
    if (!recipeId) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      )
    }

    // Check if user is authenticated
    const authResult = await authService.getCurrentUser()
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const recipeService = new RecipeService()
    const result = await recipeService.isRecipeSaved(authResult.user.id, recipeId)

    if (result.error) {
      console.error('Error checking saved status:', result.error)
      return NextResponse.json(
        { error: 'Failed to check saved status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      isSaved: result.data || false,
      recipeId,
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/recipes/saved/[recipeId]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}