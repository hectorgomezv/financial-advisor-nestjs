import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Exception for database-related errors
 * This exception hides sensitive SQL error details from the API response
 */
export class DatabaseException extends HttpException {
  constructor(originalError: any) {
    super(
      {
        message: 'An error occurred while processing your request',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    // Store the original error for logging purposes (can be accessed via this.originalError)
    // but it won't be exposed in the API response
    this.originalError = originalError;
  }

  originalError: any;
}
