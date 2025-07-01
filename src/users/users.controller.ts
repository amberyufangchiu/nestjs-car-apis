import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
  Session,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Serialize } from './interceptor/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { AuthService } from './auth.service';

interface SessionData {
  userId: number | null;
}

@Controller('auth')
@Serialize(UserDto)
// @UseInterceptors(new SerializeInterceptor(UserDto))
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  @Get('/me')
  getMe(@Session() session: SessionData) {
    if (!session.userId) {
      throw new NotFoundException('User not found');
    }
    return this.usersService.findUser(session.userId);
  }

  @Post('/signup')
  async createUser(
    @Body() body: CreateUserDto,
    @Session() session: SessionData,
  ) {
    const user = await this.authService.signUp(body.email, body.password);
    session.userId = user.id;
    return user;
  }

  @Post('/signin')
  async signIn(@Body() body: CreateUserDto, @Session() session: SessionData) {
    const user = await this.authService.signIn(body.email, body.password);
    session.userId = user.id;
    return user;
  }

  @Post('/signout')
  signOut(@Session() session: SessionData) {
    session.userId = null;
    return { message: 'User signed out successfully' };
  }

  @Get('/users')
  async getAllUsers() {
    const users = await this.usersService.findAllUsers();
    return users;
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('/:id')
  async getUser(@Param('id') id: string) {
    const user = await this.usersService.findUser(Number(id));
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  @Get()
  async getUsersByEmail(@Query('email') email: string) {
    const user = await this.usersService.findUserByEmail(email);
    if (!user.length) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  @Patch('/:id')
  async updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    const updatedUser = await this.usersService.updateUser(Number(id), body);
    return updatedUser;
  }

  @Delete('/:id')
  async deleteUser(@Param('id') id: string) {
    await this.usersService.removeUser(Number(id));
    return { message: 'User deleted successfully' };
  }
}
