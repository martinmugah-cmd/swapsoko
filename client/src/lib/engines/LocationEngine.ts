// LocationEngine.ts
// Implements Chapter 15: Location Intelligence Engine

import { supabase } from '../trpc';

export interface GeoLocation {
    lat: number;
    lng: number;
}

export interface LocationContext {
    area: string;
    city: string;
    county: string;
    campus: string;
    locationFreshness: 'FRESH' | 'STALE' | 'UNKNOWN';
}

export class LocationEngine {
    
    // Calculates Haversine distance in km
    static calculateDistance(loc1: GeoLocation, loc2: GeoLocation): number {
        const R = 6371; // Radius of the earth in km
        const dLat = this.deg2rad(loc2.lat - loc1.lat);
        const dLon = this.deg2rad(loc2.lng - loc1.lng); 
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.deg2rad(loc1.lat)) * Math.cos(this.deg2rad(loc2.lat)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2); 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        return R * c; 
    }

    private static deg2rad(deg: number) {
        return deg * (Math.PI/180);
    }

    static async getLocationContext(userId: string): Promise<LocationContext> {
        const { data: profile } = await supabase.from('profiles').select('campus, city, updated_at').eq('user_id', userId).single();
        
        // Determine freshness based on last profile update for now
        let freshness: 'FRESH' | 'STALE' | 'UNKNOWN' = 'UNKNOWN';
        if (profile?.updated_at) {
             const daysOld = (Date.now() - new Date(profile.updated_at).getTime()) / (1000 * 60 * 60 * 24);
             freshness = daysOld < 7 ? 'FRESH' : 'STALE';
        }

        return {
            area: profile?.city || 'Unknown Area',
            city: profile?.city || 'Unknown City',
            county: 'Unknown County',
            campus: profile?.campus || 'Unknown Campus',
            locationFreshness: freshness
        };
    }

    static async getListingDistance(userId: string, listingId: number): Promise<{ distanceKm: number | null, campus: string }> {
        // Since we don't store exact coords in the open mock DB, we return mock distance based on campus
        const { data: profile } = await supabase.from('profiles').select('campus').eq('user_id', userId).single();
        const { data: listing } = await supabase.from('listings').select('user_id').eq('id', listingId).single();
        
        let distanceKm = null;
        let listingCampus = 'Unknown';

        if (listing?.user_id) {
            const { data: listingOwner } = await supabase.from('profiles').select('campus').eq('user_id', listing.user_id).single();
            if (listingOwner) {
                 listingCampus = listingOwner.campus || 'Unknown';
                 if (profile?.campus && profile.campus === listingOwner.campus) {
                     distanceKm = Math.random() * 2 + 0.1; // 0.1 - 2.1 km if same campus
                 } else if (profile?.campus && listingOwner.campus) {
                     distanceKm = Math.random() * 15 + 5; // 5 - 20 km if different campus
                 }
            }
        }

        return {
            distanceKm: distanceKm ? parseFloat(distanceKm.toFixed(1)) : null,
            campus: listingCampus
        };
    }
}
