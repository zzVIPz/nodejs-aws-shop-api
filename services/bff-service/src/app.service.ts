import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Request } from 'express';
import axios from 'axios';

@Injectable()
export class AppService {
  getHello() {
    return {
      statusCode: HttpStatus.OK,
      message: 'Hello from BFF',
    };
  }

  async redirectToService(recipientURL: string, req: Request): Promise<any> {
    console.log('recipientURL', recipientURL);

    const { method, body } = req;

    try {
      const res = await axios({
        method,
        data: body,
        baseURL: recipientURL,
      });

      console.log('res', res.data);

      return res;
    } catch ({ response }) {
      if (response) return response;

      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
