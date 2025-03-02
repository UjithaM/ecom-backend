import { IsNumber, IsString } from 'class-validator';

export class CreateProductDto {

  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsNumber()
  stock: number;

  @IsString()
  description: string;

  @IsNumber()
  categoryId: number;
}
