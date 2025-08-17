import type { db } from '../db';

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type Executor = Tx | typeof db;

export const UserRepository = {};
