// ============================================================
// 🇹🇯 TAJIK OPPORTUNITIES
// PERMISSIONS SYSTEM
// Version: 2026.09.09
//
// Полноценная система разрешений:
// • Super Admin
// • Admin
// • Moderator
// • Support
// • Analyst
// • Custom roles
// • Individual permissions
// • Inherit / Allow / Deny
// ============================================================

// ============================================================
// PERMISSION TYPE
// ============================================================

export type Permission = string;

// ============================================================
// PERMISSIONS
// ============================================================

export const PERMISSIONS = {
  SUPERADMIN: {
    FULL_CONTROL:
      "superadmin.full_control",

    MANAGE_ADMINS:
      "superadmin.manage_admins",

    MANAGE_ROLES:
      "superadmin.manage_roles",

    MANAGE_PERMISSIONS:
      "superadmin.manage_permissions",

    MANAGE_SETTINGS:
      "superadmin.manage_settings",

    MANAGE_FEATURES:
      "superadmin.manage_features",

    MANAGE_SECURITY:
      "superadmin.manage_security",

    VIEW_AUDIT_LOGS:
      "superadmin.view_audit_logs",
  },

  PUBLICATIONS: {
    VIEW:
      "publications.view",

    CREATE:
      "publications.create",

    EDIT:
      "publications.edit",

    DELETE:
      "publications.delete",

    PUBLISH:
      "publications.publish",

    MODERATE:
      "publications.moderate",

    FEATURE:
      "publications.feature",

    METRICS:
      "publications.metrics",

    PIN:
      "publications.pin",

    UNPIN:
      "publications.unpin",

    MOVE:
      "publications.move",

    CHANGE_TYPE:
      "publications.change_type",

    CHANGE_AUTHOR:
      "publications.change_author",

    CHANGE_MEDIA:
      "publications.change_media",

    CHANGE_EXPIRATION:
      "publications.change_expiration",

    RESTORE:
      "publications.restore",

    VIEW_HISTORY:
      "publications.view_history",

    MANAGE_VIP:
      "publications.manage_vip",

    MANAGE_PREMIUM:
      "publications.manage_premium",

    MANAGE_SHARES:
      "publications.manage_shares",
  },

  COMMENTS: {
    VIEW:
      "comments.view",

    CREATE:
      "comments.create",

    EDIT:
      "comments.edit",

    DELETE:
      "comments.delete",

    MODERATE:
      "comments.moderate",

    PIN:
      "comments.pin",

    HIDE:
      "comments.hide",

    RESTORE:
      "comments.restore",

    REPLY:
      "comments.reply",

    REACT:
      "comments.react",

    VIEW_HISTORY:
      "comments.view_history",

    ACT_AS_USER:
      "comments.act_as_user",
  },

  REACTIONS: {
    VIEW:
      "reactions.view",

    CREATE:
      "reactions.create",

    MANAGE:
      "reactions.manage",

    MODERATE:
      "reactions.moderate",

    DELETE:
      "reactions.delete",

    ACT_AS_USER:
      "reactions.act_as_user",
  },

  REVIEWS: {
    VIEW:
      "reviews.view",

    CREATE:
      "reviews.create",

    EDIT:
      "reviews.edit",

    DELETE:
      "reviews.delete",

    MODERATE:
      "reviews.moderate",

    MANAGE:
      "reviews.manage",

    METRICS:
      "reviews.metrics",

    RESPOND:
      "reviews.respond",

    PIN:
      "reviews.pin",
  },

  PARTICIPANTS: {
    VIEW:
      "participants.view",

    MANAGE:
      "participants.manage",

    EDIT:
      "participants.edit",

    DELETE:
      "participants.delete",

    RESTORE:
      "participants.restore",

    BLOCK:
      "participants.block",

    UNBLOCK:
      "participants.unblock",

    SEARCH:
      "participants.search",

    VIEW_ACTIVITY:
      "participants.view_activity",

    VIEW_PRESENCE:
      "participants.view_presence",

    VIEW_TECHNICAL_DATA:
      "participants.view_technical_data",

    MANAGE_LEVEL:
      "participants.manage_level",

    MANAGE_STATUS:
      "participants.manage_status",

    MANAGE_TAGS:
      "participants.manage_tags",

    MANAGE_PREMIUM:
      "participants.manage_premium",

    MANAGE_PRO:
      "participants.manage_pro",

    MANAGE_TOP:
      "participants.manage_top",

    MANAGE_VIP:
      "participants.manage_vip",

    MANAGE_PERMISSIONS:
      "participants.manage_permissions",

    MANAGE_NOTIFICATIONS:
      "participants.manage_notifications",

    ACT_AS_USER:
      "participants.act_as_user",
  },

  CHAT: {
    VIEW:
      "chat.view",

    SEND:
      "chat.send",

    MODERATE:
      "chat.moderate",

    MANAGE:
      "chat.manage",

    DELETE:
      "chat.delete",

    EDIT:
      "chat.edit",

    PIN:
      "chat.pin",

    REACT:
      "chat.react",

    READ_PRIVATE:
      "chat.read_private",

    INITIATE:
      "chat.initiate",

    CLOSE:
      "chat.close",

    BLOCK:
      "chat.block",

    INTERNAL_NOTES:
      "chat.internal_notes",

    SEND_MEDIA:
      "chat.send_media",

    SEND_FILES:
      "chat.send_files",

    SEND_VOICE:
      "chat.send_voice",

    FORWARD:
      "chat.forward",

    SEARCH:
      "chat.search",
  },

  REPORTS: {
    VIEW:
      "reports.view",

    MANAGE:
      "reports.manage",

    RESOLVE:
      "reports.resolve",

    DELETE:
      "reports.delete",

    ASSIGN:
      "reports.assign",

    VIEW_HISTORY:
      "reports.view_history",
  },

  NOTIFICATIONS: {
    VIEW:
      "notifications.view",

    SEND:
      "notifications.send",

    MANAGE:
      "notifications.manage",

    DELETE:
      "notifications.delete",

    MARK_READ:
      "notifications.mark_read",

    MANAGE_GLOBAL:
      "notifications.manage_global",

    MANAGE_USER:
      "notifications.manage_user",

    MANAGE_CHANNELS:
      "notifications.manage_channels",

    MANAGE_FORCED:
      "notifications.manage_forced",
  },

  USERS: {
    VIEW:
      "users.view",

    SEARCH:
      "users.search",

    EDIT:
      "users.edit",

    DELETE:
      "users.delete",

    RESTORE:
      "users.restore",

    BLOCK:
      "users.block",

    UNBLOCK:
      "users.unblock",
  },

  MEDIA: {
    VIEW:
      "media.view",

    UPLOAD:
      "media.upload",

    EDIT:
      "media.edit",

    DELETE:
      "media.delete",

    MODERATE:
      "media.moderate",

    MANAGE:
      "media.manage",
  },

  REPORTING: {
    VIEW:
      "reporting.view",

    EXPORT:
      "reporting.export",

    ANALYTICS:
      "reporting.analytics",

    STATISTICS:
      "reporting.statistics",
  },

  PAYMENTS: {
    VIEW:
      "payments.view",

    MANAGE:
      "payments.manage",

    CONFIRM:
      "payments.confirm",

    REFUND:
      "payments.refund",

    CHANGE_PRICE:
      "payments.change_price",

    VIEW_HISTORY:
      "payments.view_history",
  },

  LEVELS: {
    VIEW:
      "levels.view",

    MANAGE:
      "levels.manage",

    ASSIGN:
      "levels.assign",

    REMOVE:
      "levels.remove",

    RESET:
      "levels.reset",
  },

  CATEGORIES: {
    VIEW:
      "categories.view",

    CREATE:
      "categories.create",

    EDIT:
      "categories.edit",

    DELETE:
      "categories.delete",

    MANAGE:
      "categories.manage",
  },

  SEARCH: {
    VIEW:
      "search.view",

    USERS:
      "search.users",

    PUBLICATIONS:
      "search.publications",

    COMMENTS:
      "search.comments",

    CHATS:
      "search.chats",

    GLOBAL:
      "search.global",
  },

  AUDIT: {
    VIEW:
      "audit.view",

    EXPORT:
      "audit.export",

    MANAGE:
      "audit.manage",
  },

  SYSTEM: {
    SETTINGS:
      "system.settings",

    FEATURES:
      "system.features",

    MAINTENANCE:
      "system.maintenance",

    SECURITY:
      "system.security",

    DATABASE:
      "system.database",

    CACHE:
      "system.cache",

    LOGS:
      "system.logs",
  },
} as const;

// ============================================================
// FLATTEN PERMISSIONS
// ============================================================

function flattenPermissions(
  value: unknown,
): string[] {
  const result: string[] = [];

  if (
    !value ||
    typeof value !== "object"
  ) {
    return result;
  }

  for (
    const item of Object.values(
      value as Record<
        string,
        unknown
      >,
    )
  ) {
    if (
      typeof item === "string"
    ) {
      result.push(item);
      continue;
    }

    if (
      item &&
      typeof item === "object"
    ) {
      result.push(
        ...flattenPermissions(
          item,
        ),
      );
    }
  }

  return result;
}

// ============================================================
// ALL PERMISSIONS
// ============================================================

export const ALL_PERMISSIONS:
  Permission[] =
  Array.from(
    new Set(
      flattenPermissions(
        PERMISSIONS,
      ),
    ),
  );

// ============================================================
// ROLE NAMES
// ============================================================

export type AdminRole =
  | "SUPERADMIN"
  | "ADMIN"
  | "MODERATOR"
  | "SUPPORT"
  | "ANALYST"
  | "CUSTOM";

// ============================================================
// ROLE PERMISSIONS
// ============================================================

export const ROLE_PERMISSIONS:
  Record<
    AdminRole,
    Permission[]
  > = {
    SUPERADMIN: [
      ...ALL_PERMISSIONS,
    ],

    ADMIN: [
      ...ALL_PERMISSIONS.filter(
        (permission) =>
          !permission.startsWith(
            "superadmin.",
          ),
      ),
    ],

    MODERATOR: [
      PERMISSIONS.PUBLICATIONS.VIEW,
      PERMISSIONS.PUBLICATIONS.EDIT,
      PERMISSIONS.PUBLICATIONS.DELETE,
      PERMISSIONS.PUBLICATIONS.MODERATE,
      PERMISSIONS.PUBLICATIONS.FEATURE,
      PERMISSIONS.PUBLICATIONS.PIN,
      PERMISSIONS.PUBLICATIONS.UNPIN,
      PERMISSIONS.PUBLICATIONS.METRICS,

      PERMISSIONS.COMMENTS.VIEW,
      PERMISSIONS.COMMENTS.EDIT,
      PERMISSIONS.COMMENTS.DELETE,
      PERMISSIONS.COMMENTS.MODERATE,
      PERMISSIONS.COMMENTS.PIN,
      PERMISSIONS.COMMENTS.HIDE,
      PERMISSIONS.COMMENTS.RESTORE,
      PERMISSIONS.COMMENTS.REACT,

      PERMISSIONS.REACTIONS.VIEW,
      PERMISSIONS.REACTIONS.MANAGE,
      PERMISSIONS.REACTIONS.MODERATE,
      PERMISSIONS.REACTIONS.DELETE,

      PERMISSIONS.REVIEWS.VIEW,
      PERMISSIONS.REVIEWS.MODERATE,
      PERMISSIONS.REVIEWS.DELETE,

      PERMISSIONS.REPORTS.VIEW,
      PERMISSIONS.REPORTS.MANAGE,
      PERMISSIONS.REPORTS.RESOLVE,

      PERMISSIONS.MEDIA.VIEW,
      PERMISSIONS.MEDIA.MODERATE,
      PERMISSIONS.MEDIA.DELETE,

      PERMISSIONS.CHAT.VIEW,
      PERMISSIONS.CHAT.MODERATE,
    ],

    SUPPORT: [
      PERMISSIONS.PARTICIPANTS.VIEW,
      PERMISSIONS.PARTICIPANTS.SEARCH,
      PERMISSIONS.PARTICIPANTS.MANAGE,

      PERMISSIONS.CHAT.VIEW,
      PERMISSIONS.CHAT.SEND,
      PERMISSIONS.CHAT.MANAGE,
      PERMISSIONS.CHAT.INITIATE,
      PERMISSIONS.CHAT.READ_PRIVATE,
      PERMISSIONS.CHAT.INTERNAL_NOTES,

      PERMISSIONS.NOTIFICATIONS.VIEW,
      PERMISSIONS.NOTIFICATIONS.SEND,

      PERMISSIONS.REPORTS.VIEW,
      PERMISSIONS.REPORTS.MANAGE,

      PERMISSIONS.PUBLICATIONS.VIEW,
      PERMISSIONS.COMMENTS.VIEW,
      PERMISSIONS.REVIEWS.VIEW,
    ],

    ANALYST: [
      PERMISSIONS.PUBLICATIONS.VIEW,
      PERMISSIONS.PUBLICATIONS.METRICS,

      PERMISSIONS.PARTICIPANTS.VIEW,
      PERMISSIONS.PARTICIPANTS.SEARCH,
      PERMISSIONS.PARTICIPANTS.VIEW_ACTIVITY,
      PERMISSIONS.PARTICIPANTS.VIEW_PRESENCE,

      PERMISSIONS.REACTIONS.VIEW,
      PERMISSIONS.REVIEWS.VIEW,

      PERMISSIONS.REPORTS.VIEW,

      PERMISSIONS.REPORTING.VIEW,
      PERMISSIONS.REPORTING.ANALYTICS,
      PERMISSIONS.REPORTING.STATISTICS,
      PERMISSIONS.REPORTING.EXPORT,

      PERMISSIONS.SEARCH.VIEW,
      PERMISSIONS.SEARCH.USERS,
      PERMISSIONS.SEARCH.PUBLICATIONS,
      PERMISSIONS.SEARCH.COMMENTS,

      PERMISSIONS.AUDIT.VIEW,
    ],

    CUSTOM: [],
  };

// ============================================================
// ROLE NORMALIZATION
// ============================================================

export function normalizeRole(
  role:
    | AdminRole
    | string
    | null
    | undefined,
): AdminRole {
  const normalized =
    String(
      role ?? "",
    )
      .trim()
      .toUpperCase();

  if (
    normalized ===
    "SUPERADMIN"
  ) {
    return "SUPERADMIN";
  }

  if (
    normalized === "ADMIN"
  ) {
    return "ADMIN";
  }

  if (
    normalized ===
    "MODERATOR"
  ) {
    return "MODERATOR";
  }

  if (
    normalized === "SUPPORT"
  ) {
    return "SUPPORT";
  }

  if (
    normalized === "ANALYST"
  ) {
    return "ANALYST";
  }

  return "CUSTOM";
}

// ============================================================
// ROLE CHECK
// ============================================================

export function isSuperAdmin(
  role:
    | AdminRole
    | string
    | null
    | undefined,
): boolean {
  return (
    normalizeRole(
      role,
    ) === "SUPERADMIN"
  );
}

// ============================================================
// GET ROLE PERMISSIONS
// ============================================================

export function getRolePermissions(
  role:
    | AdminRole
    | string
    | null
    | undefined,
): Permission[] {
  const normalized =
    normalizeRole(
      role,
    );

  return [
    ...(
      ROLE_PERMISSIONS[
        normalized
      ] ?? []
    ),
  ];
}

// ============================================================
// HAS PERMISSION
// ============================================================

export function hasPermission(
  role:
    | AdminRole
    | string
    | null
    | undefined,
  permission:
    | Permission
    | null
    | undefined,
): boolean {
  if (
    !permission
  ) {
    return false;
  }

  if (
    isSuperAdmin(
      role,
    )
  ) {
    return true;
  }

  return getRolePermissions(
    role,
  ).includes(
    permission,
  );
}

// ============================================================
// HAS ANY
// ============================================================

export function hasAnyPermission(
  role:
    | AdminRole
    | string
    | null
    | undefined,
  permissions:
    | readonly Permission[]
    | null
    | undefined,
): boolean {
  if (
    !permissions ||
    permissions.length === 0
  ) {
    return false;
  }

  if (
    isSuperAdmin(
      role,
    )
  ) {
    return true;
  }

  return permissions.some(
    (permission) =>
      hasPermission(
        role,
        permission,
      ),
  );
}

// ============================================================
// HAS ALL
// ============================================================

export function hasAllPermissions(
  role:
    | AdminRole
    | string
    | null
    | undefined,
  permissions:
    | readonly Permission[]
    | null
    | undefined,
): boolean {
  if (
    !permissions ||
    permissions.length === 0
  ) {
    return true;
  }

  if (
    isSuperAdmin(
      role,
    )
  ) {
    return true;
  }

  return permissions.every(
    (permission) =>
      hasPermission(
        role,
        permission,
      ),
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
  const normalized =
    normalizeRole(
      role,
    );

  return (
    normalized ===
      "SUPERADMIN" ||
    normalized ===
      "ADMIN" ||
    normalized ===
      "MODERATOR" ||
    normalized ===
      "SUPPORT" ||
    normalized ===
      "ANALYST"
  );
}

// ============================================================
// PERMISSION EXISTS
// ============================================================

export function permissionExists(
  permission:
    | string
    | null
    | undefined,
): boolean {
  if (
    !permission
  ) {
    return false;
  }

  return ALL_PERMISSIONS.includes(
    permission,
  );
}

// ============================================================
// EXPORT DEFAULT
// ============================================================

export default {
  PERMISSIONS,
  ALL_PERMISSIONS,
  ROLE_PERMISSIONS,

  normalizeRole,

  isSuperAdmin,

  getRolePermissions,

  hasPermission,
  hasAnyPermission,
  hasAllPermissions,

  canAccessAdmin,

  permissionExists,
};
