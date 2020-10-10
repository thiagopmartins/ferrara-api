import mongoose, { Document, Schema } from 'mongoose';

import { Deliveryman } from '@interfaces/Deliveryman';

type DeliverymanType = Deliveryman & Document;

const DeliverymanSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    category: {},
    category6: {},
    category10: {},
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<DeliverymanType>(
  'Deliveryman',
  DeliverymanSchema,
);
