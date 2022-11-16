/**
 * Usage:
 * ACCESS_TOKEN=[...] k6 run get-portfolio-with-state.load-test.js
 */

import http from 'k6/http';
import { check } from 'k6';

const baseUrl = 'http://localhost:3000/api/v2';

export const options = {
  stages: [
    { duration: '10s', target: 20 },
    { duration: '30s', target: 10 },
    { duration: '10s', target: 0 },
  ],
};

export function setup() {
  const { body } = http.get(`${baseUrl}/portfolios`, {
    headers: {
      Authorization: `Bearer ${__ENV.ACCESS_TOKEN}`,
    },
  });

  return { portfolioUuid: JSON.parse(body).data[0].uuid };
}

export default function (data) {
  const res = http.get(`${baseUrl}/portfolios/${data.portfolioUuid}`, {
    headers: {
      Authorization: `Bearer ${__ENV.ACCESS_TOKEN}`,
    },
  });

  check(res, { 'status was 200': (r) => r.status == 200 });
}
