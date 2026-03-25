import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/constants';

@Controller()
export class AppController {
  @Public()
  @Get()
  root() {
    return { status: 'ok', version: '1.0.1' };
  }

  @Public()
  @Get('health')
  health() {
    return { status: 'ok', version: '1.0.1' };
  }
}