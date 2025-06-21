"use client";

import dynamic from "next/dynamic";
import { ComponentProps } from "react";

// Import Map component with SSR disabled
const Map = dynamic(
  () => import("./map").then((mod) => ({ default: mod.Map })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    ),
  }
);

interface InteractiveMapProps {
  height?: string;
  className?: string;
  fullScreen?: boolean;
  listings?: Array<{
    id: string;
    position: [number, number];
    title: string;
    price: string;
    description?: string;
    listingUrl?: string;
    rating?: number;
    distance?: string;
  }>;
}

export function InteractiveMap({
  height = "500px",
  className = "",
  fullScreen = false,
  listings = [],
}: InteractiveMapProps) {
  // GTA map centered on Toronto
  const mapCenter: [number, number] = [43.6532, -79.3832]; // Downtown Toronto
  const mapZoom = 11;
  // GTA test listings with various universities and locations
  const sampleListings = [
    {
      id: "1",
      position: [43.6629, -79.3957] as [number, number], // University of Toronto (St. George)
      title: "Modern Studio Near UofT",
      price: "$1,800/month",
      description: "Fully furnished studio apartment perfect for students",
      distance: "0.2 km from University of Toronto",
      rating: 4.9,
      listingUrl: "/listings/1",
    },
    {
      id: "2",
      position: [43.7735, -79.5019] as [number, number], // York University
      title: "Shared 2BR at York Village",
      price: "$950/month",
      description: "Spacious room in a shared apartment with great amenities",
      distance: "0.1 km from York University",
      rating: 4.7,
      listingUrl: "/listings/2",
    },
  ];

  const allListings = [...sampleListings, ...listings];

  const markers = allListings.map((listing) => ({
    position: listing.position,
    title: listing.title,
    price: listing.price,
    popup: listing.description,
    id: listing.id,
    listingUrl: listing.listingUrl,
    rating: listing.rating,
    distance: listing.distance,
  }));
  return (
    <div className={`w-full ${className}`}>
      <Map
        center={mapCenter}
        zoom={mapZoom}
        height={height}
        markers={markers}
        fullScreen={fullScreen}
        className={fullScreen ? "" : "border border-gray-200"}
      />
    </div>
  );
}
