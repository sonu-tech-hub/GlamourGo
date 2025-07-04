// client/src/services/appointmentService.js
import api from './api';

// Get all user appointments
export const getUserAppointments = async () => {
    try {
        const response = await api.get(`/appointments/user`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user appointments:', error);
        throw error;
    }
};

// Get appointment details
export const getAppointmentDetails = async (appointmentId) => {
    try {
        const response = await api.get(`/appointments/${appointmentId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching appointment by ID:', error);
        throw error;
    }
};
console.log('get appointment  service:', getAppointmentDetails());
// Get available time slots
export const getAvailableTimeSlots = async ({ shopId, serviceId, date }) => { 
    try {
        const response = await api.get(`/appointments/available-slots`, {
            params: { shopId, serviceId, date }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching available time slots:', error);
        throw error;
    }
};
 
// Create appointment
export const createAppointment = async (appointmentData) => {
    try {
        const response = await api.post('/appointments', appointmentData);
        return response.data;
    } catch (error) {
        console.error('Error creating appointment:', error);
        throw error;
    }
};

// Update appointment status
export const updateAppointmentStatus = async (appointmentId, status) => {
    try {
        const response = await api.put(`/appointments/${appointmentId}/status`, { status });
        return response.data;
    } catch (error) {
        console.error('Error updating appointment status:', error);
        throw error;
    }
};

// Cancel appointment
export const cancelAppointment = async (appointmentId) => {
    try {
        // Your backend already handles authorization for cancellation,
        // so this simply calls the status update endpoint with 'cancelled'.
        const response = await api.put(`/appointments/${appointmentId}/cancel`);
        return response.data;
    } catch (error) {
        console.error('Error canceling appointment:', error);
        throw error;
    }
};


export const getShopAppointments = async (shopId) => {
    try {
        const response = await api.get(`/appointments/shop/${shopId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching shop appointments:', error);
        throw error;
    }
};