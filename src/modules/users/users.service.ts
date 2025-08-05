import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaginationDto } from 'src/common/dto/pagination.dto';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  createUser(email: string, password: string): Promise<User> {
    const user = this.repo.create({ email, password });
    return this.repo.save(user);
  }

  async findAllUsers({
    offset,
    limit,
  }: PaginationDto): Promise<[User[], number]> {
    const data = await this.repo.findAndCount({
      skip: offset,
      take: limit,
      order: { id: 'ASC' },
    });

    return data;
  }

  findUser(id: number): Promise<User> {
    if (!id) {
      return null;
    }
    return this.repo.findOneBy({ id });
  }

  findUserByEmail(email: string): Promise<User[]> {
    return this.repo.find({ where: { email } });
  }

  async updateUser(id: number, attr: Partial<User>): Promise<User> {
    const user = await this.findUser(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, attr);
    return this.repo.save(user);
  }

  async removeUser(id: number): Promise<User> {
    const user = await this.findUser(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.repo.remove(user);
  }
}
