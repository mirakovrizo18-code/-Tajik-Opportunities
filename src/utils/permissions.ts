// ============================================================
// 🇹🇯 TAJIK OPPORTUNITIES
// PERMISSIONS UTILITY
// Version: 2026.09.09
//
// Единый слой работы с правами администратора.
//
// Поддерживает:
// • SUPERADMIN
// • ADMIN
// • MODERATOR
// • SUPPORT
// • ANALYST
// • CUSTOM
// • проверку одного права
// • проверку любого права
// • проверку всех прав
// • effective permissions
// • individual allow/deny
// • permission presets
// ============================================================

import {
  PERMISSIONS,
  ALL_PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission as constantHasPermission,
  hasAnyPermission as constantHasAnyPermission,
  hasAllPermissions as constantHasAllPermissions,
  isSuperAdmin as constantIsSuperAdmin,
  canAccessAdmin as constantCanAccessAdmin,
  normalizeRole,
  getRolePermissions,
  permissionExists,
  type Permission,
  type AdminRole,
} from "../constants/permissions";

// ============================================================
// TYPES
// ============================================================

export type PermissionValue =
  | "inherit"
  | "allow"
  | "deny";

export type PermissionOverrides =
  Record<
    string,
    PermissionValue
  >;

export interface PermissionContext {
  role:
    | AdminRole
    | string
    | null
    | undefined;

  permissions?:
    | readonly Permission[]
    | null;

  overrides?:
    | PermissionOverrides
    | null;
}

// ============================================================
// NORMALIZE PERMISSION
// ============================================================

export function normalizePermission(
  permission:
    | Permission
    | string
    | null
    | undefined,
): string {
  return String(
    permission ?? "",
  ).trim();
}

// ============================================================
// CHECK ONE PERMISSION
// ============================================================

export function hasPermission(
  role:
    | AdminRole
    | string
    | null
    | undefined,
  permission:
    | Permission
    | string
    | null
    | undefined,
): boolean {
  const normalized =
    normalizePermission(
      permission,
    );

  if (
    !normalized
  ) {
    return false;
  }

  return constantHasPermission(
    role,
    normalized,
  );
}

// ============================================================
// CHECK ANY PERMISSION
// ============================================================

export function hasAnyPermission(
  role:
    | AdminRole
    | string
    | null
    | undefined,
  permissions:
    | readonly Permission[]
    | readonly string[]
    | null
    | undefined,
): boolean {
  if (
    !permissions ||
    permissions.length === 0
  ) {
    return false;
  }

  return constantHasAnyPermission(
    role,
    permissions as Permission[],
  );
}

// ============================================================
// CHECK ALL PERMISSIONS
// ============================================================

export function hasAllPermissions(
  role:
    | AdminRole
    | string
    | null
    | undefined,
  permissions:
    | readonly Permission[]
    | readonly string[]
    | null
    | undefined,
): boolean {
  if (
    !permissions ||
    permissions.length === 0
  ) {
    return true;
  }

  return constantHasAllPermissions(
    role,
    permissions as Permission[],
  );
}

// ============================================================
// SUPER ADMIN
// ============================================================

export function isSuperAdmin(
  role:
    | AdminRole
    | string
    | null
    | undefined,
): boolean {
  return constantIsSuperAdmin(
    role,
  );
}

// ============================================================
// ADMIN ACCESS
// ============================================================

export function canAccessAdmin(
  role:
    | AdminRole
    | string
    | null
    | undefined,
): boolean {
  return constantCanAccessAdmin(
    role,
  );
}

// ============================================================
// GET ROLE PERMISSIONS
// ============================================================

export function getPermissionsForRole(
  role:
    | AdminRole
    | string
    | null
    | undefined,
): Permission[] {
  return getRolePermissions(
    role,
  );
}

// ============================================================
// EFFECTIVE PERMISSIONS
//
// Формула:
//
// role permissions
// + explicitly allowed
// - explicitly denied
//
// SUPERADMIN всегда получает полный доступ.
// ============================================================

export function getEffectivePermissions(
  context: PermissionContext,
): Permission[] {
  const role =
    normalizeRole(
      context.role,
    );

  if (
    role === "SUPERADMIN"
  ) {
    return [
      ...ALL_PERMISSIONS,
    ];
  }

  const base =
    new Set<Permission>(
      getRolePermissions(
        role,
      ),
    );

  const explicit =
    context.permissions ??
    [];

  for (
    const permission
    of explicit
  ) {
    base.add(
      permission,
    );
  }

  const overrides =
    context.overrides ??
    {};

  for (
    const [
      permission,
      value,
    ] of Object.entries(
      overrides,
    )
  ) {
    if (
      value === "allow"
    ) {
      base.add(
        permission,
      );
    }

    if (
      value === "deny"
    ) {
      base.delete(
        permission,
      );
    }
  }

  return Array.from(
    base,
  );
}

// ============================================================
// CHECK CONTEXT
// ============================================================

export function hasEffectivePermission(
  context: PermissionContext,
  permission:
    | Permission
    | string,
): boolean {
  const normalized =
    normalizePermission(
      permission,
    );

  if (
    !normalized
  ) {
    return false;
  }

  if (
    isSuperAdmin(
      context.role,
    )
  ) {
    return true;
  }

  const overrides =
    context.overrides;

  if (
    overrides &&
    overrides[normalized] ===
      "deny"
  ) {
    return false;
  }

  if (
    overrides &&
    overrides[normalized] ===
      "allow"
  ) {
    return true;
  }

  const permissions =
    getEffectivePermissions(
      context,
    );

  return permissions.includes(
    normalized,
  );
}

// ============================================================
// CHECK ANY EFFECTIVE
// ============================================================

export function hasAnyEffectivePermission(
  context: PermissionContext,
  permissions:
    | readonly Permission[]
    | readonly string[],
): boolean {
  return permissions.some(
    (
      permission,
    ) =>
      hasEffectivePermission(
        context,
        permission,
      ),
  );
}

// ============================================================
// CHECK ALL EFFECTIVE
// ============================================================

export function hasAllEffectivePermissions(
  context: PermissionContext,
  permissions:
    | readonly Permission[]
    | readonly string[],
): boolean {
  return permissions.every(
    (
      permission,
    ) =>
      hasEffectivePermission(
        context,
        permission,
      ),
  );
}

// ============================================================
// PERMISSION STATUS
// ============================================================

export function getPermissionStatus(
  context: PermissionContext,
  permission:
    | Permission
    | string,
): PermissionValue {
  const normalized =
    normalizePermission(
      permission,
    );

  const overrides =
    context.overrides;

  if (
    overrides &&
    overrides[normalized]
  ) {
    return overrides[
      normalized
    ];
  }

  return hasEffectivePermission(
    context,
    normalized,
  )
    ? "allow"
    : "inherit";
}

// ============================================================
// APPLY OVERRIDE
// ============================================================

export function applyPermissionOverride(
  overrides:
    | PermissionOverrides
    | null
    | undefined,
  permission:
    | Permission
    | string,
  value:
    | PermissionValue,
): PermissionOverrides {
  const result: PermissionOverrides =
    {
      ...(overrides ?? {}),
    };

  const normalized =
    normalizePermission(
      permission,
    );

  if (
    !normalized
  ) {
    return result;
  }

  if (
    value === "inherit"
  ) {
    delete result[
      normalized
    ];
  } else {
    result[
      normalized
    ] = value;
  }

  return result;
}

// ============================================================
// ALLOW
// ============================================================

export function allowPermission(
  overrides:
    | PermissionOverrides
    | null
    | undefined,
  permission:
    | Permission
    | string,
): PermissionOverrides {
  return applyPermissionOverride(
    overrides,
    permission,
    "allow",
  );
}

// ============================================================
// DENY
// ============================================================

export function denyPermission(
  overrides:
    | PermissionOverrides
    | null
    | undefined,
  permission:
    | Permission
    | string,
): PermissionOverrides {
  return applyPermissionOverride(
    overrides,
    permission,
    "deny",
  );
}

// ============================================================
// INHERIT
// ============================================================

export function inheritPermission(
  overrides:
    | PermissionOverrides
    | null
    | undefined,
  permission:
    | Permission
    | string,
): PermissionOverrides {
  return applyPermissionOverride(
    overrides,
    permission,
    "inherit",
  );
}

// ============================================================
// ROLE CHECK
// ============================================================

export function hasRole(
  role:
    | AdminRole
    | string
    | null
    | undefined,
  expected:
    | AdminRole
    | string,
): boolean {
  return (
    normalizeRole(
      role,
    ) ===
    normalizeRole(
      expected,
    )
  );
}

// ============================================================
// ANY ROLE
// ============================================================

export function hasAnyRole(
  role:
    | AdminRole
    | string
    | null
    | undefined,
  roles:
    | readonly (
        | AdminRole
        | string
      )[],
): boolean {
  const normalized =
    normalizeRole(
      role,
    );

  return roles.some(
    (item) =>
      normalizeRole(
        item,
      ) === normalized,
  );
}

// ============================================================
// ROLE HELPERS
// ============================================================

export function isAdminRole(
  role:
    | AdminRole
    | string
    | null
    | undefined,
): boolean {
  return hasAnyRole(
    role,
    [
      "SUPERADMIN",
      "ADMIN",
    ],
  );
}

export function isModeratorRole(
  role:
    | AdminRole
    | string
    | null
    | undefined,
): boolean {
  return hasAnyRole(
    role,
    [
      "MODERATOR",
      "ADMIN",
      "SUPERADMIN",
    ],
  );
}

export function isSupportRole(
  role:
    | AdminRole
    | string
    | null
    | undefined,
): boolean {
  return hasAnyRole(
    role,
    [
      "SUPPORT",
      "ADMIN",
      "SUPERADMIN",
    ],
  );
}

// ============================================================
// PERMISSION EXISTS
// ============================================================

export function isValidPermission(
  permission:
    | string
    | null
    | undefined,
): boolean {
  return permissionExists(
    permission,
  );
}

// ============================================================
// PERMISSION GROUPS
// ============================================================

export const PERMISSION_GROUPS = {
  SUPERADMIN:
    PERMISSIONS.SUPERADMIN,

  PUBLICATIONS:
    PERMISSIONS.PUBLICATIONS,

  COMMENTS:
    PERMISSIONS.COMMENTS,

  REACTIONS:
    PERMISSIONS.REACTIONS,

  REVIEWS:
    PERMISSIONS.REVIEWS,

  PARTICIPANTS:
    PERMISSIONS.PARTICIPANTS,

  CHAT:
    PERMISSIONS.CHAT,

  REPORTS:
    PERMISSIONS.REPORTS,

  NOTIFICATIONS:
    PERMISSIONS.NOTIFICATIONS,

  USERS:
    PERMISSIONS.USERS,

  MEDIA:
    PERMISSIONS.MEDIA,

  REPORTING:
    PERMISSIONS.REPORTING,

  PAYMENTS:
    PERMISSIONS.PAYMENTS,

  LEVELS:
    PERMISSIONS.LEVELS,

  CATEGORIES:
    PERMISSIONS.CATEGORIES,

  SEARCH:
    PERMISSIONS.SEARCH,

  AUDIT:
    PERMISSIONS.AUDIT,

  SYSTEM:
    PERMISSIONS.SYSTEM,
} as const;

// ============================================================
// PRESETS
// ============================================================

export const PERMISSION_PRESETS:
  Record<
    string,
    Permission[]
  > = {
    SUPERADMIN: [
      ...ROLE_PERMISSIONS.SUPERADMIN,
    ],

    ADMIN: [
      ...ROLE_PERMISSIONS.ADMIN,
    ],

    MODERATOR: [
      ...ROLE_PERMISSIONS.MODERATOR,
    ],

    SUPPORT: [
      ...ROLE_PERMISSIONS.SUPPORT,
    ],

    ANALYST: [
      ...ROLE_PERMISSIONS.ANALYST,
    ],

    CUSTOM: [],
  };

// ============================================================
// PRESET PERMISSIONS
// ============================================================

export function getPresetPermissions(
  preset:
    | string
    | null
    | undefined,
): Permission[] {
  const normalized =
    String(
      preset ?? "",
    )
      .trim()
      .toUpperCase();

  return [
    ...(
      PERMISSION_PRESETS[
        normalized
      ] ?? []
    ),
  ];
}

// ============================================================
// MERGE PERMISSIONS
// ============================================================

export function mergePermissions(
  ...lists:
    Array<
      | readonly Permission[]
      | null
      | undefined
    >
): Permission[] {
  const result =
    new Set<Permission>();

  for (
    const list
    of lists
  ) {
    if (!list) {
      continue;
    }

    for (
      const permission
      of list
    ) {
      if (
        permission
      ) {
        result.add(
          permission,
        );
      }
    }
  }

  return Array.from(
    result,
  );
}

// ============================================================
// REMOVE PERMISSIONS
// ============================================================

export function removePermissions(
  source:
    | readonly Permission[]
    | null
    | undefined,
  remove:
    | readonly Permission[]
    | null
    | undefined,
): Permission[] {
  if (!source) {
    return [];
  }

  if (!remove) {
    return [
      ...source,
    ];
  }

  const denied =
    new Set(
      remove,
    );

  return source.filter(
    (
      permission,
    ) =>
      !denied.has(
        permission,
      ),
  );
}

// ============================================================
// PERMISSION SUMMARY
// ============================================================

export interface PermissionSummary {
  role: AdminRole;
  total: number;
  granted: number;
  denied: number;
  inherited: number;
  permissions: Permission[];
}

export function getPermissionSummary(
  context: PermissionContext,
): PermissionSummary {
  const permissions =
    getEffectivePermissions(
      context,
    );

  const overrides =
    context.overrides ??
    {};

  let denied = 0;
  let inherited = 0;

  for (
    const permission
    of ALL_PERMISSIONS
  ) {
    const override =
      overrides[
        permission
      ];

    if (
      override === "deny"
    ) {
      denied++;
    }

    if (
      override ===
      "inherit"
    ) {
      inherited++;
    }
  }

  return {
    role:
      normalizeRole(
        context.role,
      ),

    total:
      ALL_PERMISSIONS.length,

    granted:
      permissions.length,

    denied,

    inherited,

    permissions,
  };
}

// ============================================================
// REQUIRE PERMISSION
//
// Удобно для middleware.
// Не бросает исключение — возвращает boolean.
// ============================================================

export function requirePermission(
  context: PermissionContext,
  permission:
    | Permission
    | string,
): boolean {
  return hasEffectivePermission(
    context,
    permission,
  );
}

// ============================================================
// REQUIRE ANY
// ============================================================

export function requireAnyPermission(
  context: PermissionContext,
  permissions:
    | readonly Permission[]
    | readonly string[],
): boolean {
  return hasAnyEffectivePermission(
    context,
    permissions,
  );
}

// ============================================================
// REQUIRE ALL
// ============================================================

export function requireAllPermissions(
  context: PermissionContext,
  permissions:
    | readonly Permission[]
    | readonly string[],
): boolean {
  return hasAllEffectivePermissions(
    context,
    permissions,
  );
}

// ============================================================
// EXPORTS
// ============================================================

export {
  PERMISSIONS,
  ALL_PERMISSIONS,
  ROLE_PERMISSIONS,
  normalizeRole,
  getRolePermissions,
  permissionExists,
};

export type {
  Permission,
  AdminRole,
};
