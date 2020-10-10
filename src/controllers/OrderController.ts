/* eslint-disable no-plusplus */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-globals */
import { Response } from 'express';
import 'moment/locale/pt-br';

import { RequestCustom } from '@interfaces/RequestCustom';
import OrderSchema from '@schemas/OrderSchema';
import DiscountSchema from '@schemas/DiscountSchema';
import { OrderStatusEnum } from '@utils/enums/OrderStatusEnum';
import DeliverymanSchema from '@schemas/DeliverymanSchema';
import { Deliveryman } from '@interfaces/Deliveryman';

type Nullable<T> = T | null;

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
    const orders = await OrderSchema.find({});

    return res.json(orders);
  }

  public async index(req: RequestCustom, res: Response): Promise<Response> {
    // eslint-disable-next-line prefer-destructuring
    const status: number = +req.params.status;
    const orders = await OrderSchema.find({
      status,
    });

    return res.json(orders);
  }

  public async update(req: RequestCustom, res: Response): Promise<Response> {
    const status: number = +req.body.status;
    let finishedAt: Nullable<Date> = null;

    if (status === OrderStatusEnum.finished) {
      finishedAt = new Date();

      const deliveryman = await DeliverymanSchema.findOne({
        _id: req.body.deliveryman._id,
      });

      if (deliveryman !== null) {
        const { deliveryTax } = req.body.customer;

        if (deliveryTax === 4) {
          if (
            deliveryman.category6 === undefined ||
            deliveryman.category6 === null
          ) {
            deliveryman.category6 = {
              quantity: 0,
              value: 0,
            };
          }
          deliveryman.category6.quantity++;
          deliveryman.category6.value += 6;
        } else if (deliveryTax === 6) {
          if (
            deliveryman.category10 === undefined ||
            deliveryman.category10 === null
          ) {
            deliveryman.category10 = {
              quantity: 0,
              value: 0,
            };
          }
          deliveryman.category10.quantity++;
          deliveryman.category10.value += 10;
        } else {
          if (
            deliveryman.category === undefined ||
            deliveryman.category === null
          ) {
            deliveryman.category = {
              quantity: 0,
              value: 0,
            };
          }
          deliveryman.category.quantity++;
          deliveryman.category.value += deliveryTax;
        }
        await DeliverymanSchema.updateOne(
          { _id: req.body.deliveryman._id },
          deliveryman,
        );
      }
    }

    const order = await OrderSchema.findOneAndUpdate(
      {
        _id: req.body._id,
      },
      {
        status,
        finishedAt,
        deliveryman: req.body.deliveryman,
      },
    );

    return res.status(200).json(order);
  }
}

export default new OrderController();
