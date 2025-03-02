import { Product } from '../entities/product.entity';


export class ProductAllResponse {
  data: Product[];
  total: number;
  page: number;
  hasNextPage: boolean;
}