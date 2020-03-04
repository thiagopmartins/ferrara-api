import { Router } from 'express';

import SessionController from '@controllers/SessionController';
import CustomerController from '@controllers/CustomerController';

import Authentication from '@middlewares/Authentication';

const routes = Router();

routes.post('/session', SessionController.store);

routes.post('/customer', Authentication, CustomerController.store);
routes.get('/customer', Authentication, CustomerController.index);
routes.get('/customer/:id', Authentication, CustomerController.show);
routes.delete('/customer/:id', Authentication, CustomerController.delete);
routes.put('/customer', Authentication, CustomerController.update);

export default routes;
