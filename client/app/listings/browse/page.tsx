'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, MapPin, DollarSign, Calendar, Heart, Plus, Star, Users, Home, Clover, ChevronDown } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import toast from 'react-hot-toast';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  startDate: string;
  endDate: string;
  imageUrls: string[];
  summary?: string;
  tags: string[];
  user: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    likes: number;
  };
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    location: '',
    startDate: '',
    endDate: '',
    propertyType: '',
    bedrooms: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.location) params.append('location', filters.location);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/listings/browse?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch listings');
      }

      setListings(data.listings || [
        // Mock data for demonstration
        {
          id: '1',
          title: 'Modern Studio Near University',
          description: 'Beautiful studio apartment with all amenities',
          price: 1200,
          location: '0.3 miles from campus',
          startDate: '2025-01-15',
          endDate: '2025-05-15',
          imageUrls: [],
          summary: 'Perfect for students, fully furnished with WiFi included',
          tags: ['furnished', 'wifi'],
          user: { id: '1', name: 'Jessica S.', email: 'jessica@example.com' },
          _count: { likes: 12 }
        },
        {
          id: '2',
          title: 'Shared 2BR Near Campus',
          description: 'Spacious shared apartment close to university',
          price: 850,
          location: '0.5 miles from campus',
          startDate: '2025-02-01',
          endDate: '2025-06-01',
          imageUrls: [],
          summary: 'Great roommate, clean and quiet environment',
          tags: ['shared', 'quiet'],
          user: { id: '2', name: 'Mike R.', email: 'mike@example.com' },
          _count: { likes: 8 }
        },
        {
          id: '3',
          title: 'Cozy Room Downtown',
          description: 'Private room in downtown area',
          price: 950,
          location: '0.2 miles from campus',
          startDate: '2025-01-20',
          endDate: '2025-05-20',
          imageUrls: [],
          summary: 'Walking distance to everything, great location',
          tags: ['private', 'downtown'],
          user: { id: '3', name: 'Anna L.', email: 'anna@example.com' },
          _count: { likes: 15 }
        }
      ]);
    } catch (error) {
      toast.error('Failed to load listings');
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchListings();
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      location: '',
      startDate: '',
      endDate: '',
      propertyType: '',
      bedrooms: ''
    });
    setSearchTerm('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl shadow-sm border p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-emerald-600 hover:bg-emerald-50"
                >
                  Clear All
                </Button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Location, title, description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Min"
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  />
                  <Input
                    placeholder="Max"
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <Input
                  placeholder="City, neighborhood..."
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </div>

              {/* Property Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                <div className="relative">
                  <select
                    value={filters.propertyType}
                    onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="">All Types</option>
                    <option value="studio">Studio</option>
                    <option value="shared">Shared Room</option>
                    <option value="private">Private Room</option>
                    <option value="apartment">Full Apartment</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                </div>
              </div>

              {/* Bedrooms */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                <div className="relative">
                  <select
                    value={filters.bedrooms}
                    onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="">Any</option>
                    <option value="1">1 Bedroom</option>
                    <option value="2">2 Bedrooms</option>
                    <option value="3">3+ Bedrooms</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                </div>
              </div>

              {/* Move-in Dates */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Move-in Period</label>
                <div className="space-y-2">
                  <Input
                    type="date"
                    placeholder="Start Date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  />
                  <Input
                    type="date"
                    placeholder="End Date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  />
                </div>
              </div>

              <Button 
                onClick={handleSearch}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                Apply Filters
              </Button>
            </div>
          </div>

          {/* Listings Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Available Listings</h2>
                <p className="text-gray-600">{listings.length} properties found</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                  <option>Most Recent</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Distance</option>
                </select>
              </div>
            </div>

            {listings.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <Search className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No listings found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search criteria or filters.</p>
                <Button 
                  onClick={clearFilters}
                  variant="outline"
                  className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {listings.map((listing, index) => (
                  <Link key={listing.id} href={`/listings/${listing.id}`}>
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-200 cursor-pointer group">
                      <div className="relative">
                        {listing.imageUrls.length > 0 ? (
                          <img
                            src={listing.imageUrls[0]}
                            alt={listing.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className={`w-full h-48 flex items-center justify-center ${
                            index % 3 === 0 ? 'bg-gradient-to-r from-emerald-100 to-emerald-200' :
                            index % 3 === 1 ? 'bg-gradient-to-r from-blue-100 to-blue-200' :
                            'bg-gradient-to-r from-purple-100 to-purple-200'
                          }`}>
                            <Home className={`w-16 h-16 ${
                              index % 3 === 0 ? 'text-emerald-600' :
                              index % 3 === 1 ? 'text-blue-600' :
                              'text-purple-600'
                            }`} />
                          </div>
                        )}
                        <Button
                          size="sm"
                          variant="secondary"
                          className="absolute top-3 right-3 bg-white/90 hover:bg-white"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                        {index === 0 && (
                          <Badge className="absolute top-3 left-3 bg-emerald-600">
                            Featured
                          </Badge>
                        )}
                        {index === 1 && (
                          <Badge className="absolute top-3 left-3 bg-orange-500">
                            Hot Deal
                          </Badge>
                        )}
                        {index === 2 && (
                          <Badge className="absolute top-3 left-3 bg-blue-500">
                            New
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg mb-1 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                              {listing.title}
                            </h4>
                            <p className="text-gray-600 flex items-center text-sm">
                              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                              {listing.location}
                            </p>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-2xl font-bold text-emerald-600">
                              ${listing.price}
                            </div>
                            <div className="text-sm text-gray-500">/month</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600 mb-3">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>
                            {formatDate(listing.startDate)} - {formatDate(listing.endDate)}
                          </span>
                        </div>

                        {listing.summary && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                            {listing.summary}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs">
                                {listing.user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-600">{listing.user.name}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600 ml-1">
                                {4.5 + Math.random() * 0.5}
                              </span>
                            </div>
                            <div className="flex items-center text-gray-500">
                              <Heart className="h-4 w-4 mr-1" />
                              <span className="text-sm">{listing._count.likes}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}