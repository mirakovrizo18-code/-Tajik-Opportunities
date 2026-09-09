/* ============================================================
   TAJIK OPPORTUNITIES
   PERMISSIONS UTILITY
   Production-safe permission system
   ============================================================ */

export type Permission = string;

export type AdminRole =
  | "SUPERADMIN"
  | "ADMIN"
  | "MODERATOR"
  | "EDITOR"
  | "SUPPORT"
  | "ANALYST"
  | "VIEWER"
  | string;

export interface PermissionContext {
  role?: AdminRole | null;
  permissions?: Iterable<Permission> | null;
  isSuperAdmin?: boolean;
  disabled?: boolean;
}

/* ------------------------------------------------------------
   PERMISSION GROUPS
   ------------------------------------------------------------ */

const createGroup = (
  prefix: string,
  names: string[],
): Record<string, Permission> => {
  const result: Record<string, Permission> = {};

  for (const name of names) {
    result[name] = `${prefix}.${name}`;
  }

  return result;
};

export const PERMISSIONS = {
  SUPERADMIN: {
    FULL_CONTROL: "SUPERADMIN.FULL_CONTROL",
  },

  SYSTEM: createGroup("SYSTEM", [
    "VIEW",
    "MANAGE",
    "SETTINGS",
    "FEATURE_FLAGS",
    "MAINTENANCE",
    "SECURITY",
  ]),

  PUBLICATIONS: createGroup("PUBLICATIONS", [
    "VIEW",
    "CREATE",
    "EDIT",
    "DELETE",
    "PUBLISH",
    "MODERATE",
    "FEATURE",
    "METRICS",
    "MANAGE",
  ]),

  COMMENTS: createGroup("COMMENTS", [
    "VIEW",
    "CREATE",
    "EDIT",
    "DELETE",
    "MODERATE",
    "MANAGE",
  ]),

  REACTIONS: createGroup("REACTIONS", [
    "VIEW",
    "CREATE",
    "DELETE",
    "MANAGE",
    "MODERATE",
  ]),

  REVIEWS: createGroup("REVIEWS", [
    "VIEW",
    "CREATE",
    "EDIT",
    "DELETE",
    "MODERATE",
    "MANAGE",
    "METRICS",
  ]),

  PARTICIPANTS: createGroup("PARTICIPANTS", [
    "VIEW",
    "CREATE",
    "EDIT",
    "DELETE",
    "MANAGE",
    "BLOCK",
    "UNBLOCK",
    "IMPERSONATE",
    "ACT_AS",
    "PRESENCE",
  ]),

  CHAT: createGroup("CHAT", [
    "VIEW",
    "SEND",
    "EDIT",
    "DELETE",
    "MODERATE",
    "MANAGE",
    "INITIATE",
    "ATTACHMENTS",
    "READ_PRIVATE",
  ]),

  REPORTS: createGroup("REPORTS", [
    "VIEW",
    "CREATE",
    "MANAGE",
    "RESOLVE",
    "DELETE",
  ]),

  NOTIFICATIONS: createGroup("NOTIFICATIONS", [
    "VIEW",
    "SEND",
    "MANAGE",
    "SETTINGS",
    "FORCE",
  ]),

  MEDIA: createGroup("MEDIA", [
    "VIEW",
    "UPLOAD",
    "EDIT",
    "DELETE",
    "MODERATE",
    "MANAGE",
  ]),

  ANALYTICS: createGroup("ANALYTICS", [
    "VIEW",
    "MANAGE",
    "EXPORT",
  ]),

  PAYMENTS: createGroup("PAYMENTS", [
    "VIEW",
    "MANAGE",
    "CONFIRM",
    "REFUND",
    "PRICES",
  ]),

  LEVELS: createGroup("LEVELS", [
    "VIEW",
    "MANAGE",
    "ASSIGN",
    "REMOVE",
  ]),

  PREMIUM: createGroup("PREMIUM", [
    "VIEW",
    "MANAGE",
    "GRANT",
    "REVOKE",
  ]),

  PRO: createGroup("PRO", [
    "VIEW",
    "MANAGE",
    "GRANT",
    "REVOKE",
  ]),

  TOP: createGroup("TOP", [
    "VIEW",
    "MANAGE",
    "GRANT",
    "REVOKE",
  ]),

  VIP: createGroup("VIP", [
    "VIEW",
    "MANAGE",
    "GRANT",
    "REVOKE",
  ]),

  SEARCH: createGroup("SEARCH", [
    "VIEW",
    "GLOBAL",
    "PARTICIPANTS",
    "PUBLICATIONS",
    "COMMENTS",
    "CHATS",
  ]),

  AUDIT: createGroup("AUDIT", [
    "VIEW",
    "EXPORT",
    "MANAGE",
  ]),
} as const;

/* ------------------------------------------------------------
   ALL PERMISSIONS
   ------------------------------------------------------------ */

function flattenPermissions(
  value: unknown,
): Permission[] {
  const result: Permission[] = [];

  if (!value || typeof value !== "object") {
    return result;
  }

  for (const item of Object.values(
    value as Record<string, unknown>,
  )) {
    if (typeof item === "string") {
      result.push(item);
      continue;
    }

    result.push(
      ...flattenPermissions(item),
    );
  }

  return result;
}

export const ALL_PERMISSIONS: Permission[] = [
  ...flattenPermissions(PERMISSIONS),
];

/* ------------------------------------------------------------
   ROLE PERMISSIONS
   ------------------------------------------------------------ */

export const ROLE_PERMISSIONS: Record<
  AdminRole,
  Permission[]
> = {
  SUPERADMIN: [
    PERMISSIONS.SUPERADMIN.FULL_CONTROL,
    ...ALL_PERMISSIONS,
  ],

  ADMIN: [
    PERMISSIONS.PUBLICATIONS.VIEW,
    PERMISSIONS.PUBLICATIONS.CREATE,
    PERMISSIONS.PUBLICATIONS.EDIT,
    PERMISSIONS.PUBLICATIONS.DELETE,
    PERMISSIONS.PUBLICATIONS.PUBLISH,
    PERMISSIONS.PUBLICATIONS.MODERATE,
    PERMISSIONS.PUBLICATIONS.FEATURE,
    PERMISSIONS.PUBLICATIONS.METRICS,

    PERMISSIONS.COMMENTS.VIEW,
    PERMISSIONS.COMMENTS.MODERATE,
    PERMISSIONS.COMMENTS.MANAGE,

    PERMISSIONS.REACTIONS.VIEW,
    PERMISSIONS.REACTIONS.MANAGE,
    PERMISSIONS.REACTIONS.MODERATE,

    PERMISSIONS.REVIEWS.VIEW,
    PERMISSIONS.REVIEWS.MODERATE,
    PERMISSIONS.REVIEWS.MANAGE,
    PERMISSIONS.REVIEWS.METRICS,

    PERMISSIONS.PARTICIPANTS.VIEW,
    PERMISSIONS.PARTICIPANTS.MANAGE,
    PERMISSIONS.PARTICIPANTS.BLOCK,
    PERMISSIONS.PARTICIPANTS.UNBLOCK,
    PERMISSIONS.PARTICIPANTS.PRESENCE,

    PERMISSIONS.CHAT.VIEW,
    PERMISSIONS.CHAT.SEND,
    PERMISSIONS.CHAT.MODERATE,
    PERMISSIONS.CHAT.MANAGE,
    PERMISSIONS.CHAT.INITIATE,

    PERMISSIONS.REPORTS.VIEW,
    PERMISSIONS.REPORTS.MANAGE,
    PERMISSIONS.REPORTS.RESOLVE,

    PERMISSIONS.NOTIFICATIONS.VIEW,
    PERMISSIONS.NOTIFICATIONS.SEND,
    PERMISSIONS.NOTIFICATIONS.MANAGE,

    PERMISSIONS.MEDIA.VIEW,
    PERMISSIONS.MEDIA.MODERATE,
    PERMISSIONS.MEDIA.MANAGE,

    PERMISSIONS.ANALYTICS.VIEW,
    PERMISSIONS.ANALYTICS.MANAGE,

    PERMISSIONS.PAYMENTS.VIEW,
    PERMISSIONS.PAYMENTS.MANAGE,
    PERMISSIONS.PAYMENTS.CONFIRM,

    PERMISSIONS.LEVELS.VIEW,
    PERMISSIONS.LEVELS.MANAGE,
    PERMISSIONS.LEVELS.ASSIGN,

    PERMISSIONS.PREMIUM.VIEW,
    PERMISSIONS.PREMIUM.MANAGE,
    PERMISSIONS.PREMIUM.GRANT,
    PERMISSIONS.PREMIUM.REVOKE,

    PERMISSIONS.PRO.VIEW,
    PERMISSIONS.PRO.MANAGE,
    PERMISSIONS.PRO.GRANT,
    PERMISSIONS.PRO.REVOKE,

    PERMISSIONS.TOP.VIEW,
    PERMISSIONS.TOP.MANAGE,
    PERMISSIONS.TOP.GRANT,
    PERMISSIONS.TOP.REVOKE,

    PERMISSIONS.VIP.VIEW,
    PERMISSIONS.VIP.MANAGE,
    PERMISSIONS.VIP.GRANT,
    PERMISSIONS.VIP.REVOKE,

    PERMISSIONS.SEARCH.VIEW,
    PERMISSIONS.SEARCH.GLOBAL,

    PERMISSIONS.AUDIT.VIEW,
  ],

  MODERATOR: [
    PERMISSIONS.PUBLICATIONS.VIEW,
    PERMISSIONS.PUBLICATIONS.MODERATE,

    PERMISSIONS.COMMENTS.VIEW,
    PERMISSIONS.COMMENTS.MODERATE,

    PERMISSIONS.REACTIONS.VIEW,
    PERMISSIONS.REACTIONS.MODERATE,

    PERMISSIONS.REVIEWS.VIEW,
    PERMISSIONS.REVIEWS.MODERATE,

    PERMISSIONS.PARTICIPANTS.VIEW,
    PERMISSIONS.PARTICIPANTS.BLOCK,
    PERMISSIONS.PARTICIPANTS.UNBLOCK,

    PERMISSIONS.CHAT.VIEW,
    PERMISSIONS.CHAT.MODERATE,

    PERMISSIONS.REPORTS.VIEW,
    PERMISSIONS.REPORTS.MANAGE,
    PERMISSIONS.REPORTS.RESOLVE,

    PERMISSIONS.MEDIA.VIEW,
    PERMISSIONS.MEDIA.MODERATE,

    PERMISSIONS.SEARCH.VIEW,
  ],

  EDITOR: [
    PERMISSIONS.PUBLICATIONS.VIEW,
    PERMISSIONS.PUBLICATIONS.CREATE,
    PERMISSIONS.PUBLICATIONS.EDIT,
    PERMISSIONS.PUBLICATIONS.PUBLISH,

    PERMISSIONS.COMMENTS.VIEW,
    PERMISSIONS.REVIEWS.VIEW,

    PERMISSIONS.MEDIA.VIEW,
    PERMISSIONS.MEDIA.UPLOAD,
    PERMISSIONS.MEDIA.EDIT,

    PERMISSIONS.SEARCH.VIEW,
  ],

  SUPPORT: [
    PERMISSIONS.PARTICIPANTS.VIEW,
    PERMISSIONS.PARTICIPANTS.PRESENCE,

    PERMISSIONS.CHAT.VIEW,
    PERMISSIONS.CHAT.SEND,
    PERMISSIONS.CHAT.INITIATE,

    PERMISSIONS.NOTIFICATIONS.VIEW,

    PERMISSIONS.REPORTS.VIEW,

    PERMISSIONS.SEARCH.VIEW,
    PERMISSIONS.SEARCH.PARTICIPANTS,
  ],

  ANALYST: [
    PERMISSIONS.PUBLICATIONS.VIEW,
    PERMISSIONS.PUBLICATIONS.METRICS,

    PERMISSIONS.REVIEWS.VIEW,
    PERMISSIONS.REVIEWS.METRICS,

    PERMISSIONS.ANALYTICS.VIEW,
    PERMISSIONS.ANALYTICS.EXPORT,

    PERMISSIONS.SEARCH.VIEW,

    PERMISSIONS.AUDIT.VIEW,
  ],

  VIEWER: [
    PERMISSIONS.PUBLICATIONS.VIEW,
    PERMISSIONS.COMMENTS.VIEW,
    PERMISSIONS.REACTIONS.VIEW,
    PERMISSIONS.REVIEWS.VIEW,
    PERMISSIONS.PARTICIPANTS.VIEW,
    PERMISSIONS.REPORTS.VIEW,
    PERMISSIONS.NOTIFICATIONS.VIEW,
    PERMISSIONS.ANALYTICS.VIEW,
    PERMISSIONS.SEARCH.VIEW,
  ],
};

/* ------------------------------------------------------------
   HELPERS
   ------------------------------------------------------------ */

function normalizePermissions(
  permissions: Iterable<Permission> | null | undefined,
): Set<string> {
  return new Set(
    permissions
      ? Array.from(permissions).map(String)
      : [],
  );
}

export function getRolePermissions(
  role: AdminRole | null | undefined,
): Permission[] {
  if (!role) return [];

  return [
    ...(ROLE_PERMISSIONS[String(role)] || []),
  ];
}

export function hasPermission(
  roleOrPermissions:
    | AdminRole
    | Iterable<Permission>
    | null
    | undefined,
  permission: Permission,
): boolean {
  if (!permission) return false;

  if (
    typeof roleOrPermissions === "string"
  ) {
    if (
      roleOrPermissions === "SUPERADMIN"
    ) {
      return true;
    }

    return getRolePermissions(
      roleOrPermissions,
    ).includes(permission);
  }

  const permissions = normalizePermissions(
    roleOrPermissions,
  );

  return (
    permissions.has(
      PERMISSIONS.SUPERADMIN.FULL_CONTROL,
    ) ||
    permissions.has(permission)
  );
}

export function hasAnyPermission(
  roleOrPermissions:
    | AdminRole
    | Iterable<Permission>
    | null
    | undefined,
  permissions: Iterable<Permission>,
): boolean {
  for (const permission of permissions) {
    if (
      hasPermission(
        roleOrPermissions,
        permission,
      )
    ) {
      return true;
    }
  }

  return false;
}

export function hasAllPermissions(
  roleOrPermissions:
    | AdminRole
    | Iterable<Permission>
    | null
    | undefined,
  permissions: Iterable<Permission>,
): boolean {
  for (const permission of permissions) {
    if (
      !hasPermission(
        roleOrPermissions,
        permission,
      )
    ) {
      return false;
    }
  }

  return true;
}

export function isSuperAdmin(
  roleOrPermissions:
    | AdminRole
    | Iterable<Permission>
    | null
    | undefined,
): boolean {
  if (
    roleOrPermissions === "SUPERADMIN"
  ) {
    return true;
  }

  return hasPermission(
    roleOrPermissions,
    PERMISSIONS.SUPERADMIN.FULL_CONTROL,
  );
}

export function canAccessAdmin(
  roleOrPermissions:
    | AdminRole
    | Iterable<Permission>
    | null
    | undefined,
): boolean {
  return (
    isSuperAdmin(roleOrPermissions) ||
    hasAnyPermission(
      roleOrPermissions,
      [
        PERMISSIONS.SYSTEM.VIEW,
        PERMISSIONS.PUBLICATIONS.VIEW,
        PERMISSIONS.PARTICIPANTS.VIEW,
        PERMISSIONS.ANALYTICS.VIEW,
        PERMISSIONS.SEARCH.VIEW,
      ],
    )
  );
}

export function permissionSetForRole(
  role: AdminRole,
): Set<Permission> {
  return new Set(
    getRolePermissions(role),
  );
}

export function requirePermission(
  roleOrPermissions:
    | AdminRole
    | Iterable<Permission>
    | null
    | undefined,
  permission: Permission,
): void {
  if (
    !hasPermission(
      roleOrPermissions,
      permission,
    )
  ) {
    throw new Error(
      `Permission denied: ${permission}`,
    );
  }
}

export function permissionMatches(
  granted: Permission,
  required: Permission,
): boolean {
  if (
    granted ===
    PERMISSIONS.SUPERADMIN.FULL_CONTROL
  ) {
    return true;
  }

  if (granted === required) {
    return true;
  }

  if (
    granted.endsWith(".*")
  ) {
    const prefix = granted.slice(0, -2);

    return (
      required === prefix ||
      required.startsWith(`${prefix}.`)
    );
  }

  return false;
}
