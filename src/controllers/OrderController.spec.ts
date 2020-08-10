/* eslint-disable import/no-extraneous-dependencies */
import request from 'supertest';

import MongoMock from '@utils/tests/MongoMock';
import CustomerSchema from '@schemas/CustomerSchema';
import { Customer } from '@interfaces/Customer';
import OrderSchema from '@schemas/OrderSchema';
import { PermissionEnum } from '@utils/enums/PermissionEnum';
import { Order } from '@interfaces/Order';
import { Product } from '@interfaces/Product';
import ProductSchema from '@schemas/ProductSchema';
import { CategoryEnum } from '@utils/enums/CategoryEnum';
import { OrderStatusEnum } from '@utils/enums/OrderStatusEnum';
import ProductController from './ProductController';
import app from '../app';

describe('Customer tests', () => {
  let token: string;
  let order: Order;
  let customerId: string;
  let productsId: string[];

  beforeAll(async () => {
    await MongoMock.connect();
  });

  afterAll(async done => {
    await MongoMock.disconnect();
    done();
  });

  beforeEach(async () => {
    await OrderSchema.deleteMany({});
    await CustomerSchema.deleteMany({});
    await ProductSchema.deleteMany({});
    token = await MongoMock.createToken(PermissionEnum.owner);
    const customer: Customer = {
      name: 'thiago',
      phone: '4998504737',
      deliveryTax: +Math.random().toFixed(2),
      address: 'rua',
      lot: '53',
      block: 'A',
      aptoBlock: '53A',
      apto: '204',
      district: 'QUADRA A',
      number: 53,
      referencePoint: 'Perto do a',
      comments: 'Comentario qualquer',
      dateOfBirth: Date.now.toString(),
    };
    const productList: Product[] = [
      {
        category: CategoryEnum.pizzaDoce30,
        description: 'Descricao',
        name: 'produto1',
        price: +Math.random().toFixed(2),
      },
      {
        category: CategoryEnum.pizzaDoce30,
        description: 'Descricao',
        name: 'produto2',
        price: +Math.random().toFixed(2),
      },
      {
        category: CategoryEnum.pizzaDoce30,
        description: 'Descricao',
        name: 'produto3',
        price: +Math.random().toFixed(2),
      },
    ];
    customerId = (await CustomerSchema.create(customer)).id;
    productsId = (await ProductSchema.create(productList)).map(m => m.id);
    order = {
      customer: customerId,
      products: productsId,
      price: +Math.random().toFixed(2),
      status: OrderStatusEnum.production,
    };
  });

  it('Deve criar um pedido', async () => {
    const response = await request(app)
      .post('/order')
      .set('authorization', `bearer ${token}`)
      .send(order);

    const { price, _id } = response.body;
    expect(response.status).toBe(200);
    expect(price.toFixed(2)).toBe(order.price.toFixed(2));
    expect(_id).not.toBeNull();
    expect(_id).not.toBeUndefined();
  });
});
