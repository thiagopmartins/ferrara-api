import mongoose, { Document, Schema } from 'mongoose';

import { User } from '@interfaces/User';

type UserType = User & Document;

const UserSchema = new Schema(
  {
    name: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    permission: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<UserType>('User', UserSchema);
