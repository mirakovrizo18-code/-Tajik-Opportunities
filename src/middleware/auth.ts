import type { Env } from "../index";
import {
  getRequestContext,
  type RequestContext,
} from "../utils/response";
import {
  getBearerToken,
  getRequestAdminContext,
} from "../utils/security";
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isSuperAdmin,
} from "../utils/permissions";

export type AuthType =
  | "anonymous"
  | "participant"
  | "admin";

export type ActingMode = {
  enabled: boolean;
  participantId: string | null;
  adminId: string | null;
  startedAt: string | null;
};

export interface AuthenticatedParticipant {
  id: string;
  username: string | null;
  name: string | null;
  avatarUrl: string | null;
  level: number;
  status: string;
  isBlocked: boolean;
  deletedAt: string | null;
}

export interface AuthenticatedAdmin {
  id: string;
  username: string | null;
  name: string | null;
  role: string;
  status: string;
  isSuperAdmin: boolean;
}

export interface AuthContext {
  request: RequestContext;

  type: AuthType;

  participant: AuthenticatedParticipant | null;

  admin: AuthenticatedAdmin | null;

  acting: ActingMode;

  effectiveParticipantId: string | null;

  visitorId: string | null;

  sessionId: string | null;

  permissions: Set<string>;

  isAuthenticated: boolean;

  isAdmin: boolean;

  isParticipant: boolean;

  isAnonymous: boolean;
}

export interface RequireAuthOptions {
  allowAnonymous?: boolean;
  allowParticipant?: boolean;
  allowAdmin?: boolean;
  requireParticipant?: boolean;
  requireAdmin?: boolean;
  permissions?: string[];
  anyPermission?: string[];
  allPermissions?: string[];
  allowBlocked?: boolean;
  allowDeleted?: boolean;
}

export class AuthError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(
    message: string,
    status = 401,
    code = "AUTH_REQUIRED"
  ) {
    super(message);
    this.name = "AuthError";
    this.status = status;
    this.code = code;
  }
}

// ============================================================
// ENVIRONMENT HELPERS
// ============================================================

function hasDb(
  env: Env
): boolean {
  return Boolean(env?.DB);
}

function nowIso(): string {
  return new Date().toISOString();
}

function cleanString(
  value: unknown
): string | null {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const result =
    value.trim();

  return result
    ? result
    : null;
}

// ============================================================
// REQUEST IDENTITY
// ============================================================

function getHeader(
  request: Request,
  name: string
): string | null {
  return cleanString(
    request.headers.get(name)
  );
}

function getParticipantIdFromRequest(
  request: Request
): string | null {
  return (
    getHeader(
      request,
      "X-Participant-ID"
    ) ??
    getHeader(
      request,
      "X-User-ID"
    )
  );
}

function getVisitorIdFromRequest(
  request: Request
): string | null {
  return (
    getHeader(
      request,
      "X-Visitor-ID"
    ) ??
    getHeader(
      request,
      "X-TO-Visitor-ID"
    )
  );
}

function getSessionIdFromRequest(
  request: Request
): string | null {
  return (
    getHeader(
      request,
      "X-Session-ID"
    ) ??
    getHeader(
      request,
      "X-TO-Session-ID"
    )
  );
}

// ============================================================
// PARTICIPANT
// ============================================================

async function loadParticipant(
  env: Env,
  participantId: string | null
): Promise<AuthenticatedParticipant | null> {
  if (
    !participantId ||
    !hasDb(env)
  ) {
    return null;
  }

  try {
    const row =
      await env.DB.prepare(
        `
        SELECT
          id,
          username,
          name,
          avatar_url,
          COALESCE(level, 0) AS level,
          COALESCE(status, 'active') AS status,
          blocked_at,
          deleted_at
        FROM users_profiles
        WHERE id = ?
        LIMIT 1
        `
      )
        .bind(participantId)
        .first<{
          id: string;
          username: string | null;
          name: string | null;
          avatar_url: string | null;
          level: number | string | null;
          status: string | null;
          blocked_at: string | null;
          deleted_at: string | null;
        }>();

    if (!row) {
      return null;
    }

    const level =
      typeof row.level === "number"
        ? row.level
        : Number(row.level ?? 0);

    return {
      id: row.id,
      username: row.username,
      name: row.name,
      avatarUrl: row.avatar_url,
      level:
        Number.isFinite(level)
          ? level
          : 0,
      status:
        row.status ??
        "active",
      isBlocked:
        Boolean(row.blocked_at) ||
        row.status === "blocked",
      deletedAt:
        row.deleted_at,
    };
  } catch {
    return null;
  }
}

// ============================================================
// ADMIN
// ============================================================

async function loadAdmin(
  env: Env,
  request: Request
): Promise<AuthenticatedAdmin | null> {
  if (!hasDb(env)) {
    return null;
  }

  const token =
    getBearerToken(request);

  const headerAdminId =
    getHeader(
      request,
      "X-Admin-ID"
    );

  if (
    !token &&
    !headerAdminId
  ) {
    return null;
  }

  try {
    let row:
      | {
          id: string;
          username: string | null;
          name: string | null;
          role: string;
          status: string;
          is_super_admin: number | null;
        }
      | null = null;

    if (token) {
      row =
        await env.DB.prepare(
          `
          SELECT
            a.id,
            a.username,
            a.name,
            a.role,
            a.status,
            a.is_super_admin
          FROM admin_users a
          INNER JOIN admin_sessions s
            ON s.admin_id = a.id
          WHERE
            s.token_hash = ?
            AND s.revoked_at IS NULL
            AND a.status = 'active'
          LIMIT 1
          `
        )
          .bind(token)
          .first<{
            id: string;
            username: string | null;
            name: string | null;
            role: string;
            status: string;
            is_super_admin: number | null;
          }>();
    }

    if (
      !row &&
      headerAdminId
    ) {
      row =
        await env.DB.prepare(
          `
          SELECT
            id,
            username,
            name,
            role,
            status,
            is_super_admin
          FROM admin_users
          WHERE
            id = ?
            AND status = 'active'
          LIMIT 1
          `
        )
          .bind(headerAdminId)
          .first<{
            id: string;
            username: string | null;
            name: string | null;
            role: string;
            status: string;
            is_super_admin: number | null;
          }>();
    }

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      username: row.username,
      name: row.name,
      role: row.role,
      status: row.status,
      isSuperAdmin:
        Boolean(
          row.is_super_admin
        ),
    };
  } catch {
    return null;
  }
}

// ============================================================
// PERMISSIONS
// ============================================================

async function loadAdminPermissions(
  env: Env,
  admin: AuthenticatedAdmin | null
): Promise<Set<string>> {
  const result =
    new Set<string>();

  if (
    !admin ||
    !hasDb(env)
  ) {
    return result;
  }

  if (
    admin.isSuperAdmin
  ) {
    result.add("*");
    return result;
  }

  try {
    const rows =
      await env.DB.prepare(
        `
        SELECT permission_key
        FROM admin_permissions
        WHERE admin_id = ?

        UNION

        SELECT p.permission_key
        FROM admin_role_permissions rp
        INNER JOIN admin_permissions p
          ON p.id = rp.permission_id
        INNER JOIN admin_users a
          ON a.role = rp.role
        WHERE a.id = ?
        `
      )
        .bind(
          admin.id,
          admin.id
        )
        .all<{
          permission_key: string;
        }>();

    for (
      const row of rows.results ?? []
    ) {
      if (
        row.permission_key
      ) {
        result.add(
          row.permission_key
        );
      }
    }
  } catch {
    // Безопасное поведение:
    // если разрешения не прочитаны,
    // права не выдаются.
  }

  return result;
}

function permissionSetHas(
  permissions: Set<string>,
  permission: string
): boolean {
  return (
    permissions.has("*") ||
    permissions.has(permission)
  );
}

function checkPermissions(
  permissions: Set<string>,
  required?: string[],
  any?: string[],
  all?: string[]
): boolean {
  if (
    required?.length
  ) {
    for (
      const permission of required
    ) {
      if (
        !permissionSetHas(
          permissions,
          permission
        )
      ) {
        return false;
      }
    }
  }

  if (
    any?.length
  ) {
    const found =
      any.some(
        permission =>
          permissionSetHas(
            permissions,
            permission
          )
      );

    if (!found) {
      return false;
    }
  }

  if (
    all?.length
  ) {
    const found =
      all.every(
        permission =>
          permissionSetHas(
            permissions,
            permission
          )
      );

    if (!found) {
      return false;
    }
  }

  return true;
}

// ============================================================
// ACTING MODE
// ============================================================

function getActingParticipantId(
  request: Request
): string | null {
  return (
    getHeader(
      request,
      "X-Acting-Participant-ID"
    ) ??
    getHeader(
      request,
      "X-TO-Acting-Participant-ID"
    )
  );
}

function getActingEnabled(
  request: Request
): boolean {
  const value =
    getHeader(
      request,
      "X-Acting-Mode"
    );

  return (
    value === "1" ||
    value === "true" ||
    value === "enabled"
  );
}

async function resolveActingMode(
  env: Env,
  request: Request,
  admin: AuthenticatedAdmin | null
): Promise<ActingMode> {
  if (!admin) {
    return {
      enabled: false,
      participantId: null,
      adminId: null,
      startedAt: null,
    };
  }

  const participantId =
    getActingParticipantId(
      request
    );

  const enabled =
    getActingEnabled(
      request
    ) &&
    Boolean(
      participantId
    );

  if (!enabled) {
    return {
      enabled: false,
      participantId: null,
      adminId: null,
      startedAt: null,
    };
  }

  if (
    participantId &&
    hasDb(env)
  ) {
    const exists =
      await env.DB.prepare(
        `
        SELECT id
        FROM users_profiles
        WHERE id = ?
        LIMIT 1
        `
      )
        .bind(participantId)
        .first();

    if (!exists) {
      throw new AuthError(
        "Участник для режима Acting Mode не найден",
        404,
        "ACTING_PARTICIPANT_NOT_FOUND"
      );
    }
  }

  return {
    enabled: true,
    participantId,
    adminId: admin.id,
    startedAt:
      getHeader(
        request,
        "X-Acting-Started-At"
      ) ?? nowIso(),
  };
}

// ============================================================
// MAIN AUTH CONTEXT
// ============================================================

export async function getAuthContext(
  request: Request,
  env: Env
): Promise<AuthContext> {
  const requestContext =
    getRequestContext(
      request
    );

  const visitorId =
    getVisitorIdFromRequest(
      request
    );

  const sessionId =
    getSessionIdFromRequest(
      request
    );

  const participantId =
    getParticipantIdFromRequest(
      request
    );

  const admin =
    await loadAdmin(
      env,
      request
    );

  const permissions =
    await loadAdminPermissions(
      env,
      admin
    );

  const acting =
    await resolveActingMode(
      env,
      request,
      admin
    );

  const effectiveParticipantId =
    acting.enabled
      ? acting.participantId
      : participantId;

  const participant =
    await loadParticipant(
      env,
      effectiveParticipantId
    );

  let type: AuthType =
    "anonymous";

  if (admin) {
    type = "admin";
  } else if (participant) {
    type = "participant";
  }

  return {
    request: requestContext,

    type,

    participant,

    admin,

    acting,

    effectiveParticipantId,

    visitorId,

    sessionId,

    permissions,

    isAuthenticated:
      type !== "anonymous",

    isAdmin:
      type === "admin",

    isParticipant:
      type === "participant",

    isAnonymous:
      type === "anonymous",
  };
}

// ============================================================
// AUTH REQUIREMENTS
// ============================================================

export async function requireAuth(
  request: Request,
  env: Env,
  options: RequireAuthOptions = {}
): Promise<AuthContext> {
  const auth =
    await getAuthContext(
      request,
      env
    );

  const {
    allowAnonymous = false,
    allowParticipant = true,
    allowAdmin = true,
    requireParticipant = false,
    requireAdmin = false,
    permissions,
    anyPermission,
    allPermissions,
    allowBlocked = false,
    allowDeleted = false,
  } = options;

  if (
    auth.isAnonymous
  ) {
    if (
      allowAnonymous &&
      !requireParticipant &&
      !requireAdmin
    ) {
      return auth;
    }

    throw new AuthError(
      "Требуется авторизация",
      401,
      "AUTH_REQUIRED"
    );
  }

  if (
    auth.isAdmin &&
    !allowAdmin
  ) {
    throw new AuthError(
      "Доступ администратора запрещён для этого маршрута",
      403,
      "ADMIN_ACCESS_DENIED"
    );
  }

  if (
    auth.isParticipant &&
    !allowParticipant
  ) {
    throw new AuthError(
      "Доступ участника запрещён для этого маршрута",
      403,
      "PARTICIPANT_ACCESS_DENIED"
    );
  }

  if (
    requireAdmin &&
    !auth.isAdmin
  ) {
    throw new AuthError(
      "Требуются права администратора",
      403,
      "ADMIN_REQUIRED"
    );
  }

  if (
    requireParticipant &&
    !auth.participant
  ) {
    throw new AuthError(
      "Требуется профиль участника",
      403,
      "PARTICIPANT_REQUIRED"
    );
  }

  if (
    auth.participant
  ) {
    if (
      auth.participant.isBlocked &&
      !allowBlocked
    ) {
      throw new AuthError(
        "Участник заблокирован",
        403,
        "PARTICIPANT_BLOCKED"
      );
    }

    if (
      auth.participant.deletedAt &&
      !allowDeleted
    ) {
      throw new AuthError(
        "Профиль участника удалён",
        403,
        "PARTICIPANT_DELETED"
      );
    }
  }

  if (
    permissions?.length ||
    anyPermission?.length ||
    allPermissions?.length
  ) {
    if (
      !auth.isAdmin
    ) {
      throw new AuthError(
        "Недостаточно административных прав",
        403,
        "PERMISSION_REQUIRED"
      );
    }

    if (
      !checkPermissions(
        auth.permissions,
        permissions,
        anyPermission,
        allPermissions
      )
    ) {
      throw new AuthError(
        "Недостаточно прав для выполнения этого действия",
        403,
        "PERMISSION_DENIED"
      );
    }
  }

  return auth;
}

// ============================================================
// ADMIN REQUIREMENT
// ============================================================

export async function requireAdmin(
  request: Request,
  env: Env,
  permissions?: string[]
): Promise<AuthContext> {
  return requireAuth(
    request,
    env,
    {
      allowParticipant: false,
      allowAdmin: true,
      requireAdmin: true,
      permissions,
    }
  );
}

// ============================================================
// PARTICIPANT REQUIREMENT
// ============================================================

export async function requireParticipant(
  request: Request,
  env: Env
): Promise<AuthContext> {
  return requireAuth(
    request,
    env,
    {
      allowParticipant: true,
      allowAdmin: true,
      requireParticipant: true,
    }
  );
}

// ============================================================
// PERMISSION CHECKS
// ============================================================

export function can(
  auth: AuthContext,
  permission: string
): boolean {
  if (
    !auth.isAdmin
  ) {
    return false;
  }

  return permissionSetHas(
    auth.permissions,
    permission
  );
}

export function canAny(
  auth: AuthContext,
  permissions: string[]
): boolean {
  if (
    !auth.isAdmin
  ) {
    return false;
  }

  return permissions.some(
    permission =>
      permissionSetHas(
        auth.permissions,
        permission
      )
  );
}

export function canAll(
  auth: AuthContext,
  permissions: string[]
): boolean {
  if (
    !auth.isAdmin
  ) {
    return false;
  }

  return permissions.every(
    permission =>
      permissionSetHas(
        auth.permissions,
        permission
      )
  );
}

export function assertPermission(
  auth: AuthContext,
  permission: string
): void {
  if (
    !can(
      auth,
      permission
    )
  ) {
    throw new AuthError(
      `Недостаточно прав: ${permission}`,
      403,
      "PERMISSION_DENIED"
    );
  }
}

export function assertAnyPermission(
  auth: AuthContext,
  permissions: string[]
): void {
  if (
    !canAny(
      auth,
      permissions
    )
  ) {
    throw new AuthError(
      "Недостаточно прав",
      403,
      "PERMISSION_DENIED"
    );
  }
}

export function assertAllPermissions(
  auth: AuthContext,
  permissions: string[]
): void {
  if (
    !canAll(
      auth,
      permissions
    )
  ) {
    throw new AuthError(
      "Недостаточно прав",
      403,
      "PERMISSION_DENIED"
    );
  }
}

// ============================================================
// OWNER / ACTING CHECKS
// ============================================================

export function isParticipantOwner(
  auth: AuthContext,
  participantId: string
): boolean {
  return (
    auth.effectiveParticipantId ===
    participantId
  );
}

export function isActingAs(
  auth: AuthContext,
  participantId?: string
): boolean {
  if (
    !auth.acting.enabled
  ) {
    return false;
  }

  if (
    !participantId
  ) {
    return true;
  }

  return (
    auth.acting.participantId ===
    participantId
  );
}

export function getEffectiveParticipantId(
  auth: AuthContext
): string | null {
  return (
    auth.effectiveParticipantId
  );
}

// ============================================================
// ADMIN ACTING ACTION SAFETY
// ============================================================

export function assertActingPermission(
  auth: AuthContext
): void {
  if (
    !auth.acting.enabled
  ) {
    return;
  }

  if (
    !auth.isAdmin
  ) {
    throw new AuthError(
      "Acting Mode доступен только администратору",
      403,
      "ACTING_MODE_ADMIN_ONLY"
    );
  }

  const allowed =
    canAny(
      auth,
      [
        "participants.act_as",
        "participants.manage",
        "admin.acting_mode",
        "system.full_control",
      ]
    );

  if (!allowed) {
    throw new AuthError(
      "Недостаточно прав для Acting Mode",
      403,
      "ACTING_MODE_PERMISSION_DENIED"
    );
  }
}

// ============================================================
// BLOCK SCOPE
// ============================================================

export type BlockScope =
  | "full"
  | "publications"
  | "comments"
  | "chat"
  | "media"
  | "reactions"
  | "reviews"
  | "premium"
  | "vip"
  | "pro"
  | "top"
  | "custom";

export function isBlockedForScope(
  auth: AuthContext,
  scope: BlockScope
): boolean {
  const participant =
    auth.participant;

  if (!participant) {
    return false;
  }

  if (
    !participant.isBlocked
  ) {
    return false;
  }

  /*
   * Общая блокировка профиля.
   * Более детальные ограничения могут
   * храниться в отдельной таблице permissions/
   * participant_restrictions.
   */
  if (
    participant.status ===
    "blocked"
  ) {
    return true;
  }

  return scope === "full";
}

// ============================================================
// SESSION / IDENTITY
// ============================================================

export function getIdentity(
  auth: AuthContext
): {
  type: AuthType;
  participantId: string | null;
  adminId: string | null;
  visitorId: string | null;
  sessionId: string | null;
  acting: boolean;
} {
  return {
    type: auth.type,
    participantId:
      auth.effectiveParticipantId,
    adminId:
      auth.admin?.id ?? null,
    visitorId:
      auth.visitorId,
    sessionId:
      auth.sessionId,
    acting:
      auth.acting.enabled,
  };
}

// ============================================================
// AUDIT CONTEXT
// ============================================================

export function getAuditContext(
  auth: AuthContext
): Record<string, unknown> {
  return {
    actor_type:
      auth.isAdmin
        ? "admin"
        : auth.isParticipant
          ? "participant"
          : "anonymous",

    actor_admin_id:
      auth.admin?.id ?? null,

    actor_participant_id:
      auth.effectiveParticipantId,

    original_participant_id:
      auth.acting.enabled
        ? getParticipantIdFromRequest(
            new Request(
              "https://internal.local"
            )
          )
        : auth.participant?.id ?? null,

    acting_mode:
      auth.acting.enabled,

    acting_participant_id:
      auth.acting.participantId,

    visitor_id:
      auth.visitorId,

    session_id:
      auth.sessionId,

    request_id:
      auth.request?.requestId ?? null,
  };
}

// ============================================================
// ROUTE HELPERS
// ============================================================

export function publicAuth(
  request: Request,
  env: Env
): Promise<AuthContext> {
  return requireAuth(
    request,
    env,
    {
      allowAnonymous: true,
      allowParticipant: true,
      allowAdmin: true,
    }
  );
}

export function participantAuth(
  request: Request,
  env: Env
): Promise<AuthContext> {
  return requireParticipant(
    request,
    env
  );
}

export function adminAuth(
  request: Request,
  env: Env,
  permissions?: string[]
): Promise<AuthContext> {
  return requireAdmin(
    request,
    env,
    permissions
  );
}

// ============================================================
// EXPORTS
// ============================================================

export {
  getParticipantIdFromRequest,
  getVisitorIdFromRequest,
  getSessionIdFromRequest,
  getActingParticipantId,
};
