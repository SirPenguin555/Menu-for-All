export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          display_name: string | null
          dietary_restrictions: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          dietary_restrictions?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          dietary_restrictions?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      recipes: {
        Row: {
          id: string
          title: string
          description: string | null
          ingredients: Json[]
          instructions: Json[]
          prep_time_minutes: number | null
          cook_time_minutes: number | null
          servings: number | null
          difficulty_level: 'easy' | 'medium' | 'hard' | null
          cuisine_type: string | null
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert' | null
          dietary_tags: string[] | null
          source_url: string | null
          source_name: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          ingredients: Json[]
          instructions: Json[]
          prep_time_minutes?: number | null
          cook_time_minutes?: number | null
          servings?: number | null
          difficulty_level?: 'easy' | 'medium' | 'hard' | null
          cuisine_type?: string | null
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert' | null
          dietary_tags?: string[] | null
          source_url?: string | null
          source_name?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          ingredients?: Json[]
          instructions?: Json[]
          prep_time_minutes?: number | null
          cook_time_minutes?: number | null
          servings?: number | null
          difficulty_level?: 'easy' | 'medium' | 'hard' | null
          cuisine_type?: string | null
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert' | null
          dietary_tags?: string[] | null
          source_url?: string | null
          source_name?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_saved_recipes: {
        Row: {
          id: string
          user_id: string
          recipe_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recipe_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recipe_id?: string
          created_at?: string
        }
      }
      pantry_items: {
        Row: {
          id: string
          user_id: string
          ingredient_name: string
          quantity: number | null
          unit: string | null
          expiration_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          ingredient_name: string
          quantity?: number | null
          unit?: string | null
          expiration_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          ingredient_name?: string
          quantity?: number | null
          unit?: string | null
          expiration_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      difficulty_level: 'easy' | 'medium' | 'hard'
      meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert'
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Type aliases for convenience
export type User = Tables<'users'>
export type Recipe = Tables<'recipes'>
export type UserSavedRecipe = Tables<'user_saved_recipes'>
export type PantryItem = Tables<'pantry_items'>

export type NewUser = TablesInsert<'users'>
export type NewRecipe = TablesInsert<'recipes'>
export type NewUserSavedRecipe = TablesInsert<'user_saved_recipes'>
export type NewPantryItem = TablesInsert<'pantry_items'>

export type UserUpdate = TablesUpdate<'users'>
export type RecipeUpdate = TablesUpdate<'recipes'>
export type PantryItemUpdate = TablesUpdate<'pantry_items'>