import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  PaginationDto,
  PaginationResponse,
} from 'src/common/dto/pagination.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { User } from './users.entity';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getAllUsers(
    @Query() pagination: PaginationDto,
  ): Promise<PaginationResponse<User>> {
    const [users, total] = await this.usersService.findAllUsers(pagination);
    return {
      data: users,
      meta: { total, limit: pagination.limit, offset: pagination.offset },
    };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  async getUser(@Param('id') id: string): Promise<User> {
    const user = await this.usersService.findUser(Number(id));
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  @Get('by-email')
  async getUsersByEmail(@Query('email') email: string): Promise<User[]> {
    const user = await this.usersService.findUserByEmail(email);
    if (!user.length) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
  ): Promise<User> {
    const updatedUser = await this.usersService.updateUser(Number(id), body);
    return updatedUser;
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<{ message: string }> {
    await this.usersService.removeUser(Number(id));
    return { message: 'User deleted successfully' };
  }
}
