// client/src/pages/ShopsPage.jsx (continued)
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaFilter, FaSortAmountDown, FaList, FaThLarge, FaSpinner , FaStore} from 'react-icons/fa';
import toast from 'react-hot-toast';

import api from '../services/api';
import ShopCard from '../components/shop/ShopCard';
import ShopListItem from '../components/shop/ShopListItem';
import ShopMap from '../components/shop/ShopMap';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import RangeSlider from '../components/common/RangeSlider';

const ShopsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get search params from URL
  const searchParams = new URLSearchParams(location.search);
  const initialCategory = searchParams.get('category') || '';
  const initialQuery = searchParams.get('query') || '';
  const initialLocation = searchParams.get('location') || '';
  
  // State
  const [shops, setShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', or 'map'
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [locationQuery, setLocationQuery] = useState(initialLocation);
  const [userLocation, setUserLocation] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [priceRangeFilter, setPriceRangeFilter] = useState([0, 5000]);
  const [sortBy, setSortBy] = useState('rating'); // 'rating', 'popularity', 'priceAsc', 'priceDesc'
  
  // Load shops based on search params
  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
    
    fetchShops();
  }, [location.search]);
  
  // Apply filters when filter state changes
  useEffect(() => {
    applyFilters();
  }, [shops, categoryFilter, ratingFilter, priceRangeFilter, sortBy]);
  
  const fetchShops = async () => {
    setIsLoading(true);
    try {
      let endpoint = '/shops';
      let params = {};
      
      // Add search query if present
      if (initialQuery) {
        endpoint = '/shops/search';
        params.query = initialQuery;
      }
      
      // Add location if present
      if (initialLocation) {
        params.location = initialLocation;
      }
      
      // Add category if present
      if (initialCategory) {
        params.category = initialCategory;
      }
      
      const response = await api.get(endpoint, { params });
      setShops(response.data.shops || []);
      
      // Extract unique categories
      if (response.data.shops) {
        const uniqueCategories = [...new Set(response.data.shops.map(shop => shop.category))];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
      toast.error('Failed to load shops');
      setShops([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const applyFilters = () => {
    // Start with all shops
    let filtered = [...shops];
    
    // Filter by category
    if (categoryFilter) {
      filtered = filtered.filter(shop => shop.category === categoryFilter);
    }
    
    // Filter by rating
    if (ratingFilter > 0) {
      filtered = filtered.filter(shop => shop.ratings.average >= ratingFilter);
    }
    
    // Filter by price range (using minimum price of services)
    filtered = filtered.filter(shop => {
      if (!shop.services || shop.services.length === 0) return true;
      
      const minPrice = Math.min(...shop.services.map(service => service.price));
      return minPrice >= priceRangeFilter[0] && minPrice <= priceRangeFilter[1];
    });
    
    // Apply sorting
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.ratings.average - a.ratings.average);
        break;
      case 'popularity':
        filtered.sort((a, b) => (b.ratings.count * b.ratings.average) - (a.ratings.count * a.ratings.average));
        break;
      case 'priceAsc':
        filtered.sort((a, b) => {
          const aMinPrice = a.services && a.services.length ? Math.min(...a.services.map(service => service.price)) : 0;
          const bMinPrice = b.services && b.services.length ? Math.min(...b.services.map(service => service.price)) : 0;
          return aMinPrice - bMinPrice;
        });
        break;
      case 'priceDesc':
        filtered.sort((a, b) => {
          const aMinPrice = a.services && a.services.length ? Math.min(...a.services.map(service => service.price)) : 0;
          const bMinPrice = b.services && b.services.length ? Math.min(...b.services.map(service => service.price)) : 0;
          return bMinPrice - aMinPrice;
        });
        break;
      default:
        filtered.sort((a, b) => b.ratings.average - a.ratings.average);
    }
    
    setFilteredShops(filtered);
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    
    // Build query params
    const params = new URLSearchParams();
    
    if (searchQuery) {
      params.append('query', searchQuery);
    }
    
    if (locationQuery) {
      params.append('location', locationQuery);
    }
    
    // Navigate to the same page with new search params
    navigate({
      pathname: '/shops',
      search: params.toString()
    });
  };
  
  const handleCategoryClick = (category) => {
    setCategoryFilter(category === categoryFilter ? '' : category);
  };
  
  const toggleFavorite = async (shopId) => {
    try {
      await api.post(`/shops/${shopId}/toggle-favorite`);
      
      // Update UI by toggling the isFavorite property
      setShops(prevShops =>
        prevShops.map(shop =>
          shop._id === shopId
            ? { ...shop, isFavorite: !shop.isFavorite }
            : shop
        )
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites. Please try again.');
    }
  };
  
  const resetFilters = () => {
    setCategoryFilter('');
    setRatingFilter(0);
    setPriceRangeFilter([0, 5000]);
    setSortBy('rating');
  };
  
  return (
    <div className="bg-[#fef4ea] min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-[#a38772] mb-6">
          {initialCategory 
            ? `${initialCategory.charAt(0).toUpperCase() + initialCategory.slice(1)} Shops`
            : initialQuery
            ? `Search Results for "${initialQuery}"`
            : 'Find Beauty & Wellness Services'}
        </h1>
        
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-grow">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for salon, spa, service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#doa189]"
              />
            </div>
            
            <div className="relative flex-grow">
              <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Location"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#doa189]"
              />
            </div>
            
            <button
              type="submit"
              className="bg-[#doa189] hover:bg-[#ecdfcf] text-[#a38772] border-x-2 font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Search
            </button>
          </form>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#a38772]">Filters</h2>
                <button 
                  onClick={resetFilters}
                  className="text-sm text-[#doa189] hover:underline"
                >
                  Reset All
                </button>
              </div>
              
              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-2">Categories</h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => handleCategoryClick(category)}
                      className={`block w-full text-left px-3 py-2 rounded-lg ${
                        categoryFilter === category
                          ? 'bg-[#fef4ea] text-[#doa189] font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Rating Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-2">Minimum Rating</h3>
                <div className="space-y-2">
                  {[0, 3, 3.5, 4, 4.5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setRatingFilter(rating)}
                      className={`block w-full text-left px-3 py-2 rounded-lg ${
                        ratingFilter === rating
                          ? 'bg-[#fef4ea] text-[#doa189] font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {rating === 0 ? 'Any Rating' : (
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="text-yellow-400">
                              {i < Math.floor(rating) ? '★' : i < Math.ceil(rating) ? '★' : '☆'}
                            </span>
                          ))}
                          <span className="ml-1">& Above</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Price Range Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-2">Price Range</h3>
                <RangeSlider
                  min={0}
                  max={5000}
                  step={100}
                  value={priceRangeFilter}
                  onChange={setPriceRangeFilter}
                  formatLabel={(value) => `₹${value}`}
                />
              </div>
              
              {/* Sort By */}
              <div className="mb-4">
                <h3 className="font-medium text-gray-700 mb-2">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#doa189]"
                >
                  <option value="rating">Highest Rated</option>
                  <option value="popularity">Most Popular</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Toggle Filters (Mobile) */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-center bg-white py-2 px-4 rounded-lg shadow-md text-[#a38772]"
              >
                <FaFilter className="mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>
            
            {/* View Controls */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-3 sm:mb-0">
                  <p className="text-gray-600">
                    {filteredShops.length} {filteredShops.length === 1 ? 'shop' : 'shops'} found
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 text-sm mr-2">View:</span>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-[#fef4ea] text-[#doa189]' : 'text-gray-500 hover:bg-gray-100'}`}
                    title="Grid View"
                  >
                    <FaThLarge />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-[#fef4ea] text-[#doa189]' : 'text-gray-500 hover:bg-gray-100'}`}
                    title="List View"
                  >
                    <FaList />
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`p-2 rounded ${viewMode === 'map' ? 'bg-[#fef4ea] text-[#doa189]' : 'text-gray-500 hover:bg-gray-100'}`}
                    title="Map View"
                  >
                    <FaMapMarkerAlt />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Shops List */}
            {isLoading ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <LoadingSpinner />
                <p className="text-gray-500 mt-4">Loading shops...</p>
              </div>
            ) : filteredShops.length > 0 ? (
              viewMode === 'map' ? (
                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="h-[600px]">
                    <ShopMap
                      shops={filteredShops}
                      userLocation={userLocation}
                      onMarkerClick={(shopId) => navigate(`/shop/${shopId}`)}
                    />
                  </div>
                </div>
              ) : viewMode === 'list' ? (
                <div className="space-y-4">
                  {filteredShops.map(shop => (
                    <ShopListItem
                      key={shop._id}
                      shop={shop}
                      isFavorite={shop.isFavorite}
                      onFavoriteToggle={() => toggleFavorite(shop._id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredShops.map(shop => (
                    <ShopCard
                      key={shop._id}
                      shop={shop}
                      isFavorite={shop.isFavorite}
                      onFavoriteToggle={() => toggleFavorite(shop._id)}
                    />
                  ))}
                </div>
              )
            ) : (
              <EmptyState
                icon={<FaStore className="text-6xl" />}
                title="No Shops Found"
                message="We couldn't find any shops matching your criteria. Try adjusting your filters or search for something else."
                actionText={<span className='text-[#a38772]'>Reset Filters</span>}
                onActionClick={resetFilters}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopsPage;
