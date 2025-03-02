import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductImage } from './entities/product-image.entity';
import { Product } from './entities/product.entity';
import { Category } from '../category/entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductImage, Product, Category]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
