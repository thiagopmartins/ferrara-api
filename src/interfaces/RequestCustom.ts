import { Request } from 'express';

export interface RequestCustom extends Request {
  name?: string;
  permission?: number;
  id?: string;
}
