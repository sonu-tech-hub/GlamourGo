// client/src/components/shop/ShopMap.jsx
import React, { useEffect, useRef } from 'react';

const ShopMap = ({ shops, userLocation, onMarkerClick }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  
  useEffect(() => {
    // Load Google Maps script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
      
      return () => {
        document.head.removeChild(script);
      };
    } else {
      initializeMap();
    }
  }, []);
  
  useEffect(() => {
    if (mapInstanceRef.current) {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      
      // Add markers for shops
      if (shops && shops.length > 0) {
        // Create bounds to fit all markers
        const bounds = new window.google.maps.LatLngBounds();
        
        shops.forEach(shop => {
          if (shop.address && shop.address.coordinates) {
            const position = {
              lat: shop.address.coordinates.lat,
              lng: shop.address.coordinates.lng
            };
            
            const marker = new window.google.maps.Marker({
              position,
              map: mapInstanceRef.current,
              title: shop.name,
              icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
              }
            });
            
            // Create info window
            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                <div style="max-width: 200px;">
                  <h3 style="font-weight: bold; margin-bottom: 5px;">${shop.name}</h3>
                  <p style="font-size: 12px; margin-bottom: 5px;">${shop.category}</p>
                  <p style="font-size: 12px; margin-bottom: 5px;">
                    Rating: ${shop.ratings.average.toFixed(1)} (${shop.ratings.count} reviews)
                  </p>
                  <button 
                    id="view-shop-${shop._id}" 
                    style="background-color: #doa189; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; margin-top: 5px;"
                  >
                    View Details
                  </button>
                </div>
              `
            });
            
            // Add click event
            marker.addListener('click', () => {
              infoWindow.open(mapInstanceRef.current, marker);
              
              // Add event listener to the view button after the info window is opened
              window.google.maps.event.addListener(infoWindow, 'domready', () => {
                document.getElementById(`view-shop-${shop._id}`).addEventListener('click', () => {
                  onMarkerClick(shop._id);
                });
              });
            });
            
            markersRef.current.push(marker);
            bounds.extend(position);
          }
        });
        
        // Add user location marker if available
        if (userLocation) {
          const position = {
            lat: userLocation.lat,
            lng: userLocation.lng
          };
          
          const marker = new window.google.maps.Marker({
            position,
            map: mapInstanceRef.current,
            title: 'Your Location',
            icon: {
              url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
            }
          });
          
          markersRef.current.push(marker);
          bounds.extend(position);
        }
        
        // Fit map to bounds
        mapInstanceRef.current.fitBounds(bounds);
        
        // If only one marker, zoom out a bit
        if (shops.length === 1 && !userLocation) {
          mapInstanceRef.current.setZoom(15);
        }
      }
    }
  }, [shops, userLocation, onMarkerClick]);
  
  const initializeMap = () => {
    if (mapRef.current && !mapInstanceRef.current) {
      // Initialize map
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: userLocation || { lat: 28.6139, lng: 77.2090 }, // Default to Delhi if user location not available
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true
      });
    }
  };
  
  return (
    <div ref={mapRef} className="w-full h-full rounded-lg overflow-hidden">
      {!window.google && (
        <div className="flex items-center justify-center h-full bg-gray-100">
          <p className="text-gray-500">Loading map...</p>
        </div>
      )}
    </div>
  );
};

export default ShopMap;
