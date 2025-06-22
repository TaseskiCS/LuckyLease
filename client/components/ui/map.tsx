"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./map.css";

// Fix for default markers in Next.js
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
}

// Create custom green marker icon using HTML/CSS
const greenIcon = L.divIcon({
  className: "custom-green-marker",
  html: `
    <div style="
      position: relative;
      width: 20px;
      height: 20px;
      background-color: #10b981;
      border: 2px solid #047857;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    ">
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 6px;
        height: 6px;
        background-color: white;
        border-radius: 50%;
      "></div>
      <div style="
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-top: 6px solid #047857;
      "></div>
    </div>
  `,
  iconSize: [20, 26],
  iconAnchor: [10, 26],
  popupAnchor: [0, -26],
});

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
  className?: string;
  fullScreen?: boolean;
  markers?: Array<{
    position: [number, number];
    popup?: string;
    price?: string;
    title?: string;
    id?: string;
    listingUrl?: string;
    rating?: number;
    distance?: string;
  }>;
}

export function Map({
  center = [43.6532, -79.3832], // Downtown Toronto
  zoom = 11,
  height = "400px",
  className = "",
  fullScreen = false,
  markers = [],
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Debug logging
  console.log("Map component received markers:", markers.length);
  console.log("Map markers data:", markers);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize map only once
  useEffect(() => {
    if (!isClient || !mapRef.current || mapInstanceRef.current) return;

    let timeoutId: NodeJS.Timeout;

    const initializeMap = () => {
      if (!mapRef.current || mapInstanceRef.current) return;

      try {
        // Ensure the container has dimensions
        const container = mapRef.current;
        if (container.offsetWidth === 0 || container.offsetHeight === 0) {
          timeoutId = setTimeout(initializeMap, 50);
          return;
        }

        // Initialize map with error handling
        mapInstanceRef.current = L.map(container, {
          preferCanvas: true,
          zoomControl: true,
          attributionControl: true,
          fadeAnimation: false,
          zoomAnimation: false,
          markerZoomAnimation: false,
        }).setView(center, zoom);

        // Add OpenStreetMap tiles
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(mapInstanceRef.current);

        // Force a resize to ensure proper initialization
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 100);
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    initializeMap();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (error) {
          console.error("Error removing map:", error);
        } finally {
          mapInstanceRef.current = null;
        }
      }
    };
  }, [isClient]);

  // Handle view changes separately
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    try {
      mapInstanceRef.current.setView(center, zoom);
    } catch (error) {
      console.error("Error setting map view:", error);
    }
  }, [center, zoom]);

  // Handle markers separately
  useEffect(() => {
    console.log("Map markers useEffect triggered");
    console.log("isClient:", isClient);
    console.log("mapInstanceRef.current exists:", !!mapInstanceRef.current);
    console.log("markers array:", markers);

    if (!isClient || !mapInstanceRef.current) {
      console.log("No client or map instance, skipping marker update");
      return;
    }

    // Add a small delay to ensure map is fully initialized
    const timeoutId = setTimeout(() => {
      if (!mapInstanceRef.current) {
        console.log("Map instance no longer exists after timeout");
        return;
      }

      try {
        console.log("Clearing existing markers");
        // Clear existing markers
        mapInstanceRef.current.eachLayer((layer) => {
          if (layer instanceof L.Marker) {
            mapInstanceRef.current?.removeLayer(layer);
          }
        });

        console.log("Adding", markers.length, "new markers");
        // Add new markers
        const markerGroup = L.featureGroup();

        markers.forEach((marker, index) => {
          console.log(`Processing marker ${index}:`, marker);
          if (mapInstanceRef.current) {
            try {
              const leafletMarker = L.marker(marker.position, {
                icon: greenIcon,
              });

              if (marker.popup || marker.title || marker.price) {
                const popupContent = `
                <div class="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 compact-popup">
                  <div class="p-3">
                    ${
                      marker.title
                        ? `<h3 class="font-semibold text-sm text-gray-900 mb-1 leading-snug line-clamp-2">${marker.title}</h3>`
                        : ""
                    }
                    ${
                      marker.price
                        ? `<div class="flex items-center justify-between mb-2">
                      <span class="text-lg font-bold text-emerald-600">${
                        marker.price
                      }</span>
                      ${
                        marker.rating
                          ? `<div class="flex items-center">
                        <svg class="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                        <span class="ml-1 text-xs text-gray-600">${marker.rating}</span>
                      </div>`
                          : ""
                      }
                    </div>`
                        : ""
                    }
                    ${
                      marker.distance
                        ? `<p class="text-gray-500 text-xs mb-2 flex items-center">
                      <svg class="w-3 h-3 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      ${marker.distance}
                    </p>`
                        : ""
                    }
                    ${
                      marker.popup
                        ? `<p class="text-gray-600 text-xs mb-3 line-clamp-2">${marker.popup}</p>`
                        : ""
                    }                ${
                  marker.listingUrl
                    ? `
                      <a href="${marker.listingUrl}" class="inline-flex items-center justify-center w-full px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-md transition-colors duration-200 no-underline cursor-pointer" style="color: white !important;">
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                        View Details
                      </a>
                    `
                    : ""
                }
                  </div>
                </div>
              `;
                leafletMarker.bindPopup(popupContent, {
                  className: "custom-popup",
                  closeButton: true,
                  maxWidth: 220,
                  minWidth: 200,
                });
              }
              markerGroup.addLayer(leafletMarker);
              console.log(`Marker ${index} added to group`);
            } catch (markerError) {
              console.error("Error creating marker:", markerError);
            }
          }
        });

        // Add marker group to map
        if (markers.length > 0 && mapInstanceRef.current) {
          console.log(
            "Adding marker group to map with",
            markers.length,
            "markers"
          );
          markerGroup.addTo(mapInstanceRef.current);
          console.log("Marker group added to map");

          // If we have multiple markers, fit the map to show all markers with some padding
          if (markers.length > 1) {
            console.log("Fitting bounds for multiple markers");
            try {
              setTimeout(() => {
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.fitBounds(markerGroup.getBounds(), {
                    padding: [20, 20],
                    maxZoom: 13, // Don't zoom in too much even for close markers
                  });
                  console.log("Bounds fitted");
                }
              }, 100);
            } catch (boundsError) {
              console.error("Error fitting bounds:", boundsError);
            }
          }
        } else {
          console.log("No markers to add or no map instance");
        }
      } catch (error) {
        console.error("Error handling markers:", error);
      }
    }, 100); // End of setTimeout

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [markers, isClient]); // Add isClient dependency

  if (!isClient) {
    return (
      <div
        style={{ height }}
        className={`w-full ${
          fullScreen ? "" : "rounded-lg overflow-hidden shadow-lg"
        } bg-gray-100 flex items-center justify-center ${className}`}
      >
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      style={{ height }}
      className={`w-full ${
        fullScreen ? "" : "rounded-lg overflow-hidden shadow-lg"
      } map-container ${className}`}
    />
  );
}
