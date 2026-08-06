import { useEffect, useRef } from 'react';
import { useAppStore } from '@/store';
import { supabase } from '@/lib/supabase';

// Utility to calculate distance in km between two lat/lng pairs
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; 
  return d;
}

export function useLocationTracker() {
  const user = useAppStore(state => state.user);
  const setFilters = useAppStore(state => state.setFilters);
  const lastUpdateRef = useRef<{ lat: number, lng: number } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    let watchId: number;

    const startTracking = () => {
      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Update global state immediately
          setFilters({ coords: { lat: latitude, lng: longitude } });

          if (!user?.id) return;

          // Only update backend if moved more than 100 meters (0.1 km)
          if (lastUpdateRef.current) {
             const dist = getDistanceFromLatLonInKm(lastUpdateRef.current.lat, lastUpdateRef.current.lng, latitude, longitude);
             if (dist < 0.1) return;
          }
          
          lastUpdateRef.current = { lat: latitude, lng: longitude };

          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            if (data && data.display_name) {
              const name = data.name || data.display_name.split(',')[0];
              const county = data.display_name.split(',').slice(-2).join(',').trim();
              const campusName = `${name}, ${county}`;
              
              // Update profile silently
              const newMetadata = { locationName: campusName };
              supabase.auth.updateUser({ data: newMetadata });
            }
          } catch(e) {}
        },
        (error) => {
          console.error("Location tracking error:", error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    };

    startTracking();

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [user?.id]);
}
