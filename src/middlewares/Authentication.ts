/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response, NextFunction } from 'express';
import { promisify } from 'util';
import * as jwt from 'jsonwebtoken';
import { string, object, number } from 'yup';

import config from '@config/auth';
import { RequestCustom } from '@interfaces/RequestCustom';

export default async (
  req: RequestCustom,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  const authHeader = req.get('authorization');

  if (!authHeader) {
    return res.status(401).json({
      error: {
        name: 'Unauthorized',
        description: 'Token não enviado',
      },
    });
  }
  try {
    const token: string = authHeader ? authHeader.split(' ')[1] : 'error';

    const { jwtPayload }: any = await promisify(jwt.verify)(
      token,
      config.secret,
    );
    const schema = object().shape({
      name: string().required(),
      id: string().required(),
      permission: number().required(),
    });

    await schema.validate(jwtPayload);

    req.name = jwtPayload.name;
    req.permission = jwtPayload.permission;
    req.id = jwtPayload.id;

    return next();
  } catch (error) {
    return res.status(401).json({
      error: {
        name: 'Unauthorized',
        description: 'Token inválido',
      },
    });
  }
};
