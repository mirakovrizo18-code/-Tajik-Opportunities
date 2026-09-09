/* ============================================================
TAJIK OPPORTUNITIES
RESPONSE UTILITY
Cloudflare Workers / D1 compatible
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
}

export interface ResponseOptions {
requestId?: string;
headers?: HeadersInit;
}

export interface ErrorResponseOptions {
requestId?: string;
details?: unknown;
code?: string;
headers?: HeadersInit;
}

export function corsHeaders(
_request?: Request,
): Record<string, string> {
return {
"Access-Control-Allow-Origin": "*",
"Access-Control-Allow-Methods":
"GET,POST,PUT,PATCH,DELETE,OPTIONS",
"Access-Control-Allow-Headers":
"Content-Type, Authorization, X-Requested-With, X-Request-ID",
"Access-Control-Max-Age": "86400",
};
}

function createHeaders(
extra?: HeadersInit,
): Headers {
const headers = new Headers();

headers.set(
"Content-Type",
"application/json; charset=utf-8",
);

headers.set(
"Cache-Control",
"no-store",
);

for (const [key, value] of Object.entries(
corsHeaders(),
)) {
headers.set(key, value);
}

if (extra) {
const extraHeaders = new Headers(extra);

```
extraHeaders.forEach(
  (value, key) => {
    headers.set(key, value);
  },
);
```

}

return headers;
}

function serialize(
body: unknown,
): string {
return JSON.stringify(
body,
(_key, value) => {
if (typeof value === "bigint") {
return value.toString();
}

```
  return value;
},
```

);
}

export function jsonResponse<T = unknown>(
data: T,
status = 200,
options?: ResponseOptions,
): Response {
const body: ApiResponseBody<T> = {
success: true,
data,
...(options?.requestId
? { requestId: options.requestId }
: {}),
};

return new Response(
serialize(body),
{
status,
headers: createHeaders(
options?.headers,
),
},
);
}

export function successResponse<T = unknown>(
data: T,
status = 200,
headers?: HeadersInit,
requestId?: string,
): Response {
return jsonResponse(
data,
status,
{
headers,
requestId,
},
);
}

function defaultErrorCode(
status: number,
): string {
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
options?.code ??
defaultErrorCode(status);

const body: ApiResponseBody = {
success: false,
error: {
code,
message,
...(options?.details !== undefined
? { details: options.details }
: {}),
},
...(options?.requestId
? { requestId: options.requestId }
: {}),
};

return new Response(
serialize(body),
{
status,
headers: createHeaders(
options?.headers,
),
},
);
}

export function badRequestResponse(
message = "Некорректный запрос",
details?: unknown,
requestId?: string,
): Response {
return errorResponse(
message,
400,
{
code: "BAD_REQUEST",
details,
requestId,
},
);
}

export function unauthorizedResponse(
message = "Требуется авторизация",
requestId?: string,
): Response {
return errorResponse(
message,
401,
{
code: "UNAUTHORIZED",
requestId,
},
);
}

export function forbiddenResponse(
message = "Доступ запрещён",
requestId?: string,
): Response {
return errorResponse(
message,
403,
{
code: "FORBIDDEN",
requestId,
},
);
}

export function notFoundResponse(
message = "Ресурс не найден",
requestId?: string,
): Response {
return errorResponse(
message,
404,
{
code: "NOT_FOUND",
requestId,
},
);
}

export function conflictResponse(
message = "Конфликт данных",
details?: unknown,
requestId?: string,
): Response {
return errorResponse(
message,
409,
{
code: "CONFLICT",
details,
requestId,
},
);
}

export function tooManyRequestsResponse(
message = "Слишком много запросов",
requestId?: string,
): Response {
return errorResponse(
message,
429,
{
code: "RATE_LIMITED",
requestId,
},
);
}

export function serverErrorResponse(
message = "Внутренняя ошибка сервера",
details?: unknown,
requestId?: string,
): Response {
return errorResponse(
message,
500,
{
code: "INTERNAL_ERROR",
details,
requestId,
},
);
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
request.headers.get(
"X-Request-ID",
) ||
crypto.randomUUID();

return {
requestId,

```
ip:
  request.headers.get(
    "CF-Connecting-IP",
  ) ||
  request.headers.get(
    "X-Forwarded-For",
  ),

userAgent:
  request.headers.get(
    "User-Agent",
  ),

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
const merged =
new Headers(response.headers);

for (const [key, value] of Object.entries(
corsHeaders(),
)) {
if (!merged.has(key)) {
merged.set(key, value);
}
}

if (headers) {
const extra =
new Headers(headers);

```
extra.forEach(
  (value, key) => {
    merged.set(key, value);
  },
);
```

}

return new Response(
response.body,
{
status: response.status,
statusText:
response.statusText,
headers: merged,
},
);
}

export async function readJson<T = unknown>(
request: Request,
): Promise<T> {
const contentType =
request.headers.get(
"Content-Type",
) || "";

if (
contentType &&
!contentType
.toLowerCase()
.includes("application/json")
) {
throw new Error(
"Expected application/json",
);
}

return (
(await request.json()) as T
);
}

export function isJsonRequest(
request: Request,
): boolean {
const contentType =
request.headers.get(
"Content-Type",
) || "";

return contentType
.toLowerCase()
.includes("application/json");
}

export function withRequestId(
response: Response,
requestId: string,
): Response {
return responseWithHeaders(
response,
{
"X-Request-ID":
requestId,
},
);
}

export function noContentResponse(
headers?: HeadersInit,
): Response {
const merged =
createHeaders(headers);

merged.delete(
"Content-Type",
);

return new Response(null, {
status: 204,
headers: merged,
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
const headers =
createHeaders();

headers.set(
"Location",
location,
);

return new Response(null, {
status,
headers,
});
}
