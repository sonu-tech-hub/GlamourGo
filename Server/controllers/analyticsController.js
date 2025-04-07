// controllers/analyticsController.js
const Appointment = require('../models/Appointment');
const Shop = require('../models/Shop');
const User = require('../models/User');
const Review = require('../models/Review');
const Transaction = require('../models/Transaction');

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
    
    // Get current date
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Get first day of month
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    
    // Get first day of previous month
    const firstDayOfPrevMonth = new Date(currentYear, currentMonth - 1, 1);
    
    // Get appointments for current month
    const currentMonthAppointments = await Appointment.find({
      shop: shopId,
      date: { $gte: firstDayOfMonth, $lte: today }
    });
    
    // Get appointments for previous month
    const prevMonthAppointments = await Appointment.find({
      shop: shopId,
      date: { $gte: firstDayOfPrevMonth, $lt: firstDayOfMonth }
    });
    
    // Get today's appointments
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayEnd = new Date(today.setHours(23, 59, 59, 999));
    
    const todayAppointments = await Appointment.find({
      shop: shopId,
      date: { $gte: todayStart, $lte: todayEnd }
    });
    
    // Calculate revenue
    const currentMonthRevenue = currentMonthAppointments.reduce((sum, appointment) => {
      if (appointment.payment.status === 'completed') {
        return sum + appointment.service.price;
      }
      return sum;
    }, 0);
    
    const prevMonthRevenue = prevMonthAppointments.reduce((sum, appointment) => {
      if (appointment.payment.status === 'completed') {
        return sum + appointment.service.price;
      }
      return sum;
    }, 0);
    
    const todayRevenue = todayAppointments.reduce((sum, appointment) => {
      if (appointment.payment.status === 'completed') {
        return sum + appointment.service.price;
      }
      return sum;
    }, 0);
    
    // Get pending appointments
    const pendingAppointments = await Appointment.find({
      shop: shopId,
      status: 'pending',
      date: { $gte: today }
    }).sort({ date: 1 }).limit(10);
    
    // Get unique customers count
    const uniqueCustomers = await Appointment.distinct('user', { shop: shopId });
    
    // Get recent reviews
    const recentReviews = await Review.find({ shop: shopId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name profilePicture');
    
    // Calculate revenue growth
    const revenueGrowth = prevMonthRevenue === 0 
      ? 100 
      : ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100;
    
    res.json({
      stats: {
        totalAppointments: currentMonthAppointments.length,
        pendingAppointments: currentMonthAppointments.filter(a => a.status === 'pending').length,
        completedAppointments: currentMonthAppointments.filter(a => a.status === 'completed').length,
        cancelledAppointments: currentMonthAppointments.filter(a => a.status === 'cancelled').length,
        totalRevenue: currentMonthRevenue,
        todayRevenue,
        todayAppointments: todayAppointments.length,
        revenueGrowth,
        customersCount: uniqueCustomers.length,
        reviewsAverage: shop.ratings.average
      },
      pendingAppointments,
      recentReviews
    });
  } catch (error) {
    console.error('Error fetching shop dashboard stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get revenue analytics
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { period = 'month' } = req.query;
    const ownerId = req.user.id; // From auth middleware
    
    // Verify shop ownership
    const shop = await Shop.findById(shopId);
    if (!shop || shop.owner.toString() !== ownerId) {
      return res.status(403).json({ message: 'You are not authorized to view analytics for this shop' });
    }
    
    // Get current date
    const today = new Date();
    
    let startDate, endDate, format, dateFormat;
    
    // Set date range based on period
    if (period === 'week') {
      // Last 7 days
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
      
      format = '%Y-%m-%d';
      dateFormat = { year: 'numeric', month: 'short', day: 'numeric' };
    } else if (period === 'month') {
      // Current month
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today);
      
      format = '%Y-%m-%d';
      dateFormat = { month: 'short', day: 'numeric' };
    } else if (period === 'year') {
      // Current year
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = new Date(today);
      
      format = '%Y-%m';
      dateFormat = { year: 'numeric', month: 'short' };
    }
    
    // Get completed appointments within date range
    const appointments = await Appointment.find({
      shop: shopId,
      date: { $gte: startDate, $lte: endDate },
      'payment.status': 'completed'
    });
    
    // Aggregate revenue data
    const revenueData = [];
    
    if (period === 'week') {
      // Daily revenue for the week
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const dayRevenue = appointments
          .filter(a => {
            const appointmentDate = new Date(a.date);
            return appointmentDate.getDate() === date.getDate() &&
                  appointmentDate.getMonth() === date.getMonth() &&
                  appointmentDate.getFullYear() === date.getFullYear();
          })
          .reduce((sum, a) => sum + a.service.price, 0);
        
        revenueData.push({
          date: date.toLocaleDateString('en-US', dateFormat),
          revenue: dayRevenue
        });
      }
    } else if (period === 'month') {
      // Daily revenue for the month
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      
      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(today.getFullYear(), today.getMonth(), i);
        
        if (date > today) break;
        
        const dayRevenue = appointments
          .filter(a => {
            const appointmentDate = new Date(a.date);
            return appointmentDate.getDate() === date.getDate() &&
                  appointmentDate.getMonth() === date.getMonth();
          })
          .reduce((sum, a) => sum + a.service.price, 0);
        
        revenueData.push({
          date: date.toLocaleDateString('en-US', dateFormat),
          revenue: dayRevenue
        });
      }
    } else if (period === 'year') {
      // Monthly revenue for the year
      for (let i = 0; i < 12; i++) {
        const date = new Date(today.getFullYear(), i, 1);
        
        if (date > today) break;
        
        const monthRevenue = appointments
          .filter(a => {
            const appointmentDate = new Date(a.date);
            return appointmentDate.getMonth() === date.getMonth() &&
                  appointmentDate.getFullYear() === date.getFullYear();
          })
          .reduce((sum, a) => sum + a.service.price, 0);
        
        revenueData.push({
          date: date.toLocaleDateString('en-US', dateFormat),
          revenue: monthRevenue
        });
      }
    }
    
    // Get service popularity
    const servicePopularity = {};
    appointments.forEach(appointment => {
      const serviceName = appointment.service.name;
      
      if (!servicePopularity[serviceName]) {
        servicePopularity[serviceName] = {
          count: 0,
          revenue: 0
        };
      }
      
      servicePopularity[serviceName].count += 1;
      servicePopularity[serviceName].revenue += appointment.service.price;
    });
    
    // Convert to array and sort by count
    const popularServices = Object.keys(servicePopularity).map(name => ({
      name,
      count: servicePopularity[name].count,
      revenue: servicePopularity[name].revenue
    })).sort((a, b) => b.count - a.count);
    
    // Calculate total revenue
    const totalRevenue = revenueData.reduce((sum, data) => sum + data.revenue, 0);
    
    res.json({
      revenueData,
      popularServices,
      totalRevenue,
      periodLabel: period === 'week' ? 'Last 7 Days' : 
                   period === 'month' ? 'This Month' : 'This Year'
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
    
    // Get all appointments for this shop
    const appointments = await Appointment.find({ shop: shopId })
      .populate('user', 'name');
    
    // Get unique customers
    const customerMap = {};
    
    appointments.forEach(appointment => {
      const userId = appointment.user._id.toString();
      const userName = appointment.user.name;
      
      if (!customerMap[userId]) {
        customerMap[userId] = {
          name: userName,
          visits: 0,
          spent: 0,
          lastVisit: null
        };
      }
      
      customerMap[userId].visits += 1;
      
      if (appointment.payment.status === 'completed') {
        customerMap[userId].spent += appointment.service.price;
      }
      
      const appointmentDate = new Date(appointment.date);
      
      if (!customerMap[userId].lastVisit || appointmentDate > customerMap[userId].lastVisit) {
        customerMap[userId].lastVisit = appointmentDate;
      }
    });
    
    // Convert to array and sort by visits
    const customers = Object.keys(customerMap).map(userId => ({
      id: userId,
      ...customerMap[userId]
    })).sort((a, b) => b.visits - a.visits);
    
    // Calculate metrics
    const totalCustomers = customers.length;
    const totalAppointments = appointments.length;
    const repeatRate = totalCustomers === 0 ? 0 : 
      (customers.filter(c => c.visits > 1).length / totalCustomers) * 100;
    
    const averageSpend = totalCustomers === 0 ? 0 :
      customers.reduce((sum, c) => sum + c.spent, 0) / totalCustomers;
    
    // Get new vs returning customers by month
    const today = new Date();
    const currentYear = today.getFullYear();
    
    const customersByMonth = [];
    
    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(currentYear, month, 1);
      const monthEnd = new Date(currentYear, month + 1, 0);
      
      if (monthEnd > today) break;
      
      const monthAppointments = appointments.filter(a => {
        const date = new Date(a.date);
        return date >= monthStart && date <= monthEnd;
      });
      
      const monthCustomers = {};
      let newCustomers = 0;
      let returningCustomers = 0;
      
      monthAppointments.forEach(a => {
        const userId = a.user._id.toString();
        
        if (!monthCustomers[userId]) {
          monthCustomers[userId] = true;
          
          // Check if this customer had any appointment before this month
          const previousAppointments = appointments.filter(prevA => {
            const prevDate = new Date(prevA.date);
            return prevA.user._id.toString() === userId && prevDate < monthStart;
          });
          
          if (previousAppointments.length > 0) {
            returningCustomers += 1;
          } else {
            newCustomers += 1;
          }
        }
      });
      
      customersByMonth.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        new: newCustomers,
        returning: returningCustomers
      });
    }
    
    res.json({
      customers: customers.slice(0, 10), // Top 10 customers
      metrics: {
        totalCustomers,
        repeatRate,
        averageSpend,
        appointmentsPerCustomer: totalCustomers === 0 ? 0 : totalAppointments / totalCustomers
      },
      customersByMonth
    });
  } catch (error) {
    console.error('Error fetching customer analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};