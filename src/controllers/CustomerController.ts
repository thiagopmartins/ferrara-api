import { Response } from 'express';
import * as yup from 'yup';

import { RequestCustom } from '@interfaces/RequestCustom';
import CustomerSchema from '@schemas/CustomerSchema';
import { PermissionEnum } from '@utils/enums/PermissionEnum';

class CustomerController {
  public async store(req: RequestCustom, res: Response): Promise<Response> {
    const schema = yup.object().shape({
      phone: yup.string().required('telefone não informado'),
      name: yup.string().required('nome do cliente não informado'),
    });

    await schema.validate(req.body).catch(err => {
      return res.status(400).json({
        error: {
          name: err?.name,
          description: err?.errors,
        },
      });
    });

    const {
      phone,
      name,
      deliveryTax,
      address,
      lot,
      block,
      aptoBlock,
      apto,
      district,
      number,
      referencePoint,
      comments,
      dateOfBirth,
    } = req.body;

    if (phone === undefined || name === undefined) {
      return res.status(400);
    }
    const customer = await CustomerSchema.findOne({ phone });

    if (customer) {
      return res.status(400).json({
        error: {
          name: 'CustomerAlreadyExists',
          description: 'Cliente já cadastrado',
        },
      });
    }
    await CustomerSchema.create({
      phone,
      name,
      deliveryTax,
      address,
      lot,
      block,
      aptoBlock,
      apto,
      district,
      number,
      referencePoint,
      comments,
      dateOfBirth,
    });

    return res.json(await CustomerSchema.findOne({ phone }));
  }

  public async index(req: RequestCustom, res: Response): Promise<Response> {
    const customers = await CustomerSchema.find();
    return res.json(customers);
  }

  public async show(req: RequestCustom, res: Response): Promise<Response> {
    const { id } = req.params;
    const customer = await CustomerSchema.findOne({ _id: id });

    if (!customer) {
      return res.status(400).json({
        error: {
          name: 'CustomerNotExists',
          description: 'Cliente não encontrado',
        },
      });
    }

    return res.json(customer);
  }

  public async delete(req: RequestCustom, res: Response): Promise<Response> {
    const { id } = req.params;
    if (req.permission !== PermissionEnum.owner) {
      return res.status(401).json({
        error: {
          name: 'Unauthorized',
          description: 'Sem permissão para deletar um cliente',
        },
      });
    }

    const { deletedCount } = await CustomerSchema.deleteOne({ _id: id });

    if (deletedCount === undefined || deletedCount < 1) {
      return res.status(400).json({
        error: {
          name: 'CustomerNotExists',
          description: `Cliente não encontrado`,
        },
      });
    }

    return res.json('Cliente removido com sucesso');
  }

  public async update(req: RequestCustom, res: Response): Promise<Response> {
    const customer = await CustomerSchema.findOneAndUpdate(
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
    if (!customer) {
      return res.status(400).json({
        error: {
          name: 'CustomerNotExists',
          description: 'Cliente não encontrado',
        },
      });
    }
    return res.status(200).json(customer);
  }
}
export default new CustomerController();
