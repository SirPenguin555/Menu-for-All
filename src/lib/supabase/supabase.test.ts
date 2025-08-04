import { describe, it, expect, vi, beforeAll } from 'vitest'

// Mock environment variables before any imports
beforeAll(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MTc3NzI3MywiZXhwIjoxOTU3MzUzMjczfQ.test'
})

import { createClient } from './client'
import { testSupabaseConnection, testDatabaseSchema, testSupabaseAuth } from './test-connection'
import type { Database } from '@/types/database'

describe('Supabase Client', () => {
  it('should create a client with proper types', () => {
    const client = createClient()
    expect(client).toBeDefined()
    expect(typeof client.from).toBe('function')
    expect(typeof client.auth).toBe('object')
  })

  it('should have proper TypeScript types for database operations', async () => {
    const client = createClient()
    
    // This test mainly checks TypeScript compilation
    // The actual database calls would fail without a real connection
    const recipesQuery = client.from('recipes').select('*')
    expect(recipesQuery).toBeDefined()
    
    const usersQuery = client.from('users').select('*')
    expect(usersQuery).toBeDefined()
    
    const pantryQuery = client.from('pantry_items').select('*')
    expect(pantryQuery).toBeDefined()
  })

  it('should have auth methods available', () => {
    const client = createClient()
    
    expect(client.auth.signUp).toBeDefined()
    expect(client.auth.signInWithPassword).toBeDefined()
    expect(client.auth.signOut).toBeDefined()
    expect(client.auth.getSession).toBeDefined()
    expect(client.auth.getUser).toBeDefined()
  })
})

describe('Supabase Connection Tests', () => {
  it('should export connection test functions', () => {
    expect(testSupabaseConnection).toBeDefined()
    expect(testDatabaseSchema).toBeDefined()
    expect(testSupabaseAuth).toBeDefined()
    expect(typeof testSupabaseConnection).toBe('function')
    expect(typeof testDatabaseSchema).toBe('function')
    expect(typeof testSupabaseAuth).toBe('function')
  })

  it('should handle connection test structure without real connection', () => {
    // Just test the function structure without making actual network calls
    expect(testSupabaseConnection).toBeDefined()
    expect(testDatabaseSchema).toBeDefined()
    expect(testSupabaseAuth).toBeDefined()
    
    // These functions should return promises
    expect(testSupabaseConnection()).toBeInstanceOf(Promise)
    expect(testDatabaseSchema()).toBeInstanceOf(Promise)
    expect(testSupabaseAuth()).toBeInstanceOf(Promise)
  })
})