import mongoose, { Document, Schema } from 'mongoose';

import { Product } from '@interfaces/Product';

type ProductType = Product & Document;

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
    },
    category: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<ProductType>('Product', ProductSchema);
