const mongoose = require('mongoose');

const splitSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true }, // Storing amounts as integers (paise/cents)
}, { _id: false });

const expenseSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true }, // Storing amounts as integers
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  splitType: { 
    type: String, 
    enum: ['equal', 'custom_amount', 'custom_percentage'], 
    required: true 
  },
  splits: [splitSchema],
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
