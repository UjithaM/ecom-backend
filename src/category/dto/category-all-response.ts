import { Category } from '../entities/category.entity';

export class CategoryAllResponse {
  data: Category[];
  total: number;
  page: number;
  hasNextPage: boolean;
}