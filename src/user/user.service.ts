import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async update(
    userId: number,
    updateUserDto: UpdateUserDto,
  ) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { ...updateUserDto },
    });
    const { hashedPassword, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
