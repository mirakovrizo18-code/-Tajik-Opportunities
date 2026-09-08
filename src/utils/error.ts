export type ErrorCode =
  | "UNKNOWN_ERROR"
  | "VALIDATION_ERROR"
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "METHOD_NOT_ALLOWED"
  | "PAYLOAD_TOO_LARGE"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "DATABASE_ERROR"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "SECURITY_ERROR"
  | "CSRF_ERROR"
  | "SESSION_ERROR"
  | "PERMISSION_ERROR"
  | "PUBLICATION_ERROR"
  | "COMMENT_ERROR"
  | "REVIEW_ERROR"
  | "REACTION_ERROR"
  | "CHAT_ERROR"
  | "NOTIFICATION_ERROR"
  | "FILE_ERROR"
  | "STORAGE_ERROR"
  | "CONFIGURATION_ERROR"
  | "INTERNAL_ERROR";

export interface ErrorOptions {
  code?: ErrorCode | string;
  status?: number;
  details?: unknown;
  cause?: unknown;
  expose?: boolean;
  requestId?: string;
  field?: string;
  retryAfter?: number;
}

export interface SerializedError {
  name: string;
  message: string;
  code: string;
  status: number;
  details?: unknown;
  requestId?: string;
  field?: string;
  retryAfter?: number;
}

export class AppError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details: unknown;
  readonly expose: boolean;
  readonly requestId?: string;
  readonly field?: string;
  readonly retryAfter?: number;

  constructor(
    message: string,
    options: ErrorOptions = {},
  ) {
    super(message);

    this.name = "AppError";
    this.code =
      options.code ??
      "UNKNOWN_ERROR";

    this.status =
      options.status ??
      500;

    this.details =
      options.details;

    this.expose =
      options.expose ??
      this.status < 500;

    this.requestId =
      options.requestId;

    this.field =
      options.field;

    this.retryAfter =
      options.retryAfter;

    if (
      options.cause !==
      undefined
    ) {
      Object.defineProperty(
        this,
        "cause",
        {
          value:
            options.cause,
          enumerable: false,
          configurable: true,
        },
      );
    }

    Object.setPrototypeOf(
      this,
      new.target.prototype,
    );
  }
}

export class ValidationError
  extends AppError {
  constructor(
    message =
      "Некорректные данные.",
    details?: unknown,
    field?: string,
  ) {
    super(message, {
      code:
        "VALIDATION_ERROR",
      status: 400,
      details,
      field,
      expose: true,
    });

    this.name =
      "ValidationError";
  }
}

export class AuthenticationError
  extends AppError {
  constructor(
    message =
      "Требуется авторизация.",
    details?: unknown,
  ) {
    super(message, {
      code:
        "UNAUTHORIZED",
      status: 401,
      details,
      expose: true,
    });

    this.name =
      "AuthenticationError";
  }
}

export class AuthorizationError
  extends AppError {
  constructor(
    message =
      "Недостаточно прав.",
    details?: unknown,
  ) {
    super(message, {
      code: "FORBIDDEN",
      status: 403,
      details,
      expose: true,
    });

    this.name =
      "AuthorizationError";
  }
}

export class NotFoundError
  extends AppError {
  constructor(
    message =
      "Объект не найден.",
    details?: unknown,
  ) {
    super(message, {
      code: "NOT_FOUND",
      status: 404,
      details,
      expose: true,
    });

    this.name =
      "NotFoundError";
  }
}

export class ConflictError
  extends AppError {
  constructor(
    message =
      "Операция конфликтует с текущим состоянием.",
    details?: unknown,
  ) {
    super(message, {
      code: "CONFLICT",
      status: 409,
      details,
      expose: true,
    });

    this.name =
      "ConflictError";
  }
}

export class RateLimitError
  extends AppError {
  constructor(
    message =
      "Слишком много запросов.",
    retryAfter = 60,
  ) {
    super(message, {
      code: "RATE_LIMITED",
      status: 429,
      retryAfter,
      expose: true,
    });

    this.name =
      "RateLimitError";
  }
}

export class DatabaseError
  extends AppError {
  constructor(
    message =
      "Ошибка базы данных.",
    cause?: unknown,
    details?: unknown,
  ) {
    super(message, {
      code: "DATABASE_ERROR",
      status: 500,
      cause,
      details,
      expose: false,
    });

    this.name =
      "DatabaseError";
  }
}

export class SecurityError
  extends AppError {
  constructor(
    message =
      "Операция заблокирована системой безопасности.",
    details?: unknown,
  ) {
    super(message, {
      code: "SECURITY_ERROR",
      status: 403,
      details,
      expose: true,
    });

    this.name =
      "SecurityError";
  }
}

export class CsrfError
  extends AppError {
  constructor(
    message =
      "Недействительный CSRF-токен.",
  ) {
    super(message, {
      code: "CSRF_ERROR",
      status: 403,
      expose: true,
    });

    this.name =
      "CsrfError";
  }
}

export class SessionError
  extends AppError {
  constructor(
    message =
      "Сессия недействительна или истекла.",
    details?: unknown,
  ) {
    super(message, {
      code: "SESSION_ERROR",
      status: 401,
      details,
      expose: true,
    });

    this.name =
      "SessionError";
  }
}

export class PermissionError
  extends AppError {
  constructor(
    message =
      "У вас нет разрешения на это действие.",
    details?: unknown,
  ) {
    super(message, {
      code:
        "PERMISSION_ERROR",
      status: 403,
      details,
      expose: true,
    });

    this.name =
      "PermissionError";
  }
}

export class PublicationError
  extends AppError {
  constructor(
    message =
      "Ошибка публикации.",
    details?: unknown,
  ) {
    super(message, {
      code:
        "PUBLICATION_ERROR",
      status: 400,
      details,
      expose: true,
    });

    this.name =
      "PublicationError";
  }
}

export class CommentError
  extends AppError {
  constructor(
    message =
      "Ошибка комментария.",
    details?: unknown,
  ) {
    super(message, {
      code:
        "COMMENT_ERROR",
      status: 400,
      details,
      expose: true,
    });

    this.name =
      "CommentError";
  }
}

export class ReviewError
  extends AppError {
  constructor(
    message =
      "Ошибка отзыва или оценки.",
    details?: unknown,
  ) {
    super(message, {
      code:
        "REVIEW_ERROR",
      status: 400,
      details,
      expose: true,
    });

    this.name =
      "ReviewError";
  }
}

export class ReactionError
  extends AppError {
  constructor(
    message =
      "Ошибка реакции.",
    details?: unknown,
  ) {
    super(message, {
      code:
        "REACTION_ERROR",
      status: 400,
      details,
      expose: true,
    });

    this.name =
      "ReactionError";
  }
}

export class ChatError
  extends AppError {
  constructor(
    message =
      "Ошибка чата.",
    details?: unknown,
  ) {
    super(message, {
      code: "CHAT_ERROR",
      status: 400,
      details,
      expose: true,
    });

    this.name =
      "ChatError";
  }
}

export class NotificationError
  extends AppError {
  constructor(
    message =
      "Ошибка уведомления.",
    details?: unknown,
  ) {
    super(message, {
      code:
        "NOTIFICATION_ERROR",
      status: 400,
      details,
      expose: true,
    });

    this.name =
      "NotificationError";
  }
}

export class FileError
  extends AppError {
  constructor(
    message =
      "Ошибка файла.",
    details?: unknown,
  ) {
    super(message, {
      code: "FILE_ERROR",
      status: 400,
      details,
      expose: true,
    });

    this.name =
      "FileError";
  }
}

export class StorageError
  extends AppError {
  constructor(
    message =
      "Ошибка хранилища.",
    cause?: unknown,
  ) {
    super(message, {
      code:
        "STORAGE_ERROR",
      status: 500,
      cause,
      expose: false,
    });

    this.name =
      "StorageError";
  }
}

export class ConfigurationError
  extends AppError {
  constructor(
    message =
      "Ошибка конфигурации системы.",
    details?: unknown,
  ) {
    super(message, {
      code:
        "CONFIGURATION_ERROR",
      status: 500,
      details,
      expose: false,
    });

    this.name =
      "ConfigurationError";
  }
}

export class TimeoutError
  extends AppError {
  constructor(
    message =
      "Время ожидания операции истекло.",
  ) {
    super(message, {
      code: "TIMEOUT",
      status: 504,
      expose: true,
    });

    this.name =
      "TimeoutError";
  }
}

export class NetworkError
  extends AppError {
  constructor(
    message =
      "Ошибка сетевого соединения.",
    cause?: unknown,
  ) {
    super(message, {
      code:
        "NETWORK_ERROR",
      status: 502,
      cause,
      expose: true,
    });

    this.name =
      "NetworkError";
  }
}

export function isAppError(
  error: unknown,
): error is AppError {
  return (
    error instanceof AppError
  );
}

export function isError(
  value: unknown,
): value is Error {
  return (
    value instanceof Error
  );
}

export function errorMessage(
  error: unknown,
  fallback =
    "Произошла неизвестная ошибка.",
): string {
  if (
    error instanceof Error &&
    error.message
  ) {
    return error.message;
  }

  if (
    typeof error === "string" &&
    error.trim()
  ) {
    return error;
  }

  if (
    error &&
    typeof error === "object"
  ) {
    const value =
      error as Record<
        string,
        unknown
      >;

    if (
      typeof value.message ===
      "string"
    ) {
      return value.message;
    }

    if (
      typeof value.error ===
      "string"
    ) {
      return value.error;
    }
  }

  return fallback;
}

export function errorCode(
  error: unknown,
): string {
  if (
    error instanceof AppError
  ) {
    return error.code;
  }

  if (
    error &&
    typeof error === "object"
  ) {
    const value =
      error as Record<
        string,
        unknown
      >;

    if (
      typeof value.code ===
      "string"
    ) {
      return value.code;
    }
  }

  return "UNKNOWN_ERROR";
}

export function errorStatus(
  error: unknown,
): number {
  if (
    error instanceof AppError
  ) {
    return error.status;
  }

  if (
    error &&
    typeof error === "object"
  ) {
    const value =
      error as Record<
        string,
        unknown
      >;

    if (
      typeof value.status ===
      "number" &&
      Number.isFinite(
        value.status,
      )
    ) {
      return value.status;
    }
  }

  return 500;
}

export function errorDetails(
  error: unknown,
): unknown {
  if (
    error instanceof AppError
  ) {
    return error.details;
  }

  if (
    error &&
    typeof error === "object"
  ) {
    return (
      error as Record<
        string,
        unknown
      >
    ).details;
  }

  return undefined;
}

export function serializeError(
  error: unknown,
  requestId?: string,
): SerializedError {
  if (
    error instanceof AppError
  ) {
    return {
      name: error.name,
      message: error.expose
        ? error.message
        : "Внутренняя ошибка сервера.",
      code: error.code,
      status: error.status,
      details: error.expose
        ? error.details
        : undefined,
      requestId:
        error.requestId ??
        requestId,
      field: error.field,
      retryAfter:
        error.retryAfter,
    };
  }

  return {
    name:
      error instanceof Error
        ? error.name
        : "Error",
    message:
      "Внутренняя ошибка сервера.",
    code: "INTERNAL_ERROR",
    status: 500,
    requestId,
  };
}

export function toAppError(
  error: unknown,
  fallbackMessage =
    "Внутренняя ошибка сервера.",
): AppError {
  if (
    error instanceof AppError
  ) {
    return error;
  }

  if (
    error instanceof Error
  ) {
    return new AppError(
      fallbackMessage,
      {
        code:
          "INTERNAL_ERROR",
        status: 500,
        cause: error,
        expose: false,
      },
    );
  }

  return new AppError(
    fallbackMessage,
    {
      code:
        "INTERNAL_ERROR",
      status: 500,
      cause: error,
      expose: false,
    },
  );
}

export function assert(
  condition: unknown,
  message: string,
  options: ErrorOptions = {},
): asserts condition {
  if (!condition) {
    throw new AppError(
      message,
      options,
    );
  }
}

export function assertExists<T>(
  value: T | null | undefined,
  message =
    "Объект не найден.",
): T {
  if (
    value === null ||
    value === undefined
  ) {
    throw new NotFoundError(
      message,
    );
  }

  return value;
}

export function assertAuthorized(
  condition: unknown,
  message =
    "Требуется авторизация.",
): asserts condition {
  if (!condition) {
    throw new AuthenticationError(
      message,
    );
  }
}

export function assertPermission(
  condition: unknown,
  message =
    "Недостаточно прав.",
): asserts condition {
  if (!condition) {
    throw new PermissionError(
      message,
    );
  }
}

export function assertValid(
  condition: unknown,
  message =
    "Некорректные данные.",
  details?: unknown,
): asserts condition {
  if (!condition) {
    throw new ValidationError(
      message,
      details,
    );
  }
}

export function assertNotFound(
  condition: unknown,
  message =
    "Объект не найден.",
): asserts condition {
  if (!condition) {
    throw new NotFoundError(
      message,
    );
  }
}

export function wrapError(
  error: unknown,
  code: ErrorCode | string,
  message: string,
  status = 500,
): AppError {
  return new AppError(
    message,
    {
      code,
      status,
      cause: error,
      expose: status < 500,
    },
  );
}

export function isNotFoundError(
  error: unknown,
): boolean {
  return (
    errorStatus(error) === 404 ||
    errorCode(error) ===
      "NOT_FOUND"
  );
}

export function isUnauthorizedError(
  error: unknown,
): boolean {
  return (
    errorStatus(error) === 401 ||
    errorCode(error) ===
      "UNAUTHORIZED"
  );
}

export function isForbiddenError(
  error: unknown,
): boolean {
  return (
    errorStatus(error) === 403 ||
    errorCode(error) ===
      "FORBIDDEN" ||
    errorCode(error) ===
      "PERMISSION_ERROR"
  );
}

export function isValidationError(
  error: unknown,
): boolean {
  return (
    error instanceof
      ValidationError ||
    errorCode(error) ===
      "VALIDATION_ERROR"
  );
}

export function isDatabaseError(
  error: unknown,
): boolean {
  return (
    error instanceof
      DatabaseError ||
    errorCode(error) ===
      "DATABASE_ERROR"
  );
}

export function isRetryableError(
  error: unknown,
): boolean {
  const status =
    errorStatus(error);

  return (
    status === 408 ||
    status === 425 ||
    status === 429 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    status >= 500
  );
}

export function createFieldError(
  field: string,
  message: string,
  code:
    | ErrorCode
    | string =
    "VALIDATION_ERROR",
): ValidationError {
  return new ValidationError(
    message,
    {
      field,
      code,
    },
    field,
  );
}

export function collectErrors(
  errors: readonly unknown[],
): SerializedError[] {
  return errors.map(
    (error) =>
      serializeError(error),
  );
}

export function firstError(
  errors: readonly unknown[],
): unknown | null {
  return errors.length > 0
    ? errors[0]
    : null;
}

export const ERROR_STATUS: Record<
  string,
  number
> = {
  UNKNOWN_ERROR: 500,
  VALIDATION_ERROR: 400,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  METHOD_NOT_ALLOWED: 405,
  PAYLOAD_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  DATABASE_ERROR: 500,
  NETWORK_ERROR: 502,
  TIMEOUT: 504,
  SECURITY_ERROR: 403,
  CSRF_ERROR: 403,
  SESSION_ERROR: 401,
  PERMISSION_ERROR: 403,
  PUBLICATION_ERROR: 400,
  COMMENT_ERROR: 400,
  REVIEW_ERROR: 400,
  REACTION_ERROR: 400,
  CHAT_ERROR: 400,
  NOTIFICATION_ERROR: 400,
  FILE_ERROR: 400,
  STORAGE_ERROR: 500,
  CONFIGURATION_ERROR: 500,
  INTERNAL_ERROR: 500,
};

export function statusForCode(
  code: string,
): number {
  return (
    ERROR_STATUS[code] ??
    500
  );
    }
