// src/auth/auth.service.ts
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { RefreshToken } from '../refresh-tokens/refresh-token.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshRepo: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
  ) {}

  async register(email: string, password: string, role: string) {
    const hash = await bcrypt.hash(password, 10);

    const user = this.userRepo.create({
      email,
      password_hash: hash,
      role,
    });

    await this.userRepo.save(user);
    return this.generateTokens(user);
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  private async generateTokens(user: User) {
    const payload = { sub: user.id, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    await this.refreshRepo.save({
      user,
      token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 86400000),
    });

    return { accessToken, refreshToken, user };
  }

  async refresh(token: string) {
    const stored = await this.refreshRepo.findOne({
      where: { token },
      relations: ['user'],
    });

    if (!stored) throw new UnauthorizedException();

    return this.generateTokens(stored.user);
  }

  async logout(userId: string) {
    await this.refreshRepo.delete({ user: { id: userId } });
  }

  async changePassword(userId: string, oldPass: string, newPass: string) {
    const user = await this.userRepo.findOneBy({ id: userId });

    if (!user || !(await bcrypt.compare(oldPass, user.password_hash))) {
      throw new UnauthorizedException();
    }

    user.password_hash = await bcrypt.hash(newPass, 10);
    await this.userRepo.save(user);
  }
}




