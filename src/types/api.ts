export type ApiErrorCode =
| "BAD_REQUEST"
| "UNAUTHORIZED"
| "FORBIDDEN"
| "NOT_FOUND"
| "METHOD_NOT_ALLOWED"
| "CONFLICT"
| "GONE"
| "UNSUPPORTED_MEDIA_TYPE"
| "VALIDATION_ERROR"
| "RATE_LIMITED"
| "INTERNAL_SERVER_ERROR"
| "ERROR"
| "INVALID_REQUEST"
| "INVALID_JSON"
| "MISSING_FIELD"
| "INVALID_FIELD"
| "NOT_FOUND_RESOURCE"
| "ALREADY_EXISTS"
| "DATABASE_ERROR"
| "AUTHENTICATION_ERROR"
| "AUTHORIZATION_ERROR"
| "NETWORK_ERROR"
| "TIMEOUT"
| "UNKNOWN_ERROR";

export interface ApiError {
code: ApiErrorCode | string;
message: string;
details?: unknown;
field?: string;
fields?: Record<string, string>;
}

export interface ApiSuccessResponse<T = unknown> {
success: true;
data: T;
meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
success: false;
error: ApiError;
}

export type ApiResponse<T = unknown> =
| ApiSuccessResponse<T>
| ApiErrorResponse;

export interface ApiPagination {
page: number;
limit: number;
total?: number;
totalPages?: number;
hasNext?: boolean;
hasPrevious?: boolean;
}

export interface ApiListResponse<T = unknown> {
success: true;
data: T[];
meta?: Record<string, unknown>;
pagination?: ApiPagination;
}

export interface ApiRequestContext {
requestId: string;
method: string;
path: string;
url: string;
userAgent?: string;
ip?: string;
}

export interface ApiValidationError {
field: string;
message: string;
code?: ApiErrorCode | string;
}

export interface ApiValidationResult {
valid: boolean;
errors?: ApiValidationError[];
}
