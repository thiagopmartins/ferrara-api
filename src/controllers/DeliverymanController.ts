import { Response } from 'express';
import * as yup from 'yup';

import { RequestCustom } from '@interfaces/RequestCustom';
import DeliverymanSchema from '@schemas/DeliverymanSchema';
import { PermissionEnum } from '@utils/enums/PermissionEnum';

class DeliverymanController {
  public async store(req: RequestCustom, res: Response): Promise<Response> {
    const schema = yup.object().shape({
      phone: yup.string().required('telefone não informado'),
      name: yup.string().required('nome do Entregador não informado'),
    });

    await schema.validate(req.body).catch(err => {
      return res.status(400).json({
        error: {
          name: err?.name,
          description: err?.errors,
        },
      });
    });

    const { phone, name } = req.body;

    if (phone === undefined || name === undefined) {
      return res.status(400);
    }
    const Deliveryman = await DeliverymanSchema.findOne({ phone });

    if (Deliveryman) {
      return res.status(400).json({
        error: {
          name: 'DeliverymanAlreadyExists',
          description: 'Entregador já cadastrado',
        },
      });
    }
    await DeliverymanSchema.create({
      phone,
      name,
    });

    return res.json(await DeliverymanSchema.findOne({ phone }));
  }

  public async index(req: RequestCustom, res: Response): Promise<Response> {
    const Deliverymans = await DeliverymanSchema.find();
    return res.json(Deliverymans);
  }

  public async show(req: RequestCustom, res: Response): Promise<Response> {
    const { id } = req.params;
    const Deliveryman = await DeliverymanSchema.findOne({ _id: id });

    if (!Deliveryman) {
      return res.status(400).json({
        error: {
          name: 'DeliverymanNotExists',
          description: 'Entregador não encontrado',
        },
      });
    }

    return res.json(Deliveryman);
  }

  public async delete(req: RequestCustom, res: Response): Promise<Response> {
    const { id } = req.params;
    if (req.permission !== PermissionEnum.owner) {
      return res.status(401).json({
        error: {
          name: 'Unauthorized',
          description: 'Sem permissão para deletar um Entregador',
        },
      });
    }

    const { deletedCount } = await DeliverymanSchema.deleteOne({ _id: id });

    if (deletedCount === undefined || deletedCount < 1) {
      return res.status(400).json({
        error: {
          name: 'DeliverymanNotExists',
          description: `Entregador não encontrado`,
        },
      });
    }

    return res.json('Entregador removido com sucesso');
  }

  public async update(req: RequestCustom, res: Response): Promise<Response> {
    const Deliveryman = await DeliverymanSchema.findOneAndUpdate(
      {
        _id: req.body._id,
      },
      req.body,
      { new: true },
      (err: { name: any; message: any }, doc: any) => {
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
    if (!Deliveryman) {
      return res.status(400).json({
        error: {
          name: 'DeliverymanNotExists',
          description: 'Entregador não encontrado',
        },
      });
    }
    return res.status(200).json(Deliveryman);
  }

  public async reset(req: RequestCustom, res: Response): Promise<Response> {
    const options = { multi: true, upsert: true };
    await DeliverymanSchema.updateMany(
      {},
      { $set: { numberOfViewsPerWeek: 0 } },
      options,
    );
    return res.status(200).json('Expediente finalizado');
  }
}
export default new DeliverymanController();
