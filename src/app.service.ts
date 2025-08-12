import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { message: string } {
    return { message: 'Zeniark NodeJS Skills Test - 2025' };
  }
}
