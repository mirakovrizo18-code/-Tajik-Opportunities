import {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  type Permission,
} from "../constants/permissions";
import type { AdminRole } from "../types";

export interface PermissionCheck {
  permission: Permission;
  allowed: boolean;
}

export interface PermissionResult {
  allowed: boolean;
  missing: Permission[];
  matched: Permission[];
}

export interface RolePermissionSummary {
  role: AdminRole;
  permissions: Permission[];
  count: number;
}

export interface PermissionGroup {
  key: string;
  label: string;
  permissions: Permission[];
}

const ALL_PERMISSIONS = Array.from(
  new Set(
    Object.values(
      PERMISSIONS,
    ) as Permission[],
  ),
);

export function getAllPermissions(): Permission[] {
  return [...ALL_PERMISSIONS];
}

export function getRolePermissions(
  role: AdminRole,
): Permission[] {
  return [
    ...(ROLE_PERMISSIONS[role] ??
      []),
  ] as Permission[];
}

export function roleHasPermission(
  role: AdminRole,
  permission: Permission,
): boolean {
  return getRolePermissions(
    role,
  ).includes(permission);
}

export function roleHasAnyPermission(
  role: AdminRole,
  permissions: readonly Permission[],
): boolean {
  return permissions.some(
    (permission) =>
      roleHasPermission(
        role,
        permission,
      ),
  );
}

export function roleHasAllPermissions(
  role: AdminRole,
  permissions: readonly Permission[],
): boolean {
  return permissions.every(
    (permission) =>
      roleHasPermission(
        role,
        permission,
      ),
  );
}

export function checkPermissions(
  granted: readonly Permission[],
  required: readonly Permission[],
): PermissionResult {
  const set =
    new Set(granted);

  const missing =
    required.filter(
      (permission) =>
        !set.has(permission),
    );

  const matched =
    required.filter(
      (permission) =>
        set.has(permission),
    );

  return {
    allowed:
      missing.length === 0,
    missing,
    matched,
  };
}

export function checkAnyPermissions(
  granted: readonly Permission[],
  required: readonly Permission[],
): PermissionResult {
  const set =
    new Set(granted);

  const matched =
    required.filter(
      (permission) =>
        set.has(permission),
    );

  const missing =
    required.filter(
      (permission) =>
        !set.has(permission),
    );

  return {
    allowed:
      matched.length > 0,
    missing,
    matched,
  };
}

export function assertPermission(
  granted: readonly Permission[],
  permission: Permission,
): boolean {
  return granted.includes(
    permission,
  );
}

export function assertAnyPermission(
  granted: readonly Permission[],
  permissions: readonly Permission[],
): boolean {
  return permissions.some(
    (permission) =>
      granted.includes(
        permission,
      ),
  );
}

export function assertAllPermissions(
  granted: readonly Permission[],
  permissions: readonly Permission[],
): boolean {
  return permissions.every(
    (permission) =>
      granted.includes(
        permission,
      ),
  );
}

export function createPermissionSet(
  permissions: readonly Permission[],
): Set<Permission> {
  return new Set(
    permissions,
  );
}

export function mergePermissions(
  ...permissionLists: Array<
    readonly Permission[]
  >
): Permission[] {
  return Array.from(
    new Set(
      permissionLists.flat(),
    ),
  );
}

export function removePermissions(
  source: readonly Permission[],
  ...remove: Array<
    readonly Permission[]
  >
): Permission[] {
  const blocked =
    new Set(
      remove.flat(),
    );

  return source.filter(
    (permission) =>
      !blocked.has(permission),
  );
}

export function differencePermissions(
  a: readonly Permission[],
  b: readonly Permission[],
): Permission[] {
  const bSet =
    new Set(b);

  return a.filter(
    (permission) =>
      !bSet.has(permission),
  );
}

export function intersectionPermissions(
  a: readonly Permission[],
  b: readonly Permission[],
): Permission[] {
  const bSet =
    new Set(b);

  return a.filter(
    (permission) =>
      bSet.has(permission),
  );
}

export function permissionsEqual(
  a: readonly Permission[],
  b: readonly Permission[],
): boolean {
  if (
    a.length !==
    b.length
  ) {
    return false;
  }

  const aSet =
    new Set(a);

  const bSet =
    new Set(b);

  if (
    aSet.size !==
    bSet.size
  ) {
    return false;
  }

  for (const permission of aSet) {
    if (
      !bSet.has(
        permission,
      )
    ) {
      return false;
    }
  }

  return true;
}

export function countPermissions(
  permissions: readonly Permission[],
): number {
  return new Set(
    permissions,
  ).size;
}

export function getPermissionChecks(
  granted: readonly Permission[],
  permissions: readonly Permission[] =
    ALL_PERMISSIONS,
): PermissionCheck[] {
  return permissions.map(
    (permission) => ({
      permission,
      allowed:
        granted.includes(
          permission,
        ),
    }),
  );
}

export function getDeniedPermissions(
  granted: readonly Permission[],
): Permission[] {
  return ALL_PERMISSIONS.filter(
    (permission) =>
      !granted.includes(
        permission,
      ),
  );
}

export function getGrantedPermissions(
  granted: readonly Permission[],
): Permission[] {
  return ALL_PERMISSIONS.filter(
    (permission) =>
      granted.includes(
        permission,
      ),
  );
}

export function getRoleSummary(
  role: AdminRole,
): RolePermissionSummary {
  const permissions =
    getRolePermissions(
      role,
    );

  return {
    role,
    permissions,
    count: permissions.length,
  };
}

export function getAllRoleSummaries(): RolePermissionSummary[] {
  const roles =
    Object.keys(
      ROLE_PERMISSIONS,
    ) as AdminRole[];

  return roles.map(
    (role) =>
      getRoleSummary(role),
  );
}

function permissionGroupKey(
  permission: Permission,
): string {
  const value =
    String(permission);

  const dot =
    value.indexOf(".");

  return dot > 0
    ? value.slice(0, dot)
    : "other";
}

export function groupPermissions(
  permissions: readonly Permission[] =
    ALL_PERMISSIONS,
): PermissionGroup[] {
  const groups =
    new Map<
      string,
      Permission[]
    >();

  for (const permission of permissions) {
    const key =
      permissionGroupKey(
        permission,
      );

    const existing =
      groups.get(key);

    if (existing) {
      existing.push(
        permission,
      );
    } else {
      groups.set(
        key,
        [permission],
      );
    }
  }

  return Array.from(
    groups.entries(),
  )
    .sort(([a], [b]) =>
      a.localeCompare(b),
    )
    .map(
      ([key, group]) => ({
        key,
        label: key,
        permissions:
          group.sort(),
      }),
    );
}

export function getPermissionGroup(
  permission: Permission,
): string {
  return permissionGroupKey(
    permission,
  );
}

export function permissionMatches(
  permission: Permission,
  pattern: string,
): boolean {
  if (
    permission === pattern
  ) {
    return true;
  }

  if (
    pattern.endsWith(
      ".*",
    )
  ) {
    const prefix =
      pattern.slice(
        0,
        -2,
      );

    return (
      permission === prefix ||
      permission.startsWith(
        `${prefix}.`,
      )
    );
  }

  return false;
}

export function hasPermissionPattern(
  granted: readonly Permission[],
  pattern: string,
): boolean {
  return granted.some(
    (permission) =>
      permissionMatches(
        permission,
        pattern,
      ),
  );
}

export function hasAnyPermissionPattern(
  granted: readonly Permission[],
  patterns: readonly string[],
): boolean {
  return patterns.some(
    (pattern) =>
      hasPermissionPattern(
        granted,
        pattern,
      ),
  );
}

export function hasAllPermissionPatterns(
  granted: readonly Permission[],
  patterns: readonly string[],
): boolean {
  return patterns.every(
    (pattern) =>
      hasPermissionPattern(
        granted,
        pattern,
      ),
  );
}

export function expandPermissionPatterns(
  patterns: readonly string[],
): Permission[] {
  const result: Permission[] =
    [];

  for (const pattern of patterns) {
    if (
      pattern.endsWith(
        ".*",
      )
    ) {
      const prefix =
        pattern.slice(
          0,
          -2,
        );

      for (const permission of ALL_PERMISSIONS) {
        if (
          permission ===
            prefix ||
          permission.startsWith(
            `${prefix}.`,
          )
        ) {
          result.push(
            permission,
          );
        }
      }
    } else if (
      ALL_PERMISSIONS.includes(
        pattern as Permission,
      )
    ) {
      result.push(
        pattern as Permission,
      );
    }
  }

  return Array.from(
    new Set(result),
  );
}

export function validatePermissions(
  permissions: readonly Permission[],
): Permission[] {
  return Array.from(
    new Set(
      permissions.filter(
        (permission) =>
          ALL_PERMISSIONS.includes(
            permission,
          ),
      ),
    ),
  );
}

export function getPermissionName(
  permission: Permission,
): string {
  return String(permission)
    .split(".")
    .map(
      (part) =>
        part
          .replace(
            /[_-]+/g,
            " ",
          )
          .replace(
            /\b\w/g,
            (letter) =>
              letter.toUpperCase(),
          ),
    )
    .join(" / ");
}

export function getPermissionAction(
  permission: Permission,
): string {
  const parts =
    String(permission).split(
      ".",
    );

  return (
    parts[parts.length - 1] ??
    permission
  );
}

export function getPermissionResource(
  permission: Permission,
): string {
  return (
    String(permission).split(
      ".",
    )[0] ??
    "system"
  );
}

export function getPermissionsForResource(
  resource: string,
): Permission[] {
  const prefix =
    `${resource}.`;

  return ALL_PERMISSIONS.filter(
    (permission) =>
      permission.startsWith(
        prefix,
      ),
  );
}

export function getPermissionResources(): string[] {
  return Array.from(
    new Set(
      ALL_PERMISSIONS.map(
        getPermissionResource,
      ),
    ),
  ).sort();
}

export function canManagePermission(
  role: AdminRole,
  permission: Permission,
): boolean {
  if (
    role === "superadmin"
  ) {
    return true;
  }

  if (
    permission ===
    PERMISSIONS.SUPERADMIN.FULL_CONTROL
  ) {
    return false;
  }

  return roleHasPermission(
    role,
    permission,
  );
}

export function canManageRole(
  actorRole: AdminRole,
  targetRole: AdminRole,
): boolean {
  if (
    actorRole === "superadmin"
  ) {
    return true;
  }

  if (
    actorRole === "admin"
  ) {
    return (
      targetRole !==
      "superadmin"
    );
  }

  return false;
}

export function isPrivilegedRole(
  role: AdminRole,
): boolean {
  return (
    role === "superadmin" ||
    role === "admin"
  );
}

export function isModerationRole(
  role: AdminRole,
): boolean {
  return (
    role === "superadmin" ||
    role === "admin" ||
    role === "moderator"
  );
}

export function isContentRole(
  role: AdminRole,
): boolean {
  return (
    role === "superadmin" ||
    role === "admin" ||
    role === "editor"
  );
}

export function isSupportRole(
  role: AdminRole,
): boolean {
  return (
    role === "superadmin" ||
    role === "admin" ||
    role === "support"
  );
}

export function isAnalyticsRole(
  role: AdminRole,
): boolean {
  return (
    role === "superadmin" ||
    role === "admin" ||
    role === "analyst"
  );
}

export function getHighestRole(
  roles: readonly AdminRole[],
): AdminRole | null {
  const order: AdminRole[] = [
    "superadmin",
    "admin",
    "moderator",
    "editor",
    "support",
    "analyst",
  ];

  for (const role of order) {
    if (
      roles.includes(role)
    ) {
      return role;
    }
  }

  return null;
}

/**
 * Проверка через существующие helpers
 * из constants/permissions.ts.
 */
export function checkNamedPermission(
  permissions: readonly Permission[],
  permission: Permission,
): boolean {
  return hasPermission(
    permissions,
    permission,
  );
}

export function checkNamedAnyPermission(
  permissions: readonly Permission[],
  required: readonly Permission[],
): boolean {
  return hasAnyPermission(
    permissions,
    required,
  );
}

export function checkNamedAllPermissions(
  permissions: readonly Permission[],
  required: readonly Permission[],
): boolean {
  return hasAllPermissions(
    permissions,
    required,
  );
}

/**
 * Централизованные разрешения для
 * контентных объектов.
 */
export const CONTENT_PERMISSIONS = {
  publications: {
    view:
      PERMISSIONS.PUBLICATIONS.VIEW,
    create:
      PERMISSIONS.PUBLICATIONS.CREATE,
    edit:
      PERMISSIONS.PUBLICATIONS.EDIT,
    delete:
      PERMISSIONS.PUBLICATIONS.DELETE,
    publish:
      PERMISSIONS.PUBLICATIONS.PUBLISH,
    moderate:
      PERMISSIONS.PUBLICATIONS.MODERATE,
    feature:
      PERMISSIONS.PUBLICATIONS.FEATURE,
    metrics:
      PERMISSIONS.PUBLICATIONS.METRICS,
  },

  comments: {
    view:
      PERMISSIONS.COMMENTS.VIEW,
    create:
      PERMISSIONS.COMMENTS.CREATE,
    edit:
      PERMISSIONS.COMMENTS.EDIT,
    delete:
      PERMISSIONS.COMMENTS.DELETE,
    moderate:
      PERMISSIONS.COMMENTS.MODERATE,
  },

  reactions: {
    view:
      PERMISSIONS.REACTIONS.VIEW,
    manage:
      PERMISSIONS.REACTIONS.MANAGE,
    moderate:
      PERMISSIONS.REACTIONS.MODERATE,
  },

  reviews: {
    view:
      PERMISSIONS.REVIEWS.VIEW,
    create:
      PERMISSIONS.REVIEWS.CREATE,
    edit:
      PERMISSIONS.REVIEWS.EDIT,
    delete:
      PERMISSIONS.REVIEWS.DELETE,
    moderate:
      PERMISSIONS.REVIEWS.MODERATE,
    manage:
      PERMISSIONS.REVIEWS.MANAGE,
    metrics:
      PERMISSIONS.REVIEWS.METRICS,
  },

  participants: {
    view:
      PERMISSIONS.PARTICIPANTS.VIEW,
    manage:
      PERMISSIONS.PARTICIPANTS.MANAGE,
    block:
      PERMISSIONS.PARTICIPANTS.BLOCK,
  },

  chat: {
    view:
      PERMISSIONS.CHAT.VIEW,
    send:
      PERMISSIONS.CHAT.SEND,
    moderate:
      PERMISSIONS.CHAT.MODERATE,
    manage:
      PERMISSIONS.CHAT.MANAGE,
  },

  reports: {
    view:
      PERMISSIONS.REPORTS.VIEW,
    manage:
      PERMISSIONS.REPORTS.MANAGE,
    resolve:
      PERMISSIONS.REPORTS.RESOLVE,
  },

  notifications: {
    view:
      PERMISSIONS.NOTIFICATIONS.VIEW,
    send:
      PERMISSIONS.NOTIFICATIONS.SEND,
    manage:
      PERMISSIONS.NOTIFICATIONS.MANAGE,
  },
} as const;
