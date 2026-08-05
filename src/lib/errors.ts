import { NextResponse } from 'next/server';

export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class IdempotencyConflictError extends AppError {
  constructor(message = 'Request is currently in progress') {
    super(message, 409);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded. Please try again later.') {
    super(message, 429);
  }
}

export class ConnectorError extends AppError {
  constructor(message = 'Platform connector error') {
    super(message, 502);
  }
}

export function formatErrorResponse(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.name },
      { status: error.statusCode }
    );
  }

  const message = error instanceof Error ? error.message : 'Internal error';
  return NextResponse.json({ error: message }, { status: 500 });
}
