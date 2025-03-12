import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductImage } from './entities/product-image.entity';
import { Product } from './entities/product.entity';
import { Brackets, Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomException } from '../exceptions/custom.exception';
import { Category } from '../category/entities/category.entity';
import { CategoryAllResponse } from '../category/dto/category-all-response';
import { ProductAllResponse } from './dto/product-all-response.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const product = await this.productRepository.findOne({
      where: { name: createProductDto.name },
    });
    if (product) throw new CustomException('Product already exists', 400);

    const category = await this.categoryRepository.findOne({
      where: { id: createProductDto.categoryId },
    });
    if (!category) throw new CustomException('Category not found', 404);

    const newProduct = this.productRepository.create(createProductDto);
    newProduct.category = category;

    return await this.productRepository.save(newProduct);
  }

  async findAll({
    page = 1,
    limit = 20,
    name = '',
    categoryId = 0,
    minPrice = 0,
    maxPrice = 0,
  }) {
    const take = limit > 0 ? limit : 10;
    const skip = (page > 0 ? page - 1 : 0) * take;

    categoryId = parseInt(String(categoryId)) || 0;
    minPrice = parseInt(String(minPrice)) || 0;
    maxPrice = parseInt(String(maxPrice)) || 0;

    const [data, total] = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')
      .where('product.name LIKE :name', { name: `%${name}%` })
      .andWhere(new Brackets(qb => {
        qb.where('category.id = :categoryId', { categoryId })
          .orWhere(':categoryId = 0', { categoryId });
      }))
      .andWhere(new Brackets(qb => {
        qb.where('product.price >= :minPrice', { minPrice })
          .orWhere(':minPrice = 0', { minPrice });
      }))
      .andWhere(new Brackets(qb => {
        qb.where('product.price <= :maxPrice', { maxPrice })
          .orWhere(':maxPrice = 0', { maxPrice });
      }))
      .orderBy('product.createdAt', 'DESC')
      .take(take)
      .skip(skip)
      .getManyAndCount();

    return {
      data,
      total,
      page: parseInt(String(page) ? String(page) : '1', 10),
      hasNextPage: total > page * take,
    } as ProductAllResponse;
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'images'],
    });
    if (!product) throw new CustomException('Product not found', 404);
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) throw new CustomException('Product not found', 404);

    const category = await this.categoryRepository.findOne({
      where: { id: updateProductDto.categoryId },
    });
    if (!category) throw new CustomException('Category not found', 404);

    const updatedProduct = this.productRepository.create(updateProductDto);
    updatedProduct.category = category;

    await this.productRepository.update(id, updatedProduct);

    return await this.productRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) throw new CustomException('Product not found', 404);

    return this.productRepository.softDelete(id);
  }

  async saveImages(productId: number, filePaths: string[]) {
    const images = filePaths.map((path) => {
      const image = new ProductImage();
      image.path = path;
      image.product = { id: productId } as Product;
      return image;
    });

    return await this.productImageRepository.save(images);
  }
}
