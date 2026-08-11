import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon issue
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

export interface LocationData {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description: string;
  imageUrl?: string;
  icon?: L.Icon | L.DivIcon;
}

interface MapProps {
  locations?: LocationData[];
  center?: [number, number];
  userLocation?: [number, number];
  zoom?: number;
  onMarkerClick?: (location: LocationData) => void;
  className?: string;
}

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export function Map({ locations = [], center = [-1.1018, 37.0144], userLocation, zoom = 14, onMarkerClick, className = "h-[400px] w-full rounded-3xl" }: MapProps) {
  // Default to JKUAT Juja if no center provided
  
  return (
    <div className={`overflow-hidden shadow-sm border border-gray-200 z-0 relative ${className}`}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <ChangeView center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {locations.map((loc) => (
          <Marker 
            key={loc.id} 
            position={[loc.lat, loc.lng]}
            icon={loc.icon}
            eventHandlers={{
              click: () => onMarkerClick && onMarkerClick(loc),
            }}
          >
            <Popup>
              <div className="text-center w-32">
                {loc.imageUrl && (
                  <img src={loc.imageUrl} alt={loc.title} className="w-full h-20 object-cover rounded-2xl mb-2" />
                )}
                <h3 className="font-bold text-xs">{loc.title}</h3>
                <p className="text-xs text-gray-500 truncate">{loc.description}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {userLocation && (
          <Marker
            position={userLocation}
            icon={L.divIcon({
              className: 'custom-user-marker',
              html: `<div class="relative flex h-6 w-6 items-center justify-center">
                       <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                       <span class="relative inline-flex rounded-full h-3 w-3 bg-blue-500 border-2 border-white shadow"></span>
                     </div>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            })}
          >
            <Popup>
              <div className="text-center font-bold text-xs text-slate-900">You are here</div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
