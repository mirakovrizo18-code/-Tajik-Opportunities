// ============================================================
// 🇹🇯 TAJIK OPPORTUNITIES
// COOKIE UTILITIES
// Version: 2026.09
// ============================================================

export interface CookieOptions {
  maxAge?: number;
  expires?: Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
  priority?: "Low" | "Medium" | "High";
}

export interface ParsedCookie {
  name: string;
  value: string;
}

/**
 * Безопасно декодирует cookie value.
 */
function decodeCookieValue(
  value: string
): string {
  try {
    return decodeURIComponent(
      value
    );
  } catch {
    return value;
  }
}

/**
 * Безопасно кодирует cookie value.
 */
function encodeCookieValue(
  value: string
): string {
  return encodeURIComponent(
    value
  );
}

/**
 * Очищает имя cookie.
 */
export function sanitizeCookieName(
  name: string
): string {
  return name
    .trim()
    .replace(/[^A-Za-z0-9!#$%&'*+\-.^_`|~]/g, "");
}

/**
 * Проверяет имя cookie.
 */
export function isValidCookieName(
  name: string
): boolean {
  if (
    !name ||
    name.length > 256
  ) {
    return false;
  }

  return /^[A-Za-z0-9!#$%&'*+\-.^_`|~]+$/.test(
    name
  );
}

/**
 * Проверяет cookie value.
 */
export function isValidCookieValue(
  value: string
): boolean {
  if (
    value.includes("\r") ||
    value.includes("\n") ||
    value.includes("\0")
  ) {
    return false;
  }

  return true;
}

/**
 * Парсит Cookie header.
 */
export function parseCookies(
  header: string | null
): Record<string, string> {
  const cookies: Record<
    string,
    string
  > = {};

  if (!header) {
    return cookies;
  }

  const parts =
    header.split(";");

  for (const part of parts) {
    const index =
      part.indexOf("=");

    if (index <= 0) {
      continue;
    }

    const rawName =
      part
        .slice(0, index)
        .trim();

    const rawValue =
      part
        .slice(index + 1)
        .trim();

    if (
      !isValidCookieName(
        rawName
      )
    ) {
      continue;
    }

    cookies[rawName] =
      decodeCookieValue(
        rawValue
      );
  }

  return cookies;
}

/**
 * Возвращает конкретную cookie.
 */
export function getCookie(
  request: Request,
  name: string
): string | null {
  const cookies =
    parseCookies(
      request.headers.get(
        "Cookie"
      )
    );

  return (
    cookies[name] ??
    null
  );
}

/**
 * Проверяет наличие cookie.
 */
export function hasCookie(
  request: Request,
  name: string
): boolean {
  return (
    getCookie(
      request,
      name
    ) !== null
  );
}

/**
 * Формирует Set-Cookie.
 */
export function serializeCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): string {
  if (
    !isValidCookieName(
      name
    )
  ) {
    throw new Error(
      "Invalid cookie name"
    );
  }

  if (
    !isValidCookieValue(
      value
    )
  ) {
    throw new Error(
      "Invalid cookie value"
    );
  }

  const parts: string[] = [];

  parts.push(
    `${name}=${encodeCookieValue(
      value
    )}`
  );

  if (
    options.maxAge !==
      undefined &&
    Number.isFinite(
      options.maxAge
    )
  ) {
    parts.push(
      `Max-Age=${Math.floor(
        options.maxAge
      )}`
    );
  }

  if (options.expires) {
    parts.push(
      `Expires=${options.expires.toUTCString()}`
    );
  }

  if (options.domain) {
    parts.push(
      `Domain=${options.domain}`
    );
  }

  if (options.path) {
    parts.push(
      `Path=${options.path}`
    );
  }

  if (options.secure) {
    parts.push(
      "Secure"
    );
  }

  if (options.httpOnly) {
    parts.push(
      "HttpOnly"
    );
  }

  if (options.sameSite) {
    parts.push(
      `SameSite=${options.sameSite}`
    );
  }

  if (options.priority) {
    parts.push(
      `Priority=${options.priority}`
    );
  }

  return parts.join("; ");
}

/**
 * Cookie для visitor ID.
 */
export function visitorCookie(
  visitorId: string,
  maxAge = 60 * 60 * 24 * 365
): string {
  return serializeCookie(
    "to_visitor",
    visitorId,
    {
      maxAge,
      path: "/",
      secure: true,
      httpOnly: true,
      sameSite: "Lax",
    }
  );
}

/**
 * Cookie для visitor session.
 */
export function visitorSessionCookie(
  sessionId: string,
  maxAge = 60 * 60 * 24 * 30
): string {
  return serializeCookie(
    "to_session",
    sessionId,
    {
      maxAge,
      path: "/",
      secure: true,
      httpOnly: true,
      sameSite: "Lax",
    }
  );
}

/**
 * Cookie для admin session.
 */
export function adminSessionCookie(
  sessionId: string,
  maxAge = 60 * 60 * 8
): string {
  return serializeCookie(
    "to_admin_session",
    sessionId,
    {
      maxAge,
      path: "/",
      secure: true,
      httpOnly: true,
      sameSite: "Strict",
    }
  );
}

/**
 * Cookie для CSRF token.
 *
 * Она не HttpOnly, потому что frontend
 * может читать её для отправки X-CSRF-Token.
 */
export function csrfCookie(
  token: string,
  maxAge = 60 * 60 * 2
): string {
  return serializeCookie(
    "to_csrf",
    token,
    {
      maxAge,
      path: "/",
      secure: true,
      httpOnly: false,
      sameSite: "Strict",
    }
  );
}

/**
 * Удаляет cookie.
 */
export function deleteCookie(
  name: string,
  options: Omit<
    CookieOptions,
    "maxAge" | "expires"
  > = {}
): string {
  return serializeCookie(
    name,
    "",
    {
      ...options,
      maxAge: 0,
      expires:
        new Date(0),
    }
  );
}

/**
 * Удаляет visitor cookie.
 */
export function deleteVisitorCookie(): string {
  return deleteCookie(
    "to_visitor",
    {
      path: "/",
      secure: true,
      httpOnly: true,
      sameSite: "Lax",
    }
  );
}

/**
 * Удаляет session cookie.
 */
export function deleteSessionCookie(): string {
  return deleteCookie(
    "to_session",
    {
      path: "/",
      secure: true,
      httpOnly: true,
      sameSite: "Lax",
    }
  );
}

/**
 * Удаляет admin session cookie.
 */
export function deleteAdminSessionCookie(): string {
  return deleteCookie(
    "to_admin_session",
    {
      path: "/",
      secure: true,
      httpOnly: true,
      sameSite: "Strict",
    }
  );
}

/**
 * Удаляет CSRF cookie.
 */
export function deleteCsrfCookie(): string {
  return deleteCookie(
    "to_csrf",
    {
      path: "/",
      secure: true,
      httpOnly: false,
      sameSite: "Strict",
    }
  );
}

/**
 * Добавляет Set-Cookie к Response.
 */
export function withCookie(
  response: Response,
  cookie: string
): Response {
  const headers =
    new Headers(
      response.headers
    );

  headers.append(
    "Set-Cookie",
    cookie
  );

  return new Response(
    response.body,
    {
      status:
        response.status,
      statusText:
        response.statusText,
      headers,
    }
  );
}

/**
 * Добавляет несколько cookies.
 */
export function withCookies(
  response: Response,
  cookies: string[]
): Response {
  const headers =
    new Headers(
      response.headers
    );

  for (const cookie of cookies) {
    headers.append(
      "Set-Cookie",
      cookie
    );
  }

  return new Response(
    response.body,
    {
      status:
        response.status,
      statusText:
        response.statusText,
      headers,
    }
  );
}

/**
 * Удаляет несколько cookies.
 */
export function clearAuthCookies(
  response: Response
): Response {
  return withCookies(
    response,
    [
      deleteAdminSessionCookie(),
      deleteSessionCookie(),
      deleteCsrfCookie(),
    ]
  );
}

/**
 * Возвращает cookie names.
 */
export function cookieNames(
  header: string | null
): string[] {
  return Object.keys(
    parseCookies(header)
  );
}

/**
 * Извлекает несколько cookies.
 */
export function pickCookies(
  header: string | null,
  names: readonly string[]
): Record<string, string> {
  const cookies =
    parseCookies(header);

  const result: Record<
    string,
    string
  > = {};

  for (const name of names) {
    if (
      Object.prototype.hasOwnProperty.call(
        cookies,
        name
      )
    ) {
      result[name] =
        cookies[name];
    }
  }

  return result;
}

/**
 * Проверяет наличие безопасных cookie attributes.
 */
export function hasSecureAttributes(
  cookie: string
): boolean {
  const normalized =
    cookie.toLocaleLowerCase();

  return (
    normalized.includes(
      "secure"
    ) &&
    normalized.includes(
      "httponly"
    ) &&
    normalized.includes(
      "samesite="
    )
  );
}

/**
 * Извлекает имя из Set-Cookie.
 */
export function getSetCookieName(
  cookie: string
): string | null {
  const index =
    cookie.indexOf("=");

  if (index <= 0) {
    return null;
  }

  const name =
    cookie
      .slice(0, index)
      .trim();

  return isValidCookieName(
    name
  )
    ? name
    : null;
}

/**
 * Проверяет cookie на потенциальную injection.
 */
export function detectCookieInjection(
  value: unknown
): boolean {
  if (
    typeof value !== "string"
  ) {
    return false;
  }

  return /[\r\n\0;]/.test(
    value
  );
}
