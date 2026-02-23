import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import { Msg, JwtToken } from './types/auth.type';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(dto: AuthDto): Promise<Msg> {
    const hashedPassword = await bcrypt.hash(dto.password, 12);
    try {
      await this.prisma.user.create({
        data: {
          email: dto.email,
          hashedPassword: hashedPassword,
        },
      });
      return { message: 'ユーザー登録に成功しました' };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return { message: 'このメールアドレスは既に使用されています' };
        }
      }
      throw error;
    }
  }

  async login(dto: AuthDto): Promise<JwtToken> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) throw new ForbiddenException('ユーザーが見つかりませんでした'); // ユーザーが存在しない場合

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.hashedPassword,
    );

    if (!isPasswordValid)
      throw new ForbiddenException('メールアドレスかパスワードが正しくありません'); 

    return this.generateJwtToken(user.id, user.email);
  }

  async generateJwtToken(userId: number, email: string): Promise<JwtToken> {
    const payload = { sub: userId, email };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '5m',
    });
    return { accessToken };

  }
}
