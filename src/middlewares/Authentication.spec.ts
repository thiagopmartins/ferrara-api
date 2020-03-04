import jwt from 'jsonwebtoken';
import request from 'supertest';
import express, { Request, Response } from 'express';

import MongoMock from '@utils/tests/MongoMock';
import Authentication from '@middlewares/Authentication';
import config from '@config/auth';

describe('Middleware authentication tests', () => {
  const app = express();

  const jwtPayload = {
    id: '1',
    name: 'usuario_qualquer',
    permission: 1,
  };

  const token: string = jwt.sign({ jwtPayload }, config.secret);

  app.get('/testing', Authentication, (req: Request, res: Response) => {
    res.status(200).json('success');
  });

  beforeAll(async () => {
    await MongoMock.connect();
  });

  afterAll(async done => {
    await MongoMock.disconnect();
    done();
  });

  it('Deve retornar sem autorização se não for enviado um token', async () => {
    const response = await request(app).get('/testing');

    const { error } = response.body;

    expect(response.status).toBe(401);
    expect(error.name).toBe('Unauthorized');
    expect(error.description).toContain('Token não enviado');
  });

  it('Deve retornar sem autorização se for enviado um token inválido', async () => {
    const response = await request(app)
      .get('/testing')
      .set('authorization', 'token_invalido');

    const { error } = response.body;

    expect(response.status).toBe(401);
    expect(error.name).toBe('Unauthorized');
    expect(error.description).toContain('Token inválido');
  });

  it('Deve retornar 200 se for enviado um token válido', async () => {
    const response = await request(app)
      .get('/testing')
      .set('authorization', `bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toBe('success');
  });
});
