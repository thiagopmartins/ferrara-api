import mongoose, { Document, Schema } from 'mongoose';

import { Order } from '@interfaces/Order';

type OrderType = Order & Document;

const OrderSchema = new Schema(
  {
    customer: {},
    productsOfOrder: [{}],
    discount: { type: mongoose.Schema.Types.ObjectId, ref: 'Discount' },
    deliveryman: { type: mongoose.Schema.Types.ObjectId, ref: 'Deliverymen' },
    price: {
      type: Number,
    },
    status: {
      type: String,
    },
    finishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<OrderType>('Order', OrderSchema);
