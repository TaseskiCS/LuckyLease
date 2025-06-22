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
  // Debug logging
  console.log("InteractiveMap received listings:", listings.length);
  console.log("InteractiveMap listings data:", listings);

  // Calculate map center and zoom based on listings
  const getMapCenterAndZoom = (): {
    center: [number, number];
    zoom: number;
  } => {
    if (listings.length === 0) {
      // Default to North America view when no listings
      return { center: [45.0, -100.0], zoom: 4 };
    }

    if (listings.length === 1) {
      // Single listing - center on it with moderate zoom
      return { center: listings[0].position, zoom: 12 };
    }

    // Calculate bounding box for multiple listings
    const lats = listings.map((listing) => listing.position[0]);
    const lngs = listings.map((listing) => listing.position[1]);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    // Calculate center
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;

    // Calculate zoom level based on the span
    const latSpan = maxLat - minLat;
    const lngSpan = maxLng - minLng;
    const maxSpan = Math.max(latSpan, lngSpan);

    // Determine zoom level based on span (with some padding)
    let zoom = 10; // Default zoom
    if (maxSpan > 20) zoom = 4; // Very wide spread
    else if (maxSpan > 10) zoom = 5; // Wide spread
    else if (maxSpan > 5) zoom = 6; // Large spread
    else if (maxSpan > 2) zoom = 7; // Medium spread
    else if (maxSpan > 1) zoom = 8; // Small spread
    else if (maxSpan > 0.5) zoom = 9; // Very small spread
    else zoom = 10; // Tight clustering

    return { center: [centerLat, centerLng] as [number, number], zoom };
  };

  const { center: mapCenter, zoom: mapZoom } = getMapCenterAndZoom();

  const markers = listings.map((listing) => ({
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
