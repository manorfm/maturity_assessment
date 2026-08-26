import { createHash, randomBytes, randomUUID } from 'node:crypto';

export const id = (): string => randomUUID();
export const secret = (): string => randomBytes(32).toString('base64url');
export const hashSecret = (value: string): string =>
  createHash('sha256').update(value, 'utf8').digest('hex');

