import request from 'supertest';
import { createApp } from '../src/app';

describe('GET /health', () => {
  it('returns 200 and { ok: true }', async () => {
    const app = createApp();
    await request(app).get('/health').expect(200, { ok: true });
  });
});
