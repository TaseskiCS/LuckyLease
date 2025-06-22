"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  User,
  Heart,
  MessageSquare,
  Settings,
  MapPin,
  GraduationCap,
  Star,
  Calendar,
  Edit3,
  Mail,
  Phone,
  Home,
  Plus,
  Eye,
  Trash2,
  DollarSign,
  Bed,
  Bath,
} from "lucide-react";

// Mock data - replace with real data from your backend
const mockUser = {
  id: 1,
  name: "Alex Johnson",
  email: "alex.johnson@uwaterloo.ca",
  phone: "+1 (519) 123-4567",
  university: "University of Waterloo",
  program: "Computer Science",
  year: "3rd Year",
  location: "Waterloo, ON",

  bio: "Looking for clean, quiet spaces close to campus. Non-smoker, respectful of shared spaces, and always pay rent on time!",
  joinDate: "September 2023",
  rating: 4.8,
  totalReviews: 12,
};

// This would normally come from your backend API
const allListings = [
  {
    id: "1",
    title: "Modern Studio Near University Campus",
    location: "0.3 miles from campus",
    price: 1200,
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&h=300&fit=crop",
    bedrooms: 1,
    bathrooms: 1,
    availableFrom: "2025-01-15",
  },
  {
    id: "2",
    title: "Shared 2BR Apartment - Great Roommate",
    location: "0.5 miles from campus",
    price: 850,
    image:
      "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=500&h=300&fit=crop",
    bedrooms: 2,
    bathrooms: 1,
    availableFrom: "2025-02-01",
  },
  {
    id: "3",
    title: "Cozy Private Room in Downtown Area",
    location: "0.2 miles from campus",
    price: 950,
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&h=300&fit=crop",
    bedrooms: 1,
    bathrooms: 1,
    availableFrom: "2025-01-20",
  },
  {
    id: "4",
    title: "Luxury 1BR with Mountain Views",
    location: "1.2 miles from campus",
    price: 1500,
    image:
      "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=500&h=300&fit=crop",
    bedrooms: 1,
    bathrooms: 1,
    availableFrom: "2025-03-01",
  },
  {
    id: "5",
    title: "Budget-Friendly Studio for Students",
    location: "0.8 miles from campus",
    price: 750,
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&h=300&fit=crop",
    bedrooms: 0,
    bathrooms: 1,
    availableFrom: "2025-02-15",
  },
];

const mockReviews = [
  {
    id: 1,
    reviewer: "Sarah Chen",
    rating: 5,
    date: "2024-12-15",
    comment:
      "Alex was an amazing tenant! Always kept common areas clean, paid rent on time, and was very respectful. Would definitely recommend!",
  },
  {
    id: 2,
    reviewer: "Mike Rodriguez",
    rating: 5,
    date: "2024-11-28",
    comment:
      "Great communication and very responsible. Left the place in perfect condition when moving out.",
  },
  {
    id: 3,
    reviewer: "Emma Wilson",
    rating: 4,
    date: "2024-10-10",
    comment:
      "Alex is quiet and respectful. Good roommate overall, would rent to again.",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<
    "profile" | "favorites" | "reviews" | "listings"
  >("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [favoriteListings, setFavoriteListings] = useState<any[]>([]);
  const [userListings, setUserListings] = useState<any[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  useEffect(() => {
    // Check for tab parameter in URL
    const tab = searchParams.get("tab");
    if (tab && ["profile", "favorites", "reviews", "listings"].includes(tab)) {
      setActiveTab(tab as "profile" | "favorites" | "reviews" | "listings");
    }

    loadFavorites();
    if (activeTab === "listings" || tab === "listings") {
      loadUserListings();
    }
    if (activeTab === "favorites" || tab === "favorites") {
      loadFavoriteListings();
    }
  }, [activeTab, searchParams]);
  const loadFavorites = () => {
    // This just loads the favorite IDs for the count in the sidebar
    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) {
      try {
        const favoriteIds: string[] = JSON.parse(savedFavorites);
        // Don't set favoriteListings here, just use for count
        return favoriteIds;
      } catch (error) {
        console.error("Error loading favorites:", error);
        return [];
      }
    }
    return [];
  };

  const loadFavoriteListings = async () => {
    setLoadingFavorites(true);
    try {
      const savedFavorites = localStorage.getItem("favorites");
      if (!savedFavorites) {
        setFavoriteListings([]);
        return;
      }

      const favoriteIds: string[] = JSON.parse(savedFavorites);
      if (favoriteIds.length === 0) {
        setFavoriteListings([]);
        return;
      }

      // Fetch actual listing data for each favorite ID
      const listingPromises = favoriteIds.map(async (id) => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/listings/${id}`
          );
          if (response.ok) {
            const data = await response.json();
            return data.listing;
          }
          return null;
        } catch (error) {
          console.error(`Error fetching listing ${id}:`, error);
          return null;
        }
      });

      const listings = await Promise.all(listingPromises);
      const validListings = listings.filter((listing) => listing !== null);
      setFavoriteListings(validListings);

      // Clean up localStorage if some listings no longer exist
      if (validListings.length !== favoriteIds.length) {
        const validIds = validListings.map((listing) => listing.id);
        localStorage.setItem("favorites", JSON.stringify(validIds));
      }
    } catch (error) {
      console.error("Error loading favorite listings:", error);
      toast.error("Failed to load favorite listings");
    } finally {
      setLoadingFavorites(false);
    }
  };
  const removeFavorite = (listingId: string) => {
    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) {
      try {
        const favoriteIds: string[] = JSON.parse(savedFavorites);
        const updatedIds = favoriteIds.filter((id) => id !== listingId);
        localStorage.setItem("favorites", JSON.stringify(updatedIds));
        setFavoriteListings((prev) =>
          prev.filter((listing) => listing.id !== listingId)
        );
        toast.success("Removed from favorites");
      } catch (error) {
        console.error("Error removing favorite:", error);
      }
    }
  };
  const loadUserListings = async () => {
    setLoadingListings(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/listings/user/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUserListings(data.listings || []);
      } else if (response.status === 401) {
        toast.error("Please log in to view your listings");
        // Could redirect to login page if needed
      } else {
        toast.error("Failed to load your listings");
      }
    } catch (error) {
      console.error("Error loading user listings:", error);
      toast.error("An error occurred while loading your listings");
    } finally {
      setLoadingListings(false);
    }
  };
  const deleteListing = async (listingId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this listing? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to delete listings");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/listings/${listingId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setUserListings((prev) =>
          prev.filter((listing) => listing.id !== listingId)
        );
        toast.success("Listing deleted successfully");
      } else {
        toast.error("Failed to delete listing");
      }
    } catch (error) {
      console.error("Error deleting listing:", error);
      toast.error("An error occurred while deleting the listing");
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-emerald-100">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-emerald-600 hover:text-emerald-700 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              {/* User Info */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-12 h-12 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {mockUser.name}
                </h2>
                <div className="flex items-center justify-center space-x-1 mt-2">
                  {renderStars(mockUser.rating)}
                  <span className="text-sm text-gray-600 ml-2">
                    {mockUser.rating} ({mockUser.totalReviews} reviews)
                  </span>
                </div>
              </div>{" "}
              {/* Navigation */}
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "profile"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Profile</span>
                </button>{" "}
                <button
                  onClick={() => setActiveTab("listings")}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "listings"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Home className="w-5 h-5" />
                  <span className="font-medium">My Listings</span>
                </button>{" "}
                <button
                  onClick={() => setActiveTab("favorites")}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "favorites"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Heart className="w-5 h-5" />
                  <span className="font-medium">Favorites</span>
                </button>{" "}
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "reviews"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="font-medium">Reviews</span>
                </button>
              </nav>{" "}
              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-sm text-gray-600">Member since</div>
                  <div className="font-medium text-gray-900">
                    {mockUser.joinDate}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Profile Information
                  </h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>{isEditing ? "Save Changes" : "Edit Profile"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Personal Information
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          defaultValue={mockUser.name}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      ) : (
                        <p className="text-gray-900">{mockUser.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-900">{mockUser.email}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          defaultValue={mockUser.phone}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-900">{mockUser.phone}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          defaultValue={mockUser.location}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-900">{mockUser.location}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Academic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Academic Information
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        University
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          defaultValue={mockUser.university}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <GraduationCap className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-900">{mockUser.university}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Program
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          defaultValue={mockUser.program}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      ) : (
                        <p className="text-gray-900">{mockUser.program}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Year
                      </label>
                      {isEditing ? (
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                          <option>1st Year</option>
                          <option>2nd Year</option>
                          <option selected>3rd Year</option>
                          <option>4th Year</option>
                          <option>Graduate</option>
                        </select>
                      ) : (
                        <p className="text-gray-900">{mockUser.year}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio Section */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                    About Me
                  </h3>
                  {isEditing ? (
                    <textarea
                      defaultValue={mockUser.bio}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Tell others about yourself as a tenant/landlord..."
                    />
                  ) : (
                    <p className="text-gray-700 leading-relaxed">
                      {mockUser.bio}
                    </p>
                  )}
                </div>
              </div>
            )}{" "}
            {/* Favorites Tab */}{" "}
            {activeTab === "favorites" && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Favorited Listings
                </h2>

                {loadingFavorites ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your favorites...</p>
                  </div>
                ) : favoriteListings.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No favorites yet
                    </h3>
                    <p className="text-gray-600">
                      Start browsing listings to save your favorites!
                    </p>
                    <button
                      onClick={() => router.push("/listings/browse")}
                      className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Browse Listings
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {favoriteListings.map((listing) => (
                      <div
                        key={listing.id}
                        className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                      >
                        {listing.imageUrls && listing.imageUrls.length > 0 ? (
                          <img
                            src={listing.imageUrls[0]}
                            alt={listing.title}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-r from-emerald-100 to-emerald-200 flex items-center justify-center">
                            <Home className="w-16 h-16 text-emerald-600" />
                          </div>
                        )}
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {listing.title}
                            </h3>
                            <button
                              onClick={() => removeFavorite(listing.id)}
                              className="text-red-500 hover:text-red-600 transition-colors"
                              title="Remove from favorites"
                            >
                              <Heart className="w-5 h-5 fill-current" />
                            </button>
                          </div>
                          <div className="flex items-center text-gray-600 mb-2">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span className="text-sm">{listing.location}</span>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-2xl font-bold text-emerald-600">
                              <DollarSign className="w-5 h-5 inline mr-1" />
                              {listing.price}
                              <span className="text-sm font-normal text-gray-600">
                                /month
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 flex items-center space-x-3">
                              <span className="flex items-center">
                                <Bed className="w-4 h-4 mr-1" />
                                {listing.bedrooms} bed
                              </span>
                              <span className="flex items-center">
                                <Bath className="w-4 h-4 mr-1" />
                                {listing.bathrooms} bath
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                Available:{" "}
                                {new Date(
                                  listing.startDate
                                ).toLocaleDateString()}{" "}
                                -{" "}
                                {new Date(listing.endDate).toLocaleDateString()}
                              </div>
                              <button
                                onClick={() =>
                                  router.push(`/listings/browse/${listing.id}`)
                                }
                                className="text-emerald-600 hover:text-emerald-700 font-medium"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* My Listings Tab */}
            {activeTab === "listings" && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    My Listings
                  </h2>
                  <button
                    onClick={() => router.push("/listings/create")}
                    className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New Listing</span>
                  </button>
                </div>

                {loadingListings ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your listings...</p>
                  </div>
                ) : userListings.length === 0 ? (
                  <div className="text-center py-12">
                    <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No listings yet
                    </h3>
                    <p className="text-gray-600">
                      Start by creating your first listing to find tenants!
                    </p>
                    <button
                      onClick={() => router.push("/listings/create")}
                      className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Create Your First Listing
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userListings.map((listing) => (
                      <div
                        key={listing.id}
                        className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                      >
                        {listing.imageUrls && listing.imageUrls.length > 0 ? (
                          <img
                            src={listing.imageUrls[0]}
                            alt={listing.title}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-r from-emerald-100 to-emerald-200 flex items-center justify-center">
                            <Home className="w-16 h-16 text-emerald-600" />
                          </div>
                        )}
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {listing.title}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() =>
                                  router.push(`/listings/browse/${listing.id}`)
                                }
                                className="text-emerald-600 hover:text-emerald-700 transition-colors"
                                title="View listing"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => deleteListing(listing.id)}
                                className="text-red-500 hover:text-red-600 transition-colors"
                                title="Delete listing"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center text-gray-600 mb-2">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span className="text-sm">{listing.location}</span>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-2xl font-bold text-emerald-600">
                              <DollarSign className="w-5 h-5 inline mr-1" />
                              {listing.price}
                              <span className="text-sm font-normal text-gray-600">
                                /month
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 flex items-center space-x-3">
                              <span className="flex items-center">
                                <Bed className="w-4 h-4 mr-1" />
                                {listing.bedrooms} bed
                              </span>
                              <span className="flex items-center">
                                <Bath className="w-4 h-4 mr-1" />
                                {listing.bathrooms} bath
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                Available:{" "}
                                {new Date(
                                  listing.startDate
                                ).toLocaleDateString()}{" "}
                                -{" "}
                                {new Date(listing.endDate).toLocaleDateString()}
                              </div>
                              <div className="flex items-center space-x-3">
                                {listing.likes && (
                                  <span className="flex items-center">
                                    <Heart className="w-4 h-4 mr-1" />
                                    {listing.likes[0]?.count || 0}
                                  </span>
                                )}
                                {listing.messages && (
                                  <span className="flex items-center">
                                    <MessageSquare className="w-4 h-4 mr-1" />
                                    {listing.messages[0]?.count || 0}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Reviews & Ratings
                  </h2>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-3xl font-bold text-emerald-600">
                        {mockUser.rating}
                      </div>
                      <div className="flex items-center space-x-1">
                        {renderStars(mockUser.rating)}
                      </div>
                    </div>
                  </div>
                </div>

                {mockReviews.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No reviews yet
                    </h3>
                    <p className="text-gray-600">
                      Complete your first rental to start receiving reviews!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {mockReviews.map((review) => (
                      <div
                        key={review.id}
                        className="border border-gray-200 rounded-lg p-6"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {review.reviewer}
                                </h4>
                                <div className="flex items-center space-x-2 mt-1">
                                  {renderStars(review.rating)}
                                  <span className="text-sm text-gray-600">
                                    {review.date}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                              {review.comment}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
