import http from 'k6/http';

export const authUrl =
  'http://financial-advisor.es/api/v1/auth/accounts/login';

export const baseUrl = 'http://localhost:3000/api/v2';

export const commonOptions = {
  stages: [
    { duration: '10s', target: 20 },
    { duration: '30s', target: 100 },
    { duration: '10s', target: 0 },
  ],
};

export function getAccessToken() {
  const res = http.post(
    authUrl,
    JSON.stringify({
      data: {
        email: __ENV.EMAIL,
        password: __ENV.PASSWORD,
      },
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );

  return res.json().data.accessToken;
}

export function getFirstPortfolio(accessToken) {
  const { body } = http.get(`${baseUrl}/portfolios`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return JSON.parse(body).data[0].uuid;
}

export const buildParams = (setupData) => ({
  headers: {
    Authorization: `Bearer ${setupData.accessToken}`,
  },
});
