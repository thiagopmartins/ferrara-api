import { Response } from 'express';
import 'moment/locale/pt-br';

import { RequestCustom } from '@interfaces/RequestCustom';
import ProductSchema from '@schemas/ProductSchema';
import OrderSchema from '@schemas/OrderSchema';
import { OrderStatusEnum } from '@utils/enums/OrderStatusEnum';
import CustomerSchema from '@schemas/CustomerSchema';

class OrderController {
  public async store(req: RequestCustom, res: Response): Promise<Response> {
    const { customer, products, price } = req.body;
    
    const result = await OrderSchema.create({
      customer,
      products,
      price,
      status: OrderStatusEnum.production
    });

    return res.json(result);
  }
}

export default new OrderController();
