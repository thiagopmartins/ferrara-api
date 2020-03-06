import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import 'module-alias/register';

import routes from './routes';

class App {
  public express: express.Application;

  public constructor() {
    dotenv.config();
    this.express = express();

    this.middlewares();
    this.database();
    this.routes();
  }

  private middlewares(): void {
    this.express.use(express.json());
    this.express.use(cors({origin: 'https://ferrara-front.herokuapp.com'}));
  }

  private database(): void {
    mongoose.connect(`${process.env.MONGO_URL}`, {
      useNewUrlParser: true,
      useUnifiedTopology: false,
      useCreateIndex: true,
      useFindAndModify: false,
    });
  }

  private routes(): void {
    this.express.use(routes);
  }
}

export default new App().express;
