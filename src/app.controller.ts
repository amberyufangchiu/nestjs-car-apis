import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';
import { AppConfig } from './configs/app.config';
import { configType } from './configs/config.type';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService<configType>,
  ) {}

  @Get()
  getHello(): string {
    const prefix = this.configService.get<AppConfig>('app').messagePrefix;
    console.log(`Using message prefix: ${prefix}`);
    return this.appService.getHello();
  }
}
