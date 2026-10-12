const mongoose = require('mongoose');
const crypto = require('crypto');

const walletTransactionSchema = new mongoose.Schema(
  {
    transactionId: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    currency: { type: String, required: true },
    type: { type: String, enum: ['CREDIT', 'DEBIT'], default: 'CREDIT' },
    amount: { type: Number, required: true },
    source: { type: String, default: 'DAILY_STREAK' },
    referenceId: { type: String, required: true }, // e.g. STREAK-<random>
    streakDay: { type: Number },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    status: { type: String, enum: ['SUCCESS', 'FAILED'], default: 'SUCCESS' },
  },
  { timestamps: true }
);

walletTransactionSchema.statics.generateReferenceId = function generateReferenceId() {
  return `STREAK-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
};

walletTransactionSchema.statics.generateTransactionId = function generateTransactionId() {
  return `TXN-${crypto.randomBytes(6).toString('hex')}`;
};

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);
