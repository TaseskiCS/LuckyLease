"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Chat } from "@/components/ui/chat";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  university?: string;
  program?: string;
  year?: string;
  location?: string;
  bio?: string;
  isRenter: boolean;
  isSeller: boolean;
}

interface Review {
  id: string;
  reviewer: string;
  rating: number;
  date: string;
  comment: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "profile" | "listings" | "favorites" | "reviews" | "messages"
  >("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    token: string;
  } | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [favoriteListings, setFavoriteListings] = useState<any[]>([]);
  const [userListings, setUserListings] = useState<any[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    // Get current user info from localStorage
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    const userInfo = localStorage.getItem("userInfo");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        if (userInfo) {
          setCurrentUser(JSON.parse(userInfo));
        }
      } catch (error) {
        console.error("Error parsing user info:", error);
        router.push("/auth/login");
      }
    } else {
      router.push("/auth/login");
    }

    setLoadingUser(false);
    loadFavorites();
  }, [router]);

  // Load favorites when favorites tab is selected
  useEffect(() => {
    if (activeTab === "favorites") {
      loadFavoriteListings();
    }
  }, [activeTab]);

  // Load user listings when listings tab is selected
  useEffect(() => {
    if (activeTab === "listings") {
      loadUserListings();
    }
  }, [activeTab]);

  const loadFavorites = () => {
    // This just loads the favorite IDs for the count in the sidebar
    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) {
      try {
        const favoriteIds: string[] = JSON.parse(savedFavorites);
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

  const handleSaveProfile = async (formData: FormData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to update profile");
        return;
      }

      // Extract form data
      const profileData = {
        name: formData.get("name") as string,
        phone: formData.get("phone") as string,
        location: formData.get("location") as string,
        university: formData.get("university") as string,
        program: formData.get("program") as string,
        year: formData.get("year") as string,
        bio: formData.get("bio") as string,
      };

      // In a real implementation, you would make an API call here
      // For now, we'll just update the local state
      if (user) {
        const updatedUser = { ...user, ...profileData };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
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
              {" "}
              {/* User Info */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-12 h-12 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {user?.name || "Loading..."}
                </h2>
                <div className="flex items-center justify-center space-x-1 mt-2">
                  {renderStars(0)}
                  <span className="text-sm text-gray-600 ml-2">New Member</span>
                </div>
              </div>
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
                </button>

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
                </button>

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
                </button>

                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "reviews"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Star className="w-5 h-5" />
                  <span className="font-medium">Reviews</span>
                </button>

                <button
                  onClick={() => setActiveTab("messages")}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "messages"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="font-medium">Messages</span>
                </button>
              </nav>{" "}
              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-sm text-gray-600">Member since</div>
                  <div className="font-medium text-gray-900">
                    {user
                      ? new Date().toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                        })
                      : "Loading..."}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {" "}
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                {loadingUser ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading profile...</p>
                  </div>
                ) : (
                  <>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        handleSaveProfile(formData);
                      }}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                          Profile Information
                        </h2>
                        <div className="flex space-x-2">
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => setIsEditing(false)}
                              className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            type={isEditing ? "submit" : "button"}
                            onClick={
                              isEditing ? undefined : () => setIsEditing(true)
                            }
                            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                            <span>
                              {isEditing ? "Save Changes" : "Edit Profile"}
                            </span>
                          </button>
                        </div>
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
                                name="name"
                                defaultValue={user?.name || ""}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              />
                            ) : (
                              <p className="text-gray-900">
                                {user?.name || "Not provided"}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email
                            </label>
                            <div className="flex items-center space-x-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <p className="text-gray-900">
                                {user?.email || "Not provided"}
                              </p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Email cannot be changed
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Phone
                            </label>
                            {isEditing ? (
                              <input
                                type="tel"
                                name="phone"
                                defaultValue={user?.phone || ""}
                                placeholder="Add your phone number"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              />
                            ) : (
                              <div className="flex items-center space-x-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <p className="text-gray-900">
                                  {user?.phone || "Not provided"}
                                </p>
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
                                name="location"
                                defaultValue={user?.location || ""}
                                placeholder="Add your location"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              />
                            ) : (
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <p className="text-gray-900">
                                  {user?.location || "Not provided"}
                                </p>
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
                                name="university"
                                defaultValue={user?.university || ""}
                                placeholder="Add your university"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              />
                            ) : (
                              <div className="flex items-center space-x-2">
                                <GraduationCap className="w-4 h-4 text-gray-400" />
                                <p className="text-gray-900">
                                  {user?.university || "Not provided"}
                                </p>
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
                                name="program"
                                defaultValue={user?.program || ""}
                                placeholder="Add your program"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              />
                            ) : (
                              <p className="text-gray-900">
                                {user?.program || "Not provided"}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Year
                            </label>
                            {isEditing ? (
                              <select
                                name="year"
                                defaultValue={user?.year || ""}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              >
                                <option value="">Select year</option>
                                <option value="1st Year">1st Year</option>
                                <option value="2nd Year">2nd Year</option>
                                <option value="3rd Year">3rd Year</option>
                                <option value="4th Year">4th Year</option>
                                <option value="Graduate">Graduate</option>
                              </select>
                            ) : (
                              <p className="text-gray-900">
                                {user?.year || "Not provided"}
                              </p>
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
                            name="bio"
                            defaultValue={user?.bio || ""}
                            rows={4}
                            placeholder="Tell others about yourself as a tenant/landlord..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        ) : (
                          <p className="text-gray-700 leading-relaxed">
                            {user?.bio ||
                              'No bio provided yet. Click "Edit Profile" to add information about yourself.'}
                          </p>
                        )}
                      </div>
                    </form>
                  </>
                )}
              </div>
            )}
            {/* Favorites Tab */}
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
            )}{" "}
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
                        0.0
                      </div>
                      <div className="flex items-center space-x-1">
                        {renderStars(0)}
                      </div>
                      <div className="text-sm text-gray-600">0 reviews</div>
                    </div>
                  </div>
                </div>

                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No reviews yet
                  </h3>
                  <p className="text-gray-600">
                    Complete your first rental to start receiving reviews!
                  </p>
                </div>
              </div>
            )}
            {/* Messages Tab */}
            {activeTab === "messages" && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Open Chat</span>
                  </button>
                </div>

                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No messages yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Start a conversation by contacting a listing owner or
                    responding to messages.
                  </p>
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Open Messages
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      {isChatOpen && currentUser && (
        <Chat
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          currentUserId={currentUser.id}
          token={currentUser.token}
        />
      )}
    </div>
  );
}
