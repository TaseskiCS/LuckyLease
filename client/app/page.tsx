import Link from 'next/link'
import { Search, Home, MessageCircle, Heart, User } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Home className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">RoomRelay</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">
                Login
              </Link>
              <Link 
                href="/auth/signup" 
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Find Your Perfect
            <span className="text-primary-600"> Short-Term Home</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with students, interns, and digital nomads for hassle-free sublets. 
            List your space or find your next temporary home.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by location, price, or dates..."
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors">
                Search
              </button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/listings" 
              className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
            >
              Browse Listings
            </Link>
            <Link 
              href="/listings/create" 
              className="bg-white text-primary-600 border-2 border-primary-600 px-8 py-3 rounded-lg hover:bg-primary-50 transition-colors font-semibold"
            >
              List Your Space
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose RoomRelay?
            </h2>
            <p className="text-lg text-gray-600">
              Built for the modern renter and lister
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Verified Listings
              </h3>
              <p className="text-gray-600">
                All listings are verified and include detailed photos and descriptions
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Direct Messaging
              </h3>
              <p className="text-gray-600">
                Chat directly with listers and renters in real-time
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Save Favorites
              </h3>
              <p className="text-gray-600">
                Save your favorite listings and get notified of updates
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Home className="h-6 w-6 text-primary-400" />
                <span className="ml-2 text-lg font-bold">RoomRelay</span>
              </div>
              <p className="text-gray-400">
                The peer-to-peer marketplace for short-term housing
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Renters</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/listings" className="hover:text-white">Browse Listings</Link></li>
                <li><Link href="/auth/signup" className="hover:text-white">Create Account</Link></li>
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Listers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/listings/create" className="hover:text-white">List Your Space</Link></li>
                <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 RoomRelay. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
