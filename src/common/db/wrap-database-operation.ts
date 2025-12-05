import { DatabaseException } from '../routes/exceptions/database.exception';

/**
 * Wraps database operations to catch and sanitize database errors
 * This prevents sensitive SQL errors from being exposed to the API
 *
 * @param operation - The async database operation to wrap
 * @returns The result of the operation or throws a sanitized DatabaseException
 */
export async function wrapDatabaseOperation<T>(
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    // If it's already a sanitized exception, re-throw it
    if (error instanceof DatabaseException) {
      throw error;
    }

    // Check if it's a database error (PostgreSQL or general connection errors)
    const isDatabaseError =
      error?.code || // PostgreSQL error code
      error?.severity || // PostgreSQL severity
      error?.detail || // PostgreSQL detail
      error?.message?.includes('ECONNREFUSED') || // Connection refused
      error?.message?.includes('syntax error') || // SQL syntax error
      error?.message?.includes('constraint') || // Constraint violation
      error?.message?.includes('duplicate key'); // Duplicate key error

    if (isDatabaseError) {
      throw new DatabaseException(error);
    }

    // If it's not a database error, re-throw the original exception
    throw error;
  }
}
