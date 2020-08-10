import { OrderStatusEnum } from '@utils/enums/OrderStatusEnum';
import { Discount } from './Discount';

export interface Order {
  customer: string;
  products: string[];
  price: number;
  status: OrderStatusEnum;
  discount?: Discount;
}
