export default function HomePage() {
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
            <button className="btn-primary text-lg px-8 py-3">
              Get Started
            </button>
            <button className="btn-secondary text-lg px-8 py-3">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}