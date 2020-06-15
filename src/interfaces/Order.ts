import { OrderStatusEnum } from "@utils/enums/OrderStatusEnum";

export interface Order {
  client: String,
  products: String[],
  price: Number,
  status: OrderStatusEnum
}