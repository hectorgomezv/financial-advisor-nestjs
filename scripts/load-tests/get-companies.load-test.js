/**
 * Usage:
 * ACCESS_TOKEN=[...] k6 run get-companies.load-test.js
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

export default function () {
  const res = http.get(`${baseUrl}/companies`, {
    headers: {
      Authorization: `Bearer ${__ENV.ACCESS_TOKEN}`,
    },
  });

  check(res, { 'status was 200': (r) => r.status == 200 });
}
