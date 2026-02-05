import { GraphQLFormattedError } from 'graphql';
import { unwrapResolverError } from '@apollo/server/errors';
import {
  ForbiddenException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CommandValidationException } from '@boilerplate/core';

export function formatGraphQLError(
  formattedError: GraphQLFormattedError,
  error: unknown,
): GraphQLFormattedError {
  const originalError = unwrapResolverError(error);

  if (originalError instanceof CommandValidationException) {
    return {
      message: 'Validation failed',
      extensions: {
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        errors: originalError.constraintsViolated,
      },
    };
  }

  if (originalError instanceof BadRequestException) {
    const response = originalError.getResponse();
    return {
      message:
        typeof response === 'string'
          ? response
          : (response as { message?: string }).message || 'Bad request',
      extensions: {
        code: 'BAD_REQUEST',
        statusCode: 400,
      },
    };
  }

  if (originalError instanceof UnauthorizedException) {
    return {
      message: originalError.message || 'Unauthorized',
      extensions: {
        code: 'UNAUTHENTICATED',
        statusCode: 401,
      },
    };
  }

  if (originalError instanceof ForbiddenException) {
    return {
      message: originalError.message || 'Forbidden',
      extensions: {
        code: 'FORBIDDEN',
        statusCode: 403,
      },
    };
  }

  if (originalError instanceof NotFoundException) {
    return {
      message: originalError.message || 'Not found',
      extensions: {
        code: 'NOT_FOUND',
        statusCode: 404,
      },
    };
  }

  if (originalError instanceof ConflictException) {
    return {
      message: originalError.message || 'Conflict',
      extensions: {
        code: 'CONFLICT',
        statusCode: 409,
      },
    };
  }

  if (formattedError.extensions?.code === 'GRAPHQL_VALIDATION_FAILED') {
    return {
      message: formattedError.message,
      extensions: {
        code: 'GRAPHQL_VALIDATION_FAILED',
        statusCode: 400,
      },
    };
  }

  return {
    message: formattedError.message || 'Internal server error',
    extensions: {
      code: formattedError.extensions?.code || 'INTERNAL_SERVER_ERROR',
      statusCode: 500,
    },
  };
}
