import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  createUser(email: string, password: string) {
    const user = this.repo.create({ email, password });
    return this.repo.save(user);
  }

  findAllUsers() {
    return this.repo.find();
  }

  findUser(id: number) {
    if (!id) {
      return null;
    }
    return this.repo.findOneBy({ id });
  }

  findUserByEmail(email: string) {
    return this.repo.find({ where: { email } });
  }

  async updateUser(id: number, attr: Partial<User>) {
    const user = await this.findUser(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, attr);
    return this.repo.save(user);
  }

  async removeUser(id: number) {
    const user = await this.findUser(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.repo.remove(user);
  }
}
