// eslint-disable-next-line import/no-extraneous-dependencies
import request from 'supertest';

import MongoMock from '@utils/tests/MongoMock';
import { PermissionEnum } from '@utils/enums/PermissionEnum';
import ProductSchema from '@schemas/ProductSchema';
import { Product } from '@interfaces/Product';
import { CategoryEnum } from '@utils/enums/CategoryEnum';
import app from '../app';

describe('Create Product', () => {
  let product: Product;

  let token: string;

  beforeAll(async () => {
    await MongoMock.connect();
  });

  afterAll(async done => {
    await MongoMock.disconnect();
    done();
  });

  beforeEach(async () => {
    await ProductSchema.deleteMany({});
    token = await MongoMock.createToken(PermissionEnum.owner);
    product = {
      name: 'product name',
      description: 'description product',
      price: 563.5,
      category: CategoryEnum.pizzaSalgada45,
    };
  });

  it('deve cadastrar um produto', async () => {
    const response = await request(app)
      .post('/product')
      .set('authorization', `bearer ${token}`)
      .send(product);

    const { name, description, price, category } = response.body;
    expect(response.status).toBe(200);
    expect(name).toBe(product.name);
    expect(description).toBe(description);
    expect(price).toBe(price);
    expect(category).toBe(category);
  });

  it('Não deve cadastrar um produto, quando não for enviado o campo name', async () => {
    const response = await request(app)
      .post('/product')
      .set('authorization', `bearer ${token}`)
      .send({
        description: product.description,
        price: product.price,
        category: product.category,
      });

    const { error } = response.body;

    expect(response.status).toBe(400);
    expect(error.name).toBe('ValidationError');
    expect(error.description).toContain('nome do produto não informado');
    expect(response.body.token).toBeUndefined();
  });

  it('Não deve cadastrar um produto, quando não for enviado o campo description', async () => {
    const response = await request(app)
      .post('/product')
      .set('authorization', `bearer ${token}`)
      .send({
        name: product.name,
        price: product.price,
        category: product.category,
      });

    const { error } = response.body;

    expect(response.status).toBe(400);
    expect(error.name).toBe('ValidationError');
    expect(error.description).toContain('descrição do produto não informado');
    expect(response.body.token).toBeUndefined();
  });

  it('Não deve criar um produto, caso usuário não tenha permissão', async () => {
    token = await MongoMock.createToken(PermissionEnum.employee);

    const response = await request(app)
      .post('/product')
      .set('authorization', `bearer ${token}`)
      .send(product);

    const { error } = response.body;
    expect(response.status).toBe(401);
    expect(error.name).toBe('Unauthorized');
    expect(error.description).toContain('Sem permissão para criar um produto');
  });

  it('Deve retornar todos os produtos', async () => {
    await ProductSchema.create(product);

    const response = await request(app)
      .get('/product')
      .set('authorization', `bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body[0].name).toBe(product.name);
    expect(response.body[0].description).toBe(product.description);
    expect(response.body[0].price).toBe(product.price);
    expect(CategoryEnum[response.body[0].category]).toBe(
      CategoryEnum[product.category],
    );
  });

  it('Não deve retornar lista de produtos, caso usuário não tenha permissão', async () => {
    token = await MongoMock.createToken(PermissionEnum.employee);

    const response = await request(app)
      .get('/product')
      .set('authorization', `bearer ${token}`)
      .send(product);

    const { error } = response.body;
    expect(response.status).toBe(401);
    expect(error.name).toBe('Unauthorized');
    expect(error.description).toContain(
      'Sem permissão para consultar produtos',
    );
  });

  it('Deve retornar um produto ao pesquisar pelo id', async () => {
    const productSaved = await ProductSchema.create(product);

    const response = await request(app)
      .get(`/product/${productSaved._id}`)
      .set('authorization', `bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.name).toBe(product.name);
    expect(response.body.description).toBe(product.description);
    expect(response.body.price).toBe(product.price);
    expect(CategoryEnum[response.body.category]).toBe(
      CategoryEnum[product.category],
    );
  });

  it('Deve retornar erro se não achar um produto pelo id', async () => {
    const response = await request(app)
      .get(`/product/5e545075fbcbd5e703240406`)
      .set('authorization', `bearer ${token}`);

    const { error } = response.body;

    expect(response.status).toBe(400);
    expect(error.name).toBe('ProductNotExists');
    expect(error.description).toContain('Produto não encontrado');
  });

  it('Não deve retornar um produto, caso usuário não tenha permissão', async () => {
    token = await MongoMock.createToken(PermissionEnum.employee);
    const productSaved = await ProductSchema.create(product);
    const response = await request(app)
      .get(`/product/${productSaved._id}`)
      .set('authorization', `bearer ${token}`);

    const { error } = response.body;
    expect(response.status).toBe(401);
    expect(error.name).toBe('Unauthorized');
    expect(error.description).toContain(
      'Sem permissão para consultar um produto',
    );
  });

  it('Deve deletar um produto pelo id', async () => {
    const productSaved = await ProductSchema.create(product);

    const response = await request(app)
      .delete(`/product/${productSaved.id}`)
      .set('authorization', `bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toBe('Produto removido com sucesso');
  });

  it('Não deve deletar um produto, caso usuário não tenha permissão', async () => {
    token = await MongoMock.createToken(PermissionEnum.employee);

    const productSaved = await ProductSchema.create(product);

    const response = await request(app)
      .delete(`/product/${productSaved.id}`)
      .set('authorization', `bearer ${token}`);

    const { error } = response.body;
    expect(response.status).toBe(401);
    expect(error.name).toBe('Unauthorized');
    expect(error.description).toContain(
      'Sem permissão para deletar um produto',
    );
  });

  it('Não deve deletar um produto não cadastrado', async () => {
    const response = await request(app)
      .delete(`/product/5e545075fbcbd5e703240406`)
      .set('authorization', `bearer ${token}`);

    const { error } = response.body;
    expect(response.status).toBe(400);
    expect(error.name).toBe('ProductNotExists');
    expect(error.description).toContain('Produto não encontrado');
  });

  it('Deve atualizar um produto', async () => {
    const productSaved = await ProductSchema.create(product);
    const productUpdate = {
      _id: productSaved._id,
      name: 'NOME_ATUALIZADO',
      category: CategoryEnum.pizzaDoce35,
      price: 100.5,
      description: 'DESCRICAO_ATUALIZADA',
    };
    const response = await request(app)
      .put('/product')
      .set('authorization', `bearer ${token}`)
      .send(productUpdate);

    const { name, description, price, category } = response.body;

    expect(response.status).toBe(200);
    expect(name).toBe(productUpdate.name);
    expect(CategoryEnum[category]).toBe(CategoryEnum[productUpdate.category]);
    expect(description).toBe(productUpdate.description);
    expect(price).toBe(productUpdate.price);
  });

  it('Não deve atualizar um produto não cadastrado', async () => {
    const response = await request(app)
      .put(`/product`)
      .set('authorization', `bearer ${token}`)
      .send(product);

    const { error } = response.body;
    expect(response.status).toBe(400);
    expect(error.name).toBe('ProductNotExists');
    expect(error.description).toContain('Produto não encontrado');
  });

  it('Não deve atualizar um produto quando ocorrer um erro indefinido', async () => {
    const response = await request(app)
      .put(`/product`)
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
