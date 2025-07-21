export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this);
  }
}

// Not Found
export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

// Validation Error

export class ValidationError extends ApiError {
  constructor(message = 'Invalid request data', details?: any) {
    super(message, 400, true, details);
  }
}

// Authentication Error

export class AuthError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

// Forbidden Error

export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}
//DatabaseError

export class DatabaseError extends ApiError {
  constructor(message = 'Database Error', details?: any) {
    super(message, 500, true, details);
  }
}

// Rate Limit Error

export class RateLimitError extends ApiError {
  constructor(message = 'Too many request, Please try again later') {
    super(message, 429);
  }
}
