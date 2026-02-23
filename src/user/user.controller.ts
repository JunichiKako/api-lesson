import { Controller, Body, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { User } from '../../generated/prisma/client';

@UseGuards(AuthGuard('jwt'))
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  getLoggedInUser(@Req() req: Request) {
    const user = req.user;
    return user;
  }

  @Patch()
  async update(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    const user = req.user as User;
    return this.userService.update(user.id, updateUserDto);
  }
}
