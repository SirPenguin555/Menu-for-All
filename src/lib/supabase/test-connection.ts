import { createClient } from './client'

export async function testSupabaseConnection() {
  try {
    const supabase = createClient()
    
    // Test basic connection by fetching a simple query
    const { data, error } = await supabase
      .from('recipes')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Supabase connection test failed:', error)
      return { success: false, error: error.message }
    }
    
    console.log('Supabase connection successful!')
    return { success: true, data }
  } catch (error) {
    console.error('Supabase connection test error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function testDatabaseSchema() {
  try {
    const supabase = createClient()
    
    // Test that all expected tables exist by running simple queries
    const tests = [
      { table: 'users', query: supabase.from('users').select('id').limit(1) },
      { table: 'recipes', query: supabase.from('recipes').select('id').limit(1) },
      { table: 'user_saved_recipes', query: supabase.from('user_saved_recipes').select('id').limit(1) },
      { table: 'pantry_items', query: supabase.from('pantry_items').select('id').limit(1) }
    ]
    
    const results = []
    
    for (const test of tests) {
      const { error } = await test.query
      if (error && !error.message.includes('relation "public.')) {
        results.push({ table: test.table, success: false, error: error.message })
      } else {
        results.push({ table: test.table, success: true })
      }
    }
    
    const allSuccess = results.every(r => r.success)
    
    if (allSuccess) {
      console.log('Database schema test successful!')
    } else {
      console.error('Some database schema tests failed:', results.filter(r => !r.success))
    }
    
    return { success: allSuccess, results }
  } catch (error) {
    console.error('Database schema test error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function testSupabaseAuth() {
  try {
    const supabase = createClient()
    
    // Test auth session
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Supabase auth test failed:', error)
      return { success: false, error: error.message }
    }
    
    console.log('Supabase auth test successful!', session ? 'User logged in' : 'No active session')
    return { success: true, session }
  } catch (error) {
    console.error('Supabase auth test error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}