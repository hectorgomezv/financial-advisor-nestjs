/**
 * Usage:
 * EMAIL=[...] PASSWORD=[...] k6 run get-portfolios.load-test.js
 */

import http from 'k6/http';
import { check } from 'k6';
import { baseUrl, getAccessToken, commonOptions } from './load-test-commons.js';

export const options = commonOptions;

export const setup = () => ({
  accessToken: getAccessToken(),
});

export default function (data) {
  const res = http.get(`${baseUrl}/portfolios`, {
    headers: {
      Authorization: `Bearer ${data.accessToken}`,
    },
  });

  check(res, { 'status was 200': (r) => r.status == 200 });
}
