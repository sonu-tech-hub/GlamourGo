// frontend/pages/vendor/GalleryPage.jsx

import React, { useState, useEffect, useCallback } from "react"; // Added useCallback
import toast from "react-hot-toast";
import { FaPlus, FaEdit, FaTrash, FaTag, FaCheckCircle } from "react-icons/fa";

import {
    getShopGallery,
    deleteGalleryItem,
} from "../../services/galleryService"; // Renamed from galleryApi
import { getAllShops } from "../../services/shopService";
import { useAuth } from "../../context/AuthContext";
import AddEditGalleryItemModal from "../../components/vendor/AddEditGalleryItemModal";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ConfirmDialog from "../../components/common/ConfirmDialog";

const GalleryPage = () => {
    const { user } = useAuth();
    const [shopId, setShopId] = useState(null);
    const [hasShopBeenChecked, setHasShopBeenChecked] = useState(false);

    const [galleryItems, setGalleryItems] = useState([]);
    const [galleryCategories, setGalleryCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    // Encapsulate fetching gallery data into a useCallback for stability
    const fetchGalleryData = useCallback(async (currentShopId) => {
        setIsLoading(true);
        try {
            if (currentShopId) {
                const response = await getShopGallery(currentShopId);
                const items = response?.data?.galleryItems || [];
                const categories = response?.data?.categories || [];
                setGalleryItems(items);
                setGalleryCategories([...new Set(categories)]);
            } else {
                setGalleryItems([]);
                setGalleryCategories([]);
            }
        } catch (error) {
            console.error("Error fetching gallery:", error);
            toast.error(
                error.response?.data?.message || "Failed to load gallery items."
            );
        } finally {
            setIsLoading(false);
        }
    }, []); // No dependencies that change over time for the function itself

    useEffect(() => {
        const fetchVendorShopId = async () => {
            setIsLoading(true); // Start loading when checking for shop
            // setHasShopBeenChecked(false); // Resetting this here can cause double fetch logic in the second useEffect

            if (user?.user?.id && user?.user?.userType === "vendor") {
                try {
                    const response = await getAllShops();
                    const allShops = response.data.shops;
                    const vendorShop = allShops.find(
                        (shop) => shop.owner === user.user.id
                    );

                    if (vendorShop) {
                        setShopId(vendorShop._id);
                        // toast.success("Shop ID found and loaded."); // Optional: remove in prod
                    } else {
                        setShopId(null); // No shop found for this vendor
                        toast.error("No shop found associated with your vendor account.");
                    }
                } catch (error) {
                    console.error("Failed to fetch shop ID for vendor:", error);
                    setShopId(null);
                    toast.error("Failed to retrieve your shop details.");
                } finally {
                    setHasShopBeenChecked(true); // Mark as checked whether successful or not
                    // setIsLoading(false); // Do not set loading to false here, let the second useEffect handle it after gallery data is fetched
                }
            } else {
                setShopId(null);
                setHasShopBeenChecked(true);
                toast.error("You must be a logged-in vendor to manage the gallery.");
                setIsLoading(false); // End loading if no user or not vendor
            }
        };

        if (user) {
            fetchVendorShopId();
        } else {
            // If no user (logged out), clear shop/gallery and stop loading
            setShopId(null);
            setGalleryItems([]);
            setGalleryCategories([]);
            setIsLoading(false);
            setHasShopBeenChecked(true);
        }
    }, [user]); // Re-run when user changes

    useEffect(() => {
        // Only fetch gallery data if shopId is available and shop has been checked
        if (hasShopBeenChecked && shopId) {
            fetchGalleryData(shopId);
        } else if (hasShopBeenChecked && !shopId) {
            // If shop checked and no shopId, ensure loading is false
            setIsLoading(false);
        }
    }, [shopId, hasShopBeenChecked, fetchGalleryData]); // Re-run when shopId or hasShopBeenChecked changes, or fetchGalleryData changes (due to useCallback)

    const handleAddItem = () => {
        if (!shopId) {
            toast.error("Cannot add items. Shop details are not available or you are not authorized.");
            return;
        }
        setItemToEdit(null);
        setIsModalOpen(true);
    };

    const handleEditItem = (item) => {
        if (!shopId) {
            toast.error("Cannot edit items. Shop details are not available or you are not authorized.");
            return;
        }
        setItemToEdit(item);
        setIsModalOpen(true);
    };

    const handleDeleteItem = (item) => {
        if (!shopId) {
            toast.error("Cannot delete items. Shop details are not available or you are not authorized.");
            return;
        }
        setItemToDelete(item);
        setIsConfirmDialogOpen(true);
    };

    const confirmDeleteItem = async () => {
        setIsConfirmDialogOpen(false);
        if (!itemToDelete || !shopId) {
            toast.error("Delete operation failed: Item or Shop ID missing.");
            return;
        }

        try {
            await deleteGalleryItem(itemToDelete._id, shopId);
            toast.success("Gallery item deleted successfully!");
            fetchGalleryData(shopId); // Re-fetch all data to ensure consistent state
        } catch (error) {
            console.error("Error deleting gallery item:", error);
            toast.error(
                error.response?.data?.message || "Failed to delete gallery item."
            );
        } finally {
            setItemToDelete(null);
        }
    };

    // This callback is passed to the modal to trigger a refresh of the gallery data
    const handleItemAddedOrUpdated = () => {
        fetchGalleryData(shopId); // Pass shopId to ensure correct data fetch
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-[#fef4ea]">
                <LoadingSpinner />
            </div>
        );
    }

    if (hasShopBeenChecked && !shopId) {
        return (
            <div className="container mx-auto px-4 py-8 bg-[#fef4ea] min-h-screen text-center">
                <h1 className="text-3xl font-bold mb-6 text-[#a38772]">
                    Manage Your Gallery
                </h1>
                <p className="text-gray-700">
                    We could not find a shop associated with your account. Please ensure
                    you are logged in as a vendor.
                </p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 bg-[#fef4ea] min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-[#a38772]">
                Manage Your Gallery
            </h1>

            <div className="flex justify-end mb-4">
                <button
                    onClick={handleAddItem}
                    className="bg-[#d0a189] text-white px-6 py-2 rounded-lg shadow hover:bg-[#ecdfcf] transition-colors flex items-center"
                >
                    <FaPlus className="mr-2" /> Add New Item
                </button>
            </div>

            {galleryItems.length === 0 ? (
                <p className="text-center text-gray-600">
                    No gallery items added yet. Click "Add New Item" to get started!
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {galleryItems.map((item) => {
                        const fullImageUrl = item.imageUrl || "/placeholder-image.jpg";

                        return (
                            <div
                                key={item._id}
                                className="bg-white rounded-lg shadow-md overflow-hidden"
                            >
                                <img
                                    src={fullImageUrl}
                                    alt={item.title}
                                    className="w-full h-48 object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "/placeholder-image.jpg";
                                    }}
                                />
                                <div className="p-4">
                                    <h3 className="font-semibold text-lg text-[#a38772] mb-1">
                                        {item.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                                        {item.description}
                                    </p>
                                    <div className="flex items-center text-gray-500 text-xs mb-2">
                                        <FaTag className="mr-1" /> {item.category}
                                    </div>
                                    {item.featured && (
                                        <div className="flex items-center text-green-600 text-sm mb-2">
                                            <FaCheckCircle className="mr-1" /> Featured
                                        </div>
                                    )}
                                    <div className="flex justify-end gap-2 mt-3">
                                        <button
                                            onClick={() => handleEditItem(item)}
                                            className="text-[#d0a189] hover:text-[#a38772] p-2 rounded-full hover:bg-gray-100 transition-colors"
                                            title="Edit Item"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteItem(item)}
                                            className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                                            title="Delete Item"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <AddEditGalleryItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                shopId={shopId}
                onItemAddedOrUpdated={handleItemAddedOrUpdated}
                itemToEdit={itemToEdit}
                existingCategories={galleryCategories}
            />

            <ConfirmDialog
                isOpen={isConfirmDialogOpen}
                onClose={() => setIsConfirmDialogOpen(false)}
                onConfirm={confirmDeleteItem}
                title="Confirm Deletion"
                message={`Are you sure you want to delete "${itemToDelete?.title || "this gallery item"}"? This action cannot be undone.`}
            />
        </div>
    );
};

export default GalleryPage;