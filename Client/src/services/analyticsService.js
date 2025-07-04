import api from './api'; // Assuming you have an api.js file that sets up axios or fetch



export const getShopDashboardStats = async (shopId) => {
  try {
    const response = await api.get(`/analytics/shop/${shopId}/dashboard`);
    
    console.log('Shop Dashboard Stats:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching shop dashboard stats:', error);
    throw error;
  }
}
console.log('Analytics Service Loaded',getShopDashboardStats());
export const getRevenueAnalytics = async (shopId, period = 'month') => {
  try {
    const response = await api.get(`/analytics/shop/${shopId}/revenue`, {
      params: { period }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    throw error;
  }
}
export const getCustomerAnalytics = async (shopId) => {
  try {
    const response = await api.get(`/analytics/shop/${shopId}/customers`);
    return response.data;
  } catch (error) {
    console.error('Error fetching customer analytics:', error);
    throw error;
  }
}



