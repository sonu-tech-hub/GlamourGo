// client/src/pages/user/Favorites.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaSearch, FaFilter } from 'react-icons/fa';
import toast from 'react-hot-toast';

import api from '../../services/api';
import ShopCard from '../../components/shop/ShopCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [filteredFavorites, setFilteredFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState([]);
  
  useEffect(() => {
    fetchFavorites();
  }, []);
  
  useEffect(() => {
    // Apply filters
    let filtered = [...favorites];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(shop => 
        shop.name.toLowerCase().includes(query) ||
        shop.category.toLowerCase().includes(query)
      );
    }
    
    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(shop => shop.category === categoryFilter);
    }
    
    setFilteredFavorites(filtered);
  }, [favorites, searchQuery, categoryFilter]);
  
  const fetchFavorites = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/shops/favorites');
      setFavorites(response.data);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(response.data.map(shop => shop.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error('Failed to load favorite shops');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRemoveFavorite = (shopId) => {
    // Update UI first for better responsiveness
    setFavorites(prevFavorites => prevFavorites.filter(shop => shop._id !== shopId));
    
    // Then update in the backend
    api.post(`/shops/${shopId}/toggle-favorite`)
      .catch(error => {
        console.error('Error removing from favorites:', error);
        toast.error('Failed to remove from favorites');
        // Restore the original list on error
        fetchFavorites();
      });
  };
  
  return (
    <div className="bg-[#fef4ea] min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-[#a38772] mb-6">
          My Favorite Shops
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Filters */}
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mb-6">
            {/* Search */}
            <div className="relative flex-grow">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search favorite shops"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#doa189]"
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex items-center">
              <FaFilter className="text-gray-400 mr-2" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-2 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#doa189]"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Favorites List */}
          {isLoading ? (
            <div className="text-center py-8">
              <LoadingSpinner />
              <p className="text-gray-500 mt-3">Loading favorite shops...</p>
            </div>
          ) : filteredFavorites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFavorites.map(shop => (
                <ShopCard
                  key={shop._id}
                  shop={shop}
                  isFavorite={true}
                  onFavoriteToggle={() => handleRemoveFavorite(shop._id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<FaHeart className="text-6xl" />}
              title={
                searchQuery || categoryFilter !== 'all'
                  ? "No Matches Found"
                  : "No Favorite Shops Yet"
              }
              message={
                searchQuery || categoryFilter !== 'all'
                  ? "No favorite shops match your filters. Try adjusting your search or filters."
                  : "You haven't added any shops to your favorites list yet. Explore shops and mark your favorites!"
              }
              actionText={
                searchQuery || categoryFilter !== 'all'
                  ? <span className=" text-[#875e2c] px-4 py-2 rounded-md cursor-pointer">Clear Filters </span>
                  : <span className=" text-[#875e2c] px-4 py-2 rounded-md cursor-pointer">Explore Shops</span>
              }
              actionLink={
                searchQuery || categoryFilter !== 'all'
                  ? null
                  : "/shops"
              }
              onActionClick={
                searchQuery || categoryFilter !== 'all'
                  ? () => {
                      setSearchQuery('');
                      setCategoryFilter('all');
                    }
                  : null
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Favorites;