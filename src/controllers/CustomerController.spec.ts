import request from 'supertest';

import MongoMock from '@utils/tests/MongoMock';
import { PermissionEnum } from '@utils/enums/PermissionEnum';
import CustomerSchema from '@schemas/CustomerSchema';
import { Customer } from '@interfaces/Customer';
import app from '../app';

describe('Customer tests', () => {
  let customer: Customer;

  let token: string;

  beforeAll(async () => {
    await MongoMock.connect();
  });

  afterAll(async done => {
    await MongoMock.disconnect();
    done();
  });

  beforeEach(async () => {
    await CustomerSchema.deleteMany({});
    token = await MongoMock.createToken(PermissionEnum.owner);
    customer = {
      name: 'thiago',
      phone: '499850473724212',
      deliveryTax: 563.5,
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
  });

  it('Deve criar um cliente', async () => {
    const response = await request(app)
      .post('/customer')
      .set('authorization', `bearer ${token}`)
      .send(customer);

    expect(response.status).toBe(200);
    expect(response.body.name).toBe(customer.name);
    expect(response.body.phone).toBe(customer.phone);
    expect(response.body.deliveryTax).toBe(customer.deliveryTax);
    expect(response.body.address).toBe(customer.address);
    expect(response.body.lot).toBe(customer.lot);
    expect(response.body.block).toBe(customer.block);
    expect(response.body.aptoBlock).toBe(customer.aptoBlock);
    expect(response.body.apto).toBe(customer.apto);
    expect(response.body.district).toBe(customer.district);
    expect(response.body.number).toBe(customer.number);
    expect(response.body.referencePoint).toBe(customer.referencePoint);
    expect(response.body.comments).toBe(customer.comments);
  });

  it('Não deve criar um cliente, se o telefone já existir', async () => {
    await CustomerSchema.create(customer);

    const response = await request(app)
      .post('/customer')
      .set('authorization', `bearer ${token}`)
      .send(customer);

    const { error } = response.body;

    expect(response.status).toBe(400);
    expect(error.name).toBe('CustomerAlreadyExists');
    expect(error.description).toContain('Cliente já cadastrado');
  });

  it('Não deve criar cliente, quando não for enviado o campo name', async () => {
    const response = await request(app)
      .post('/customer')
      .set('authorization', `bearer ${token}`)
      .send({
        phone: '4993213123213213213213213213213850473',
      });

    const { error } = response.body;

    expect(response.status).toBe(400);
    expect(error.name).toBe('ValidationError');
    expect(error.description).toContain('nome do cliente não informado');
    expect(response.body.token).toBeUndefined();
  });

  it('Não deve criar cliente, quando não for enviado o campo phone', async () => {
    const response = await request(app)
      .post('/customer')
      .set('authorization', `bearer ${token}`)
      .send({
        name: 'thiago',
      });

    const { error } = response.body;

    expect(response.status).toBe(400);
    expect(error.name).toBe('ValidationError');
    expect(error.description).toContain('telefone não informado');
    expect(response.body.token).toBeUndefined();
  });

  it('Deve retornar todos os clientes', async () => {
    await CustomerSchema.create(customer);

    const response = await request(app)
      .get('/customer')
      .set('authorization', `bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toContainEqual(
      expect.objectContaining({ name: customer.name, phone: customer.phone }),
    );
  });

  it('Deve retornar um cliente ao pesquisar pelo id', async () => {
    const customerSaved = await CustomerSchema.create(customer);

    const response = await request(app)
      .get(`/customer/${customerSaved._id}`)
      .set('authorization', `bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject(customer);
  });

  it('Deve retornar erro se não achar um cliente pelo id', async () => {
    const response = await request(app)
      .get(`/customer/5e545075fbcbd5e703240406`)
      .set('authorization', `bearer ${token}`);

    const { error } = response.body;

    expect(response.status).toBe(400);
    expect(error.name).toBe('CustomerNotExists');
    expect(error.description).toContain('Cliente não encontrado');
  });

  it('Deve deletar um cliente pelo id', async () => {
    const customerSaved = await CustomerSchema.create(customer);

    const response = await request(app)
      .delete(`/customer/${customerSaved._id}`)
      .set('authorization', `bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toBe('Cliente removido com sucesso');
  });

  it('Não deve deletar um cliente, caso usuário não tenha permissão', async () => {
    token = await MongoMock.createToken(PermissionEnum.employee);

    await CustomerSchema.create(customer);

    const response = await request(app)
      .delete(`/customer/${customer.phone}`)
      .set('authorization', `bearer ${token}`);

    const { error } = response.body;
    expect(response.status).toBe(401);
    expect(error.name).toBe('Unauthorized');
    expect(error.description).toContain(
      'Sem permissão para deletar um cliente',
    );
  });

  it('Não deve deletar um cliente não cadastrado', async () => {
    const response = await request(app)
      .delete(`/customer/5e545075fbcbd5e703240406`)
      .set('authorization', `bearer ${token}`);

    const { error } = response.body;
    expect(response.status).toBe(400);
    expect(error.name).toBe('CustomerNotExists');
    expect(error.description).toContain('Cliente não encontrado');
  });

  it('Deve atualizar um cliente', async () => {
    const customerSaved = await CustomerSchema.create(customer);
    const customerUpdate = {
      _id: customerSaved._id,
      name: 'NOME_ATUALIZADO',
      phone: '499850473724212',
      deliveryTax: 100.5,
      address: 'RUA_ATUALIZADA',
      lot: 'LOTE_ATUALIZADO',
      block: 'BLOCO_ATUALIZADO',
      aptoBlock: 'APTO_BLOCO_ATUALIZADO',
      apto: 'APTO_ATUALIZADO',
      district: 'QUADRA_ATUALIZADA',
      number: 31232132,
      referencePoint: 'PONTO DE REFERENCIA_ATUALIZADA',
      comments: 'COMENTARIO_ATUALIZADO',
      dateOfBirth: Date.now.toString(),
    };
    const response = await request(app)
      .put('/customer')
      .set('authorization', `bearer ${token}`)
      .send(customerUpdate);

    expect(response.status).toBe(200);
    expect(response.body.name).toBe(customerUpdate.name);
    expect(response.body.phone).toBe(customerUpdate.phone);
    expect(response.body.deliveryTax).toBe(customerUpdate.deliveryTax);
    expect(response.body.address).toBe(customerUpdate.address);
    expect(response.body.lot).toBe(customerUpdate.lot);
    expect(response.body.block).toBe(customerUpdate.block);
    expect(response.body.aptoBlock).toBe(customerUpdate.aptoBlock);
    expect(response.body.apto).toBe(customerUpdate.apto);
    expect(response.body.district).toBe(customerUpdate.district);
    expect(response.body.number).toBe(customerUpdate.number);
    expect(response.body.referencePoint).toBe(customerUpdate.referencePoint);
    expect(response.body.comments).toBe(customerUpdate.comments);
    expect(response.body.dateOfBirth).toBe(customerUpdate.dateOfBirth);
  });

  it('Não deve atualizar um cliente não cadastrado', async () => {
    const response = await request(app)
      .put(`/customer`)
      .set('authorization', `bearer ${token}`)
      .send(customer);

    const { error } = response.body;
    expect(response.status).toBe(400);
    expect(error.name).toBe('CustomerNotExists');
    expect(error.description).toContain('Cliente não encontrado');
  });

  it('Não deve atualizar um cliente quando ocorrer um erro indefinido', async () => {
    const response = await request(app)
      .put(`/customer`)
      .set('authorization', `bearer ${token}`)
      .send({
        name: 'NOME_ATUALIZADO',
        phone: '499850473724212',
        deliveryTax: 'dsadassasadsa',
        address: 'RUA_ATUALIZADA',
        lot: 'LOTE_ATUALIZADO',
        block: 'BLOCO_ATUALIZADO',
        aptoBlock: 'APTO_BLOCO_ATUALIZADO',
        apto: 'APTO_ATUALIZADO',
        district: 'QUADRA_ATUALIZADA',
        number: 31232132,
        referencePoint: 'PONTO DE REFERENCIA_ATUALIZADA',
        comments: 'COMENTARIO_ATUALIZADO',
      });

    const { error } = response.body;
    expect(response.status).toBe(400);
    expect(error).not.toBeNull();
    expect(error).not.toBeUndefined();
  });
});
