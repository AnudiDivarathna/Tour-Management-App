import mongoose from 'mongoose';

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
      enum: ['tentative', 'confirmed', 'payment_received'],
      default: 'tentative',
    },
    dieselCost: { type: Number, default: 0 },
    driverHelperPayment: { type: Number, default: 0 },
    fuelAdvance: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    commission: { type: Number, default: 0 },
    netProfit: { type: Number, default: 0 },
    highwayBill: { type: Number, default: 0 },
    parkingBill: { type: Number, default: 0 },
    accommodationCharges: { type: Number, default: 0 },
    foodBill: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Tour', tourSchema);
