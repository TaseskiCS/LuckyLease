"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import {
  Home,
  Upload,
  MapPin,
  DollarSign,
  Calendar,
  FileText,
  Phone,
  MessageCircle,
  ArrowLeft,
  Mail,
  X,
  Plus,
  Check,
  ChevronDown,
  Bed,
  Bath,
  Car,
  Shirt,
  Wind,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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

interface ListingFormData {
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms: string;
  bathrooms: string;
  startDate: string;
  endDate: string;
  contactMethod: "email" | "in_app" | "sms";
  school?: string;
  petsAllowed: boolean;
  laundryInBuilding: boolean;
  parkingAvailable: boolean;
  airConditioning: boolean;
  listingType: "house" | "apartment";
  images: FileList;
}

export default function CreateListingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [addressValidation, setAddressValidation] = useState<{
    status: "idle" | "checking" | "valid" | "invalid";
    message: string;
  }>({ status: "idle", message: "" });
  const [addressCheckTimeout, setAddressCheckTimeout] =
    useState<NodeJS.Timeout | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ListingFormData>();

  // Watch the location field for changes
  const watchedLocation = watch("location");
  // Check authentication on page load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to create a listing");
      router.push("/auth/login");
      return;
    }
    setIsAuthenticated(true);
  }, [router]);

  // Watch for location changes and validate address
  useEffect(() => {
    if (addressCheckTimeout) {
      clearTimeout(addressCheckTimeout);
    }

    if (watchedLocation && watchedLocation.trim().length >= 2) {
      const timeout = setTimeout(() => {
        validateAddress(watchedLocation);
      }, 1000);
      setAddressCheckTimeout(timeout);
    } else {
      setAddressValidation({ status: "idle", message: "" });
    }

    return () => {
      if (addressCheckTimeout) {
        clearTimeout(addressCheckTimeout);
      }
    };
  }, [watchedLocation]);

  // Handle image preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const previews: string[] = [];
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            previews.push(event.target.result as string);
            if (previews.length === files.length) {
              setImagePreview(previews);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };
  const removeImage = (indexToRemove: number) => {
    setImagePreview((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };
  // Address validation function
  const validateAddress = async (address: string) => {
    if (!address.trim()) {
      setAddressValidation({ status: "idle", message: "" });
      return;
    }

    if (address.trim().length < 2) {
      setAddressValidation({ status: "idle", message: "" });
      return;
    }

    setAddressValidation({
      status: "checking",
      message: "Checking if address can be mapped...",
    });
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const response = await fetch(`${apiUrl}/api/listings/validate-address`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ address: address.trim() }),
      });

      if (!response.ok) {
        throw new Error("Address validation failed");
      }

      const result = await response.json();

      if (result.valid) {
        setAddressValidation({
          status: "valid",
          message: "✓ Address found! This listing will appear on the map.",
        });
      } else {
        setAddressValidation({
          status: "invalid",
          message:
            "⚠ Address not found. This listing will not appear on the map.",
        });
      }
    } catch (error) {
      console.error("Address validation error:", error);
      setAddressValidation({
        status: "invalid",
        message:
          "⚠ Could not validate address. This listing may not appear on the map.",
      });
    }
  };

  const onSubmit = async (data: ListingFormData) => {
    try {
      setIsSubmitting(true);

      // Check authentication before proceeding
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to create a listing");
        router.push("/auth/login");
        return;
      }

      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("price", data.price.toString());
      formData.append("location", data.location);
      formData.append("bedrooms", data.bedrooms);
      formData.append("bathrooms", data.bathrooms);
      formData.append("startDate", data.startDate);
      formData.append("endDate", data.endDate);
      formData.append("contactMethod", data.contactMethod || "email");
      if (data.school) {
        formData.append("school", data.school);
      }
      formData.append("petsAllowed", (data.petsAllowed || false).toString());
      formData.append(
        "laundryInBuilding",
        (data.laundryInBuilding || false).toString()
      );
      formData.append(
        "parkingAvailable",
        (data.parkingAvailable || false).toString()
      );
      formData.append(
        "airConditioning",
        (data.airConditioning || false).toString()
      );
      formData.append("listingType", data.listingType);

      // Add images
      if (data.images) {
        Array.from(data.images).forEach((file) => {
          formData.append("images", file);
        });
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const response = await fetch(`${apiUrl}/api/listings`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        toast.success("Listing created successfully!");
        router.push("/dashboard?tab=listings");
      } else if (response.status === 401 || response.status === 403) {
        // Authentication failed - token might be expired
        localStorage.removeItem("token");
        toast.error("Your session has expired. Please log in again.");
        router.push("/auth/login");
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create listing");
      }
    } catch (error) {
      console.error("Error creating listing:", error);
      toast.error("Failed to create listing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header with Back Button */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/listings/browse">
              <Button
                variant="ghost"
                className="flex items-center space-x-2 text-gray-600 hover:text-emerald-600"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Listings</span>
              </Button>
            </Link>
            <div className="h-8 w-px bg-gray-300"></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Create New Listing
              </h1>
              <p className="text-gray-600">
                Share your space with the community
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
            <CardContent className="p-8">
              <div className="mb-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Home className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  List Your Property
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Create a compelling listing to attract the perfect tenant for
                  your space
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                {/* Basic Information */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <FileText className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Basic Information
                    </h3>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Listing Title *
                    </label>
                    <Input
                      {...register("title", {
                        required: "Title is required",
                        minLength: {
                          value: 5,
                          message: "Title must be at least 5 characters",
                        },
                        maxLength: {
                          value: 100,
                          message: "Title cannot exceed 100 characters",
                        },
                      })}
                      className="h-12 text-md"
                      placeholder="e.g., Cozy Studio Near Campus - Perfect for Students"
                    />
                    {errors.title && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <X className="w-4 h-4 mr-1" />
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Description *
                    </label>
                    <textarea
                      rows={5}
                      {...register("description", {
                        required: "Description is required",
                        minLength: {
                          value: 20,
                          message: "Description must be at least 20 characters",
                        },
                        maxLength: {
                          value: 1000,
                          message: "Description cannot exceed 1000 characters",
                        },
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none text-md"
                      placeholder="Describe your space, amenities, neighborhood, and what makes it special..."
                    />
                    {errors.description && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <X className="w-4 h-4 mr-1" />
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  {/* Property Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Property Type *
                    </label>
                    <div className="relative">
                      <select
                        {...register("listingType", {
                          required: "Property type is required",
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white h-12 text-md"
                      >
                        {" "}
                        <option value="">Select property type</option>
                        <option value="house">House</option>
                        <option value="apartment">Apartment</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.listingType && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <X className="w-4 h-4 mr-1" />
                        {errors.listingType.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Location & Pricing */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Location & Pricing
                    </h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* School Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Nearest School/Institution
                      </label>
                      <div className="relative">
                        <select
                          {...register("school")}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white h-12 text-md"
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
                                    <option
                                      key={school.value}
                                      value={school.value}
                                    >
                                      {school.name}
                                    </option>
                                  )
                                )}
                                {(region as Region).colleges?.map(
                                  (school: School) => (
                                    <option
                                      key={school.value}
                                      value={school.value}
                                    >
                                      {school.name}
                                    </option>
                                  )
                                )}
                              </optgroup>
                            )
                          )}

                          {/* American Schools */}
                          {Object.entries(schoolsData.usa).map(
                            ([stateKey, state]) => (
                              <optgroup
                                key={`usa-${stateKey}`}
                                label={`🇺🇸 ${(state as Region).label}`}
                              >
                                {(state as Region).universities?.map(
                                  (school: School) => (
                                    <option
                                      key={school.value}
                                      value={school.value}
                                    >
                                      {school.name}
                                    </option>
                                  )
                                )}
                                {(state as Region).colleges?.map(
                                  (school: School) => (
                                    <option
                                      key={school.value}
                                      value={school.value}
                                    >
                                      {school.name}
                                    </option>
                                  )
                                )}
                              </optgroup>
                            )
                          )}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>{" "}
                    {/* Address */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Address/Location *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />{" "}
                        <Input
                          {...register("location", {
                            required: "Location is required",
                            minLength: {
                              value: 2,
                              message: "Location must be at least 2 characters",
                            },
                            maxLength: {
                              value: 100,
                              message: "Location cannot exceed 100 characters",
                            },
                          })}
                          className="pl-11 h-12 text-md"
                          placeholder="e.g., 123 Clover Ave, Waterloo, ON"
                        />
                      </div>
                      {errors.location && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <X className="w-4 h-4 mr-1" />
                          {errors.location.message}
                        </p>
                      )}
                      {/* Address validation feedback */}
                      {addressValidation.status !== "idle" && (
                        <div
                          className={`mt-2 text-sm flex items-center ${
                            addressValidation.status === "checking"
                              ? "text-blue-600"
                              : addressValidation.status === "valid"
                              ? "text-green-600"
                              : "text-orange-600"
                          }`}
                        >
                          {addressValidation.status === "checking" && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                          )}
                          {addressValidation.status === "valid" && (
                            <Check className="w-4 h-4 mr-2" />
                          )}
                          {addressValidation.status === "invalid" && (
                            <span className="w-4 h-4 mr-2">⚠</span>
                          )}
                          {addressValidation.message}
                        </div>
                      )}
                    </div>
                    {/* Price */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Monthly Price (CAD) *
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          {...register("price", {
                            required: "Price is required",
                            min: {
                              value: 0,
                              message: "Price must be greater than 0",
                            },
                          })}
                          className="pl-11 h-12 text-md"
                          placeholder="e.g., 1200.00"
                        />
                      </div>
                      {errors.price && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <X className="w-4 h-4 mr-1" />
                          {errors.price.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Bedrooms */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Bedrooms *
                      </label>
                      <div className="relative">
                        <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <select
                          {...register("bedrooms", {
                            required: "Please select number of bedrooms",
                          })}
                          className="w-full pl-11 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white h-12 text-mds"
                        >
                          <option value="">Select</option>
                          <option value="studio">Studio</option>
                          <option value="1">1 Bedroom</option>
                          <option value="2">2 Bedrooms</option>
                          <option value="3">3 Bedrooms</option>
                          <option value="4">4 Bedrooms</option>
                          <option value="5+">5+ Bedrooms</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                      </div>
                      {errors.bedrooms && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <X className="w-4 h-4 mr-1" />
                          {errors.bedrooms.message}
                        </p>
                      )}
                    </div>

                    {/* Bathrooms */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Bathrooms *
                      </label>
                      <div className="relative">
                        <Bath className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <select
                          {...register("bathrooms", {
                            required: "Please select number of bathrooms",
                          })}
                          className="w-full pl-11 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white h-12 text-md"
                        >
                          <option value="">Select</option>
                          <option value="1">1 Bathroom</option>
                          <option value="1.5">1.5 Bathrooms</option>
                          <option value="2">2 Bathrooms</option>
                          <option value="2.5">2.5 Bathrooms</option>
                          <option value="3">3 Bathrooms</option>
                          <option value="3.5">3.5 Bathrooms</option>
                          <option value="4+">4+ Bathrooms</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                      </div>
                      {errors.bathrooms && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <X className="w-4 h-4 mr-1" />
                          {errors.bathrooms.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sublease Duration */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Availability Period
                    </h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Start Date */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Available From *
                      </label>
                      <Input
                        type="date"
                        {...register("startDate", {
                          required: "Start date is required",
                        })}
                        className="h-12 text-md"
                      />
                      {errors.startDate && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <X className="w-4 h-4 mr-1" />
                          {errors.startDate.message}
                        </p>
                      )}
                    </div>

                    {/* End Date */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Available Until *
                      </label>
                      <Input
                        type="date"
                        {...register("endDate", {
                          required: "End date is required",
                        })}
                        className="h-12 text-md"
                      />
                      {errors.endDate && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <X className="w-4 h-4 mr-1" />
                          {errors.endDate.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Property Amenities & Policies */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Home className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Amenities & Policies
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pets Allowed */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          {...register("petsAllowed")}
                          className="w-5 h-5 text-emerald-600 border-2 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2 mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-md">🐾</span>
                            <span className="text-md font-semibold text-gray-900">
                              Pets Allowed
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            Pets are welcome in this space
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Laundry in Building */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          {...register("laundryInBuilding")}
                          className="w-5 h-5 text-emerald-600 border-2 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2 mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Shirt className="w-4 h-4 text-gray-600" />
                            <span className="text-md font-semibold text-gray-900">
                              Laundry in Building
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            Washer and dryer available on-site
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Parking Available */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          {...register("parkingAvailable")}
                          className="w-5 h-5 text-emerald-600 border-2 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2 mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Car className="w-4 h-4 text-gray-600" />
                            <span className="text-md font-semibold text-gray-900">
                              Parking Available
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            Parking space included or available
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Air Conditioning */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          {...register("airConditioning")}
                          className="w-5 h-5 text-emerald-600 border-2 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2 mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Wind className="w-4 h-4 text-gray-600" />
                            <span className="text-md font-semibold text-gray-900">
                              Air Conditioning
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            Climate control and cooling available
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Upload className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Property Photos
                    </h3>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Upload Images (Max 10)
                    </label>
                    <div className="border-2 border-dashed border-emerald-200 rounded-xl p-8 text-center hover:border-emerald-300 transition-colors bg-emerald-50/50">
                      <Upload className="mx-auto h-16 w-16 text-emerald-400" />
                      <div className="mt-4">
                        <label htmlFor="images" className="cursor-pointer">
                          <span className="mt-2 block text-lg font-semibold text-gray-900">
                            Click to upload images
                          </span>
                          <span className="mt-1 block text-sm text-gray-500">
                            PNG, JPG, GIF up to 5MB each
                          </span>
                        </label>
                        <input
                          id="images"
                          type="file"
                          multiple
                          accept="image/*"
                          {...register("images")}
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </div>
                    </div>

                    {/* Image Preview */}
                    {imagePreview.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        {imagePreview.map((src, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={src}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border-2 border-white shadow-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-8">
                  <div className="flex space-x-4">
                    <Link href="/listings/browse">
                      <Button
                        variant="outline"
                        className="px-8 py-3 h-12 border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                      >
                        Cancel
                      </Button>
                    </Link>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-12 py-3 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5 mr-3" />
                          Submit Listing
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
