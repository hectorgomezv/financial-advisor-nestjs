import { Decimal } from 'decimal.js';
import z from 'zod';

export const DecimalSchema = z.coerce
  .string()
  .transform((numericString, ctx): Decimal => {
    try {
      const decimal = new Decimal(numericString);
      if (decimal.isNaN() || !decimal.isFinite()) {
        ctx.addIssue({
          code: 'custom',
          error: 'Invalid numeric string',
        });
        return z.NEVER;
      }
      return decimal;
    } catch (err) {
      ctx.addIssue({
        code: 'custom',
        error: `Invalid numeric string (${(err as Error).message})`,
      });
      return z.NEVER;
    }
  });
