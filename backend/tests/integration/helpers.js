const request = require('supertest');
const crypto = require('crypto');

const PASSWORD = 'Test1234';

function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

async function registerUser(app, label = 'user') {
  const suffix = `${label}-${crypto.randomBytes(4).toString('hex')}`;
  const email = `integration-${suffix}@example.com`;
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: `Integration ${label}`,
      email,
      password: PASSWORD,
    });

  if (res.status !== 201) {
    throw new Error(
      `Register failed (${label}): ${res.status} ${JSON.stringify(res.body)}`
    );
  }

  return {
    token: res.body.token,
    user: res.body.user,
    email,
  };
}

module.exports = {
  PASSWORD,
  authHeader,
  registerUser,
};
