"use client";

import { useState, useMemo } from "react";
import { InteractiveMap } from "@/components/ui/interactive-map";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  MapPin,
  DollarSign,
  Users,
  Home,
  Calendar,
  Car,
  Shirt,
  Wind,
  Bath,
  Bed,
  ChevronDown,
} from "lucide-react";
import schoolsData from "@/data/schools.json";

interface School {
  value: string;
  name: string;
}

interface Region {
  label: string;
  universities?: School[];
  colleges?: School[];
}

// Enhanced sample listings for the map page
const allListings = [
  {
    id: "1",
    position: [43.6629, -79.3957], // University of Toronto (St. George)
    title: "Modern Studio Near UofT",
    price: 1800,
    priceDisplay: "$1,800/month",
    description: "Fully furnished studio apartment perfect for students",
    distance: "0.2 km from University of Toronto",
    rating: 4.9,
    listingUrl: "/listings/1",
    roomType: "Studio",
    bedrooms: "studio",
    bathrooms: "1",
    university: "University of Toronto",
    school: "University of Toronto",
    startDate: "2023-09-01",
    endDate: "2024-04-30",
    petsAllowed: false,
    laundryInBuilding: true,
    parkingAvailable: false,
    airConditioning: true,
  },
  {
    id: "2",
    position: [43.7735, -79.5019], // York University
    title: "Shared 2BR at York Village",
    price: 950,
    priceDisplay: "$950/month",
    description:
      "Spacious shared room in a 2-bedroom apartment near York University",
    distance: "1 km from York University",
    rating: 4.5,
    listingUrl: "/listings/2",
    roomType: "Shared Room",
    bedrooms: "shared",
    bathrooms: "1.5",
    university: "York University",
    school: "York University",
    startDate: "2023-09-01",
    endDate: "2024-04-30",
    petsAllowed: true,
    laundryInBuilding: false,
    parkingAvailable: true,
    airConditioning: false,
  },
];

export default function MapPage() {
  const [filters, setFilters] = useState({
    searchTerm: "",
    minPrice: "",
    maxPrice: "",
    propertyType: "",
    bedrooms: "",
    bathrooms: "",
    school: "",
    availableFrom: "",
    availableUntil: "",
    petsAllowed: false,
    laundryInBuilding: false,
    parkingAvailable: false,
    airConditioning: false,
  });

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
        const locationMatch = listing.location
          .toLowerCase()
          .includes(searchLower);
        if (
          !titleMatch &&
          !descriptionMatch &&
          !universityMatch &&
          !locationMatch
        )
          return false;
      }

      // Price range filters
      if (filters.minPrice && listing.price < parseInt(filters.minPrice))
        return false;
      if (filters.maxPrice && listing.price > parseInt(filters.maxPrice))
        return false; // Location filter - removed since we have search and school filter

      // Property type filter
      if (filters.propertyType) {
        const typeMapping: { [key: string]: string[] } = {
          studio: ["Studio", "studio"],
          shared: ["Shared"],
          private: ["1BR", "Apartment", "1", "2", "3", "4", "5+"],
          apartment: ["Loft", "Condo", "Apartment", "Residence"],
        };
        if (
          !typeMapping[filters.propertyType]?.includes(listing.roomType) &&
          !typeMapping[filters.propertyType]?.includes(listing.bedrooms)
        )
          return false;
      }

      // Bedrooms filter
      if (filters.bedrooms && filters.bedrooms !== listing.bedrooms) {
        return false;
      }

      // Bathrooms filter
      if (filters.bathrooms && filters.bathrooms !== listing.bathrooms) {
        return false;
      } // University filter - removed since we have school filter

      // School filter
      if (filters.school && listing.school !== filters.school) {
        return false;
      } // Rating filter - removed since we simplified the filters

      // Date range filters
      if (filters.availableFrom) {
        const filterDate = new Date(filters.availableFrom);
        const listingStartDate = new Date(listing.startDate);
        if (listingStartDate > filterDate) return false;
      }

      if (filters.availableUntil) {
        const filterDate = new Date(filters.availableUntil);
        const listingEndDate = new Date(listing.endDate);
        if (listingEndDate < filterDate) return false;
      }

      // Amenities filters
      if (filters.petsAllowed && !listing.petsAllowed) return false;
      if (filters.laundryInBuilding && !listing.laundryInBuilding) return false;
      if (filters.parkingAvailable && !listing.parkingAvailable) return false;
      if (filters.airConditioning && !listing.airConditioning) return false;
      return true;
    });
  }, [filters]);
  const handleFilterChange = (
    key: string,
    value: string | number | boolean
  ) => {
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
      propertyType: "",
      bedrooms: "",
      bathrooms: "",
      school: "",
      availableFrom: "",
      availableUntil: "",
      petsAllowed: false,
      laundryInBuilding: false,
      parkingAvailable: false,
      airConditioning: false,
    });
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="flex h-screen">
        {/* Filters Sidebar - Always Visible */}
        <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto">
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
              </div>{" "}
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
            </div>{" "}
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
                  <option value="studio">Studio</option>
                  <option value="1">1 Bedroom</option>
                  <option value="2">2 Bedrooms</option>
                  <option value="3">3 Bedrooms</option>
                  <option value="4">4 Bedrooms</option>
                  <option value="5+">5+ Bedrooms</option>
                </select>
                <Bed className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
              </div>
            </div>
            {/* Bathrooms */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bathrooms
              </label>
              <div className="relative">
                <select
                  value={filters.bathrooms}
                  onChange={(e) =>
                    handleFilterChange("bathrooms", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">Any</option>
                  <option value="1">1 Bathroom</option>
                  <option value="1.5">1.5 Bathrooms</option>
                  <option value="2">2 Bathrooms</option>
                  <option value="2.5">2.5 Bathrooms</option>
                  <option value="3">3 Bathrooms</option>
                  <option value="3.5">3.5 Bathrooms</option>
                  <option value="4+">4+ Bathrooms</option>
                </select>
                <Bath className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
              </div>
            </div>
            {/* School/Institution */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nearest School/Institution
              </label>
              <div className="relative">
                <select
                  value={filters.school}
                  onChange={(e) => handleFilterChange("school", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">Select a school</option>

                  {/* Canadian Schools */}
                  {Object.entries(schoolsData.canada).map(
                    ([regionKey, region]) => (
                      <optgroup
                        key={`canada-${regionKey}`}
                        label={`🇨🇦 ${(region as Region).label}`}
                      >
                        {(region as Region).universities?.map(
                          (school: School) => (
                            <option key={school.value} value={school.value}>
                              {school.name}
                            </option>
                          )
                        )}
                        {(region as Region).colleges?.map((school: School) => (
                          <option key={school.value} value={school.value}>
                            {school.name}
                          </option>
                        ))}
                      </optgroup>
                    )
                  )}

                  {/* American Schools */}
                  {Object.entries(schoolsData.usa).map(([stateKey, state]) => (
                    <optgroup
                      key={`usa-${stateKey}`}
                      label={`🇺🇸 ${(state as Region).label}`}
                    >
                      {(state as Region).universities?.map((school: School) => (
                        <option key={school.value} value={school.value}>
                          {school.name}
                        </option>
                      ))}
                      {(state as Region).colleges?.map((school: School) => (
                        <option key={school.value} value={school.value}>
                          {school.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
              </div>
            </div>
            {/* Availability Period */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Availability Period
              </label>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Available From
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="date"
                      value={filters.availableFrom}
                      onChange={(e) =>
                        handleFilterChange("availableFrom", e.target.value)
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Available Until
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="date"
                      value={filters.availableUntil}
                      onChange={(e) =>
                        handleFilterChange("availableUntil", e.target.value)
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Amenities */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Amenities
              </label>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.petsAllowed}
                    onChange={(e) =>
                      handleFilterChange("petsAllowed", e.target.checked)
                    }
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">🐾 Pets Allowed</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.laundryInBuilding}
                    onChange={(e) =>
                      handleFilterChange("laundryInBuilding", e.target.checked)
                    }
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <div className="flex items-center space-x-2">
                    <Shirt className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">
                      Laundry in Building
                    </span>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.parkingAvailable}
                    onChange={(e) =>
                      handleFilterChange("parkingAvailable", e.target.checked)
                    }
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <div className="flex items-center space-x-2">
                    <Car className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">
                      Parking Available
                    </span>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.airConditioning}
                    onChange={(e) =>
                      handleFilterChange("airConditioning", e.target.checked)
                    }
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <div className="flex items-center space-x-2">
                    <Wind className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">
                      Air Conditioning
                    </span>
                  </div>
                </label>
              </div>{" "}
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
