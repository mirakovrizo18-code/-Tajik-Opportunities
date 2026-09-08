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
     
