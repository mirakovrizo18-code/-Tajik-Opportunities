import type { ApiErrorCode } from "../types/api";

export interface RequestContext {
requestId: string;
method: string;
path: string;
url: string;
userAgent?: string;
ip?: string;
}

export interface ApiErrorDetails {
code?: string;
field?: string;
fields?: Record<string, string>;
[key: string]: unknown;
}

export interface PaginationMeta {
page: number;
limit: number;
total?: number;
totalPages?: number;
hasNext?: boolean;
hasPrevious?: boolean;
}

export interface ApiResponseBody<T = unknown> {
success: boolean;
data?: T;
error?: {
code?: string;
message: string;
details?: unknown;
};
meta?: Record<string, unknown>;
}

export interface ResponseOptions {
requestId?: string;
headers?: HeadersInit;
cacheControl?: string;
contentType?: string;
statusText?: string;
}

export interface ErrorResponseOptions {
requestId?: string;
details?: unknown;
headers?: HeadersInit;
code?: string;
}

export interface RateLimitOptions {
limit: number;
remaining: number;
reset?: number;
}

const DEFAULT_CACHE_CONTROL = "no-store";

const DEFAULT_SECURITY_HEADERS: Record<string, string> = {
"X-Content-Type-Options": "nosniff",
"X-Frame-Options": "DENY",
"Referrer-Policy": "strict-origin-when-cross-origin",
};

export function corsHeaders(_request?: Request): Record<string, string> {
return {
"Access-Control-Allow-Origin": "*",
"Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
"Access-Control-Allow-Headers":
"Content-Type, Authorization, X-Requested-With, X-Request-ID",
"Access-Control-Max-Age": "86400",
};
}

function createHeaders(
request?: Request,
options: ResponseOptions = {},
): Headers {
const headers = new Headers();

const cors = corsHeaders(request);
for (const [key, value] of Object.entries(cors)) {
headers.set(key, value);
}

for (const [key, value] of Object.entries(DEFAULT_SECURITY_HEADERS)) {
headers.set(key, value);
}

headers.set(
"Cache-Control",
options.cacheControl ?? DEFAULT_CACHE_CONTROL,
);

headers.set(
"Content-Type",
options.contentType ?? "application/json; charset=utf-8",
);

if (options.headers) {
const customHeaders = new Headers(options.headers);

```
customHeaders.forEach((value, key) => {
  headers.set(key, value);
});
```

}

if (options.requestId) {
headers.set("X-Request-ID", options.requestId);
}

return headers;
}

function serialize(value: unknown): unknown {
if (typeof value === "bigint") {
return value.toString();
}

if (value instanceof Date) {
return value.toISOString();
}

if (Array.isArray(value)) {
return value.map(serialize);
}

if (value && typeof value === "object") {
const result: Record<string, unknown> = {};

```
for (const [key, item] of Object.entries(value)) {
  result[key] = serialize(item);
}

return result;
```

}

return value;
}

function buildMeta(
meta?: Record<string, unknown>,
pagination?: PaginationMeta,
): Record<string, unknown> | undefined {
if (!meta && !pagination) {
return undefined;
}

const result: Record<string, unknown> = {
...(meta ?? {}),
};

if (pagination) {
result.pagination = pagination;
}

return result;
}

function normalizePagination(
page?: number,
limit?: number,
total?: number,
): PaginationMeta | undefined {
if (page === undefined && limit === undefined && total === undefined) {
return undefined;
}

const safePage = Math.max(1, page ?? 1);
const safeLimit = Math.max(1, limit ?? 20);

const result: PaginationMeta = {
page: safePage,
limit: safeLimit,
};

if (total !== undefined) {
const safeTotal = Math.max(0, total);
const totalPages = Math.max(1, Math.ceil(safeTotal / safeLimit));

```
result.total = safeTotal;
result.totalPages = totalPages;
result.hasNext = safePage < totalPages;
result.hasPrevious = safePage > 1;
```

}

return result;
}

function createBody<T>(
data: T,
meta?: Record<string, unknown>,
pagination?: PaginationMeta,
): ApiResponseBody<T> {
const body: ApiResponseBody<T> = {
success: true,
data: serialize(data) as T,
};

const finalMeta = buildMeta(meta, pagination);

if (finalMeta) {
body.meta = finalMeta;
}

return body;
}

export function jsonResponse<T>(
data: T,
status = 200,
options: ResponseOptions & {
meta?: Record<string, unknown>;
page?: number;
limit?: number;
total?: number;
} = {},
): Response {
const pagination = normalizePagination(
options.page,
options.limit,
options.total,
);

const body = createBody(data, options.meta, pagination);

const headers = createHeaders(undefined, {
...options,
requestId: options.requestId,
});

return new Response(JSON.stringify(body), {
status,
statusText: options.statusText,
headers,
});
}

export function successResponse<T>(
data: T,
status = 200,
options: ResponseOptions = {},
): Response {
return jsonResponse(data, status, options);
}

function defaultErrorCode(status: number): string {
switch (status) {
case 400:
return "BAD_REQUEST";
case 401:
return "UNAUTHORIZED";
case 403:
return "FORBIDDEN";
case 404:
return "NOT_FOUND";
case 405:
return "METHOD_NOT_ALLOWED";
case 409:
return "CONFLICT";
case 410:
return "GONE";
case 415:
return "UNSUPPORTED_MEDIA_TYPE";
case 422:
return "VALIDATION_ERROR";
case 429:
return "RATE_LIMITED";
default:
return status >= 500 ? "INTERNAL_SERVER_ERROR" : "ERROR";
}
}

export function errorResponse(
message: string,
status = 500,
options: ErrorResponseOptions = {},
): Response {
const error = {
code: options.code ?? defaultErrorCode(status),
message,
...(options.details !== undefined
? { details: serialize(options.details) }
: {}),
};

const body: ApiResponseBody = {
success: false,
error,
};

const headers = createHeaders(undefined, {
requestId: options.requestId,
headers: options.headers,
});

return new Response(JSON.stringify(body), {
status,
headers,
});
}

export function badRequestResponse(
message = "Bad request",
options: ErrorResponseOptions = {},
): Response {
return errorResponse(message, 400, {
...options,
code: options.code ?? "BAD_REQUEST",
});
}

export function unauthorizedResponse(
message = "Unauthorized",
options: ErrorResponseOptions = {},
): Response {
return errorResponse(message, 401, {
...options,
code: options.code ?? "UNAUTHORIZED",
});
}

export function forbiddenResponse(
message = "Forbidden",
options: ErrorResponseOptions = {},
): Response {
return errorResponse(message, 403, {
...options,
code: options.code ?? "FORBIDDEN",
});
}

export function notFoundResponse(
message = "Not found",
options: ErrorResponseOptions = {},
): Response {
return errorResponse(message, 404, {
...options,
code: options.code ?? "NOT_FOUND",
});
}

export function conflictResponse(
message = "Conflict",
options: ErrorResponseOptions = {},
): Response {
return errorResponse(message, 409, {
...options,
code: options.code ?? "CONFLICT",
});
}

export function goneResponse(
message = "Gone",
options: ErrorResponseOptions = {},
): Response {
return errorResponse(message, 410, {
...options,
code: options.code ?? "GONE",
});
}

export function unsupportedMediaTypeResponse(
message = "Unsupported media type",
options: ErrorResponseOptions = {},
): Response {
return errorResponse(message, 415, {
...options,
code: options.code ?? "UNSUPPORTED_MEDIA_TYPE",
});
}

export function validationErrorResponse(
message = "Validation error",
details?: unknown,
options: ErrorResponseOptions = {},
): Response {
return errorResponse(message, 422, {
...options,
details: details ?? options.details,
code: options.code ?? "VALIDATION_ERROR",
});
}

export function tooManyRequestsResponse(
message = "Too many requests",
options: ErrorResponseOptions & RateLimitOptions = {
limit: 100,
remaining: 0,
},
): Response {
const headers = new Headers(options.headers);

headers.set("X-RateLimit-Limit", String(options.limit));
headers.set("X-RateLimit-Remaining", String(options.remaining));

if (options.reset !== undefined) {
headers.set("X-RateLimit-Reset", String(options.reset));
}

return errorResponse(message, 429, {
...options,
headers,
code: options.code ?? "RATE_LIMITED",
});
}

export function serverErrorResponse(
message = "Internal server error",
options: ErrorResponseOptions = {},
): Response {
return errorResponse(message, 500, {
...options,
code: options.code ?? "INTERNAL_SERVER_ERROR",
});
}

export function methodNotAllowedResponse(
allowedMethods: string[] = [],
options: ErrorResponseOptions = {},
): Response {
const headers = new Headers(options.headers);

if (allowedMethods.length > 0) {
headers.set("Allow", allowedMethods.join(", "));
}

return errorResponse("Method not allowed", 405, {
...options,
headers,
code: options.code ?? "METHOD_NOT_ALLOWED",
});
}

export function getRequestContext(request: Request): RequestContext {
const url = new URL(request.url);

const requestId =
request.headers.get("X-Request-ID") ??
crypto.randomUUID();

const userAgent =
request.headers.get("User-Agent") ?? undefined;

const ip =
request.headers.get("CF-Connecting-IP") ??
request.headers.get("X-Forwarded-For") ??
undefined;

return {
requestId,
method: request.method,
path: url.pathname,
url: request.url,
userAgent,
ip,
};
}

export function responseWithHeaders(
response: Response,
headers?: HeadersInit,
): Response {
const resultHeaders = new Headers(response.headers);

if (headers) {
const extraHeaders = new Headers(headers);

```
extraHeaders.forEach((value, key) => {
  resultHeaders.set(key, value);
});
```

}

return new Response(response.body, {
status: response.status,
statusText: response.statusText,
headers: resultHeaders,
});
}

export async function readJson<T = unknown>(
request: Request,
): Promise<T> {
const text = await request.text();

if (!text.trim()) {
throw new Error("Request body is empty");
}

try {
return JSON.parse(text) as T;
} catch {
throw new Error("Invalid JSON");
}
}

export async function tryReadJson<T = unknown>(
request: Request,
): Promise<T | null> {
try {
return await readJson<T>(request);
} catch {
return null;
}
}

export function isJsonRequest(request: Request): boolean {
const contentType = request.headers.get("Content-Type") ?? "";

return contentType.toLowerCase().includes("application/json");
}

export function withRequestId(
response: Response,
requestId: string,
): Response {
return responseWithHeaders(response, {
"X-Request-ID": requestId,
});
}

export function withApiVersion(
response: Response,
version: string,
): Response {
return responseWithHeaders(response, {
"X-API-Version": version,
});
}

export function withRateLimit(
response: Response,
options: RateLimitOptions,
): Response {
const headers = new Headers();

headers.set("X-RateLimit-Limit", String(options.limit));
headers.set("X-RateLimit-Remaining", String(options.remaining));

if (options.reset !== undefined) {
headers.set("X-RateLimit-Reset", String(options.reset));
}

return responseWithHeaders(response, headers);
}

export function noContentResponse(
options: ResponseOptions = {},
): Response {
const headers = createHeaders(undefined, {
...options,
contentType: undefined,
});

return new Response(null, {
status: 204,
headers,
});
}

export function optionsResponse(
request?: Request,
): Response {
const headers = createHeaders(request, {
contentType: undefined,
});

return new Response(null, {
status: 204,
headers,
});
}

export function redirectResponse(
url: string,
status = 302,
options: ResponseOptions = {},
): Response {
const headers = createHeaders(undefined, {
...options,
contentType: undefined,
});

headers.set("Location", url);

return new Response(null, {
status,
headers,
});
}

export function textResponse(
text: string,
status = 200,
options: ResponseOptions = {},
): Response {
const headers = createHeaders(undefined, {
...options,
contentType: options.contentType ?? "text/plain; charset=utf-8",
});

return new Response(text, {
status,
statusText: options.statusText,
headers,
});
}

export function htmlResponse(
html: string,
status = 200,
options: ResponseOptions = {},
): Response {
const headers = createHeaders(undefined, {
...options,
contentType: "text/html; charset=utf-8",
});

return new Response(html, {
status,
statusText: options.statusText,
headers,
});
}

export async function createEtag(
data: unknown,
): Promise<string> {
const serialized = JSON.stringify(serialize(data));

const bytes = new TextEncoder().encode(serialized);

const hashBuffer = await crypto.subtle.digest(
"SHA-256",
bytes,
);

const hashArray = Array.from(new Uint8Array(hashBuffer));

const hash = hashArray
.map((byte) => byte.toString(16).padStart(2, "0"))
.join("");

return `"${hash}"`;
}

export function isNotModified(
request: Request,
etag: string,
): boolean {
const ifNoneMatch = request.headers.get("If-None-Match");

if (!ifNoneMatch) {
return false;
}

return ifNoneMatch === etag || ifNoneMatch.includes("*");
}

export function notModifiedResponse(
etag?: string,
): Response {
const headers = new Headers();

if (etag) {
headers.set("ETag", etag);
}

return new Response(null, {
status: 304,
headers,
});
}

export function jsonErrorFromUnknown(
error: unknown,
requestId?: string,
): Response {
if (error instanceof Error) {
return serverErrorResponse(error.message, {
requestId,
});
}

if (typeof error === "string") {
return serverErrorResponse(error, {
requestId,
});
}

return serverErrorResponse("Unknown server error", {
requestId,
details: error,
});
}

export function addResponseTiming(
response: Response,
startedAt: number,
): Response {
const elapsed = Math.max(
0,
Math.round(performance.now() - startedAt),
);

return responseWithHeaders(response, {
"Server-Timing": `app;dur=${elapsed}`,
});
}
