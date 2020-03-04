import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import * as yup from 'yup';

import UserSchema from '@schemas/UserSchema';
import config from '@config/auth';

class SessionController {
  public async store(req: Request, res: Response): Promise<Response> {
    const schema = yup.object().shape({
      name: yup.string().required('usuário não informado'),
      password: yup.string().required('Senha não informada'),
    });

    await schema.validate(req.body).catch(err => {
      return res.status(400).json({
        error: {
          name: err?.name,
          description: err?.errors,
        },
      });
    });
    const { name, password } = req.body;

    const user = await UserSchema.findOne({ name });

    if (user == null || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        error: {
          name: 'Unauthorized',
          description: 'Usuario ou password inválido',
        },
      });
    }

    const jwtPayload = {
      id: user._id,
      name: user.name,
      permission: user.permission,
    };

    const token = jwt.sign({ jwtPayload }, config.secret);

    return res.json({
      user,
      token,
    });
  }
}

export default new SessionController();
