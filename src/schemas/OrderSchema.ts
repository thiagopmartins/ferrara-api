import mongoose, { Document, Schema } from 'mongoose';

import { Order } from '@interfaces/Order';

type OrderType = Order & Document;

const OrderSchema = new Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer'
    },
    produtcs: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
    ],
    price: {
      type: Number
    },
    status: {
      type: String
    }
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<OrderType>('Order', OrderSchema);
