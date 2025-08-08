'use client'

import { useEffect, useState } from 'react'
import { testSupabaseConnection, testDatabaseSchema, testSupabaseAuth } from '@/lib/supabase/test-connection'

export default function TestSupabasePage() {
  const [connectionResult, setConnectionResult] = useState<any>(null)
  const [schemaResult, setSchemaResult] = useState<any>(null)
  const [authResult, setAuthResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function runTests() {
      console.log('Running Supabase connection tests...')
      
      const connResult = await testSupabaseConnection()
      setConnectionResult(connResult)
      console.log('Connection test:', connResult)
      
      const schemaResult = await testDatabaseSchema()
      setSchemaResult(schemaResult)
      console.log('Schema test:', schemaResult)
      
      const authResult = await testSupabaseAuth()
      setAuthResult(authResult)
      console.log('Auth test:', authResult)
      
      setLoading(false)
    }

    runTests()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Testing Supabase Connection...</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Supabase Integration Test</h1>
        
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          {/* Connection Test */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <span className={`inline-block w-3 h-3 rounded-full mr-3 ${
                connectionResult?.success ? 'bg-green-500' : 'bg-red-500'
              }`}></span>
              Connection Test
            </h2>
            <div className="text-sm">
              <p className="mb-2">
                <strong>Status:</strong> {connectionResult?.success ? 'Success' : 'Failed'}
              </p>
              {connectionResult?.error && (
                <p className="text-red-600">
                  <strong>Error:</strong> {connectionResult.error}
                </p>
              )}
              {connectionResult?.success && (
                <p className="text-green-600">✅ Database connection working!</p>
              )}
            </div>
          </div>

          {/* Schema Test */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <span className={`inline-block w-3 h-3 rounded-full mr-3 ${
                schemaResult?.success ? 'bg-green-500' : 'bg-red-500'
              }`}></span>
              Schema Test
            </h2>
            <div className="text-sm">
              <p className="mb-2">
                <strong>Status:</strong> {schemaResult?.success ? 'Success' : 'Failed'}
              </p>
              {schemaResult?.results && (
                <div className="space-y-1">
                  {schemaResult.results.map((result: any, index: number) => (
                    <p key={index} className={result.success ? 'text-green-600' : 'text-red-600'}>
                      {result.success ? '✅' : '❌'} {result.table}
                      {result.error && `: ${result.error}`}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Auth Test */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <span className={`inline-block w-3 h-3 rounded-full mr-3 ${
                authResult?.success ? 'bg-green-500' : 'bg-red-500'
              }`}></span>
              Auth Test
            </h2>
            <div className="text-sm">
              <p className="mb-2">
                <strong>Status:</strong> {authResult?.success ? 'Success' : 'Failed'}
              </p>
              {authResult?.error && (
                <p className="text-red-600">
                  <strong>Error:</strong> {authResult.error}
                </p>
              )}
              {authResult?.success && (
                <p className="text-green-600">
                  ✅ Auth system ready! {authResult.session ? 'User logged in' : 'No active session'}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
          <div className="space-y-2 text-sm">
            {connectionResult?.success ? (
              <>
                <p className="text-green-600">✅ Environment variables are configured correctly</p>
                {!schemaResult?.success && (
                  <p className="text-orange-600">⚠️ Database schema needs to be created. Run the migration in your Supabase dashboard.</p>
                )}
                {schemaResult?.success && (
                  <p className="text-green-600">✅ Database schema is ready</p>
                )}
                <p className="text-blue-600">🚀 You can now start building authentication and database features!</p>
              </>
            ) : (
              <p className="text-red-600">❌ Check your environment variables and Supabase project settings</p>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <a 
            href="/" 
            className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}