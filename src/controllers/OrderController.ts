import { Response } from 'express';
import 'moment/locale/pt-br';

import { RequestCustom } from '@interfaces/RequestCustom';
import OrderSchema from '@schemas/OrderSchema';
import DiscountSchema from '@schemas/DiscountSchema';
import { OrderStatusEnum } from '@utils/enums/OrderStatusEnum';

class OrderController {
  public async store(req: RequestCustom, res: Response): Promise<Response> {
    const { customer, productsOfOrder, price, discount } = req.body;

    if (
      customer === null ||
      customer === undefined ||
      customer.name === 'Nenhum'
    ) {
      return res.status(401).json({
        error: {
          name: 'InvalidRequest',
          description: 'Não foi informado um cliente válido',
        },
      });
    }

    const result = await OrderSchema.create({
      customer,
      productsOfOrder,
      price,
      discount,
      status: OrderStatusEnum.production,
    });

    if (discount !== undefined && discount !== null) {
      await DiscountSchema.findOneAndUpdate(
        { _id: discount._id },
        { $inc: { totalUse: 1 } },
      ).exec();
    }
    return res.json(result);
  }

  public async show(req: RequestCustom, res: Response): Promise<Response> {
    const { status } = req.params;
    const orders = await OrderSchema.find({
      status: OrderStatusEnum.production,
    });

    return res.json(orders);
  }

  public async update(req: RequestCustom, res: Response): Promise<Response> {
    const order = await OrderSchema.findOneAndUpdate(
      {
        _id: req.body._id,
      },
      {
        status: OrderStatusEnum.sending,
        finishedAt: new Date(),
      },
    );

    return res.status(200).json(order);
  }
}

export default new OrderController();
