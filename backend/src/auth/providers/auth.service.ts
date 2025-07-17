import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async register(registerDto: any) {
    // You can implement real logic later
    return { message: 'User registered successfully' };
  }

  async login(user: any) {
    return {
      accessToken: 'mockAccessToken',
      refreshToken: 'mockRefreshToken',
      user,
    };
  }

  async refreshToken(refreshToken: string) {
    return {
      accessToken: 'newAccessTokenFromRefresh',
    };
  }

  async logout(user: any) {
    return {
      message: 'User logged out successfully',
    };
  }
}
