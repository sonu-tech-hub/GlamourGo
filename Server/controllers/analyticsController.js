// controllers/analyticsController.js
const Shop = require('../models/Shop'); // Only need Shop model here for ownership check
const analyticsService = require('../services/analyticsService'); // Import the new service

// Get dashboard stats for a shop
exports.getShopDashboardStats = async (req, res) => {
    try {
        const { shopId } = req.params;
        const ownerId = req.user.id; // From auth middleware

        // Verify shop ownership
        const shop = await Shop.findById(shopId);
        if (!shop || shop.owner.toString() !== ownerId) {
            return res.status(403).json({ message: 'You are not authorized to view analytics for this shop' });
        }

        const dashboardStats = await analyticsService.getDashboardStats(shopId);

        res.json(dashboardStats);
    } catch (error) {
        console.error('Error fetching shop dashboard stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get revenue analytics
exports.getRevenueAnalytics = async (req, res) => {
    try {
        const { shopId } = req.params;
        const { period = 'month' } = req.query; // Default period to 'month'
        const ownerId = req.user.id; // From auth middleware

        // Verify shop ownership
        const shop = await Shop.findById(shopId);
        if (!shop || shop.owner.toString() !== ownerId) {
            return res.status(403).json({ message: 'You are not authorized to view analytics for this shop' });
        }

        const revenueAnalytics = await analyticsService.getRevenueAnalytics(shopId, period);

        // The client-side (AnalyticsPage.jsx) expects data.revenue.data and data.popularServices
        // Your service returns: { revenue: { data: [...], total: ... }, popularServices: [...] }
        // Adjust the response to match the client's expectation
        res.json({
            revenue: {
                data: revenueAnalytics.revenue.data,
                total: revenueAnalytics.revenue.total // Ensure total revenue is passed
            },
            popularServices: revenueAnalytics.popularServices,
            periodLabel: revenueAnalytics.periodLabel
        });

    } catch (error) {
        console.error('Error fetching revenue analytics:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get customer analytics
exports.getCustomerAnalytics = async (req, res) => {
    try {
        const { shopId } = req.params;
        const ownerId = req.user.id; // From auth middleware

        // Verify shop ownership
        const shop = await Shop.findById(shopId);
        if (!shop || shop.owner.toString() !== ownerId) {
            return res.status(403).json({ message: 'You are not authorized to view analytics for this shop' });
        }

        const customerAnalytics = await analyticsService.getCustomerAnalytics(shopId);

        res.json(customerAnalytics);
    } catch (error) {
        console.error('Error fetching customer analytics:', error);
        res.status(500).json({ message: 'Server error' });
    }
};