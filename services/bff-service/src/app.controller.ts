import {
  All,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppService } from './app.service';
import 'dotenv/config';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get(['', 'ping'])
  getHello() {
    return this.appService.getHello();
  }

  @All([':recipientServiceName/*', ':recipientServiceName'])
  async redirectToService(
    @Param('recipientServiceName') recipientServiceName: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const recipientURL = process.env[recipientServiceName.toLocaleUpperCase()];

    if (!recipientURL)
      throw new HttpException('Cannot process request', HttpStatus.BAD_GATEWAY);

    const { status, data } = await this.appService.redirectToService(
      recipientURL,
      req,
    );

    return res.status(status).send(data);
  }
}
