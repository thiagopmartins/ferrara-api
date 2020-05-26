import { Response } from 'express';
import * as yup from 'yup';

import { RequestCustom } from '@interfaces/RequestCustom';
import ProductSchema from '@schemas/ProductSchema';
import { PermissionEnum } from '@utils/enums/PermissionEnum';

class ProductController {
  public async store(req: RequestCustom, res: Response): Promise<Response> {
    const schema = yup.object().shape({
      name: yup.string().required('nome do produto não informado'),
      description: yup.string().required('descrição do produto não informado'),
      price: yup.number().required('preço do produto não informado'),
      category: yup.number().required('categoria do produto não informada'),
    });

    try {
      await schema.validate(req.body);

      if (req.permission !== PermissionEnum.owner) {
        return res.status(401).json({
          error: {
            name: 'Unauthorized',
            description: 'Sem permissão para criar um produto',
          },
        });
      }

      const { name, price, category, description } = req.body;

      const result = await ProductSchema.create({
        name,
        description,
        price,
        category,
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
    if (req.permission !== PermissionEnum.owner) {
      return res.status(401).json({
        error: {
          name: 'Unauthorized',
          description: 'Sem permissão para consultar produtos',
        },
      });
    }
    const products = await ProductSchema.find({});
    return res.json(products);
  }

  public async show(req: RequestCustom, res: Response): Promise<Response> {
    const { id } = req.params;

    if (req.permission !== PermissionEnum.owner) {
      return res.status(401).json({
        error: {
          name: 'Unauthorized',
          description: 'Sem permissão para consultar um produto',
        },
      });
    }

    const product = await ProductSchema.findOne({ _id: id });

    if (!product) {
      return res.status(400).json({
        error: {
          name: 'ProductNotExists',
          description: 'Produto não encontrado',
        },
      });
    }

    return res.json(product);
  }

  public async delete(req: RequestCustom, res: Response): Promise<Response> {
    const { id } = req.params;
    if (req.permission !== PermissionEnum.owner) {
      return res.status(401).json({
        error: {
          name: 'Unauthorized',
          description: 'Sem permissão para deletar um produto',
        },
      });
    }

    const { deletedCount } = await ProductSchema.deleteOne({ _id: id });

    if (deletedCount === undefined || deletedCount < 1) {
      return res.status(400).json({
        error: {
          name: 'ProductNotExists',
          description: `Produto não encontrado`,
        },
      });
    }

    return res.json('Produto removido com sucesso');
  }

  public async update(req: RequestCustom, res: Response): Promise<Response> {
    const product = await ProductSchema.findOneAndUpdate(
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
    if (!product) {
      return res.status(400).json({
        error: {
          name: 'ProductNotExists',
          description: 'Produto não encontrado',
        },
      });
    }
    return res.status(200).json(product);
  }
}

export default new ProductController();
