import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User as UserEntity } from './entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async findOne(email: string): Promise<UserEntity | null> {
    console.log('email', email);
    return this.userRepository.findOne({ where: { email: email } });
  }

  async create(user: UserEntity): Promise<UserEntity> {
    return this.userRepository.save(user);
  }
}
