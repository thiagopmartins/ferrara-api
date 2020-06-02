import mongoose, { Document, Schema } from 'mongoose';

import { Discount } from '@interfaces/Discount';

type DiscountType = Discount & Document;

const DiscountSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    expireDate: {
      type: Date,
    },
    value: {
      type: Number,
    },
    type: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<DiscountType>('Discount', DiscountSchema);
