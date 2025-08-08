import { NextRequest, NextResponse } from 'next/server'
import { RecipeService } from '@/lib/recipes/recipe.service'
import { UpdateRecipeSchema } from '@/types/recipe.types'
import { AuthService } from '@/lib/auth'

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/recipes/[id] - Get a single recipe by ID
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      )
    }

    const recipeService = new RecipeService()
    const result = await recipeService.getRecipeById(id)

    if (result.error) {
      console.error('Error fetching recipe:', result.error)
      return NextResponse.json(
        { error: 'Failed to fetch recipe' },
        { status: 500 }
      )
    }

    if (!result.data) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error('Unexpected error in GET /api/recipes/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/recipes/[id] - Update a recipe (authenticated users only)
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params
    const authService = new AuthService()
    
    if (!id) {
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

    // Parse and validate request body
    const body = await request.json()
    const validationResult = UpdateRecipeSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid recipe data', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const recipeService = new RecipeService()
    const result = await recipeService.updateRecipe(id, validationResult.data)

    if (result.error) {
      console.error('Error updating recipe:', result.error)
      return NextResponse.json(
        { error: 'Failed to update recipe' },
        { status: 500 }
      )
    }

    if (!result.data) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error('Unexpected error in PUT /api/recipes/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/recipes/[id] - Delete a recipe (authenticated users only)
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params
    const authService = new AuthService()
    
    if (!id) {
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
    const result = await recipeService.deleteRecipe(id)

    if (result.error) {
      console.error('Error deleting recipe:', result.error)
      return NextResponse.json(
        { error: 'Failed to delete recipe' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Recipe deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error in DELETE /api/recipes/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}