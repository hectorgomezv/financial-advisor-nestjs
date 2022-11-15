const axios = require('axios'); // eslint-disable-line @typescript-eslint/no-var-requires

export class AuthClient {
  private readonly url: string;
  private readonly email: string;
  private readonly password: string;
  private readonly client;

  constructor() {
    const { E2E_AUTH_EMAIL, E2E_AUTH_PASSWORD, E2E_AUTH_URL } = process.env;
    this.client = axios;
    this.email = E2E_AUTH_EMAIL;
    this.password = E2E_AUTH_PASSWORD;
    this.url = E2E_AUTH_URL;
  }

  async getAuth() {
    const { data } = await this.client.post(this.url, {
      data: {
        email: this.email,
        password: this.password,
      },
    });

    return data;
  }
}
