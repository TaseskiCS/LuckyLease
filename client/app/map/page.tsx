"use client";

import { useState, useMemo } from "react";
import { InteractiveMap } from "@/components/ui/interactive-map";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, DollarSign, Star, Users, Home } from "lucide-react";
import schoolsData from "@/data/schools.json";

// Enhanced sample listings for the map page
const allListings = [
  {
    id: "1",
    position: [43.6629, -79.3957] as [number, number],
    title: "Modern Studio Near UofT",
    price: 1800,
    priceDisplay: "$1,800/month",
    description: "Fully furnished studio apartment perfect for students",
    distance: "0.2 km from University of Toronto",
    rating: 4.9,
    listingUrl: "/listings/1",
    university: "University of Toronto",
    roomType: "Studio",
    amenities: ["Furnished", "Laundry", "Internet"],
  },
];

export default function MapPage() {
  const [filters, setFilters] = useState({
    searchTerm: "",
    minPrice: "",
    maxPrice: "",
    location: "",
    propertyType: "",
    bedrooms: "",
    university: "",
    minRating: 0,
  });

  // Get unique universities from the listings
  const universities = useMemo(() => {
    const uniqueUniversities = Array.from(
      new Set(allListings.map((listing) => listing.university))
    );
    return ["All Universities", ...uniqueUniversities.sort()];
  }, []);

  // Filter listings based on current filters
  const filteredListings = useMemo(() => {
    return allListings.filter((listing) => {
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const titleMatch = listing.title.toLowerCase().includes(searchLower);
        const descriptionMatch = listing.description
          .toLowerCase()
          .includes(searchLower);
        const universityMatch = listing.university
          .toLowerCase()
          .includes(searchLower);
        if (!titleMatch && !descriptionMatch && !universityMatch) return false;
      }

      // Price range filters
      if (filters.minPrice && listing.price < parseInt(filters.minPrice))
        return false;
      if (filters.maxPrice && listing.price > parseInt(filters.maxPrice))
        return false;

      // Location filter
      if (filters.location) {
        const locationMatch =
          listing.distance
            .toLowerCase()
            .includes(filters.location.toLowerCase()) ||
          listing.university
            .toLowerCase()
            .includes(filters.location.toLowerCase());
        if (!locationMatch) return false;
      }

      // Property type filter
      if (filters.propertyType) {
        const typeMapping: { [key: string]: string[] } = {
          studio: ["Studio"],
          shared: ["Shared"],
          private: ["1BR", "Apartment"],
          apartment: ["Loft", "Condo", "Apartment", "Residence"],
        };
        if (!typeMapping[filters.propertyType]?.includes(listing.roomType))
          return false;
      }

      // University filter
      if (filters.university && filters.university !== "All Universities") {
        if (listing.university !== filters.university) return false;
      }

      // Rating filter
      if (filters.minRating > 0) {
        if (listing.rating < filters.minRating) return false;
      }

      return true;
    });
  }, [filters]);

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: "",
      minPrice: "",
      maxPrice: "",
      location: "",
      propertyType: "",
      bedrooms: "",
      university: "",
      minRating: 0,
    });
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="flex h-screen">
        {/* Filters Sidebar - Always Visible */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-6">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Location, title, description..."
                  value={filters.searchTerm}
                  onChange={(e) =>
                    handleFilterChange("searchTerm", e.target.value)
                  }
                  className="pl-10"
                />
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Min"
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) =>
                    handleFilterChange("minPrice", e.target.value)
                  }
                />
                <Input
                  placeholder="Max"
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    handleFilterChange("maxPrice", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Location */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <Input
                placeholder="City, neighborhood..."
                value={filters.location}
                onChange={(e) => handleFilterChange("location", e.target.value)}
              />
            </div>

            {/* University */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                University
              </label>
              <div className="relative">
                <select
                  value={filters.university}
                  onChange={(e) =>
                    handleFilterChange("university", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white"
                >
                  {universities.map((university) => (
                    <option key={university} value={university}>
                      {university}
                    </option>
                  ))}
                </select>
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
              </div>
            </div>

            {/* Property Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type
              </label>
              <div className="relative">
                <select
                  value={filters.propertyType}
                  onChange={(e) =>
                    handleFilterChange("propertyType", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">All Types</option>
                  <option value="studio">Studio</option>
                  <option value="shared">Shared Room</option>
                  <option value="private">Private Room</option>
                  <option value="apartment">Full Apartment</option>
                </select>
                <Home className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
              </div>
            </div>

            {/* Bedrooms */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bedrooms
              </label>
              <div className="relative">
                <select
                  value={filters.bedrooms}
                  onChange={(e) =>
                    handleFilterChange("bedrooms", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">Any</option>
                  <option value="1">1 Bedroom</option>
                  <option value="2">2 Bedrooms</option>
                  <option value="3">3+ Bedrooms</option>
                </select>
                <Users className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
              </div>
            </div>

            {/* Rating Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Rating
              </label>
              <div className="space-y-2">
                {[0, 4.0, 4.5, 4.7].map((rating) => (
                  <Button
                    key={rating}
                    variant={
                      filters.minRating === rating ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => handleFilterChange("minRating", rating)}
                    className="w-full text-xs justify-start"
                  >
                    <Star className="w-3 h-3 mr-1" />
                    {rating === 0 ? "Any Rating" : `${rating}+ Stars`}
                  </Button>
                ))}
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-6 p-3 bg-emerald-50 rounded-lg">
              <p className="text-sm text-emerald-700 font-medium">
                {filteredListings.length} of {allListings.length} listings shown
              </p>
            </div>
          </div>
        </div>

        {/* Map - Full Screen */}
        <div className="flex-1 relative">
          <InteractiveMap
            height="100%"
            className="w-full h-full"
            fullScreen={true}
            listings={filteredListings.map((listing) => ({
              id: listing.id,
              position: listing.position,
              title: listing.title,
              price: listing.priceDisplay,
              description: listing.description,
              listingUrl: listing.listingUrl,
              rating: listing.rating,
              distance: listing.distance,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
