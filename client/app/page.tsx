import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  MapPin,
  Star,
  Users,
  Calendar,
  DollarSign,
  Shield,
  Clock,
  Heart,
  Filter,
  Home,
  Clover,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Find Your <span className="text-emerald-600">Lucky</span>{" "}
              Sublease
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Discover the perfect student housing near your campus. Your pot of
              gold awaits! 🍀
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-12">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="Enter your university or city"
                      className="pl-10 h-12 border-gray-200"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="Move-in date"
                      className="pl-10 h-12 border-gray-200"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="Max budget"
                      className="pl-10 h-12 border-gray-200"
                    />
                  </div>
                </div>
                <Button className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700">
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </Button>
              </div>
            </div>

           
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                Featured Lucky Finds
              </h3>
              <p className="text-gray-600">
                Handpicked subleases near popular campuses
              </p>
            </div>
            <Button
              variant="outline"
              className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Listing 1 */}
            <Card className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative">
                <div className="w-full h-48 bg-gradient-to-r from-emerald-100 to-emerald-200 flex items-center justify-center">
                  <Home className="w-16 h-16 text-emerald-600" />
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-3 right-3 bg-white/90 hover:bg-white"
                >
                  <Heart className="w-4 h-4" />
                </Button>
                <Badge className="absolute top-3 left-3 bg-emerald-600">
                  Featured
                </Badge>
              </div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">
                      Modern Studio Near University
                    </h4>
                    <p className="text-gray-600 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      0.3 miles from campus
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600">
                      $1,200
                    </div>
                    <div className="text-sm text-gray-500">/month</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />1 bed
                  </span>
                  <span>1 bath</span>
                  <span>450 sq ft</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback>JS</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-600">Jessica S.</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">4.9</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Listing 2 */}
            <Card className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative">
                <div className="w-full h-48 bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center">
                  <Users className="w-16 h-16 text-blue-600" />
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-3 right-3 bg-white/90 hover:bg-white"
                >
                  <Heart className="w-4 h-4" />
                </Button>
                <Badge className="absolute top-3 left-3 bg-orange-500">
                  Hot Deal
                </Badge>
              </div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">
                      Shared 2BR Near Campus
                    </h4>
                    <p className="text-gray-600 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      0.5 miles from campus
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600">
                      $850
                    </div>
                    <div className="text-sm text-gray-500">/month</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />1 bed
                  </span>
                  <span>2 bath</span>
                  <span>Shared</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback>MR</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-600">Mike R.</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">4.8</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Listing 3 */}
            <Card className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative">
                <div className="w-full h-48 bg-gradient-to-r from-purple-100 to-purple-200 flex items-center justify-center">
                  <Home className="w-16 h-16 text-purple-600" />
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-3 right-3 bg-white/90 hover:bg-white"
                >
                  <Heart className="w-4 h-4" />
                </Button>
                <Badge className="absolute top-3 left-3 bg-blue-500">New</Badge>
              </div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">
                      Cozy Room Downtown
                    </h4>
                    <p className="text-gray-600 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      0.2 miles from campus
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600">
                      $950
                    </div>
                    <div className="text-sm text-gray-500">/month</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />1 bed
                  </span>
                  <span>1 bath</span>
                  <span>Private</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback>AL</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-600">Anna L.</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">5.0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              <Link href="/listings/browse">View All Listings</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 px-4 bg-emerald-50 scroll-mt-20">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              How LuckyLease Works
            </h3>
            <p className="text-xl text-gray-600">
              Finding your perfect sublease is easy and secure!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold mb-4">1. Search & Filter</h4>
              <p className="text-gray-600">
                Use our filters to find subleases that match your budget,
                location, and preferences near your campus.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold mb-4">2. Connect Safely</h4>
              <p className="text-gray-600">
                All users are verified students. Chat securely with subletters
                and schedule virtual or in-person tours.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold mb-4">3. Move In Fast</h4>
              <p className="text-gray-600">
               Chat with landlords, and move into your new place. Your perfect sublease awaits!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-emerald-600">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to Find Your Perfect Sublease?
            </h3>
            <p className="text-xl text-emerald-100 mb-8">
              Join students who've found their perfect housing
              match. Your dream sublease is waiting!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-emerald-600 hover:bg-gray-200"
              >
                <Link href="/listings/browse">Start Searching</Link>
              </Button>
              <Button
                size="lg"
                className="bg-white text-emerald-600 hover:bg-gray-200"
              >
                <Link href="/listings/create">List Your Place</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                  <Clover className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">LuckyLease</span>
              </div>
              <p className="text-gray-400">
                Helping students find their perfect sublease since 2025.
              </p>
            </div>

            <div>
              <h5 className="font-semibold mb-4">For Students</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/listings/browse" className="hover:text-white">
                    Browse Listings
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white">
                    Saved Searches
                  </Link>
                </li>
              
                <li>
                  <Link href="/resources" className="hover:text-white">
                    Student Resources
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold mb-4">For Subletters</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/listings/create" className="hover:text-white">
                    List Your Place
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white">
                    Manage Listings
                  </Link>
                </li>
            
              </ul>
            </div>

            <div>
              <h5 className="font-semibold mb-4">Support</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>
              &copy; 2024 LuckyLease. All rights reserved. Find your lucky
              match! 🍀
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
