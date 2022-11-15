import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthClient {
  private readonly url: string;
  private readonly email: string;
  private readonly password: string;
  private readonly httpService: HttpService;

  constructor() {
    const { E2E_AUTH_EMAIL, E2E_AUTH_PASSWORD, E2E_AUTH_URL } = process.env;
    this.email = E2E_AUTH_EMAIL;
    this.password = E2E_AUTH_PASSWORD;
    this.url = E2E_AUTH_URL;
  }

  async getAuth() {
    let res;
    try {
      res = await this.httpService.post(this.url, {
        data: {
          email: this.email,
          password: this.password,
        },
      });
    } catch (err) {
      throw err;
    }

    console.log(res);
    return res.data;
  }
}
