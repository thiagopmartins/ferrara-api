import { OrderStatusEnum } from "@utils/enums/OrderStatusEnum";

export interface Order {
  customer: string,
  products: string[],
  price: number,
  status?: OrderStatusEnum
}