import { Response } from 'express';
import * as yup from 'yup';
import moment from 'moment';
import 'moment/locale/pt-br';

import { RequestCustom } from '@interfaces/RequestCustom';
import DiscountSchema from '@schemas/DiscountSchema';
import { PermissionEnum } from '@utils/enums/PermissionEnum';
import { Discount } from '@interfaces/Discount';

class DiscountController {
  public async store(req: RequestCustom, res: Response): Promise<Response> {
    const schema = yup.object().shape({
      name: yup.string().required('nome do Cupom não informado'),
      expireDate: yup.date().required('validade do Cupom não informado'),
      value: yup.number().required('valor do Cupom não informado'),
      type: yup.number().required('tipo do Cupom não informado'),
    });

    try {
      await schema.validate(req.body);

      if (req.permission !== PermissionEnum.owner) {
        return res.status(401).json({
          error: {
            name: 'Unauthorized',
            description: 'Sem permissão para criar um Cupom',
          },
        });
      }

      const { name, expireDate, value, type, partner }: Discount = req.body;

      const expireDateFormatted = new Date(expireDate);

      const result = await DiscountSchema.create({
        name,
        expireDate: expireDateFormatted,
        value,
        type,
        partner,
      });

      return res.status(200).json(result);
    } catch (err) {
      return res.status(400).json({
        error: {
          name: err?.name,
          description: err?.errors,
        },
      });
    }
  }

  public async index(req: RequestCustom, res: Response): Promise<Response> {
    const discounts = await DiscountSchema.find({});
    return res.json(
      discounts.filter(m => moment(Date.now()).isSameOrBefore(m.expireDate)),
    );
  }

  public async show(req: RequestCustom, res: Response): Promise<Response> {
    const { id } = req.params;

    const discount = await DiscountSchema.findOne({ _id: id });

    if (!discount) {
      return res.status(400).json({
        error: {
          name: 'DiscountNotExists',
          description: 'Cupom não encontrado',
        },
      });
    }

    return res.json(discount);
  }

  public async delete(req: RequestCustom, res: Response): Promise<Response> {
    const { id } = req.params;
    if (req.permission !== PermissionEnum.owner) {
      return res.status(401).json({
        error: {
          name: 'Unauthorized',
          description: 'Sem permissão para deletar um Cupom',
        },
      });
    }

    const { deletedCount } = await DiscountSchema.deleteOne({ _id: id });

    if (deletedCount === undefined || deletedCount < 1) {
      return res.status(400).json({
        error: {
          name: 'DiscountNotExists',
          description: `Cupom não encontrado`,
        },
      });
    }

    return res.json('Cupom removido com sucesso');
  }

  public async update(req: RequestCustom, res: Response): Promise<Response> {
    const discount = await DiscountSchema.findOneAndUpdate(
      {
        _id: req.body._id,
      },
      req.body,
      { new: true },
      (err, doc) => {
        if (err) {
          return res.status(400).json({
            error: {
              name: err?.name,
              description: err?.message,
            },
          });
        }

        return doc;
      },
    );
    if (!discount) {
      return res.status(400).json({
        error: {
          name: 'DiscountNotExists',
          description: 'Cupom não encontrado',
        },
      });
    }
    return res.status(200).json(discount);
  }
}

export default new DiscountController();
