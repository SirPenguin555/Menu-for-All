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