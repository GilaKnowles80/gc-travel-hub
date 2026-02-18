import React, { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { toast } from 'sonner';

export function useUserLocation() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocode to get country
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();
          
          setLocation({
            latitude,
            longitude,
            country_code: data.address?.country_code?.toUpperCase() || 'US',
            country_name: data.address?.country || 'Unknown',
            city: data.address?.city || data.address?.town || '',
            accuracy: position.coords.accuracy
          });
        } catch (err) {
          console.error('Geocoding error:', err);
          setLocation({
            latitude,
            longitude,
            country_code: 'US',
            country_name: 'Unknown',
            accuracy: position.coords.accuracy
          });
        }
        
        setLoading(false);
      },
      (err) => {
        console.error('Location error:', err);
        setError(err.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // Cache for 5 minutes
      }
    );
  };

  return { location, loading, error, getLocation };
}

export function LocationPrompt({ onLocationCaptured }) {
  const { location, loading, error, getLocation } = useUserLocation();

  useEffect(() => {
    if (location) {
      onLocationCaptured(location);
    }
  }, [location]);

  if (location) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <MapPin className="w-5 h-5 text-amber-600 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-amber-900 mb-1">
            Get Location-Based Pricing
          </h4>
          <p className="text-sm text-amber-700 mb-3">
            Allow location access to see prices optimized for your region
          </p>
          <button
            onClick={getLocation}
            disabled={loading}
            className="text-sm bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 disabled:opacity-50"
          >
            {loading ? 'Getting location...' : 'Enable Location'}
          </button>
          {error && (
            <p className="text-xs text-red-600 mt-2">
              {error} - Using default pricing
            </p>
          )}
        </div>
      </div>
    </div>
  );
}