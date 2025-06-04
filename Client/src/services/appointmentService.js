// client/src/services/appointmentService.js
import api from './api';

// Get all user appointments
export const getUserAppointments = async () => {
  return api.get('/appointments/user');
};

// Get appointment details
export const getAppointmentDetails = async (appointmentId) => {
  return api.get(`/appointments/${appointmentId}`);
};

// Get available time slots
export const getAvailableTimeSlots = async (data) => {
  return api.get('/appointments/time-slots', { params: data });
};

// Create appointment
export const createAppointment = async (appointmentData) => {
  return api.post('/appointments', appointmentData);
};

// Update appointment status
export const updateAppointmentStatus = async (appointmentId, status) => {
  return api.put(`/appointments/${appointmentId}/status`, { status });
};

// Cancel appointment
export const cancelAppointment = async (appointmentId) => {
  return api.delete(`/appointments/${appointmentId}`);
};
