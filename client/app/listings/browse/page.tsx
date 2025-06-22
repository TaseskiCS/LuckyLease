"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Heart,
  Plus,
  Home,
  ChevronDown,
  Bed,
  Bath,
  Mail,
  Phone,
  MessageCircle,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  summary?: string;
  tags: string[];
  contactMethod: "email" | "in_app" | "sms";
  bedrooms: number;
  bathrooms: number;
  petsAllowed: boolean;
  laundryInBuilding: boolean;
  parkingAvailable: boolean;
  airConditioning: boolean;
  school?: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    likes: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    startDate: "",
    endDate: "",
    bedrooms: "",
    propertyType: "", // Add this line
    petsAllowed: false,
    laundryInBuilding: false,
    parkingAvailable: false,
    airConditioning: false,
  });
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    // Check for location parameter in URL and set it as search term
    const locationParam = searchParams.get("location");
    if (locationParam) {
      setSearchTerm(locationParam);
    }

    fetchListings();
    loadFavorites();
  }, [searchParams]);

  const loadFavorites = () => {
    const saved = localStorage.getItem("favorites");
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch {
        console.error("Error parsing favorites");
      }
    }
  };

  const saveFavorites = (newFavs: string[]) => {
    localStorage.setItem("favorites", JSON.stringify(newFavs));
    setFavorites(newFavs);
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isFav = favorites.includes(id);
    const newFavs = isFav
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];
    saveFavorites(newFavs);
    toast.success(isFav ? "Removed from favorites" : "Added to favorites");
  };

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      // Check if searchTerm comes from URL location parameter
      const locationParam = searchParams.get("location");
      if (locationParam) {
        // Use location parameter for more specific location filtering
        params.append("location", locationParam);
      } else if (searchTerm) {
        // Use general search for user-entered terms
        params.append("search", searchTerm);
      }
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.bedrooms) params.append("bedrooms", filters.bedrooms);
      if (filters.petsAllowed) params.append("petsAllowed", "true");
      if (filters.laundryInBuilding) params.append("laundryInBuilding", "true");
      if (filters.parkingAvailable) params.append("parkingAvailable", "true");
      if (filters.airConditioning) params.append("airConditioning", "true");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/listings?${params}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch");

      let data: Listing[] = (json.listings || []).map((l: any) => ({
        ...l,
        bedrooms: Number(l.bedrooms),
        bathrooms: Number(l.bathrooms),
        _count: { likes: l._count?.likes ?? 0 },
      }));

      if (filters.bedrooms) {
        const f = filters.bedrooms;
        if (f.endsWith("+")) {
          const min = Number(f.replace("+", ""));
          data = data.filter((l) => l.bedrooms >= min);
        } else {
          const exact = Number(f);
          data = data.filter((l) => l.bedrooms === exact);
        }
      }

      // Apply amenity filters
      if (filters.petsAllowed) data = data.filter((l) => l.petsAllowed);
      if (filters.laundryInBuilding)
        data = data.filter((l) => l.laundryInBuilding);
      if (filters.parkingAvailable)
        data = data.filter((l) => l.parkingAvailable);
      if (filters.airConditioning) data = data.filter((l) => l.airConditioning);

      setListings(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => fetchListings();

  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      minPrice: "",
      maxPrice: "",
      startDate: "",
      endDate: "",
      bedrooms: "",
      propertyType: "",
      petsAllowed: false,
      laundryInBuilding: false,
      parkingAvailable: false,
      airConditioning: false,
    });
    setSearchTerm("");
    fetchListings();
  };

  const sortListings = (listings: Listing[], sortBy: string) => {
    const sorted = [...listings];
    switch (sortBy) {
      case "recent":
        return sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "price_asc":
        return sorted.sort((a, b) => a.price - b.price);
      case "price_desc":
        return sorted.sort((a, b) => b.price - a.price);
      default:
        return sorted;
    }
  };

  const removeFilter = (filterKey: string) => {
    if (filterKey === "searchTerm") {
      setSearchTerm("");
    } else {
      const filterType = typeof filters[filterKey as keyof typeof filters];
      setFilters((prev) => ({
        ...prev,
        [filterKey]: filterType === "boolean" ? false : "",
      }));
    }
    // Auto-apply after removing filter
    setTimeout(() => fetchListings(), 0);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  // Check if any filters are active
  const hasActiveFilters =
    searchTerm ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.startDate ||
    filters.endDate ||
    filters.bedrooms ||
    filters.petsAllowed ||
    filters.laundryInBuilding ||
    filters.parkingAvailable ||
    filters.airConditioning;

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading listings…</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80">
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

              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="mb-6 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Active Filters
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {searchTerm && (
                      <Badge
                        variant="outline"
                        className="text-xs flex items-center gap-1 bg-white"
                      >
                        Search: {searchTerm}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeFilter("searchTerm")}
                        />
                      </Badge>
                    )}
                    {filters.minPrice && (
                      <Badge
                        variant="outline"
                        className="text-xs flex items-center gap-1 bg-white"
                      >
                        Min ${filters.minPrice}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeFilter("minPrice")}
                        />
                      </Badge>
                    )}
                    {filters.maxPrice && (
                      <Badge
                        variant="outline"
                        className="text-xs flex items-center gap-1 bg-white"
                      >
                        Max ${filters.maxPrice}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeFilter("maxPrice")}
                        />
                      </Badge>
                    )}
                    {filters.startDate && (
                      <Badge
                        variant="outline"
                        className="text-xs flex items-center gap-1 bg-white"
                      >
                        From {formatDate(filters.startDate)}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeFilter("startDate")}
                        />
                      </Badge>
                    )}
                    {filters.endDate && (
                      <Badge
                        variant="outline"
                        className="text-xs flex items-center gap-1 bg-white"
                      >
                        To {formatDate(filters.endDate)}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeFilter("endDate")}
                        />
                      </Badge>
                    )}
                    {filters.bedrooms && (
                      <Badge
                        variant="outline"
                        className="text-xs flex items-center gap-1 bg-white"
                      >
                        {filters.bedrooms} Beds
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeFilter("bedrooms")}
                        />
                      </Badge>
                    )}
                    {filters.petsAllowed && (
                      <Badge
                        variant="outline"
                        className="text-xs flex items-center gap-1 bg-white"
                      >
                        Pets Allowed
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeFilter("petsAllowed")}
                        />
                      </Badge>
                    )}
                    {filters.laundryInBuilding && (
                      <Badge
                        variant="outline"
                        className="text-xs flex items-center gap-1 bg-white"
                      >
                        Laundry in Building
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeFilter("laundryInBuilding")}
                        />
                      </Badge>
                    )}
                    {filters.parkingAvailable && (
                      <Badge
                        variant="outline"
                        className="text-xs flex items-center gap-1 bg-white"
                      >
                        Parking Available
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeFilter("parkingAvailable")}
                        />
                      </Badge>
                    )}
                    {filters.airConditioning && (
                      <Badge
                        variant="outline"
                        className="text-xs flex items-center gap-1 bg-white"
                      >
                        Air Conditioning
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeFilter("airConditioning")}
                        />
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Location, title, description…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
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
                    value={filters.minPrice}
                    placeholder="Min"
                    type="number"
                    onChange={(e) =>
                      handleFilterChange("minPrice", e.target.value)
                    }
                  />
                  <Input
                    value={filters.maxPrice}
                    placeholder="Max"
                    type="number"
                    onChange={(e) =>
                      handleFilterChange("maxPrice", e.target.value)
                    }
                  />
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
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                  </select>
                  <Home className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                </div>
              </div>

              {/* Bedrooms */}
              <div className="mb-6">
                <label className="block text-sm font-small text-gray-700 mb-2">
                  Bedrooms
                </label>
                <div className="relative">
                  <select
                    value={filters.bedrooms}
                    onChange={(e) =>
                      handleFilterChange("bedrooms", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 bg-white appearance-none"
                  >
                    <option value="">Any</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3+">3+</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                </div>
              </div>

              {/* Amenities */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amenities
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      checked={filters.petsAllowed}
                      onChange={(e) =>
                        handleFilterChange("petsAllowed", e.target.checked)
                      }
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Pets Allowed
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      checked={filters.laundryInBuilding}
                      onChange={(e) =>
                        handleFilterChange(
                          "laundryInBuilding",
                          e.target.checked
                        )
                      }
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Laundry in Building
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      checked={filters.parkingAvailable}
                      onChange={(e) =>
                        handleFilterChange("parkingAvailable", e.target.checked)
                      }
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Parking Available
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      checked={filters.airConditioning}
                      onChange={(e) =>
                        handleFilterChange("airConditioning", e.target.checked)
                      }
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Air Conditioning
                    </span>
                  </label>
                </div>
              </div>

              {/* Move-in Dates */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Move-in Period
                </label>
                <div className="space-y-2">
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) =>
                      handleFilterChange("startDate", e.target.value)
                    }
                  />
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) =>
                      handleFilterChange("endDate", e.target.value)
                    }
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
                <h2 className="text-2xl font-bold text-gray-900">
                  Available Listings
                </h2>
                <p className="text-gray-600">
                  {listings.length} properties found
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 pr-8 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white appearance-none cursor-pointer outline-none"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                </div>
              </div>
            </div>

            {listings.length === 0 ? (
              <div className="text-center py-16">
                <Search className="h-16 w-16 mx-auto text-gray-400" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No listings found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria or filters.
                </p>
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
                {sortListings(listings, sortBy).map((l, idx) => (
                  <Card
                    key={l.id}
                    className="overflow-hidden hover:shadow-xl transition-all duration-200 group"
                  >
                    <Link href={`/listings/browse/${l.id}`}>
                      <div className="relative cursor-pointer">
                        {l.imageUrls.length > 0 ? (
                          <img
                            src={l.imageUrls[0]}
                            alt={l.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div
                            className={`w-full h-48 flex items-center justify-center ${
                              idx % 3 === 0
                                ? "bg-gradient-to-r from-emerald-100 to-emerald-200"
                                : idx % 3 === 1
                                ? "bg-gradient-to-r from-blue-100 to-blue-200"
                                : "bg-gradient-to-r from-purple-100 to-purple-200"
                            }`}
                          >
                            <Home
                              className={`w-16 h-16 ${
                                idx % 3 === 0
                                  ? "text-emerald-600"
                                  : idx % 3 === 1
                                  ? "text-blue-600"
                                  : "text-purple-600"
                              }`}
                            />
                          </div>
                        )}
                        <Button
                          size="sm"
                          variant="secondary"
                          className={`absolute top-3 right-3 bg-white/90 hover:bg-white transition-colors ${
                            favorites.includes(l.id)
                              ? "text-red-500"
                              : "text-gray-600"
                          }`}
                          onClick={(e) => toggleFavorite(l.id, e)}
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              favorites.includes(l.id) ? "fill-current" : ""
                            }`}
                          />
                        </Button>
                      </div>
                    </Link>
                    <CardContent className="p-6">
                      <Link href={`/listings/browse/${l.id}`}>
                        <div className="cursor-pointer">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg mb-1 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                                {l.title}
                              </h4>
                              <p className="text-gray-600 flex items-center text-sm">
                                <MapPin className="w-4 h-4 mr-1" />
                                {l.location}
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-2xl font-bold text-emerald-600">
                                ${l.price}
                              </div>
                              <div className="text-sm text-gray-500">
                                /month
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 mb-3">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>
                              {formatDate(l.startDate)} –{" "}
                              {formatDate(l.endDate)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            <span className="flex items-center">
                              <Bed className="w-4 h-4 mr-1" />
                              {l.bedrooms} bed
                            </span>
                            <span className="flex items-center">
                              <Bath className="w-4 h-4 mr-1" />
                              {l.bathrooms} bath
                            </span>
                            <span className="flex items-center">
                              {l.contactMethod === "email" ? (
                                <Mail className="w-4 h-4 mr-1" />
                              ) : l.contactMethod === "sms" ? (
                                <Phone className="w-4 h-4 mr-1" />
                              ) : (
                                <MessageCircle className="w-4 h-4 mr-1" />
                              )}
                              {l.contactMethod}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 mb-4">
                            {l.petsAllowed && (
                              <Badge variant="secondary" className="text-xs">
                                Pets OK
                              </Badge>
                            )}
                            {l.laundryInBuilding && (
                              <Badge variant="secondary" className="text-xs">
                                Laundry
                              </Badge>
                            )}
                            {l.parkingAvailable && (
                              <Badge variant="secondary" className="text-xs">
                                Parking
                              </Badge>
                            )}
                            {l.airConditioning && (
                              <Badge variant="secondary" className="text-xs">
                                AC
                              </Badge>
                            )}
                            {l.tags.slice(0, 2).map((tag, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          {l.summary && (
                            <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                              {l.summary}
                            </p>
                          )}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-xs">
                                  {l.user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-gray-600">
                                {l.user.name}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Heart className="h-4 w-4 mr-1" />
                              <span className="text-sm">{l._count.likes}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
