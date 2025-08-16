import type { RequestHandler } from 'express';
import type { ApiResponse } from '../utils/response';

export type Handler<Res, Req = unknown, P = {}, Q = {}> = RequestHandler<
  P,
  ApiResponse<Res>,
  Req,
  Q
>;
