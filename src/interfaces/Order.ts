import { OrderStatusEnum } from '@utils/enums/OrderStatusEnum';
import { Discount } from './Discount';
import { Deliveryman } from './Deliveryman';

export interface Order {
  customer?: string;
  products?: string[];
  price?: number;
  status?: OrderStatusEnum;
  discount?: Discount;
  deliveryman?: Deliveryman;
  productsOfOrder?: [{}];
}
