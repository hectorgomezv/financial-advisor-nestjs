import { createHash } from 'crypto';

export function from(values: string[]): string {
  const hash = createHash('sha1');
  for (const value of values) {
    hash.update(value);
  }
  return hash.digest('hex');
}
