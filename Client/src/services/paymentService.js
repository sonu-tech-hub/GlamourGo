// client/src/services/paymentService.js
import api from './api';

// Create payment order
export const createPaymentOrder = async (appointmentId) => {
  return api.post('/payments/create-order', { appointmentId });
};

// Verify payment
export const verifyPayment = async (paymentData) => {
  return api.post('/payments/verify', paymentData);
};

// Pay using wallet
export const payUsingWallet = async (appointmentId) => {
  return api.post('/payments/wallet', { appointmentId });
};

// Add funds to wallet
export const addFundsToWallet = async (amount) => {
  return api.post('/payments/wallet/add', { amount });
};

// Get wallet transactions
export const getWalletTransactions = async (page = 1, limit = 10) => {
  return api.get(`/payments/wallet-transactions?page=${page}&limit=${limit}`);
};