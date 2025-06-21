'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  Home, 
  Upload, 
  MapPin, 
  DollarSign, 
  Calendar, 
  FileText, 
  Phone,
  MessageCircle,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

interface ListingFormData {
  title: string;
  description: string;
  price: number;
  location: string;
  startDate: string;
  endDate: string;
  contactMethod: 'email' | 'in_app';
  images: FileList;
}

export default function CreateListingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue
  } = useForm<ListingFormData>();

  const watchImages = watch('images');

  // Handle image preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const previews: string[] = [];
      Array.from(files).forEach(file => {
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

  const onSubmit = async (data: ListingFormData) => {
    try {
      setIsSubmitting(true);
      
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('price', data.price.toString());
      formData.append('location', data.location);
      formData.append('startDate', data.startDate);
      formData.append('endDate', data.endDate);
      formData.append('contactMethod', data.contactMethod);
      
      // Add images
      if (data.images) {
        Array.from(data.images).forEach(file => {
          formData.append('images', file);
        });
      }

      // TODO: Replace with actual API call
      const response = await fetch('/api/listings', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('Listing created successfully!');
        router.push('/listings/browse');
      } else {
        throw new Error('Failed to create listing');
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      toast.error('Failed to create listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Home className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">RoomRelay</span>
            </div>
            <Link 
              href="/listings/browse"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Listings
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create Your Listing
            </h1>
            <p className="text-gray-600">
              Share your space with students, interns, and digital nomads
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Basic Information
              </h2>
              
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Listing Title *
                </label>
                <input
                  type="text"
                  {...register('title', { 
                    required: 'Title is required',
                    minLength: { value: 5, message: 'Title must be at least 5 characters' },
                    maxLength: { value: 100, message: 'Title cannot exceed 100 characters' }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Cozy Studio Near Campus - Perfect for Students"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  rows={4}
                  {...register('description', { 
                    required: 'Description is required',
                    minLength: { value: 20, message: 'Description must be at least 20 characters' },
                    maxLength: { value: 1000, message: 'Description cannot exceed 1000 characters' }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Describe your space, amenities, neighborhood, and what makes it special..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>
            </div>

            {/* Location & Pricing */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Location & Pricing
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address/Location *
                  </label>
                  <input
                    type="text"
                    {...register('location', { 
                      required: 'Location is required',
                      minLength: { value: 2, message: 'Location must be at least 2 characters' },
                      maxLength: { value: 100, message: 'Location cannot exceed 100 characters' }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Downtown Toronto, ON"
                  />
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Price (CAD) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('price', { 
                        required: 'Price is required',
                        min: { value: 0, message: 'Price must be greater than 0' }
                      })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1200.00"
                    />
                  </div>
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sublease Duration */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Sublease Duration
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available From *
                  </label>
                  <input
                    type="date"
                    {...register('startDate', { required: 'Start date is required' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                  )}
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Until *
                  </label>
                  <input
                    type="date"
                    {...register('endDate', { required: 'End date is required' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Photos
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Images (Max 10)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="images" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
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
                      {...register('images')}
                      onChange={(e) => {
                        register('images').onChange(e);
                        handleImageChange(e);
                      }}
                      className="hidden"
                    />
                  </div>
                </div>
                
                {/* Image Preview */}
                {imagePreview.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {imagePreview.map((src, index) => (
                      <div key={index} className="relative">
                        <img
                          src={src}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Contact Method */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Contact Preferences
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How would you like to be contacted? *
                </label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="in_app"
                      {...register('contactMethod', { required: 'Please select a contact method' })}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <div className="flex items-center">
                        <MessageCircle className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">In-App Messaging</span>
                      </div>
                      <p className="text-sm text-gray-500">Communicate through RoomRelay's secure messaging</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="email"
                      {...register('contactMethod', { required: 'Please select a contact method' })}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">Email Contact</span>
                      </div>
                      <p className="text-sm text-gray-500">Share your email with interested renters</p>
                    </div>
                  </label>
                </div>
                {errors.contactMethod && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactMethod.message}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6">
              <Link 
                href="/listings/browse"
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Creating Listing...' : 'Create Listing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
