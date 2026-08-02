import mongoose from 'mongoose';

export const VEHICLE_TYPES = ['bus', 'van', 'long_coach'];
export const VEHICLE_CATEGORIES = ['owned', 'others'];

const vehicleSchema = new mongoose.Schema(
  {
    numberPlate: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: VEHICLE_TYPES,
      required: true,
    },
    category: {
      type: String,
      enum: VEHICLE_CATEGORIES,
      default: 'others',
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Vehicle', vehicleSchema);
