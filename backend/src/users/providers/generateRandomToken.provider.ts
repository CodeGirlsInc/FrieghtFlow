import { Injectable } from '@nestjs/common';

@Injectable()
export class GenerateRandomTokenProvider {
  public getRandomToken() {
    const token =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    return token;
  }
}
