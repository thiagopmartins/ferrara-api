import mongoose, { Mongoose } from 'mongoose';
import dotenv from 'dotenv';

import config from '@config/auth';
import jwt from 'jsonwebtoken';

class MongoMock {
  private database: Mongoose;

  async connect(): Promise<void> {
    dotenv.config({
      path: process.env.NODE_ENV?.trim() === 'test' ? '.env.test' : '.env',
    });

    if (!process.env.MONGO_URL) {
      throw new Error('MongoDB server not initialized');
    }

    this.database = await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
  }

  async disconnect(): Promise<void> {
    return this.database.disconnect();
  }

  async createToken(permission: number): Promise<string> {
    const jwtPayload = {
      id: '1',
      name: 'usuario_qualquer',
      permission,
    };

    const token: string = jwt.sign({ jwtPayload }, config.secret);

    return token;
  }
}

export default new MongoMock();
