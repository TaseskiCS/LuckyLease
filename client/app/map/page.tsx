"use client";

import { useState, useMemo, useEffect } from "react";
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
  Filter,
  X,
} from "lucide-react";
import schoolsData from "@/data/schools.json";
import toast from "react-hot-toast";

interface School {
  value: string;
  name: string;
}

interface Region {
  label: string;
  universities?: School[];
  colleges?: School[];
}

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

export default function MapPage() {
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
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

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Fetch listings from API
  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.searchTerm) params.append("search", filters.searchTerm);
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
      if (filters.availableFrom)
        params.append("startDate", filters.availableFrom);
      if (filters.availableUntil)
        params.append("endDate", filters.availableUntil);
      if (filters.propertyType)
        params.append("listingType", filters.propertyType);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/listings?${params}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch listings");
      }

      // Filter out listings without valid coordinates
      const listingsWithCoordinates = (data.listings || []).filter(
        (listing: Listing) =>
          listing.coordinates &&
          listing.coordinates.lat &&
          listing.coordinates.lng
      );

      setAllListings(listingsWithCoordinates);
    } catch (error) {
      toast.error("Failed to load listings for map");
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  };

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
        const locationMatch = listing.location
          .toLowerCase()
          .includes(searchLower);
        const schoolMatch = listing.school?.toLowerCase().includes(searchLower);
        if (!titleMatch && !descriptionMatch && !locationMatch && !schoolMatch)
          return false;
      }

      // Price range filters
      if (filters.minPrice && listing.price < parseInt(filters.minPrice))
        return false;
      if (filters.maxPrice && listing.price > parseInt(filters.maxPrice))
        return false;

      // Property type filter
      if (
        filters.propertyType &&
        filters.propertyType !== listing.listingType
      ) {
        return false;
      }

      // Bedrooms filter
      if (filters.bedrooms && filters.bedrooms !== listing.bedrooms) {
        return false;
      }

      // Bathrooms filter
      if (filters.bathrooms && filters.bathrooms !== listing.bathrooms) {
        return false;
      } // School filter
      if (filters.school && listing.school !== filters.school) {
        return false;
      }

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
  }, [allListings, filters]);
  const handleFilterChange = (
    key: string,
    value: string | number | boolean
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSearch = () => {
    fetchListings();
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
  const toggleMobileFilters = () => {
    setIsMobileFiltersOpen(!isMobileFiltersOpen);
  };

  // Prevent body scroll when component mounts
  useEffect(() => {
    // Prevent body scroll
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    };
  }, []);
  return (
    <div className="fixed top-16 left-0 right-0 bottom-0 bg-gradient-to-b from-emerald-50 to-white flex flex-col overflow-hidden">
      {/* Mobile Filter Toggle Button */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-2 flex-shrink-0 z-40">
        <Button
          onClick={toggleMobileFilters}
          variant="outline"
          className="w-full flex items-center justify-center space-x-2"
        >
          <Filter className="w-4 h-4" />
          <span>Filters ({filteredListings.length} results)</span>
        </Button>
      </div>

      <div className="flex flex-1 relative overflow-hidden min-h-0">
        {/* Filters Sidebar */}
        <div
          className={`
          ${isMobileFiltersOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 
          fixed md:relative
          top-0 md:top-0 
          left-0 
          z-50 md:z-auto 
          w-80 md:w-72 lg:w-80 xl:w-96 
          h-full 
          bg-white 
          border-r border-gray-200 
          overflow-y-auto 
          transition-transform duration-300 ease-in-out
        `}
        >
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-emerald-600 hover:bg-emerald-50"
                >
                  Clear All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMobileFilters}
                  className="md:hidden text-gray-600"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            {/* Search */}
            <div className="mb-4 md:mb-6">
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
            <div className="mb-4 md:mb-6">
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
            <div className="mb-4 md:mb-6">
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
            <div className="mb-4 md:mb-6">
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
              </div>{" "}
            </div>
            {/* Bathrooms */}
            <div className="mb-4 md:mb-6">
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
            <div className="mb-4 md:mb-6">
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
              </div>{" "}
            </div>
            {/* Availability Period */}
            <div className="mb-4 md:mb-6">
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
            <div className="mb-4 md:mb-6">
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
                </label>{" "}
              </div>{" "}
            </div>
            {/* Results Count */}
            <div className="mt-4 md:mt-6 p-3 bg-emerald-50 rounded-lg">
              <p className="text-sm text-emerald-700 font-medium">
                {filteredListings.length} of {allListings.length} listings shown
              </p>
            </div>
            {/* Mobile Apply Button */}
            <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
              <Button
                onClick={toggleMobileFilters}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                View {filteredListings.length} Results
              </Button>
            </div>
          </div>
        </div>{" "}
        {/* Mobile Overlay */}
        {isMobileFiltersOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={toggleMobileFilters}
          />
        )}{" "}
        {/* Map Container */}
        <div className="flex-1 relative w-full min-h-0 overflow-hidden">
          {loading ? (
            <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-gray-500">Loading listings...</div>
            </div>
          ) : (
            <InteractiveMap
              height="100%"
              className="w-full h-full"
              fullScreen={true}
              listings={filteredListings.map((listing) => ({
                id: listing.id,
                position: [
                  listing.coordinates!.lat,
                  listing.coordinates!.lng,
                ] as [number, number],
                title: listing.title,
                price: `$${listing.price}/month`,
                description: listing.description,
                listingUrl: `/listings/browse/${listing.id}`,
                // Note: rating and distance would need to be calculated or stored in the database
                rating: undefined,
                distance: undefined,
              }))}
            />
          )}
        </div>
      </div>
    </div>
  );
}
