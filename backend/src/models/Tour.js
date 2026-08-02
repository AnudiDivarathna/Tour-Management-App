import mongoose from 'mongoose';
import { EXPENSE_CATEGORY_KEYS } from '../utils/tourExpenses.js';

const expenseSchema = new mongoose.Schema(
  {
    category: { type: String, enum: EXPENSE_CATEGORY_KEYS, required: true },
    amount: { type: Number, default: 0 },
    note: { type: String, default: '', trim: true },
    date: { type: Date, default: null },
  },
  { _id: true }
);

const tourSchema = new mongoose.Schema(
  {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    company: { type: String, default: '', trim: true },
    tourNo: { type: String, default: '', trim: true },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null,
    },
    status: {
      type: String,
      enum: ['scheduled', 'ongoing', 'payment_pending', 'payment_received'],
      default: 'scheduled',
    },
    dieselCost: { type: Number, default: 0 },
    driverPayment: { type: Number, default: 0 },
    helperPayment: { type: Number, default: 0 },
    fuelAdvance: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    commission: { type: Number, default: 0 },
    netProfit: { type: Number, default: 0 },
    highwayBill: { type: Number, default: 0 },
    parkingBill: { type: Number, default: 0 },
    accommodationCharges: { type: Number, default: 0 },
    foodBill: { type: Number, default: 0 },
    waterBottles: { type: Number, default: 0 },
    expenses: { type: [expenseSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model('Tour', tourSchema);
