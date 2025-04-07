// server/controllers/paymentController.js
const paymentService = require('../services/paymentService');

// Create payment order
exports.createPaymentOrder = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const userId = req.user._id;
    
    const orderData = await paymentService.createPaymentOrder(appointmentId, userId);
    
    res.json(orderData);
  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(400).json({ message: error.message });
  }
};

// Verify payment
exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature, appointmentId } = req.body;
    
    const result = await paymentService.verifyPayment({
      orderId,
      paymentId,
      signature,
      appointmentId
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(400).json({ message: error.message });
  }
};

// Add money to wallet
exports.addMoneyToWallet = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user._id;
    
    const orderData = await paymentService.addMoneyToWallet(userId, amount);
    
    res.json(orderData);
  } catch (error) {
    console.error('Error adding money to wallet:', error);
    res.status(400).json({ message: error.message });
  }
};

// Verify wallet recharge
exports.verifyWalletRecharge = async (req, res) => {
  try {
    const { orderId, paymentId, signature, amount } = req.body;
    const userId = req.user._id;
    
    const result = await paymentService.verifyWalletRecharge({
      orderId,
      paymentId,
      signature,
      userId,
      amount
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error verifying wallet recharge:', error);
    res.status(400).json({ message: error.message });
  }
};

// Pay using wallet
exports.payUsingWallet = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const userId = req.user._id;
    
    const result = await paymentService.payUsingWallet(appointmentId, userId);
    
    res.json(result);
  } catch (error) {
    console.error('Error paying using wallet:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get payment history
exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;
    
    const payments = await paymentService.getPaymentHistory(userId, page, limit);
    
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get wallet transactions
exports.getWalletTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;
    
    const transactions = await paymentService.getWalletTransactions(userId, page, limit);
    
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching wallet transactions:', error);    
    res.status(400).json({ message: error.message });
  }
};
