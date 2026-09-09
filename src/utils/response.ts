/* ============================================================
🇹🇯 TAJIK OPPORTUNITIES
RESPONSE UTILITY
Cloudflare Workers / D1 compatible

Features:

* Unified API responses
* CORS
* Security headers
* Request ID
* Error handling
* JSON parsing
* Pagination metadata
* Cache / ETag support
* Rate-limit headers
* BigInt serialization
* Cloudflare request context
  ============================================================ */

export interface RequestContext {
requestId: string;
ip?: string | null;
userAgent?: string | null;
country?: string | null;
city?: string | null;
colo?: string | null;
method: string;
url: string;
path: string;
}

export interface ApiErrorDetails {
code?: string;
field?: string;
fields?: Record<string, string>;
details?: unknown;
message?: string;
}

export interface PaginationMeta {
page?: number;
limit?: number;
total?: number;
totalPages?: number;
hasNext?: boolean;
hasPrevious?: boolean;
nextPage?: number | null;
previousPage?: number | null;
}

export interface ApiResponseBody<T = unknown> {
success: boolean;
data?: T;
error?: {
code: string;
message: string;
field?: string;
fields?: Record<string, string>;
details?: unknown;
};
meta?: Record<string, unknown>;
requestId?: string;
timestamp?: string;
}

export interface ResponseOptions {
requestId?: string;
headers?: HeadersInit;
meta?: Record<string, unknown>;
pagination?: PaginationMeta;
includeTimestamp?: boolean;
cacheControl?: string;
etag?: string;
durationMs?: number;
}

export interface ErrorResponseOptions {
requestId?: string;
details?: unknown;
code?: string;
headers?: HeadersInit;
meta?: Record<string, unknown>;
includeTimestamp?: boolean;
}

export interface RateLimitOptions {
limit?: number;
remaining?: number;
reset?: number | string;
retryAfter?: number;
}

const DEFAULT_CACHE_CONTROL = "no-store, max-age=0";

const DEFAULT_SECURITY_HEADERS: Record<string, string> = {
"X-Content-Type-Options": "nosniff",
"X-Frame-Options": "DENY",
"Referrer-Policy": "strict-origin-when-cross-origin",
"Permissions-Policy": "camera=(), microphone=(), geolocation=()",
"Cross-Origin-Resource-Policy": "cross-origin",
};

export function corsHeaders(_request?: Request): Record<string, string> {
return {
"Access-Control-Allow-Origin": "*",
"Access-Control-Allow-Methods":
"GET,POST,PUT,PATCH,DELETE,OPTIONS",
"Access-Control-Allow-Headers": [
"Content-Type",
"Authorization",
"X-Requested-With",
"X-Request-ID",
"Accept",
"Origin",
"Cache-Control",
].join(", "),
"Access-Control-Expose-Headers": [
"X-Request-ID",
"X-API-Version",
"X-Response-Time",
"ETag",
"X-RateLimit-Limit",
"X-RateLimit-Remaining",
"X-RateLimit-Reset",
"Retry-After",
].join(", "),
"Access-Control-Max-Age": "86400",
};
}

function createHeaders(
extra?: HeadersInit,
options?: {
cacheControl?: string;
etag?: string;
durationMs?: number;
},
): Headers {
const headers = new Headers();

headers.set(
"Content-Type",
"application/json; charset=utf-8",
);

headers.set(
"Cache-Control",
options?.cacheControl ?? DEFAULT_CACHE_CONTROL,
);

for (const [key, value] of Object.entries(corsHeaders())) {
headers.set(key, value);
}

for (const [key, value] of Object.entries(
DEFAULT_SECURITY_HEADERS,
)) {
headers.set(key, value);
}

if (options?.etag) {
headers.set("ETag", options.etag);
}

if (typeof options?.durationMs === "number") {
headers.set(
"X-Response-Time",
`${Math.max(0, Math.round(options.durationMs))}ms`,
);
}

if (extra) {
const extraHeaders = new Headers(extra);

```
extraHeaders.forEach((value, key) => {
  headers.set(key, value);
});
```

}

return headers;
}

function serialize(body: unknown): string {
return JSON.stringify(body, (_key, value) => {
if (typeof value === "bigint") {
return value.toString();
}

```
if (value instanceof Date) {
  return value.toISOString();
}

return value;
```

});
}

function buildMeta(
options?: ResponseOptions,
): Record<string, unknown> | undefined {
const meta: Record<string, unknown> = {
...(options?.meta ?? {}),
};

if (options?.pagination) {
meta.pagination = normalizePagination(
options.pagination,
);
}

if (typeof options?.durationMs === "number") {
meta.durationMs = Math.max(
0,
Math.round(options.durationMs),
);
}

return Object.keys(meta).length > 0 ? meta : undefined;
}

function normalizePagination(
pagination: PaginationMeta,
): PaginationMeta {
const page =
typeof pagination.page === "number" &&
Number.isFinite(pagination.page)
? Math.max(1, Math.floor(pagination.page))
: undefined;

const limit =
typeof pagination.limit === "number" &&
Number.isFinite(pagination.limit)
? Math.max(1, Math.floor(pagination.limit))
: undefined;

const total =
typeof pagination.total === "number" &&
Number.isFinite(pagination.total)
? Math.max(0, Math.floor(pagination.total))
: undefined;

const totalPages =
typeof pagination.totalPages === "number" &&
Number.isFinite(pagination.totalPages)
? Math.max(0, Math.floor(pagination.totalPages))
: undefined;

const calculatedTotalPages =
total !== undefined &&
limit !== undefined &&
limit > 0
? Math.ceil(total / limit)
: totalPages;

const finalTotalPages = calculatedTotalPages;

const hasNext =
pagination.hasNext ??
(page !== undefined &&
finalTotalPages !== undefined
? page < finalTotalPages
: false);

const hasPrevious =
pagination.hasPrevious ??
(page !== undefined ? page > 1 : false);

const nextPage =
pagination.nextPage ??
(hasNext && page !== undefined ? page + 1 : null);

const previousPage =
pagination.previousPage ??
(hasPrevious && page !== undefined ? page - 1 : null);

return {
...(page !== undefined ? { page } : {}),
...(limit !== undefined ? { limit } : {}),
...(total !== undefined ? { total } : {}),
...(finalTotalPages !== undefined
? { totalPages: finalTotalPages }
: {}),
hasNext,
hasPrevious,
nextPage,
previousPage,
};
}

function createBody<T>(
data: T,
options?: ResponseOptions,
): ApiResponseBody<T> {
const meta = buildMeta(options);

return {
success: true,
data,
...(meta ? { meta } : {}),
...(options?.requestId
? { requestId: options.requestId }
: {}),
...(options?.includeTimestamp !== false
? { timestamp: new Date().toISOString() }
: {}),
};
}

export function jsonResponse<T = unknown>(
data: T,
status = 200,
options?: ResponseOptions,
): Response {
const body = createBody(data, options);

return new Response(serialize(body), {
status,
headers: createHeaders(
options?.headers,
{
cacheControl: options?.cacheControl,
etag: options?.etag,
durationMs: options?.durationMs,
},
),
});
}

export function successResponse<T = unknown>(
data: T,
status = 200,
headers?: HeadersInit,
requestId?: string,
): Response {
return jsonResponse(data, status, {
headers,
requestId,
});
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
return status >= 500
? "INTERNAL_ERROR"
: "REQUEST_ERROR";
}
}

export function errorResponse(
message: string,
status = 500,
options?: ErrorResponseOptions,
): Response {
const code =
options?.code ?? defaultErrorCode(status);

const error: NonNullable<
ApiResponseBody["error"]

> = {
> code,
> message,
> ...(options?.details !== undefined
> ? { details: options.details }
> : {}),
> };

const body: ApiResponseBody = {
success: false,
error,
...(options?.meta
? { meta: options.meta }
: {}),
...(options?.requestId
? { requestId: options.requestId }
: {}),
...(options?.includeTimestamp !== false
? { timestamp: new Date().toISOString() }
: {}),
};

return new Response(serialize(body), {
status,
headers: createHeaders(options?.headers),
});
}

export function badRequestResponse(
message = "Некорректный запрос",
details?: unknown,
requestId?: string,
): Response {
return errorResponse(message, 400, {
code: "BAD_REQUEST",
details,
requestId,
});
}

export function unauthorizedResponse(
message = "Требуется авторизация",
requestId?: string,
): Response {
return errorResponse(message, 401, {
code: "UNAUTHORIZED",
requestId,
});
}

export function forbiddenResponse(
message = "Доступ запрещён",
requestId?: string,
): Response {
return errorResponse(message, 403, {
code: "FORBIDDEN",
requestId,
});
}

export function notFoundResponse(
message = "Ресурс не найден",
requestId?: string,
): Response {
return errorResponse(message, 404, {
code: "NOT_FOUND",
requestId,
});
}

export function conflictResponse(
message = "Конфликт данных",
details?: unknown,
requestId?: string,
): Response {
return errorResponse(message, 409, {
code: "CONFLICT",
details,
requestId,
});
}

export function goneResponse(
message = "Ресурс больше недоступен",
requestId?: string,
): Response {
return errorResponse(message, 410, {
code: "GONE",
requestId,
});
}

export function unsupportedMediaTypeResponse(
message = "Неподдерживаемый тип данных",
requestId?: string,
): Response {
return errorResponse(message, 415, {
code: "UNSUPPORTED_MEDIA_TYPE",
requestId,
});
}

export function validationErrorResponse(
message = "Ошибка проверки данных",
details?: unknown,
requestId?: string,
): Response {
return errorResponse(message, 422, {
code: "VALIDATION_ERROR",
details,
requestId,
});
}

export function tooManyRequestsResponse(
message = "Слишком много запросов",
requestId?: string,
retryAfter?: number,
): Response {
return errorResponse(message, 429, {
code: "RATE_LIMITED",
requestId,
headers:
retryAfter !== undefined
? {
"Retry-After": String(
Math.max(
0,
Math.floor(retryAfter),
),
),
}
: undefined,
});
}

export function serverErrorResponse(
message = "Внутренняя ошибка сервера",
details?: unknown,
requestId?: string,
): Response {
return errorResponse(message, 500, {
code: "INTERNAL_ERROR",
details,
requestId,
});
}

export function methodNotAllowedResponse(
allowedMethods: string[] = ["GET"],
requestId?: string,
): Response {
return errorResponse(
"Метод запроса не поддерживается",
405,
{
code: "METHOD_NOT_ALLOWED",
details: {
allowedMethods,
},
headers: {
Allow: allowedMethods.join(", "),
},
requestId,
},
);
}

export function getRequestContext(
request: Request,
): RequestContext {
const url = new URL(request.url);

const cf = (
request as Request & {
cf?: Record<string, unknown>;
}
).cf;

const requestId =
request.headers.get("X-Request-ID") ||
crypto.randomUUID();

const forwardedFor =
request.headers.get("X-Forwarded-For");

return {
requestId,

```
ip:
  request.headers.get("CF-Connecting-IP") ||
  (
    forwardedFor
      ? forwardedFor.split(",")[0]?.trim()
      : null
  ),

userAgent:
  request.headers.get("User-Agent"),

country:
  typeof cf?.country === "string"
    ? cf.country
    : null,

city:
  typeof cf?.city === "string"
    ? cf.city
    : null,

colo:
  typeof cf?.colo === "string"
    ? cf.colo
    : null,

method:
  request.method.toUpperCase(),

url: request.url,

path: url.pathname,
```

};
}

export function responseWithHeaders(
response: Response,
headers?: HeadersInit,
): Response {
const merged = new Headers(response.headers);

for (const [key, value] of Object.entries(
corsHeaders(),
)) {
if (!merged.has(key)) {
merged.set(key, value);
}
}

for (const [key, value] of Object.entries(
DEFAULT_SECURITY_HEADERS,
)) {
if (!merged.has(key)) {
merged.set(key, value);
}
}

if (headers) {
const extra = new Headers(headers);

```
extra.forEach((value, key) => {
  merged.set(key, value);
});
```

}

return new Response(response.body, {
status: response.status,
statusText: response.statusText,
headers: merged,
});
}

export async function readJson<T = unknown>(
request: Request,
): Promise<T> {
const contentType =
request.headers.get("Content-Type") || "";

if (
contentType &&
!contentType
.toLowerCase()
.includes("application/json")
) {
throw new Error("Expected application/json");
}

return (await request.json()) as T;
}

export async function tryReadJson<T = unknown>(
request: Request,
): Promise<
| {
success: true;
data: T;
}
| {
success: false;
error: string;
}

> {
> try {
> const data = await readJson<T>(request);

```
return {
  success: true,
  data,
};
```

} catch (error) {
return {
success: false,
error:
error instanceof Error
? error.message
: "Invalid JSON",
};
}
}

export function isJsonRequest(
request: Request,
): boolean {
const contentType =
request.headers.get("Content-Type") || "";

return contentType
.toLowerCase()
.includes("application/json");
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
const headers: Record<string, string> = {};

if (options.limit !== undefined) {
headers["X-RateLimit-Limit"] = String(
Math.max(
0,
Math.floor(options.limit),
),
);
}

if (options.remaining !== undefined) {
headers["X-RateLimit-Remaining"] = String(
Math.max(
0,
Math.floor(options.remaining),
),
);
}

if (options.reset !== undefined) {
headers["X-RateLimit-Reset"] =
String(options.reset);
}

if (options.retryAfter !== undefined) {
headers["Retry-After"] = String(
Math.max(
0,
Math.floor(options.retryAfter),
),
);
}

return responseWithHeaders(
response,
headers,
);
}

export function noContentResponse(
headers?: HeadersInit,
): Response {
const merged = createHeaders(headers);

merged.delete("Content-Type");

merged.set("Cache-Control", "no-store");

return new Response(null, {
status: 204,
headers: merged,
});
}

export function optionsResponse(): Response {
return new Response(null, {
status: 204,
headers: createHeaders(),
});
}

export function redirectResponse(
location: string,
status:
| 301
| 302
| 303
| 307
| 308 = 302,
): Response {
const headers = new Headers();

for (const [key, value] of Object.entries(
corsHeaders(),
)) {
headers.set(key, value);
}

for (const [key, value] of Object.entries(
DEFAULT_SECURITY_HEADERS,
)) {
headers.set(key, value);
}

headers.set("Location", location);

return new Response(null, {
status,
headers,
});
}

export function textResponse(
text: string,
status = 200,
headers?: HeadersInit,
): Response {
const merged = new Headers();

merged.set(
"Content-Type",
"text/plain; charset=utf-8",
);

merged.set(
"Cache-Control",
DEFAULT_CACHE_CONTROL,
);

for (const [key, value] of Object.entries(
corsHeaders(),
)) {
merged.set(key, value);
}

for (const [key, value] of Object.entries(
DEFAULT_SECURITY_HEADERS,
)) {
merged.set(key, value);
}

if (headers) {
const extra = new Headers(headers);

```
extra.forEach((value, key) => {
  merged.set(key, value);
});
```

}

return new Response(text, {
status,
headers: merged,
});
}

export function htmlResponse(
html: string,
status = 200,
headers?: HeadersInit,
): Response {
const merged = new Headers();

merged.set(
"Content-Type",
"text/html; charset=utf-8",
);

merged.set(
"Cache-Control",
"no-store",
);

for (const [key, value] of Object.entries(
corsHeaders(),
)) {
merged.set(key, value);
}

for (const [key, value] of Object.entries(
DEFAULT_SECURITY_HEADERS,
)) {
merged.set(key, value);
}

if (headers) {
const extra = new Headers(headers);

```
extra.forEach((value, key) => {
  merged.set(key, value);
});
```

}

return new Response(html, {
status,
headers: merged,
});
}

export async function createEtag(
value: unknown,
): Promise<string> {
const serialized = serialize(value);

const data = new TextEncoder().encode(
serialized,
);

const digest = await crypto.subtle.digest(
"SHA-256",
data,
);

const hash = Array.from(
new Uint8Array(digest),
)
.map((byte) =>
byte.toString(16).padStart(2, "0"),
)
.join("");

return `"${hash}"`;
}

export function isNotModified(
request: Request,
etag: string,
): boolean {
const clientEtag =
request.headers.get("If-None-Match");

if (!clientEtag) {
return false;
}

return (
clientEtag === etag ||
clientEtag
.split(",")
.map((value) => value.trim())
.includes(etag)
);
}

export function notModifiedResponse(
etag: string,
): Response {
return new Response(null, {
status: 304,
headers: createHeaders(
{
ETag: etag,
},
{
cacheControl: "public, max-age=60",
etag,
},
),
});
}

export function jsonErrorFromUnknown(
error: unknown,
requestId?: string,
): Response {
const message =
error instanceof Error
? error.message
: "Неизвестная ошибка";

return serverErrorResponse(
message,
undefined,
requestId,
);
}

export function addResponseTiming(
response: Response,
startedAt: number,
): Response {
const duration = Date.now() - startedAt;

return responseWithHeaders(
response,
{
"X-Response-Time": `${Math.max(
        0,
        duration,
      )}ms`,
},
);
}
