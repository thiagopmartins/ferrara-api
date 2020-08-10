import { DiscountTypeEnum } from '@utils/enums/DiscountTypeEnum';

export interface Discount {
  name?: string;
  expireDate: Date;
  value?: number;
  type: DiscountTypeEnum;
  partner?: string;
  totalUse?: number;
}
