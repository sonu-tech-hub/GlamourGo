// client/src/pages/vendor/ShopPromotionsPage.jsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';

import {
    getShopPromotionsForOwner,
    createPromotion,
    updatePromotion, // Make sure this is correctly imported
    deletePromotion,
} from '../../services/promotionService';
import { getAllShops } from '../../services/shopService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmationModal from '../../components/common/ConfirmationModal';

// --- Add/Edit Promotion Modal Component ---
// (No changes needed here based on the description, assuming it correctly passes formData and isSaving)
const AddEditPromotionModal = ({ isOpen, onClose, onSave, promotion, shopId, isSaving, shopIdLoading }) => {
    const isEditing = !!promotion;
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        couponCode: '',
        type: 'percentage',
        value: '',
        minSpend: '',
        usageLimit: '',
        usagePerCustomer: '',
        startDate: '',
        endDate: '',
        isActive: true,
        applicableServices: [],
    });
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        if (isOpen && isEditing && promotion) {
            setFormData({
                title: promotion.title || '',
                description: promotion.description || '',
                couponCode: promotion.couponCode || '',
                type: promotion.type || 'percentage',
                value: promotion.value || '',
                minSpend: promotion.minSpend || '',
                usageLimit: promotion.usageLimit || '',
                usagePerCustomer: promotion.usagePerCustomer || '',
                startDate: promotion.startDate ? format(parseISO(promotion.startDate), 'yyyy-MM-dd') : '',
                endDate: promotion.endDate ? format(parseISO(promotion.endDate), 'yyyy-MM-dd') : '',
                isActive: promotion.isActive ?? true,
                applicableServices: promotion.applicableServices || [],
            });
            setFormErrors({});
        } else if (isOpen && !isEditing) {
            setFormData({
                title: '', description: '', couponCode: '', type: 'percentage', value: '',
                minSpend: '', usageLimit: '', usagePerCustomer: '', startDate: '', endDate: '',
                isActive: true, applicableServices: []
            });
            setFormErrors({});
        }
    }, [isOpen, isEditing, promotion]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.title.trim()) errors.title = 'Title is required.';
        if (!formData.couponCode.trim()) errors.couponCode = 'Coupon Code is required.';
        if (isNaN(parseFloat(formData.value)) || parseFloat(formData.value) <= 0) errors.value = 'Value must be a positive number.';
        if (formData.type === 'percentage' && (parseFloat(formData.value) > 100)) errors.value = 'Percentage cannot exceed 100.';
        if (formData.minSpend && (isNaN(parseFloat(formData.minSpend)) || parseFloat(formData.minSpend) < 0)) errors.minSpend = 'Min spend must be a non-negative number.';
        if (formData.usageLimit && (isNaN(parseInt(formData.usageLimit)) || parseInt(formData.usageLimit) <= 0)) errors.usageLimit = 'Usage limit must be a positive integer.';
        if (formData.usagePerCustomer && (isNaN(parseInt(formData.usagePerCustomer)) || parseInt(formData.usagePerCustomer) <= 0)) errors.usagePerCustomer = 'Usage per customer must be a positive integer.';
        if (!formData.startDate) errors.startDate = 'Start Date is required.';
        if (formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) errors.endDate = 'End Date cannot be before Start Date.';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!shopId || shopIdLoading) {
            toast.error("Shop ID is still loading or not available. Please wait.");
            return;
        }

        if (!validateForm()) {
            toast.error('Please correct the form errors.');
            return;
        }

        const dataToSave = {
            ...formData,
            value: parseFloat(formData.value),
            minSpend: formData.minSpend ? parseFloat(formData.minSpend) : 0,
            usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
            usagePerCustomer: formData.usagePerCustomer ? parseInt(formData.usagePerCustomer) : undefined,
            // Convert dates to ISO strings if needed by backend, though 'yyyy-MM-dd' is often fine too
            startDate: formData.startDate ? new Date(formData.startDate).toISOString() : '',
            endDate: formData.endDate ? new Date(formData.endDate).toISOString() : '',
        };

        // Pass the prepared data to the onSave prop
        onSave(dataToSave, isEditing, promotion?._id);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-[#a38772] mb-4">
                    {isEditing ? 'Edit Promotion' : 'Create New Promotion'}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                            <input
                                type="text"
                                name="title"
                                id="title"
                                value={formData.title}
                                onChange={handleChange}
                                className={`mt-1 block w-full border ${formErrors.title ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2 focus:ring-[#a38772] focus:border-[#a38772]`}
                                required
                            />
                            {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>}
                        </div>

                        <div>
                            <label htmlFor="couponCode" className="block text-sm font-medium text-gray-700">Coupon Code</label>
                            <input
                                type="text"
                                name="couponCode"
                                id="couponCode"
                                value={formData.couponCode}
                                onChange={handleChange}
                                className={`mt-1 block w-full border ${formErrors.couponCode ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2 focus:ring-[#a38772] focus:border-[#a38772]`}
                                required
                            />
                            {formErrors.couponCode && <p className="text-red-500 text-xs mt-1">{formErrors.couponCode}</p>}
                        </div>

                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Discount Type</label>
                            <select
                                name="type"
                                id="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#a38772] focus:border-[#a38772]"
                            >
                                <option value="percentage">Percentage</option>
                                <option value="fixed">Fixed Amount</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="value" className="block text-sm font-medium text-gray-700">Discount Value</label>
                            <input
                                type="number"
                                name="value"
                                id="value"
                                value={formData.value}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                className={`mt-1 block w-full border ${formErrors.value ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2 focus:ring-[#a38772] focus:border-[#a38772]`}
                                required
                            />
                            {formErrors.value && <p className="text-red-500 text-xs mt-1">{formErrors.value}</p>}
                        </div>

                        <div>
                            <label htmlFor="minSpend" className="block text-sm font-medium text-gray-700">Minimum Spend (Optional)</label>
                            <input
                                type="number"
                                name="minSpend"
                                id="minSpend"
                                value={formData.minSpend}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                className={`mt-1 block w-full border ${formErrors.minSpend ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2 focus:ring-[#a38772] focus:border-[#a38772]`}
                            />
                            {formErrors.minSpend && <p className="text-red-500 text-xs mt-1">{formErrors.minSpend}</p>}
                        </div>

                        <div>
                            <label htmlFor="usageLimit" className="block text-sm font-medium text-gray-700">Total Usage Limit (Optional)</label>
                            <input
                                type="number"
                                name="usageLimit"
                                id="usageLimit"
                                value={formData.usageLimit}
                                onChange={handleChange}
                                min="1"
                                step="1"
                                className={`mt-1 block w-full border ${formErrors.usageLimit ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2 focus:ring-[#a38772] focus:border-[#a38772]`}
                            />
                            {formErrors.usageLimit && <p className="text-red-500 text-xs mt-1">{formErrors.usageLimit}</p>}
                        </div>

                        <div>
                            <label htmlFor="usagePerCustomer" className="block text-sm font-medium text-gray-700">Usage Per Customer (Optional)</label>
                            <input
                                type="number"
                                name="usagePerCustomer"
                                id="usagePerCustomer"
                                value={formData.usagePerCustomer}
                                onChange={handleChange}
                                min="1"
                                step="1"
                                className={`mt-1 block w-full border ${formErrors.usagePerCustomer ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2 focus:ring-[#a38772] focus:border-[#a38772]`}
                            />
                            {formErrors.usagePerCustomer && <p className="text-red-500 text-xs mt-1">{formErrors.usagePerCustomer}</p>}
                        </div>

                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                            <input
                                type="date"
                                name="startDate"
                                id="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                className={`mt-1 block w-full border ${formErrors.startDate ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2 focus:ring-[#a38772] focus:border-[#a38772]`}
                                required
                            />
                            {formErrors.startDate && <p className="text-red-500 text-xs mt-1">{formErrors.startDate}</p>}
                        </div>

                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date (Optional)</label>
                            <input
                                type="date"
                                name="endDate"
                                id="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                min={formData.startDate}
                                className={`mt-1 block w-full border ${formErrors.endDate ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2 focus:ring-[#a38772] focus:border-[#a38772]`}
                            />
                            {formErrors.endDate && <p className="text-red-500 text-xs mt-1">{formErrors.endDate}</p>}
                        </div>
                    </div>

                    <div className="mt-4">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                        <textarea
                            name="description"
                            id="description"
                            rows="3"
                            value={formData.description}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#a38772] focus:border-[#a38772]"
                        ></textarea>
                    </div>

                    <div className="mt-4 flex items-center">
                        <input
                            type="checkbox"
                            name="isActive"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={handleChange}
                            className="h-4 w-4 text-[#a38772] border-gray-300 rounded focus:ring-[#a38772]"
                        />
                        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Is Active</label>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            disabled={isSaving || shopIdLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#a38772] hover:bg-[#8e7360] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a38772] disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSaving || shopIdLoading}
                        >
                            {isSaving ? 'Saving...' : (isEditing ? 'Update Promotion' : 'Create Promotion')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const PromotionsPage = () => {
    const { user } = useAuth();
    const [shopId, setShopId] = useState('');
    const [promotions, setPromotions] = useState([]);
    const [filteredPromotions, setFilteredPromotions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isShopIdLoading, setIsShopIdLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');

    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
    const [selectedPromotion, setSelectedPromotion] = useState(null);

    // --- Fetch Vendor's Shop ID ---
    useEffect(() => {
        const fetchVendorShop = async () => {
            setIsShopIdLoading(true);
            try {
                const userId = user?.user?.id;
                const userType = user?.user?.userType;

                if (!userId || userType !== 'vendor') {
                    setIsShopIdLoading(false);
                    setIsLoading(false);
                    toast.error('Only vendors can access this page.');
                    return;
                }

                const response = await getAllShops();
                const allShops = response.data.shops;
                const vendorShop = allShops.find(shop => shop.owner === userId);

                if (!vendorShop) {
                    toast.error('No shop found for your vendor account. Please create one.');
                    setShopId('');
                    setIsShopIdLoading(false);
                    setIsLoading(false);
                    return;
                }
                setShopId(vendorShop._id);
                setIsShopIdLoading(false);
            } catch (error) {
                console.error('Failed to fetch shop for vendor:', error);
                toast.error('Unable to find your shop. Please try again later.');
                setShopId('');
                setIsShopIdLoading(false);
                setIsLoading(false);
            }
        };

        if (user) {
            fetchVendorShop();
        } else {
            setIsShopIdLoading(false);
            setIsLoading(false);
        }
    }, [user]);

    // --- Fetch Promotions once shopId is available ---
    const fetchPromotions = async () => {
        if (!shopId || isShopIdLoading) {
            return;
        }
        setIsLoading(true);
        try {
            const response = await getShopPromotionsForOwner(shopId);
            const fetchedPromotions = response.data.promotions;

            if (!Array.isArray(fetchedPromotions)) {
                console.error('API did not return an array of promotions:', response.data);
                toast.error('Invalid promotion data received.');
                setPromotions([]);
                setFilteredPromotions([]);
                return;
            }

            const sortedPromotions = fetchedPromotions.sort((a, b) =>
                new Date(b.startDate) - new Date(a.startDate)
            );
            setPromotions(sortedPromotions);
            applyFilters(sortedPromotions, searchQuery, selectedStatus);
        } catch (error) {
            console.error('Error fetching shop promotions:', error);
            toast.error(error.response?.data?.message || 'Failed to load promotions.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (shopId && !isShopIdLoading) {
            fetchPromotions();
        }
    }, [shopId, isShopIdLoading]);

    // --- Filtering Logic Helper ---
    const applyFilters = (promos, query, status) => {
        let currentFiltered = [...promos];

        if (status !== 'all') {
            currentFiltered = currentFiltered.filter(promo => {
                const now = new Date();
                const startDate = new Date(promo.startDate);
                const endDate = promo.endDate ? new Date(promo.endDate) : null;

                if (status === 'active') {
                    return promo.isActive && startDate <= now && (!endDate || endDate >= now);
                } else if (status === 'upcoming') {
                    return promo.isActive && startDate > now;
                } else if (status === 'expired') {
                    return endDate && endDate < now;
                }
                return true;
            });
        }

        if (query) {
            const lowerCaseQuery = query.toLowerCase();
            currentFiltered = currentFiltered.filter(promo =>
                promo.title?.toLowerCase().includes(lowerCaseQuery) ||
                promo.couponCode?.toLowerCase().includes(lowerCaseQuery) ||
                promo.description?.toLowerCase().includes(lowerCaseQuery)
            );
        }
        setFilteredPromotions(currentFiltered);
    };

    useEffect(() => {
        applyFilters(promotions, searchQuery, selectedStatus);
    }, [promotions, searchQuery, selectedStatus]);

    const handleAddPromotionClick = () => {
        if (!shopId) {
            toast.error("Please wait for your shop data to load, or ensure you have a shop configured.");
            return;
        }
        setSelectedPromotion(null);
        setIsAddEditModalOpen(true);
    };

    const handleEditPromotionClick = (promotion) => {
        if (!shopId) {
            toast.error("Please wait for your shop data to load, or ensure you have a shop configured.");
            return;
        }
        setSelectedPromotion(promotion);
        setIsAddEditModalOpen(true);
    };

    // --- FIX APPLIED HERE ---
    const handleSavePromotion = async (promotionData, isEditing, promotionId) => {
        if (!shopId) {
            toast.error("Shop ID not found. Cannot save promotion.");
            return;
        }
        setIsProcessing(true);
        try {
            if (isEditing) {
                // Ensure promotionData is sent as the body, and shopId as part of path or query if needed
                // Assuming updatePromotion service function takes (promotionId, updatedData, shopId)
                await updatePromotion(promotionId, {...promotionData, shopId}); // Corrected: passing promotionData directly
                toast.success('Promotion updated successfully!');
            } else {
                await createPromotion(shopId, promotionData);
                toast.success('Promotion created successfully!');
            }
            setIsAddEditModalOpen(false);
            await fetchPromotions(); // Re-fetch to update UI with latest data
        } catch (error) {
            console.error('Error saving promotion:', error);
            toast.error(error.response?.data?.message || 'Failed to save promotion.');
        } finally {
            setIsProcessing(false);
            setSelectedPromotion(null);
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedPromotion) return;
        if (!shopId) {
            toast.error("Shop ID not found. Cannot delete promotion.");
            setIsConfirmDeleteModalOpen(false);
            return;
        }

        setIsProcessing(true);
        try {
            await deletePromotion(selectedPromotion._id, { shopId });
            toast.success('Promotion deleted successfully!');
            setIsConfirmDeleteModalOpen(false);
            await fetchPromotions();
        } catch (error) {
            console.error('Error deleting promotion:', error);
            toast.error(error.response?.data?.message || 'Failed to delete promotion.');
        } finally {
            setSelectedPromotion(null);
            setIsProcessing(false);
        }
    };

    const handleDeletePromotionClick = (promotion) => {
        setSelectedPromotion(promotion);
        setIsConfirmDeleteModalOpen(true);
    };

    const renderPromotionStatusBadge = (promo) => {
        const now = new Date();
        const startDate = new Date(promo.startDate);
        const endDate = promo.endDate ? new Date(promo.endDate) : null;

        let status = 'upcoming';
        let colorClass = 'bg-yellow-100 text-yellow-800';

        if (!promo.isActive) {
            status = 'inactive';
            colorClass = 'bg-gray-100 text-gray-800';
        } else if (startDate <= now && (!endDate || endDate >= now)) {
            status = 'active';
            colorClass = 'bg-green-100 text-green-800';
        } else if (endDate && endDate < now) {
            status = 'expired';
            colorClass = 'bg-red-100 text-red-800';
        } else if (startDate > now) {
            status = 'upcoming';
            colorClass = 'bg-yellow-100 text-yellow-800';
        }

        return (
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    if (isShopIdLoading) {
        return (
            <div className="bg-[#fef4ea] min-h-screen flex items-center justify-center">
                <LoadingSpinner />
                <p className="text-gray-500 mt-2">Loading shop data...</p>
            </div>
        );
    }

    if (!shopId) {
        return (
            <div className="bg-[#fef4ea] min-h-screen flex items-center justify-center text-center py-12">
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-[#a38772] mb-4">No Shop Found</h2>
                    <p className="text-gray-600 mb-6">You need to have a shop associated with your vendor account to manage promotions.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#fef4ea] min-h-screen py-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <h1 className="text-3xl font-bold text-[#a38772] mb-4 md:mb-0">
                        Manage Promotions
                    </h1>
                    <button
                        onClick={handleAddPromotionClick}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#a38772] hover:bg-[#8e7360] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a38772] disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!shopId || isShopIdLoading}
                    >
                        <FaPlus className="mr-2" /> Add New Promotion
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by title or code..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#a38772]"
                            />
                        </div>
                        <div className="flex items-center">
                            <FaFilter className="text-gray-400 mr-2" />
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full pl-2 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#a38772]"
                            >
                                <option value="all">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="upcoming">Upcoming</option>
                                <option value="expired">Expired</option>
                            </select>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-8">
                            <LoadingSpinner />
                            <p className="text-gray-500 mt-2">Loading promotions...</p>
                        </div>
                    ) : filteredPromotions.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-[#fef4ea]">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Title / Code
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type / Value
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Validity
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Usage
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredPromotions.map(promo => (
                                        <tr key={promo._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{promo.title}</div>
                                                <div className="text-sm text-gray-500">Code: {promo.couponCode}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {promo.type === 'percentage' ? `${promo.value}% Off` : `₹${promo.value} Off`}
                                                </div>
                                                {promo.minSpend > 0 && (
                                                    <div className="text-sm text-gray-500">Min. Spend: ₹{promo.minSpend}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {format(parseISO(promo.startDate), 'MMM dd, yyyy')}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    to {promo.endDate ? format(parseISO(promo.endDate), 'MMM dd, yyyy') : 'No End Date'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    Used: {promo.usageCount || 0}
                                                    {promo.usageLimit && ` / ${promo.usageLimit}`}
                                                </div>
                                                {promo.usagePerCustomer && (
                                                    <div className="text-sm text-gray-500">
                                                        Per Customer: {promo.usagePerCustomer}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {renderPromotionStatusBadge(promo)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={() => handleEditPromotionClick(promo)}
                                                        className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-gray-100"
                                                        title="Edit Promotion"
                                                        disabled={isProcessing}
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePromotionClick(promo)}
                                                        className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-gray-100"
                                                        title="Delete Promotion"
                                                        disabled={isProcessing}
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No promotions found for your shop.</p>
                        </div>
                    )}
                </div>
            </div>

            <AddEditPromotionModal
                isOpen={isAddEditModalOpen}
                onClose={() => setIsAddEditModalOpen(false)}
                onSave={handleSavePromotion}
                promotion={selectedPromotion}
                shopId={shopId}
                isSaving={isProcessing}
                shopIdLoading={isShopIdLoading}
            />

            <ConfirmationModal
                isOpen={isConfirmDeleteModalOpen}
                onClose={() => {
                    setIsConfirmDeleteModalOpen(false);
                    setSelectedPromotion(null);
                }}
                onConfirm={handleConfirmDelete}
                title="Confirm Delete Promotion"
                message={`Are you sure you want to delete the promotion "${selectedPromotion?.title}" (Code: ${selectedPromotion?.couponCode})? This action cannot be undone.`}
                confirmButtonText="Delete"
                confirmButtonColor="red"
                isLoading={isProcessing}
            />
        </div>
    );
};

export default PromotionsPage;