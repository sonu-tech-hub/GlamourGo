const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Service = require('../models/Service');
const Review = require('../models/Review');

exports.getRevenueAnalytics = async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    const now = new Date();
    let startDate;

    if (period === 'week') {
      startDate = new Date(now.setDate(now.getDate() - 7));
    } else if (period === 'month') {
      startDate = new Date(now.setMonth(now.getMonth() - 1));
    } else if (period === 'year') {
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
    }

    const transactions = await Transaction.find({
      type: 'credit',
      status: 'completed',
      timestamp: { $gte: startDate }
    });

    const totalRevenue = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const transactionCount = transactions.length;
    const averageOrderValue = transactionCount > 0 ? totalRevenue / transactionCount : 0;

    const userMetrics = {
      totalUsers: await User.countDocuments(),
      newUsers: await User.countDocuments({ createdAt: { $gte: startDate } })
    };

    res.json({
      totalRevenue,
      transactionCount,
      averageOrderValue,
      userMetrics
    });
  } catch (err) {
    console.error('Revenue analytics error:', err);
    res.status(500).json({ error: 'Failed to load revenue analytics' });
  }
};

exports.getRecentUsers = async (req, res) => {
  try {
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .select('name email profilePicture userType createdAt');

    res.json(recentUsers);
  } catch (err) {
    console.error('Recent users error:', err);
    res.status(500).json({ error: 'Failed to load recent users' });
  }
};


exports.getSystemStats = async (req, res) => {
  try {
    const [totalUsers, totalVendors, totalCustomers, totalTransactions, completedTransactions] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ userType: 'vendor' }),
      User.countDocuments({ userType: 'customer' }),
      Transaction.countDocuments(),
      Transaction.countDocuments({ status: 'completed' })
    ]);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } });

    const completedCredits = await Transaction.find({
      type: 'credit',
      status: 'completed'
    });

    const totalRevenue = completedCredits.reduce((sum, tx) => sum + tx.amount, 0);
    const averageTransactionValue = completedCredits.length > 0 ? totalRevenue / completedCredits.length : 0;

    res.json({
      totalUsers,
      totalVendors,
      totalCustomers,
      newUsersThisMonth,
      totalTransactions,
      completedTransactions,
      totalRevenue,
      averageTransactionValue
    });
  } catch (err) {
    console.error('Error fetching system stats:', err);
    res.status(500).json({ error: 'Failed to load system stats' });
  }
};
exports.getServiceCategoriesCount = async (req, res) => {
  try {
    const categories = await Service.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json(categories);
  } catch (error) {
    console.error('Error fetching service categories:', error);
    res.status(500).json({ error: 'Failed to load service categories' });
  }
};
exports.getPopularServicesByRating = async (req, res) => {
  try {
    const popularServices = await Review.aggregate([
      { $match: { status: 'approved' } },
      {
        $group: {
          _id: '$service',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 }
        }
      },
      { $sort: { averageRating: -1, reviewCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'services',
          localField: '_id',
          foreignField: '_id',
          as: 'serviceDetails'
        }
      },
      { $unwind: '$serviceDetails' },
      // Lookup shop info from serviceDetails.shop (assuming service has shop field)
      {
        $lookup: {
          from: 'shops',
          localField: 'serviceDetails.shop',
          foreignField: '_id',
          as: 'shopDetails'
        }
      },
      { $unwind: '$shopDetails' },
      {
        $project: {
          _id: 0,
          serviceId: '$_id',
          serviceName: '$serviceDetails.name',
          category: '$serviceDetails.category',
          averageRating: { $round: ['$averageRating', 2] },
          reviewCount: 1,
          shopId: '$shopDetails._id',
          shopName: '$shopDetails.name',
          shopLocation: '$shopDetails.location'  // optional, if you want location or other fields
        }
      }
    ]);

    res.json(popularServices);
  } catch (error) {
    console.error('Error fetching popular services by rating:', error);
    res.status(500).json({ error: 'Failed to load popular services' });
  }
};