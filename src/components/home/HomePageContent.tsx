'use client'

import { useRouter } from 'next/navigation'
import { useSession } from '@/hooks/useSession'

export function HomePageContent() {
  const router = useRouter()
  const { isAuthenticated, isLoading, user, session, refreshSession } = useSession()

  const handleGetStarted = async (event?: React.MouseEvent) => {
    event?.preventDefault()
    event?.stopPropagation()
    
    if (isLoading) return
    
    console.log('handleGetStarted called:', {
      isLoading,
      isAuthenticated,
      user: user?.id,
      session: !!session
    })
    
    try {
      if (isAuthenticated && user && session) {
        console.log('User is authenticated, refreshing session...')
        // Refresh session to ensure it's still valid before navigating
        await refreshSession()
        console.log('Session refreshed, navigating to /profile')
        
        // Use window.location directly since router.push seems to be failing
        console.log('Using window.location.href to navigate')
        window.location.href = '/profile'
      } else {
        console.log('User not authenticated, navigating to /auth')
        // If not logged in, take them to auth page
        window.location.href = '/auth'
      }
    } catch (error) {
      console.error('Navigation error:', error)
      // If there's an error with session, redirect to auth
      window.location.href = '/auth'
    }
  }

  const handleLearnMore = () => {
    // Scroll to features section or go to about page
    // For now, just scroll to bottom of page
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16
                      sm:px-6 sm:py-20
                      lg:px-8 lg:py-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6
                         sm:text-5xl
                         lg:text-6xl">
            Welcome to Menu for All
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto
                        sm:text-2xl">
            Making restaurant menus accessible to everyone with AI-powered dietary accommodations and multilingual support
          </p>
          <div className="flex flex-col space-y-4 justify-center items-center
                          sm:flex-row sm:space-y-0 sm:space-x-4">
            <button 
              type="button"
              onClick={handleGetStarted}
              disabled={isLoading}
              className="btn-primary text-lg px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : isAuthenticated ? 'Go to Profile' : 'Get Started'}
            </button>
            <button 
              type="button"
              onClick={handleLearnMore}
              className="btn-secondary text-lg px-8 py-3"
            >
              Learn More
            </button>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Features
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover recipes that work for your dietary needs and available ingredients
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Advanced Filtering
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Filter recipes by dietary restrictions, ingredients, and meal types
              </p>
            </div>
            
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v6zM8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11v2m-3-2v2m6-2v2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Pantry Integration
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Find recipes based on ingredients you already have at home
              </p>
            </div>
            
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v5a2 2 0 002 2h4a2 2 0 002-2v-5m-6 0l6 0m-6 0H6a2 2 0 00-2 2v4a2 2 0 002 2h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Meal Planning
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Plan your meals and generate shopping lists automatically
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}