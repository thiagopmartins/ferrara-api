import mongoose, { Document, Schema } from 'mongoose';

import { Customer } from '@interfaces/Customer';

type CustomerType = Customer & Document;

const CustomerSchema = new Schema(
  {
    name: {
      type: String,
      lowercase: true,
      trim: true,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    deliveryTax: {
      type: Number,
    },
    address: {
      type: String,
    },
    lot: {
      type: String,
    },
    block: {
      type: String,
    },
    aptoBlock: {
      type: String,
    },
    apto: {
      type: String,
    },
    district: {
      type: String,
    },
    number: {
      type: Number,
    },
    referencePoint: {
      type: String,
    },
    comments: {
      type: String,
    },
    dateOfBirth: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<CustomerType>('Customer', CustomerSchema);
