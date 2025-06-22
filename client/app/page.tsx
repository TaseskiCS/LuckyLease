
"use client";

import { useState, useEffect } from "react";


import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { InteractiveMap } from "@/components/ui/interactive-map";
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
  Bed,
  Bath,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  startDate: string;
  endDate: string;
  imageUrls: string[];
  coordinates?: { lat: number; lng: number };
  contactMethod: "email" | "in_app" | "sms";
  bedrooms: string;
  bathrooms: string;
  petsAllowed: boolean;
  laundryInBuilding: boolean;
  parkingAvailable: boolean;
  airConditioning: boolean;
  school?: string;
  listingType: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}



export default function HomePage() {
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchFeaturedListings = async () => {
      try {
        // Use Spencer's API structure but main's approach for handling response
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/listings?limit=3`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch listings");
        }

        setFeaturedListings(data.listings || []);
      } catch (error) {
        console.error('Error fetching featured listings:', error);
        // Don't show error toast on main page, just log it
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeaturedListings();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCity.trim()) {
      // Navigate to browse page with location filter
      router.push(`/listings/browse?location=${encodeURIComponent(searchCity.trim())}`);
    } else {
      // Navigate to browse page without filter
      router.push('/listings/browse');
    }
  };
  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(180deg, #d1fae5 0%, #ecfdf5 20%, #ffffff 40%, #ffffff 50%, #ecfdf5 60%, #d1fae5 70%)",
      }}
    >
      {/* Hero Section */}
      <section className="relative py-32 px-4 min-h-[85vh] flex items-center overflow-hidden">
        {/* Subtle floating background elements */}
        <div
          className="absolute top-10 right-10 w-20 h-20 bg-emerald-100/20 rounded-full animate-pulse"
          style={{ animationDuration: "4s" }}
        ></div>
        <div
          className="absolute bottom-20 left-16 w-16 h-16 bg-emerald-200/15 rounded-full animate-pulse"
          style={{ animationDuration: "6s", animationDelay: "2s" }}
        ></div>
        <div className="absolute top-32 left-1/4 opacity-10">
          <Clover
            className="w-12 h-12 text-emerald-400 animate-pulse"
            style={{ animationDuration: "5s" }}
          />
        </div>

        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              Find Your{" "}
              <span
                className="bg-gradient-to-r from-emerald-400 via-emerald-600 to-emerald-800 bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, #10b981, #059669, #047857, #065f46, #10b981)",
                  backgroundSize: "300% 100%",
                  animation: "shimmer 8s ease-in-out infinite",
                }}
              >
                Lucky
              </span>{" "}
              Sublease
            </h2>
            <p className="text-2xl text-gray-600 mb-12">
              Discover the perfect student housing near your campus. Your pot of
              gold awaits! 🍀
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-xl p-8 mb-12">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 w-6 h-6 text-gray-400" />
                    <Input
                      placeholder="Enter your city"
                      className="pl-12 h-14 border-gray-200 text-lg"
                      value={searchCity}
                      onChange={(e) => setSearchCity(e.target.value)}
                    />
                  </div>
                </div>
                <Button 
                  type="submit"
                  className="h-14 px-10 bg-emerald-600 hover:bg-emerald-700 hover:scale-105 transition-all duration-300 ease-in-out hover:shadow-xl text-lg"
                >
                  <Search className="w-6 h-6 mr-3" />
                  Search
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>{" "}
      {/* Featured Listings */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              Featured Lucky Finds
            </h3>
            <p className="text-gray-600">
              Handpicked subleases near popular campuses
            </p>
          </div>
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <div className="w-full h-48 bg-gray-200"></div>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : featuredListings.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredListings.slice(0, 3).map((listing, index) => {
                const badgeColors = ['bg-emerald-600', 'bg-orange-500', 'bg-blue-500'];
                const badgeTexts = ['Featured', 'Hot Deal', 'New'];
                const gradientColors = [
                  'from-emerald-100 to-emerald-200',
                  'from-blue-100 to-blue-200', 
                  'from-purple-100 to-purple-200'
                ];
                const iconColors = ['text-emerald-600', 'text-blue-600', 'text-purple-600'];
                
                return (
                  <Card
                    key={listing.id}
                    className="overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    <Link href={`/listings/browse/${listing.id}`}>
                      <div className="relative cursor-pointer">
                        {listing.imageUrls && listing.imageUrls.length > 0 ? (
                          <div className="w-full h-48 relative">
                            <Image
                              src={listing.imageUrls[0]}
                              alt={listing.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className={`w-full h-48 bg-gradient-to-r ${gradientColors[index % 3]} flex items-center justify-center`}>
                            <Home className={`w-16 h-16 ${iconColors[index % 3]}`} />
                          </div>
                        )}
                        <Button
                          size="sm"
                          variant="secondary"
                          className="absolute top-3 right-3 bg-white/90 hover:bg-white hover:scale-110 hover:shadow-lg transition-all duration-300 ease-in-out"
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                        <Badge className={`absolute top-3 left-3 ${badgeColors[index % 3]}`}>
                          {badgeTexts[index % 3]}
                        </Badge>
                      </div>
                    </Link>
                    <CardContent className="p-6">
                      <Link href={`/listings/browse/${listing.id}`}>
                        <div className="cursor-pointer">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-lg line-clamp-2 group-hover:text-emerald-600 transition-colors">
                                {listing.title}
                              </h4>
                              <p className="text-gray-600 flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {listing.location}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-emerald-600">
                                ${listing.price}
                              </div>
                              <div className="text-sm text-gray-500">/month</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                            <span className="flex items-center">
                              <Bed className="w-4 h-4 mr-1" />
                              {listing.bedrooms === "studio"
                                ? "Studio"
                                : `${listing.bedrooms} bed`}
                            </span>
                            <span className="flex items-center">
                              <Bath className="w-4 h-4 mr-1" />
                              {listing.bathrooms} bath
                            </span>
                            <span className="capitalize">{listing.listingType}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback>
                                  {listing.user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-gray-600">
                                {listing.user.name}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600 ml-1">
                                {(4.5 + Math.random() * 0.5).toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No listings available
              </h3>
              <p className="text-gray-500">
                Check back later for new listings!
              </p>
            </div>
          )}
          <div className="text-center mt-12">
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 hover:scale-105 transition-all duration-300 ease-in-out hover:shadow-xl"
            >
              <Link href="/listings/browse">View All Listings</Link>
            </Button>
          </div>
        </div>
      </section>{" "}
      {/* Interactive Map Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Explore Listings on the Map
            </h3>{" "}
          </div>{" "}
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="h-[450px] bg-gray-100 rounded-xl flex items-center justify-center">
                <div className="text-gray-500">Loading map...</div>
              </div>
            ) : (
              <InteractiveMap
                height="450px"
                className="rounded-xl overflow-hidden shadow-2xl"
                listings={featuredListings.filter(listing => listing.coordinates).map((listing) => ({
                  id: listing.id,
                  position: [
                    listing.coordinates!.lat,
                    listing.coordinates!.lng,
                  ] as [number, number],
                  title: listing.title,
                  price: `$${listing.price}/month`,
                  description: listing.description,
                  listingUrl: `/listings/browse/${listing.id}`,
                  rating: undefined,
                  distance: undefined,
                }))}
              />
            )}
          </div>
        </div>
      </section>{" "}
      {/* How It Works */}
      <section id="how-it-works" className="py-16 px-4 scroll-mt-20">
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
                All users are verified. Chat securely with subletters and
                schedule virtual or in-person tours.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold mb-4">3. Move In Fast</h4>
              <p className="text-gray-600">
                Chat with landlords, and move into your new place. Your perfect
                sublease awaits!
              </p>
            </div>
          </div>
        </div>
      </section>{" "}
      {/* CTA Section */}
      <section className="py-8 px-4 bg-emerald-600">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-3">
              Ready to Find Your Perfect Sublease?
            </h3>
            <p className="text-lg text-emerald-100 mb-6">
              Join students who've found their perfect housing match. Your dream
              sublease is waiting!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-emerald-600 hover:bg-gray-100 hover:scale-105 transition-all duration-300 ease-in-out hover:shadow-xl"
              >
                <Link href="/listings/browse">Start Searching</Link>
              </Button>
              <Button
                size="lg"
                className="bg-white text-emerald-600 hover:bg-gray-100 hover:scale-105 transition-all duration-300 ease-in-out hover:shadow-xl"
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
              &copy; 2025 LuckyLease. All rights reserved. Find your lucky
              match! 🍀
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
