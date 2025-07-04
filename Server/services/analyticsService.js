// services/analyticsService.js
const Appointment = require('../models/Appointment');
const Shop = require('../models/Shop');
const Review = require('../models/Review');
// const Transaction = require('../models/Transaction'); // Not used in current code, but keep if needed later

/**
 * Fetches dashboard statistics for a given shop.
 * @param {string} shopId - The ID of the shop.
 * @returns {Object} An object containing various dashboard statistics.
 */
exports.getDashboardStats = async (shopId) => {
    // Get current date
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to start of day for accurate comparison

    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Get first day of current month
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);

    // Get first day of previous month
    const firstDayOfPrevMonth = new Date(currentYear, currentMonth - 1, 1);

    // Get the end of today for accurate filtering
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    // Fetch all relevant appointments in a single query (current month up to today, and previous month)
    const allRelevantAppointments = await Appointment.find({
        shop: shopId,
        date: { $gte: firstDayOfPrevMonth, $lte: todayEnd } // Fetch appointments from start of previous month to end of today
    }).populate('service', 'price'); // Populate service to access price

    // Filter appointments for current month (up to today)
    const currentMonthAppointments = allRelevantAppointments.filter(app =>
        app.date >= firstDayOfMonth && app.date <= todayEnd
    );

    // Filter appointments for previous month
    const prevMonthAppointments = allRelevantAppointments.filter(app =>
        app.date >= firstDayOfPrevMonth && app.date < firstDayOfMonth
    );

    // Filter today's appointments
    const todayAppointments = allRelevantAppointments.filter(app =>
        app.date >= today && app.date <= todayEnd
    );

    // Helper to calculate revenue from appointments
    const calculateRevenue = (appointmentsArray) => {
        return appointmentsArray.reduce((sum, appointment) => {
            if (appointment.payment && appointment.payment.status === 'completed') {
                return sum + (appointment.service ? appointment.service.price : 0);
            }
            return sum;
        }, 0);
    };

    // Calculate revenue
    const currentMonthRevenue = calculateRevenue(currentMonthAppointments);
    const prevMonthRevenue = calculateRevenue(prevMonthAppointments);
    const todayRevenue = calculateRevenue(todayAppointments);

    // Get pending appointments (from today onwards) - separate query is fine here as it's a specific status and future dates
    const pendingAppointmentsFuture = await Appointment.find({
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

    // Fetch shop details for ratings average
    const shop = await Shop.findById(shopId);

    // Calculate revenue growth (handle division by zero)
    const revenueGrowth = prevMonthRevenue === 0
        ? (currentMonthRevenue > 0 ? 100 : 0) // If prev month revenue was 0, and current is >0, it's 100% growth. If both 0, 0% growth.
        : ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100;

    return {
        stats: {
            totalAppointments: currentMonthAppointments.length,
            pendingAppointments: currentMonthAppointments.filter(a => a.status === 'pending').length,
            completedAppointments: currentMonthAppointments.filter(a => a.status === 'completed').length,
            cancelledAppointments: currentMonthAppointments.filter(a => a.status === 'cancelled').length, // This will now correctly count cancelled within the current month
            totalRevenue: currentMonthRevenue,
            todayRevenue,
            todayAppointments: todayAppointments.length,
            revenueGrowth: parseFloat(revenueGrowth.toFixed(2)), // Format to 2 decimal places
            customersCount: uniqueCustomers.length,
            reviewsAverage: shop?.ratings?.average || 0 // Provide a default if not found
        },
        pendingAppointments: pendingAppointmentsFuture, // Renamed for clarity to differentiate from the count in stats
        recentReviews
    };
};

/**
 * Fetches revenue analytics data based on a specified period.
 * @param {string} shopId - The ID of the shop.
 * @param {string} period - The period ('week', 'month', 'year').
 * @returns {Object} An object containing revenue data, popular services, and total revenue.
 */
exports.getRevenueAnalytics = async (shopId, period) => {
    const today = new Date();
    let startDate, endDate, dateFormat;

    // Set date range based on period
    if (period === 'week') {
        // Last 7 days including today
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);

        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);

        dateFormat = { weekday: 'short', day: 'numeric' }; // e.g., "Mon, 10"
    } else if (period === 'month') {
        // Current month
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today); // Up to today
        endDate.setHours(23, 59, 59, 999);

        dateFormat = { day: 'numeric', month: 'short' }; // e.g., "15 Jun"
    } else if (period === 'year') {
        // Current year
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today); // Up to today
        endDate.setHours(23, 59, 59, 999);

        dateFormat = { month: 'short', year: 'numeric' }; // e.g., "Jan 2024"
    } else {
        // Default to month if an invalid period is provided
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);
        dateFormat = { day: 'numeric', month: 'short' };
    }

    // Get completed appointments within date range
    const appointments = await Appointment.find({
        shop: shopId,
        date: { $gte: startDate, $lte: endDate },
        'payment.status': 'completed'
    }).populate('service', 'price name'); // Populate service to access price and name

    const revenueData = [];
    // const appointmentCounts = []; // This variable was declared but not used, so I'm commenting it out

    if (period === 'week') {
        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            date.setHours(0, 0, 0, 0); // Normalize to start of the day for comparison

            const dayAppointments = appointments.filter(a => {
                const appointmentDate = new Date(a.date);
                return appointmentDate.toDateString() === date.toDateString(); // Compare just date part
            });

            const dayRevenue = dayAppointments.reduce((sum, a) => sum + (a.service ? a.service.price : 0), 0);

            revenueData.push({
                date: date.toLocaleDateString('en-US', dateFormat),
                revenue: dayRevenue,
                count: dayAppointments.length // Count of appointments for the day
            });
        }
    } else if (period === 'month') {
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(today.getFullYear(), today.getMonth(), i);
            date.setHours(0, 0, 0, 0);

            if (date > today) break; // Don't include future days in current month

            const dayAppointments = appointments.filter(a => {
                const appointmentDate = new Date(a.date);
                return appointmentDate.toDateString() === date.toDateString();
            });

            const dayRevenue = dayAppointments.reduce((sum, a) => sum + (a.service ? a.service.price : 0), 0);

            revenueData.push({
                date: date.toLocaleDateString('en-US', dateFormat),
                revenue: dayRevenue,
                count: dayAppointments.length
            });
        }
    } else if (period === 'year') {
        for (let i = 0; i <= today.getMonth(); i++) { // Loop up to current month
            const monthDate = new Date(today.getFullYear(), i, 1);
            monthDate.setHours(0, 0, 0, 0);

            const monthAppointments = appointments.filter(a => {
                const appointmentDate = new Date(a.date);
                return appointmentDate.getFullYear() === monthDate.getFullYear() &&
                       appointmentDate.getMonth() === monthDate.getMonth();
            });

            const monthRevenue = monthAppointments.reduce((sum, a) => sum + (a.service ? a.service.price : 0), 0);

            revenueData.push({
                date: monthDate.toLocaleDateString('en-US', dateFormat),
                revenue: monthRevenue,
                count: monthAppointments.length
            });
        }
    }

    // Get service popularity
    const servicePopularity = {};
    appointments.forEach(appointment => {
        const serviceName = appointment.service ? appointment.service.name : 'Unknown Service';

        if (!servicePopularity[serviceName]) {
            servicePopularity[serviceName] = {
                count: 0,
                revenue: 0
            };
        }

        servicePopularity[serviceName].count += 1;
        servicePopularity[serviceName].revenue += (appointment.service ? appointment.service.price : 0);
    });

    // Convert to array and sort by count
    const popularServices = Object.keys(servicePopularity).map(name => ({
        name,
        count: servicePopularity[name].count,
        revenue: servicePopularity[name].revenue
    })).sort((a, b) => b.count - a.count);

    // Calculate total revenue from processed data
    const totalRevenue = revenueData.reduce((sum, data) => sum + data.revenue, 0);

    return {
        revenue: {
            data: revenueData,
            total: totalRevenue
        },
        popularServices,
        periodLabel: period === 'week' ? 'Last 7 Days' :
                     period === 'month' ? 'This Month' : 'This Year'
    };
};

/**
 * Fetches customer analytics data.
 * @param {string} shopId - The ID of the shop.
 * @returns {Object} An object containing customer metrics and acquisition trend.
 */
exports.getCustomerAnalytics = async (shopId) => {
    // Get all completed appointments for this shop to build a full customer history
    const allAppointments = await Appointment.find({
        shop: shopId,
        'payment.status': 'completed'
    }).populate('user', 'name');

    // Build customer profiles
    const customerMap = {};

    allAppointments.forEach(appointment => {
        if (!appointment.user) return; // Skip if user is not populated

        const userId = appointment.user._id.toString();
        const userName = appointment.user.name;
        const appointmentDate = new Date(appointment.date);

        if (!customerMap[userId]) {
            customerMap[userId] = {
                name: userName,
                visits: 0,
                spent: 0,
                firstVisit: appointmentDate, // Track first visit
                lastVisit: appointmentDate
            };
        }

        customerMap[userId].visits += 1;
        customerMap[userId].spent += (appointment.service ? appointment.service.price : 0);

        if (appointmentDate < customerMap[userId].firstVisit) {
            customerMap[userId].firstVisit = appointmentDate;
        }
        if (appointmentDate > customerMap[userId].lastVisit) {
            customerMap[userId].lastVisit = appointmentDate;
        }
    });

    const customers = Object.values(customerMap);

    // Calculate metrics
    const totalCustomers = customers.length;
    const returningCustomers = customers.filter(c => c.visits > 1).length;
    const repeatRate = totalCustomers === 0 ? 0 : (returningCustomers / totalCustomers) * 100;

    const totalSpend = customers.reduce((sum, c) => sum + c.spent, 0);
    const averageSpend = totalCustomers === 0 ? 0 : totalSpend / totalCustomers;

    const totalAppointments = allAppointments.length; // Count all completed appointments

    // Get new vs returning customers by month (for the current year)
    const today = new Date();
    const currentYear = today.getFullYear();
    const customersByMonth = [];

    for (let month = 0; month <= today.getMonth(); month++) { // Loop up to current month
        const monthStart = new Date(currentYear, month, 1);
        const monthEnd = new Date(currentYear, month + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);

        let newCustomers = 0;
        let returningCustomersCount = 0;
        const monthVisitedCustomers = new Set(); // Track unique customers who visited *this month*

        // Filter appointments for the current month being processed
        const appointmentsInMonth = allAppointments.filter(a => {
            const date = new Date(a.date);
            return date >= monthStart && date <= monthEnd;
        });

        appointmentsInMonth.forEach(a => {
            if (!a.user) return;
            const userId = a.user._id.toString();

            if (!monthVisitedCustomers.has(userId)) {
                monthVisitedCustomers.add(userId);

                // Check if this is the customer's *first ever* appointment
                const customerFirstVisitDate = customerMap[userId].firstVisit;

                if (customerFirstVisitDate >= monthStart && customerFirstVisitDate <= monthEnd) {
                    newCustomers += 1;
                } else {
                    returningCustomersCount += 1;
                }
            }
        });

        customersByMonth.push({
            month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
            new: newCustomers,
            returning: returningCustomersCount
        });
    }

    return {
        customers: customers.sort((a, b) => b.visits - a.visits).slice(0, 10), // Top 10 customers by visits
        metrics: {
            totalCustomers,
            returningCustomers, // Added returningCustomers count for clarity
            repeatRate: parseFloat(repeatRate.toFixed(2)),
            averageSpend: parseFloat(averageSpend.toFixed(2)),
            appointmentsPerCustomer: totalCustomers === 0 ? 0 : parseFloat((totalAppointments / totalCustomers).toFixed(2))
        },
        customersByMonth
    };
};