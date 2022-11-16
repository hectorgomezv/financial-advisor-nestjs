/**
 * Usage:
 * EMAIL=[...] PASSWORD=[...] k6 run get-portfolio-with-state.load-test.js
 */

import http from 'k6/http';
import { check } from 'k6';
import {
  baseUrl,
  getAccessToken,
  getFirstPortfolio,
  commonOptions,
} from './load-test-commons.js';

export const options = commonOptions;

export function setup() {
  const accessToken = getAccessToken();

  return {
    accessToken,
    portfolioUuid: getFirstPortfolio(accessToken),
  };
}

export default function (data) {
  const res = http.get(`${baseUrl}/portfolios/${data.portfolioUuid}`, {
    headers: {
      Authorization: `Bearer ${data.accessToken}`,
    },
  });

  check(res, { 'status was 200': (r) => r.status == 200 });
}
