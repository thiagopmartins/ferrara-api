// eslint-disable-next-line import/no-extraneous-dependencies
import request from 'supertest';

import MongoMock from '@utils/tests/MongoMock';
import { PermissionEnum } from '@utils/enums/PermissionEnum';
import DiscountSchema from '@schemas/DiscountSchema';
import { Discount } from '@interfaces/Discount';
import { DiscountTypeEnum } from '@utils/enums/DiscountTypeEnum';
import app from '../app';

describe('Create Discount', () => {
  let discount: Discount;

  let token: string;

  beforeAll(async () => {
    await MongoMock.connect();
  });

  afterAll(async done => {
    await MongoMock.disconnect();
    done();
  });

  beforeEach(async () => {
    await DiscountSchema.deleteMany({});
    token = await MongoMock.createToken(PermissionEnum.owner);
    discount = {
      name: 'discount name',
      expireDate: new Date(),
      value: 563.5,
      type: DiscountTypeEnum.percentage,
    };
  });

  it('deve cadastrar um Cupom', async () => {
    const response = await request(app)
      .post('/discount')
      .set('authorization', `bearer ${token}`)
      .send(discount);

    const { name, expireDate, value, type } = response.body;
    expect(response.status).toBe(200);
    expect(name).toBe(discount.name);
    expect(expireDate).toBe(expireDate);
    expect(value).toBe(value);
    expect(type).toBe(type);
  });

  it('Não deve cadastrar um Cupom, quando não for enviado o campo name', async () => {
    const response = await request(app)
      .post('/discount')
      .set('authorization', `bearer ${token}`)
      .send({
        expireDate: discount.expireDate,
        value: discount.value,
        type: discount.type,
      });

    const { error } = response.body;

    expect(response.status).toBe(400);
    expect(error.name).toBe('ValidationError');
    expect(error.description).toContain('nome do Cupom não informado');
    expect(response.body.token).toBeUndefined();
  });

  it('Não deve cadastrar um produto, quando não for enviado o campo expireDate', async () => {
    const response = await request(app)
      .post('/discount')
      .set('authorization', `bearer ${token}`)
      .send({
        name: discount.name,
        value: discount.value,
        type: discount.type,
      });

    const { error } = response.body;
    expect(response.status).toBe(400);
    expect(error.name).toBe('ValidationError');
    expect(error.description).toEqual(
      expect.arrayContaining(['validade do Cupom não informado']),
    );
    expect(response.body.token).toBeUndefined();
  });

  it('Não deve cadastrar um produto, quando não for enviado o campo value', async () => {
    const response = await request(app)
      .post('/discount')
      .set('authorization', `bearer ${token}`)
      .send({
        name: discount.name,
        expireDate: discount.expireDate,
        type: discount.type,
      });

    const { error } = response.body;

    expect(response.status).toBe(400);
    expect(error.name).toBe('ValidationError');
    expect(error.description).toContain('valor do Cupom não informado');
    expect(response.body.token).toBeUndefined();
  });

  it('Não deve cadastrar um produto, quando não for enviado o campo type', async () => {
    const response = await request(app)
      .post('/discount')
      .set('authorization', `bearer ${token}`)
      .send({
        name: discount.name,
        expireDate: discount.expireDate,
        value: discount.value,
      });

    const { error } = response.body;

    expect(response.status).toBe(400);
    expect(error.name).toBe('ValidationError');
    expect(error.description).toContain('tipo do Cupom não informado');
    expect(response.body.token).toBeUndefined();
  });

  it('Não deve criar um Cupom, caso usuário não tenha permissão', async () => {
    token = await MongoMock.createToken(PermissionEnum.employee);

    const response = await request(app)
      .post('/discount')
      .set('authorization', `bearer ${token}`)
      .send(discount);

    const { error } = response.body;
    expect(response.status).toBe(401);
    expect(error.name).toBe('Unauthorized');
    expect(error.description).toContain('Sem permissão para criar um Cupom');
  });

  it('Deve retornar todos os Cupons não vencidos', async () => {
    discount.expireDate = new Date(
      discount.expireDate.getFullYear(),
      discount.expireDate.getMonth(),
      discount.expireDate.getDate(),
      23,
      59,
      59,
      999,
    );
    await DiscountSchema.create(discount);

    const response = await request(app)
      .get('/discount')
      .set('authorization', `bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body[0].name).toBe(discount.name);
    expect(response.body[0].expireDate).toBe(discount.expireDate.toISOString());
    expect(response.body[0].value).toBe(discount.value);
    expect(DiscountTypeEnum[response.body[0].type]).toBe(
      DiscountTypeEnum[discount.type],
    );
  });

  it('Deve retornar um Cupom ao pesquisar pelo id', async () => {
    const discountSaved = await DiscountSchema.create(discount);

    const response = await request(app)
      .get(`/discount/${discountSaved._id}`)
      .set('authorization', `bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.name).toBe(discount.name);
    expect(response.body.expireDate).toBe(discount.expireDate.toISOString());
    expect(response.body.value).toBe(discount.value);
    expect(DiscountTypeEnum[response.body.type]).toBe(
      DiscountTypeEnum[discount.type],
    );
  });

  it('Deve retornar erro se não achar um Cupom pelo id', async () => {
    const response = await request(app)
      .get(`/discount/5e545075fbcbd5e703240406`)
      .set('authorization', `bearer ${token}`);

    const { error } = response.body;

    expect(response.status).toBe(400);
    expect(error.name).toBe('DiscountNotExists');
    expect(error.description).toContain('Cupom não encontrado');
  });

  it('Deve deletar um Cupom pelo id', async () => {
    const discountSaved = await DiscountSchema.create(discount);

    const response = await request(app)
      .delete(`/discount/${discountSaved.id}`)
      .set('authorization', `bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toBe('Cupom removido com sucesso');
  });

  it('Não deve deletar um Cupom, caso usuário não tenha permissão', async () => {
    token = await MongoMock.createToken(PermissionEnum.employee);

    const discountSaved = await DiscountSchema.create(discount);

    const response = await request(app)
      .delete(`/discount/${discountSaved.id}`)
      .set('authorization', `bearer ${token}`);

    const { error } = response.body;
    expect(response.status).toBe(401);
    expect(error.name).toBe('Unauthorized');
    expect(error.description).toContain('Sem permissão para deletar um Cupom');
  });

  it('Não deve deletar um Cupom não cadastrado', async () => {
    const response = await request(app)
      .delete(`/discount/5e545075fbcbd5e703240406`)
      .set('authorization', `bearer ${token}`);

    const { error } = response.body;
    expect(response.status).toBe(400);
    expect(error.name).toBe('DiscountNotExists');
    expect(error.description).toContain('Cupom não encontrado');
  });

  it('Deve atualizar um Cupom', async () => {
    const discountSaved = await DiscountSchema.create(discount);
    const discountUpdate = {
      _id: discountSaved._id,
      name: 'NOME_ATUALIZADO',
      type: DiscountTypeEnum.value,
      value: 100.5,
      expireDate: new Date(),
    };
    const response = await request(app)
      .put('/discount')
      .set('authorization', `bearer ${token}`)
      .send(discountUpdate);

    const { name, expireDate, type, value } = response.body;

    expect(response.status).toBe(200);
    expect(name).toBe(discountUpdate.name);
    expect(DiscountTypeEnum[type]).toBe(DiscountTypeEnum[discountUpdate.type]);
    expect(value).toBe(discountUpdate.value);
    expect(expireDate).toBe(discountUpdate.expireDate.toISOString());
  });

  it('Não deve atualizar um Cupom não cadastrado', async () => {
    const response = await request(app)
      .put(`/discount`)
      .set('authorization', `bearer ${token}`)
      .send(discount);

    const { error } = response.body;
    expect(response.status).toBe(400);
    expect(error.name).toBe('DiscountNotExists');
    expect(error.description).toContain('Cupom não encontrado');
  });
});
