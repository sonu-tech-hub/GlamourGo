// pages/ShopDiscovery.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { FaSearch, FaMapMarkerAlt, FaStar, FaHeart } from 'react-icons/fa';
import { searchShops } from '../services/shopService';
import ShopCard from '../components/ShopCard';
import Map from '../components/Map';
import Filters from '../components/Filters';

const ShopDiscovery = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
  const [filters, setFilters] = useState({
    category: '',
    priceRange: [0, 5000],
    rating: 0,
    services: [],
    sortBy: 'popularity'
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState(null);
  
  const shopListRef = useRef(null);
  const navigate = useNavigate();
  const { search } = useLocation();
  
  useEffect(() => {
    // Parse query parameters
    const params = new URLSearchParams(search);
    const category = params.get('category') || '';
    const query = params.get('query') || '';
    
    if (category) {
      setFilters(prev => ({ ...prev, category }));
    }
    
    if (query) {
      setSearchQuery(query);
    }
    
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
    
    // Initial search
    fetchShops();
  }, [search]);
  
  useEffect(() => {
    // Animate shop list when it loads
    if (shops.length > 0 && shopListRef.current) {
      gsap.from(shopListRef.current.children, {
        y: 50,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: "power3.out"
      });
    }
  }, [shops]);
  
  const fetchShops = async () => {
    setLoading(true);
    try {
      const response = await searchShops({
        query: searchQuery,
        location,
        filters
      });
      setShops(response.data);
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    fetchShops();
  };
  
  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };
  
  const applyFilters = () => {
    fetchShops();
  };
  
  const toggleFavorite = async (shopId) => {
    // Toggle favorite logic
  };
  
  return (
    <div className="min-h-screen bg-[#fef4ea]">
      <div className="container mx-auto px-4 py-8">
        {/* Search bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-wrap md:flex-nowrap gap-2">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search for salons, spas, services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 pl-10 border border-[#b0b098] rounded-lg"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#a38772]" />
            </div>
            
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Location"
                className="w-full p-3 pl-10 border border-[#b0b098] rounded-lg"
              />
              <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#a38772]" />
            </div>
            
            <button
              type="submit"
              className="bg-[#doa189] hover:bg-[#ecdfcf] text-white font-bold py-3 px-6 rounded-lg transition duration-300"
            >
              Search
            </button>
          </form>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters sidebar */}
          <div className="w-full md:w-64 bg-white rounded-lg shadow-md p-4 h-fit">
            <h3 className="text-xl font-bold mb-4 text-[#a38772]">Filters</h3>
            
            <Filters
              filters={filters}
              onChange={handleFilterChange}
              onApply={applyFilters}
            />
          </div>
          
          {/* Main content */}
          <div className="flex-grow">
            {/* View toggle and sort */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-[#doa189] text-white' : 'bg-white'}`}
                >
                  Grid View
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 rounded ${viewMode === 'map' ? 'bg-[#doa189] text-white' : 'bg-white'}`}
                >
                  Map View
                </button>
              </div>
              
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                className="p-2 border border-[#b0b098] rounded-lg"
              >
                <option value="popularity">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="distance">Nearest</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
              </select>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="loader">Loading...</div>
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div ref={shopListRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {shops.length > 0 ? (
                      shops.map((shop) => (
                        <ShopCard
                          key={shop._id}
                          shop={shop}
                          onFavoriteToggle={() => toggleFavorite(shop._id)}
                          onClick={() => navigate(`/shop/${shop._id}`)}
                        />
                      ))
                    ) : (
                      <div className="col-span-full text-center py-10">
                        <h3 className="text-xl font-semibold">No shops found matching your criteria</h3>
                        <p className="mt-2 text-gray-600">Try adjusting your filters or search term</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-[600px] bg-white rounded-lg shadow-md overflow-hidden">
                    <Map
                      shops={shops}
                      userLocation={location}
                      onMarkerClick={(shopId) => navigate(`/shop/${shopId}`)}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopDiscovery;