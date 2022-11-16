/**
 * Usage:
 * EMAIL=[...] PASSWORD=[...] k6 run get-companies.load-test.js
 */

import http from 'k6/http';
import { check } from 'k6';
import {
  baseUrl,
  getAccessToken,
  commonOptions,
  buildParams,
} from './load-test-commons.js';

export const options = commonOptions;

export const setup = () => ({
  accessToken: getAccessToken(),
});

export default function (data) {
  const res = http.get(`${baseUrl}/companies`, buildParams(data));

  check(res, { 'status was 200': (r) => r.status == 200 });
}
