const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['credit', 'debit'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String
    },
    relatedAppointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    },
    relatedOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PaymentOrder' // Assuming you have a PaymentOrder model
    },
    paymentMethod: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'completed'
    },
    transactionId: {
        type: String,
        unique: true // For tracking external transaction IDs
    },
    currency: {
        type: String,
        default: 'INR' // You might want to make this configurable
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Transaction', TransactionSchema);