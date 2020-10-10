import { Router } from 'express';

import SessionController from '@controllers/SessionController';
import CustomerController from '@controllers/CustomerController';
import ProductController from '@controllers/ProductController';
import DiscountController from '@controllers/DiscountController';

import Authentication from '@middlewares/Authentication';
import OrderController from '@controllers/OrderController';
import DeliverymanController from '@controllers/DeliverymanController';

const routes = Router();

routes.post('/session', SessionController.store);

routes.post('/customer', Authentication, CustomerController.store);
routes.get('/customer', Authentication, CustomerController.index);
routes.get('/customer/:id', Authentication, CustomerController.show);
routes.delete('/customer/:id', Authentication, CustomerController.delete);
routes.put('/customer', Authentication, CustomerController.update);

routes.post('/product', Authentication, ProductController.store);
routes.get('/product', Authentication, ProductController.index);
routes.get('/product/:id', Authentication, ProductController.show);
routes.delete('/product/:id', Authentication, ProductController.delete);
routes.put('/product', Authentication, ProductController.update);

routes.post('/discount', Authentication, DiscountController.store);
routes.get('/discount/valid', Authentication, DiscountController.index);
routes.get('/discount', Authentication, DiscountController.all);
routes.get('/discount/:id', Authentication, DiscountController.show);
routes.delete('/discount/:id', Authentication, DiscountController.delete);
routes.put('/discount', Authentication, DiscountController.update);

routes.post('/order', Authentication, OrderController.store);
routes.get('/order', Authentication, OrderController.show);
routes.put('/order', Authentication, OrderController.update);

routes.post('/deliveryman', Authentication, DeliverymanController.store);
routes.get('/deliveryman', Authentication, DeliverymanController.index);
routes.get('/deliveryman/:id', Authentication, DeliverymanController.show);
routes.delete('/deliveryman/:id', Authentication, DeliverymanController.delete);
routes.put('/deliveryman', Authentication, DeliverymanController.update);
routes.put('/deliveryman/reset', Authentication, DeliverymanController.reset);

export default routes;
