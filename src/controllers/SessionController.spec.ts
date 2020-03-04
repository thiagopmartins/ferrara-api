import bcrypt from 'bcrypt';
import request from 'supertest';

import MongoMock from '@utils/tests/MongoMock';
import UserSchema from '@schemas/UserSchema';
import { User } from '@interfaces/User';
import app from '../app';

describe('Session tests', () => {
  let user: User;

  beforeAll(async () => {
    await MongoMock.connect();
  });

  afterAll(async done => {
    await MongoMock.disconnect();
    done();
  });

  beforeEach(async () => {
    await UserSchema.deleteMany({});

    user = {
      name: 'nome_qualquer',
      password: 'password_qualquer',
      permission: 1,
    };
  });

  it('Deve retornar um token, se credenciais forem válidas', async () => {
    await UserSchema.create({
      name: user.name,
      password: bcrypt.hashSync(user.password, 12),
      permission: 1,
    });

    const response = await request(app)
      .post('/session')
      .send(user);

    expect(response.status).toBe(200);
    expect(response.body.token).not.toBeUndefined();
    expect(response.body.token).not.toBeNull();
    expect(response.body.user.name).toBe(user.name);
    expect(response.body.user.permission).toBe(user.permission);
  });

  it('Não deve retornar um token, caso password for incorreto', async () => {
    await UserSchema.create({
      name: user.name,
      password: bcrypt.hashSync('password_invalid', 12),
      permission: 1,
    });

    const response = await request(app)
      .post('/session')
      .send(user);

    const { error } = response.body;

    expect(response.status).toBe(401);
    expect(error.name).toBe('Unauthorized');
    expect(error.description).toBe('Usuario ou password inválido');
    expect(response.body.token).toBeUndefined();
  });

  it('Não deve retornar um token, caso usuário não existir', async () => {
    const response = await request(app)
      .post('/session')
      .send(user);

    const { error } = response.body;

    expect(response.status).toBe(401);
    expect(error.name).toBe('Unauthorized');
    expect(error.description).toBe('Usuario ou password inválido');
    expect(response.body.token).toBeUndefined();
  });

  it('Não deve retornar um token, quando não for enviado o campo name', async () => {
    const response = await request(app)
      .post('/session')
      .send({ password: user.password });

    const { error } = response.body;

    expect(response.status).toBe(400);
    expect(error.name).toBe('ValidationError');
    expect(error.description).toContain('usuário não informado');
    expect(response.body.token).toBeUndefined();
  });
});
