// ============================================================
// 🇹🇯 TAJIK OPPORTUNITIES
// LOGGER / AUDIT UTILITIES
// Version: 2026.09
// ============================================================

import type { Env } from "../index";
import { createRequestId, sha256 } from "./id";

export type LogLevel =
  | "debug"
  | "info"
  | "warn"
  | "error"
  | "security"
  | "audit";

export type LogSource =
  | "system"
  | "api"
  | "admin"
  | "user"
  | "database"
  | "security"
  | "worker";

export interface LogContext {
  requestId?: string;
  userId?: string | null;
  profileId?: string | null;
  visitorId?: string | null;
  sessionId?: string | null;
  adminId?: string | null;
  adminSessionId?: string | null;
  publicationId?: string | null;
  commentId?: string | null;
  conversationId?: string | null;
  messageId?: string | null;
  reportId?: string | null;
  ip?: string | null;
  country?: string | null;
  city?: string | null;
  userAgent?: string | null;
  method?: string | null;
  path?: string | null;
  status?: number | null;
  durationMs?: number | null;
  action?: string | null;
  resource?: string | null;
  resourceId?: string | null;
  metadata?: Record<string, unknown>;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  source: LogSource;
  message: string;
  requestId: string;
  context?: LogContext;
}

export interface AuditEntry {
  action: string;
  resourceType: string;
  resourceId?: string | null;
  actorType: "user" | "admin" | "system";
  actorId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  beforeData?: unknown;
  afterData?: unknown;
  metadata?: Record<string, unknown>;
}

const SENSITIVE_KEYS = new Set([
  "password",
  "password_hash",
  "passwordHash",
  "token",
  "access_token",
  "accessToken",
  "refresh_token",
  "refreshToken",
  "api_key",
  "apiKey",
  "secret",
  "csrf",
  "csrf_token",
  "csrfToken",
  "authorization",
  "cookie",
  "set-cookie",
]);

const MAX_LOG_STRING_LENGTH = 4000;
const MAX_METADATA_KEYS = 100;
const MAX_NESTING_DEPTH = 6;

/**
 * Безопасно обрезает строку для логов.
 */
function limitLogString(
  value: string
): string {
  if (
    value.length <=
    MAX_LOG_STRING_LENGTH
  ) {
    return value;
  }

  return (
    value.slice(
      0,
      MAX_LOG_STRING_LENGTH
    ) + "..."
  );
}

/**
 * Маскирует чувствительное значение.
 */
function maskSensitiveValue(
  value: unknown
): string {
  if (
    typeof value !== "string"
  ) {
    return "[REDACTED]";
  }

  if (value.length <= 4) {
    return "[REDACTED]";
  }

  return (
    value.slice(0, 2) +
    "****" +
    value.slice(-2)
  );
}

/**
 * Рекурсивно очищает metadata.
 */
export function sanitizeLogData(
  value: unknown,
  depth = 0
): unknown {
  if (depth > MAX_NESTING_DEPTH) {
    return "[MAX_DEPTH]";
  }

  if (
    value === null ||
    value === undefined
  ) {
    return value;
  }

  if (
    typeof value === "string"
  ) {
    return limitLogString(value);
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (
    typeof value === "bigint"
  ) {
    return value.toString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value
      .slice(0, 100)
      .map((item) =>
        sanitizeLogData(
          item,
          depth + 1
        )
      );
  }

  if (
    typeof value === "object"
  ) {
    const source =
      value as Record<
        string,
        unknown
      >;

    const result: Record<
      string,
      unknown
    > = {};

    let count = 0;

    for (
      const [
        key,
        item
      ] of Object.entries(source)
    ) {
      if (
        count >=
        MAX_METADATA_KEYS
      ) {
        result.__truncated__ =
          true;
        break;
      }

      if (
        SENSITIVE_KEYS.has(
          key
        ) ||
        SENSITIVE_KEYS.has(
          key.toLocaleLowerCase()
        )
      ) {
        result[key] =
          maskSensitiveValue(
            item
          );
      } else {
        result[key] =
          sanitizeLogData(
            item,
            depth + 1
          );
      }

      count++;
    }

    return result;
  }

  return String(value);
}

/**
 * Безопасно сериализует metadata.
 */
export function serializeLogData(
  value: unknown
): string {
  try {
    return JSON.stringify(
      sanitizeLogData(value)
    );
  } catch {
    return "{}";
  }
}

/**
 * Создает request ID.
 */
export function ensureRequestId(
  requestId?: string | null
): string {
  return (
    requestId?.trim() ||
    createRequestId()
  );
}

/**
 * Создает базовую запись лога.
 */
export function createLogEntry(
  level: LogLevel,
  source: LogSource,
  message: string,
  context?: LogContext
): LogEntry {
  return {
    timestamp:
      new Date().toISOString(),
    level,
    source,
    message:
      limitLogString(
        message
      ),
    requestId:
      ensureRequestId(
        context?.requestId
      ),
    context: context
      ? sanitizeLogData(
          context
        ) as LogContext
      : undefined,
  };
}

/**
 * Выводит лог в Cloudflare Worker logs.
 */
export function writeLog(
  entry: LogEntry
): void {
  const serialized =
    serializeLogData(
      entry
    );

  switch (entry.level) {
    case "debug":
      console.debug(
        serialized
      );
      break;

    case "info":
      console.info(
        serialized
      );
      break;

    case "warn":
      console.warn(
        serialized
      );
      break;

    case "error":
    case "security":
    case "audit":
      console.error(
        serialized
      );
      break;

    default:
      console.log(
        serialized
      );
  }
}

/**
 * Универсальный logger.
 */
export function log(
  level: LogLevel,
  source: LogSource,
  message: string,
  context?: LogContext
): LogEntry {
  const entry =
    createLogEntry(
      level,
      source,
      message,
      context
    );

  writeLog(entry);

  return entry;
}

/**
 * Debug.
 */
export function debug(
  message: string,
  context?: LogContext
): LogEntry {
  return log(
    "debug",
    "system",
    message,
    context
  );
}

/**
 * Info.
 */
export function info(
  message: string,
  context?: LogContext
): LogEntry {
  return log(
    "info",
    "system",
    message,
    context
  );
}

/**
 * Warning.
 */
export function warn(
  message: string,
  context?: LogContext
): LogEntry {
  return log(
    "warn",
    "system",
    message,
    context
  );
}

/**
 * Error.
 */
export function error(
  message: string,
  context?: LogContext
): LogEntry {
  return log(
    "error",
    "system",
    message,
    context
  );
}

/**
 * Security event.
 */
export function securityLog(
  message: string,
  context?: LogContext
): LogEntry {
  return log(
    "security",
    "security",
    message,
    context
  );
}

/**
 * Audit event.
 */
export function auditLog(
  message: string,
  context?: LogContext
): LogEntry {
  return log(
    "audit",
    "admin",
    message,
    context
  );
}

/**
 * Логирует HTTP request.
 */
export function logRequest(
  request: Request,
  context: LogContext = {}
): LogEntry {
  const url =
    new URL(request.url);

  return log(
    "info",
    "api",
    "HTTP request",
    {
      ...context,
      method:
        request.method,
      path:
        url.pathname,
      userAgent:
        request.headers.get(
          "User-Agent"
        ),
      requestId:
        ensureRequestId(
          context.requestId
        ),
    }
  );
}

/**
 * Логирует завершение HTTP request.
 */
export function logResponse(
  request: Request,
  response: Response,
  startedAt: number,
  context: LogContext = {}
): LogEntry {
  const url =
    new URL(request.url);

  const durationMs =
    Math.max(
      0,
      Date.now() -
        startedAt
    );

  const level: LogLevel =
    response.status >= 500
      ? "error"
      : response.status >= 400
        ? "warn"
        : "info";

  return log(
    level,
    "api",
    "HTTP response",
    {
      ...context,
      method:
        request.method,
      path:
        url.pathname,
      status:
        response.status,
      durationMs,
      userAgent:
        request.headers.get(
          "User-Agent"
        ),
      requestId:
        ensureRequestId(
          context.requestId
        ),
    }
  );
}

/**
 * Создает fingerprint IP для audit metadata.
 */
export async function hashIp(
  ip: string
): Promise<string> {
  return await sha256(
    `audit-ip:${ip}`
  );
}

/**
 * Создает fingerprint User-Agent.
 */
export async function hashUserAgent(
  userAgent: string
): Promise<string> {
  return await sha256(
    `audit-ua:${userAgent}`
  );
}

/**
 * Подготавливает audit metadata.
 */
export async function prepareAuditMetadata(
  context: LogContext = {}
): Promise<Record<string, unknown>> {
  const result: Record<
    string,
    unknown
  > = {
    requestId:
      context.requestId,
    method:
      context.method,
    path:
      context.path,
    resource:
      context.resource,
    resourceId:
      context.resourceId,
    action:
      context.action,
  };

  if (context.ip) {
    result.ipHash =
      await hashIp(
        context.ip
      );
  }

  if (context.userAgent) {
    result.userAgentHash =
      await hashUserAgent(
        context.userAgent
      );
  }

  if (context.metadata) {
    result.metadata =
      sanitizeLogData(
        context.metadata
      );
  }

  return result;
}

/**
 * Создает audit entry.
 */
export async function createAuditEntry(
  input: AuditEntry
): Promise<AuditEntry> {
  return {
    ...input,
    ipAddress:
      input.ipAddress
        ? await hashIp(
            input.ipAddress
          )
        : null,
    userAgent:
      input.userAgent
        ? await hashUserAgent(
            input.userAgent
          )
        : null,
    beforeData:
      sanitizeLogData(
        input.beforeData
      ),
    afterData:
      sanitizeLogData(
        input.afterData
      ),
    metadata:
      sanitizeLogData(
        input.metadata
      ) as Record<
        string,
        unknown
      >,
  };
}

/**
 * Сохраняет audit event в D1.
 */
export async function writeAuditLog(
  env: Env,
  input: AuditEntry
): Promise<void> {
  const audit =
    await createAuditEntry(
      input
    );

  const id =
    crypto.randomUUID();

  try {
    await env.DB
      .prepare(
        `
        INSERT INTO admin_activity_logs (
          id,
          admin_id,
          action,
          resource_type,
          resource_id,
          ip_address,
          user_agent,
          details_json,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `
      )
      .bind(
        id,
        audit.actorType ===
          "admin"
          ? audit.actorId ?? null
          : null,
        audit.action,
        audit.resourceType,
        audit.resourceId ??
          null,
        audit.ipAddress ??
          null,
        audit.userAgent ??
          null,
        JSON.stringify({
          actorType:
            audit.actorType,
          before:
            audit.beforeData,
          after:
            audit.afterData,
          metadata:
            audit.metadata,
        })
      )
      .run();
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "error",
        source: "database",
        message:
          "Failed to persist audit log",
        error:
          err instanceof Error
            ? err.message
            : String(err),
      })
    );
  }
}

/**
 * Удобный helper для admin action.
 */
export async function logAdminAction(
  env: Env,
  input: {
    adminId: string;
    action: string;
    resourceType: string;
    resourceId?: string | null;
    request?: Request;
    beforeData?: unknown;
    afterData?: unknown;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  const ip =
    input.request
      ?.headers.get(
        "CF-Connecting-IP"
      ) ??
    input.request
      ?.headers.get(
        "X-Forwarded-For"
      ) ??
    null;

  const userAgent =
    input.request
      ?.headers.get(
        "User-Agent"
      ) ??
    null;

  await writeAuditLog(
    env,
    {
      actorType:
        "admin",
      actorId:
        input.adminId,
      action:
        input.action,
      resourceType:
        input.resourceType,
      resourceId:
        input.resourceId ??
        null,
      ipAddress:
        ip,
      userAgent,
      beforeData:
        input.beforeData,
      afterData:
        input.afterData,
      metadata:
        input.metadata,
    }
  );

  auditLog(
    `Admin action: ${input.action}`,
    {
      adminId:
        input.adminId,
      resource:
        input.resourceType,
      resourceId:
        input.resourceId,
      action:
        input.action,
      ip,
      userAgent,
      metadata:
        input.metadata,
    }
  );
}

/**
 * Логирует security incident.
 */
export async function logSecurityIncident(
  env: Env,
  input: {
    action: string;
    resourceType?: string;
    resourceId?: string | null;
    request?: Request;
    actorId?: string | null;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  const ip =
    input.request
      ?.headers.get(
        "CF-Connecting-IP"
      ) ??
    input.request
      ?.headers.get(
        "X-Forwarded-For"
      ) ??
    null;

  const userAgent =
    input.request
      ?.headers.get(
        "User-Agent"
      ) ??
    null;

  await writeAuditLog(
    env,
    {
      actorType:
        input.actorId
          ? "admin"
          : "system",
      actorId:
        input.actorId ??
        null,
      action:
        input.action,
      resourceType:
        input.resourceType ??
        "security",
      resourceId:
        input.resourceId ??
        null,
      ipAddress:
        ip,
      userAgent,
      metadata:
        input.metadata,
    }
  );

  securityLog(
    `Security incident: ${input.action}`,
    {
      adminId:
        input.actorId,
      resource:
        input.resourceType,
      resourceId:
        input.resourceId,
      action:
        input.action,
      ip,
      userAgent,
      metadata:
        input.metadata,
    }
  );
}

/**
 * Логирует ошибку базы данных.
 */
export function logDatabaseError(
  message: string,
  errorValue: unknown,
  context?: LogContext
): LogEntry {
  return error(
    message,
    {
      ...context,
      metadata: {
        ...(context?.metadata ??
          {}),
        error:
          errorValue instanceof
          Error
            ? errorValue.message
            : String(
                errorValue
              ),
      },
    }
  );
}

/**
 * Логирует ошибку API.
 */
export function logApiError(
  message: string,
  errorValue: unknown,
  context?: LogContext
): LogEntry {
  return log(
    "error",
    "api",
    message,
    {
      ...context,
      metadata: {
        ...(context?.metadata ??
          {}),
        error:
          errorValue instanceof
          Error
            ? errorValue.message
            : String(
                errorValue
              ),
      },
    }
  );
}

/**
 * Логирует изменение публикации.
 */
export async function logPublicationChange(
  env: Env,
  input: {
    adminId: string;
    publicationId: string;
    action: string;
    before?: unknown;
    after?: unknown;
    request?: Request;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  await logAdminAction(
    env,
    {
      adminId:
        input.adminId,
      action:
        input.action,
      resourceType:
        "publication",
      resourceId:
        input.publicationId,
      request:
        input.request,
      beforeData:
        input.before,
      afterData:
        input.after,
      metadata:
        input.metadata,
    }
  );
}

/**
 * Логирует изменение комментария.
 */
export async function logCommentChange(
  env: Env,
  input: {
    adminId: string;
    commentId: string;
    action: string;
    before?: unknown;
    after?: unknown;
    request?: Request;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  await logAdminAction(
    env,
    {
      adminId:
        input.adminId,
      action:
        input.action,
      resourceType:
        "comment",
      resourceId:
        input.commentId,
      request:
        input.request,
      beforeData:
        input.before,
      afterData:
        input.after,
      metadata:
        input.metadata,
    }
  );
}

/**
 * Логирует изменение сообщения.
 */
export async function logMessageAction(
  env: Env,
  input: {
    adminId: string;
    messageId: string;
    action: string;
    before?: unknown;
    after?: unknown;
    request?: Request;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  await logAdminAction(
    env,
    {
      adminId:
        input.adminId,
      action:
        input.action,
      resourceType:
        "message",
      resourceId:
        input.messageId,
      request:
        input.request,
      beforeData:
        input.before,
      afterData:
        input.after,
      metadata:
        input.metadata,
    }
  );
}

/**
 * Логирует изменение пользователя/профиля.
 */
export async function logProfileAction(
  env: Env,
  input: {
    adminId: string;
    profileId: string;
    action: string;
    before?: unknown;
    after?: unknown;
    request?: Request;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  await logAdminAction(
    env,
    {
      adminId:
        input.adminId,
      action:
        input.action,
      resourceType:
        "profile",
      resourceId:
        input.profileId,
      request:
        input.request,
      beforeData:
        input.before,
      afterData:
        input.after,
      metadata:
        input.metadata,
    }
  );
}
