import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Like, Repository } from 'typeorm';
import { CustomException } from '../exceptions/custom.exception';
import { CategoryAllResponse } from './dto/category-all-response';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {
  }

  async create(createCategoryDto: CreateCategoryDto) {

    const category = await this.categoryRepository.findOne({ where: { name: createCategoryDto.name } });
    if (category) {
      return new CustomException('Category already exists', 400);
    }

    return await this.categoryRepository.save(createCategoryDto);
  }

  async findAll({ page = 1, limit = 10, name = '' }) {
    const take = limit > 0 ? limit : 10;
    const skip = (page > 0 ? page - 1 : 0) * take;

    const [data, total] = await this.categoryRepository.findAndCount({
      where: { name: Like(`%${name}%`) },
      take,
      skip,
      order: { createdAt: 'ASC' },
    });

    return {
      data,
      total,
      page: parseInt(String(page) ? String(page) : "1", 10),
      hasNextPage: total > page * take,
    } as CategoryAllResponse;
  }

  async findOne(id: number) {
    const category = await this.categoryRepository.findOne({ where: { id:id } });
    if (!category) {
      return new CustomException('Category not found', 404);
    }
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOne({ where: { id: id } });
    if (!category) {
      return new CustomException('Category not found', 404);
    }
    await this.categoryRepository.update(id, updateCategoryDto);
    return await this.categoryRepository.findOne({ where: { id: id } });
  }

  async remove(id: number) {
    const category = await this.categoryRepository.findOne({ where: { id: id } });
    if (!category) {
      return new CustomException('Category not found', 404);
    }
    category.deletedAt = new Date();
    await this.categoryRepository.save(category);
    return category;
  }
}
