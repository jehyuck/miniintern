// test/_server.ts
import type http from 'http';
import type { Test } from 'supertest';
import request from 'supertest';
import type { AddressInfo } from 'net';
import { createApp } from '../src/app';
import type TestAgent from 'supertest/lib/agent';

let server: http.Server;
let api: TestAgent<Test>;

export async function setupServer() {
  const app = createApp();
  await new Promise<void>((resolve) => {
    server = app.listen(0, '127.0.0.1', () => resolve());
  });
  const { port } = server.address() as AddressInfo;
  api = request(`http://127.0.0.1:${port}`);
}

export function getApi() {
  return api;
}

export async function teardownServer() {
  await new Promise<void>((resolve) => server.close(() => resolve()));
}
