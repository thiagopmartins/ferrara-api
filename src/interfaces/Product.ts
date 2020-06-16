import { CategoryEnum } from '@utils/enums/CategoryEnum';

export interface Product {
  name?: string;
  description?: string;
  price: number;
  category: CategoryEnum;
}
