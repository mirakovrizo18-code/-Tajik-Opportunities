// ============================================================
// 🇹🇯 TAJIK OPPORTUNITIES
// PERMISSIONS SYSTEM
// Version: 2026.09.09 POWER ADMIN
// ============================================================

export type PermissionValue = boolean;

export interface PermissionDefinition {
  key: string;
  label: string;
  description: string;
  category: string;
  dangerous?: boolean;
}

export const PERMISSIONS = {

  // ==========================================================
  // SYSTEM
  // ==========================================================

  SYSTEM_FULL_CONTROL: "system.full_control",
  SYSTEM_DATABASE_MANAGE: "system.database.manage",
  SYSTEM_RESTORE: "system.restore",
  SYSTEM_SETTINGS: "system.settings",
  SYSTEM_FEATURE_FLAGS: "system.feature_flags",
  SYSTEM_MAINTENANCE: "system.maintenance",
  SYSTEM_SECURITY: "system.security",

  // ==========================================================
  // ADMIN
  // ==========================================================

  ADMINS_VIEW: "admins.view",
  ADMINS_CREATE: "admins.create",
  ADMINS_EDIT: "admins.edit",
  ADMINS_DELETE: "admins.delete",
  ADMINS_PERMISSIONS: "admins.permissions",
  ADMINS_SESSIONS: "admins.sessions",

  // ==========================================================
  // PARTICIPANTS
  // ==========================================================

  PARTICIPANTS_VIEW: "participants.view",
  PARTICIPANTS_SEARCH: "participants.search",
  PARTICIPANTS_CREATE: "participants.create",
  PARTICIPANTS_EDIT: "participants.edit",
  PARTICIPANTS_DELETE: "participants.delete",
  PARTICIPANTS_RESTORE: "participants.restore",
  PARTICIPANTS_BLOCK: "participants.block",
  PARTICIPANTS_UNBLOCK: "participants.unblock",
  PARTICIPANTS_ACTIVITY: "participants.activity",
  PARTICIPANTS_EXPORT: "participants.export",
  PARTICIPANTS_IMPERSONATE: "participants.impersonate",

  // ==========================================================
  // PROFILES
  // ==========================================================

  PROFILES_VIEW: "profiles.view",
  PROFILES_EDIT: "profiles.edit",
  PROFILES_AVATAR: "profiles.avatar",
  PROFILES_USERNAME: "profiles.username",
  PROFILES_NAME: "profiles.name",
  PROFILES_STATUS: "profiles.status",
  PROFILES_LEVEL: "profiles.level",
  PROFILES_BADGES: "profiles.badges",
  PROFILES_TAGS: "profiles.tags",

  // ==========================================================
  // PUBLICATIONS
  // ==========================================================

  PUBLICATIONS_VIEW: "publications.view",
  PUBLICATIONS_SEARCH: "publications.search",
  PUBLICATIONS_CREATE: "publications.create",
  PUBLICATIONS_EDIT: "publications.edit",
  PUBLICATIONS_DELETE: "publications.delete",
  PUBLICATIONS_RESTORE: "publications.restore",
  PUBLICATIONS_PUBLISH: "publications.publish",
  PUBLICATIONS_MODERATE: "publications.moderate",
  PUBLICATIONS_HIDE: "publications.hide",
  PUBLICATIONS_PIN: "publications.pin",
  PUBLICATIONS_FEATURE: "publications.feature",
  PUBLICATIONS_REORDER: "publications.reorder",
  PUBLICATIONS_CHANGE_AUTHOR: "publications.change_author",
  PUBLICATIONS_CHANGE_TYPE: "publications.change_type",
  PUBLICATIONS_CHANGE_PRICE: "publications.change_price",
  PUBLICATIONS_CHANGE_EXPIRATION: "publications.change_expiration",
  PUBLICATIONS_CHANGE_METRICS: "publications.change_metrics",
  PUBLICATIONS_EDIT_MEDIA: "publications.edit_media",
  PUBLICATIONS_EXPORT: "publications.export",

  // ==========================================================
  // COMMENTS
  // ==========================================================

  COMMENTS_VIEW: "comments.view",
  COMMENTS_SEARCH: "comments.search",
  COMMENTS_CREATE: "comments.create",
  COMMENTS_EDIT: "comments.edit",
  COMMENTS_DELETE: "comments.delete",
  COMMENTS_RESTORE: "comments.restore",
  COMMENTS_MODERATE: "comments.moderate",
  COMMENTS_PIN: "comments.pin",
  COMMENTS_HIDE: "comments.hide",
  COMMENTS_CHANGE_AUTHOR: "comments.change_author",
  COMMENTS_ACT_AS_PARTICIPANT: "comments.act_as_participant",

  // ==========================================================
  // REVIEWS
  // ==========================================================

  REVIEWS_VIEW: "reviews.view",
  REVIEWS_SEARCH: "reviews.search",
  REVIEWS_CREATE: "reviews.create",
  REVIEWS_EDIT: "reviews.edit",
  REVIEWS_DELETE: "reviews.delete",
  REVIEWS_RESTORE: "reviews.restore",
  REVIEWS_MODERATE: "reviews.moderate",
  REVIEWS_PIN: "reviews.pin",
  REVIEWS_HIDE: "reviews.hide",
  REVIEWS_REPLY: "reviews.reply",
  REVIEWS_REACTIONS: "reviews.reactions",
  REVIEWS_RATING: "reviews.rating",
  REVIEWS_REPORTS: "reviews.reports",
  REVIEWS_METRICS: "reviews.metrics",
  REVIEWS_CHANGE_AUTHOR: "reviews.change_author",

  // ==========================================================
  // REACTIONS
  // ==========================================================

  REACTIONS_VIEW: "reactions.view",
  REACTIONS_CREATE: "reactions.create",
  REACTIONS_DELETE: "reactions.delete",
  REACTIONS_MODERATE: "reactions.moderate",
  REACTIONS_CHANGE_COUNT: "reactions.change_count",
  REACTIONS_ACT_AS_PARTICIPANT: "reactions.act_as_participant",

  // ==========================================================
  // SHARES
  // ==========================================================

  SHARES_VIEW: "shares.view",
  SHARES_CREATE: "shares.create",
  SHARES_DELETE: "shares.delete",
  SHARES_METRICS: "shares.metrics",
  SHARES_CHANGE_COUNT: "shares.change_count",

  // ==========================================================
  // BOOKMARKS
  // ==========================================================

  BOOKMARKS_VIEW: "bookmarks.view",
  BOOKMARKS_CREATE: "bookmarks.create",
  BOOKMARKS_DELETE: "bookmarks.delete",
  BOOKMARKS_METRICS: "bookmarks.metrics",
  BOOKMARKS_CHANGE_COUNT: "bookmarks.change_count",

  // ==========================================================
  // METRICS
  // ==========================================================

  METRICS_VIEW: "metrics.view",
  METRICS_EDIT: "metrics.edit",
  METRICS_RESET: "metrics.reset",
  METRICS_EXPORT: "metrics.export",

  // ==========================================================
  // REPORTS
  // ==========================================================

  REPORTS_VIEW: "reports.view",
  REPORTS_SEARCH: "reports.search",
  REPORTS_CREATE: "reports.create",
  REPORTS_EDIT: "reports.edit",
  REPORTS_DELETE: "reports.delete",
  REPORTS_MODERATE: "reports.moderate",
  REPORTS_RESOLVE: "reports.resolve",
  REPORTS_DISMISS: "reports.dismiss",
  REPORTS_ASSIGN: "reports.assign",

  // ==========================================================
  // CHAT
  // ==========================================================

  CHAT_VIEW: "chat.view",
  CHAT_SEARCH: "chat.search",
  CHAT_CREATE: "chat.create",
  CHAT_SEND: "chat.send",
  CHAT_EDIT: "chat.edit",
  CHAT_DELETE: "chat.delete",
  CHAT_REACT: "chat.react",
  CHAT_REPLY: "chat.reply",
  CHAT_FORWARD: "chat.forward",
  CHAT_PIN: "chat.pin",
  CHAT_READ: "chat.read",
  CHAT_BLOCK: "chat.block",
  CHAT_CLOSE: "chat.close",
  CHAT_ARCHIVE: "chat.archive",
  CHAT_ATTACHMENTS: "chat.attachments",
  CHAT_MEDIA: "chat.media",
  CHAT_VOICE: "chat.voice",
  CHAT_ADMIN_NOTES: "chat.admin_notes",
  CHAT_INITIATE: "chat.initiate",
  CHAT_ACT_AS_PARTICIPANT: "chat.act_as_participant",

  // ==========================================================
  // NOTIFICATIONS
  // ==========================================================

  NOTIFICATIONS_VIEW: "notifications.view",
  NOTIFICATIONS_SEND: "notifications.send",
  NOTIFICATIONS_EDIT: "notifications.edit",
  NOTIFICATIONS_DELETE: "notifications.delete",
  NOTIFICATIONS_READ: "notifications.read",
  NOTIFICATIONS_SETTINGS: "notifications.settings",
  NOTIFICATIONS_GLOBAL_SETTINGS: "notifications.global_settings",
  NOTIFICATIONS_USER_SETTINGS: "notifications.user_settings",
  NOTIFICATIONS_FORCE_SETTINGS: "notifications.force_settings",

  // ==========================================================
  // PAYMENTS
  // ==========================================================

  PAYMENTS_VIEW: "payments.view",
  PAYMENTS_CREATE: "payments.create",
  PAYMENTS_EDIT: "payments.edit",
  PAYMENTS_CONFIRM: "payments.confirm",
  PAYMENTS_REJECT: "payments.reject",
  PAYMENTS_REFUND: "payments.refund",
  PAYMENTS_DELETE: "payments.delete",

  // ==========================================================
  // PREMIUM
  // ==========================================================

  PREMIUM_VIEW: "premium.view",
  PREMIUM_GRANT: "premium.grant",
  PREMIUM_REVOKE: "premium.revoke",
  PREMIUM_EDIT: "premium.edit",
  PREMIUM_EXTEND: "premium.extend",
  PREMIUM_SUSPEND: "premium.suspend",
  PREMIUM_PRICE: "premium.price",
  PREMIUM_PERMISSIONS: "premium.permissions",

  // ==========================================================
  // PRO
  // ==========================================================

  PRO_VIEW: "pro.view",
  PRO_GRANT: "pro.grant",
  PRO_REVOKE: "pro.revoke",
  PRO_EDIT: "pro.edit",
  PRO_EXTEND: "pro.extend",
  PRO_SUSPEND: "pro.suspend",
  PRO_PRICE: "pro.price",
  PRO_PERMISSIONS: "pro.permissions",

  // ==========================================================
  // TOP
  // ==========================================================

  TOP_VIEW: "top.view",
  TOP_GRANT: "top.grant",
  TOP_REVOKE: "top.revoke",
  TOP_EDIT: "top.edit",
  TOP_EXTEND: "top.extend",
  TOP_SUSPEND: "top.suspend",
  TOP_PRICE: "top.price",
  TOP_PERMISSIONS: "top.permissions",

  // ==========================================================
  // VIP
  // ==========================================================

  VIP_VIEW: "vip.view",
  VIP_GRANT: "vip.grant",
  VIP_REVOKE: "vip.revoke",
  VIP_EDIT: "vip.edit",
  VIP_EXTEND: "vip.extend",
  VIP_SUSPEND: "vip.suspend",
  VIP_PRICE: "vip.price",
  VIP_PERMISSIONS: "vip.permissions",

  // ==========================================================
  // LEVELS
  // ==========================================================

  LEVELS_VIEW: "levels.view",
  LEVELS_CREATE: "levels.create",
  LEVELS_EDIT: "levels.edit",
  LEVELS_DELETE: "levels.delete",
  LEVELS_ASSIGN: "levels.assign",
  LEVELS_RESET: "levels.reset",
  LEVELS_CONFIGURE: "levels.configure",

  // ==========================================================
  // BADGES
  // ==========================================================

  BADGES_VIEW: "badges.view",
  BADGES_CREATE: "badges.create",
  BADGES_EDIT: "badges.edit",
  BADGES_DELETE: "badges.delete",
  BADGES_ASSIGN: "badges.assign",
  BADGES_REVOKE: "badges.revoke",

  // ==========================================================
  // CATEGORIES
  // ==========================================================

  CATEGORIES_VIEW: "categories.view",
  CATEGORIES_CREATE: "categories.create",
  CATEGORIES_EDIT: "categories.edit",
  CATEGORIES_DELETE: "categories.delete",
  CATEGORIES_REORDER: "categories.reorder",

  // ==========================================================
  // SEARCH
  // ==========================================================

  SEARCH_GLOBAL: "search.global",
  SEARCH_PARTICIPANTS: "search.participants",
  SEARCH_PUBLICATIONS: "search.publications",
  SEARCH_COMMENTS: "search.comments",
  SEARCH_REVIEWS: "search.reviews",
  SEARCH_CHATS: "search.chats",
  SEARCH_REPORTS: "search.reports",

  // ==========================================================
  // ACTIVITY / AUDIT
  // ==========================================================

  ACTIVITY_VIEW: "activity.view",
  ACTIVITY_SEARCH: "activity.search",
  ACTIVITY_EXPORT: "activity.export",

  AUDIT_VIEW: "audit.view",
  AUDIT_SEARCH: "audit.search",
  AUDIT_EXPORT: "audit.export",

  // ==========================================================
  // SECURITY
  // ==========================================================

  SECURITY_VIEW: "security.view",
  SECURITY_MANAGE: "security.manage",
  SECURITY_SESSIONS: "security.sessions",
  SECURITY_BLOCK_IP: "security.block_ip",
  SECURITY_RATE_LIMIT: "security.rate_limit",

  // ==========================================================
  // ANALYTICS
  // ==========================================================

  ANALYTICS_VIEW: "analytics.view",
  ANALYTICS_EXPORT: "analytics.export",
  ANALYTICS_ADVANCED: "analytics.advanced",

  // ==========================================================
  // FEATURE FLAGS
  // ==========================================================

  FEATURES_VIEW: "features.view",
  FEATURES_EDIT: "features.edit",
  FEATURES_ROLLOUT: "features.rollout",

  // ==========================================================
  // CONTENT / MEDIA
  // ==========================================================

  MEDIA_VIEW: "media.view",
  MEDIA_UPLOAD: "media.upload",
  MEDIA_EDIT: "media.edit",
  MEDIA_DELETE: "media.delete",
  MEDIA_MODERATE: "media.moderate",

  // ==========================================================
  // EXPORT / IMPORT
  // ==========================================================

  DATA_EXPORT: "data.export",
  DATA_IMPORT: "data.import",

  // ==========================================================
  // SYSTEM ACTIONS
  // ==========================================================

  SYSTEM_EMERGENCY: "system.emergency",
  SYSTEM_CACHE_CLEAR: "system.cache.clear",
  SYSTEM_MAINTENANCE_MODE: "system.maintenance_mode"

} as const;

export type PermissionKey =
  typeof PERMISSIONS[keyof typeof PERMISSIONS];


// ============================================================
// PERMISSION DEFINITIONS
// ============================================================

export const PERMISSION_DEFINITIONS: PermissionDefinition[] =
  Object.entries(PERMISSIONS).map(([name, key]) => ({
    key,
    label: name
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, char => char.toUpperCase()),
    description: `Permission: ${key}`,
    category: key.split(".")[0],
    dangerous:
      key.includes("delete") ||
      key.includes("database") ||
      key.includes("restore") ||
      key.includes("emergency") ||
      key.includes("impersonate") ||
      key.includes("force_settings")
  }));


// ============================================================
// ALL PERMISSIONS
// ============================================================

export const ALL_PERMISSIONS: PermissionKey[] =
  Object.values(PERMISSIONS);


// ============================================================
// ROLE PRESETS
// ============================================================

export const ROLE_PRESETS = {

  // ----------------------------------------------------------
  // SUPER ADMIN
  // ----------------------------------------------------------

  superadmin: [
    ...ALL_PERMISSIONS
  ] as PermissionKey[],

  // ----------------------------------------------------------
  // ADMIN
  // ----------------------------------------------------------

  admin: ALL_PERMISSIONS.filter(permission =>
    permission !== PERMISSIONS.SYSTEM_FULL_CONTROL &&
    permission !== PERMISSIONS.SYSTEM_DATABASE_MANAGE &&
    permission !== PERMISSIONS.SYSTEM_RESTORE &&
    permission !== PERMISSIONS.ADMINS_DELETE
  ),

  // ----------------------------------------------------------
  // MODERATOR
  // ----------------------------------------------------------

  moderator: [
    PERMISSIONS.PARTICIPANTS_VIEW,
    PERMISSIONS.PARTICIPANTS_SEARCH,
    PERMISSIONS.PARTICIPANTS_ACTIVITY,

    PERMISSIONS.PROFILES_VIEW,
    PERMISSIONS.PROFILES_STATUS,

    PERMISSIONS.PUBLICATIONS_VIEW,
    PERMISSIONS.PUBLICATIONS_SEARCH,
    PERMISSIONS.PUBLICATIONS_MODERATE,
    PERMISSIONS.PUBLICATIONS_HIDE,
    PERMISSIONS.PUBLICATIONS_EDIT,
    PERMISSIONS.PUBLICATIONS_FEATURE,

    PERMISSIONS.COMMENTS_VIEW,
    PERMISSIONS.COMMENTS_SEARCH,
    PERMISSIONS.COMMENTS_MODERATE,
    PERMISSIONS.COMMENTS_HIDE,
    PERMISSIONS.COMMENTS_DELETE,

    PERMISSIONS.REVIEWS_VIEW,
    PERMISSIONS.REVIEWS_SEARCH,
    PERMISSIONS.REVIEWS_MODERATE,
    PERMISSIONS.REVIEWS_HIDE,
    PERMISSIONS.REVIEWS_DELETE,

    PERMISSIONS.REACTIONS_VIEW,
    PERMISSIONS.REACTIONS.MODERATE,

    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_SEARCH,
    PERMISSIONS.REPORTS_RESOLVE,
    PERMISSIONS.REPORTS_DISMISS,

    PERMISSIONS.CHAT_VIEW,
    PERMISSIONS.CHAT_SEARCH,

    PERMISSIONS.MEDIA_VIEW,
    PERMISSIONS.MEDIA_MODERATE,

    PERMISSIONS.ACTIVITY_VIEW,
    PERMISSIONS.AUDIT_VIEW,

    PERMISSIONS.NOTIFICATIONS_VIEW
  ].filter(Boolean) as PermissionKey[],

  // ----------------------------------------------------------
  // EDITOR
  // ----------------------------------------------------------

  editor: [
    PERMISSIONS.PUBLICATIONS_VIEW,
    PERMISSIONS.PUBLICATIONS_SEARCH,
    PERMISSIONS.PUBLICATIONS_CREATE,
    PERMISSIONS.PUBLICATIONS_EDIT,
    PERMISSIONS.PUBLICATIONS_PUBLISH,
    PERMISSIONS.PUBLICATIONS_MODERATE,
    PERMISSIONS.PUBLICATIONS_HIDE,
    PERMISSIONS.PUBLICATIONS_PIN,
    PERMISSIONS.PUBLICATIONS_FEATURE,
    PERMISSIONS.PUBLICATIONS_REORDER,
    PERMISSIONS.PUBLICATIONS_EDIT_MEDIA,

    PERMISSIONS.COMMENTS_VIEW,
    PERMISSIONS.COMMENTS_CREATE,
    PERMISSIONS.COMMENTS_EDIT,
    PERMISSIONS.COMMENTS_MODERATE,

    PERMISSIONS.REVIEWS_VIEW,
    PERMISSIONS.REVIEWS_CREATE,
    PERMISSIONS.REVIEWS_EDIT,
    PERMISSIONS.REVIEWS_MODERATE,

    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.CATEGORIES_EDIT,
    PERMISSIONS.CATEGORIES_REORDER,

    PERMISSIONS.MEDIA_VIEW,
    PERMISSIONS.MEDIA_UPLOAD,
    PERMISSIONS.MEDIA_EDIT,

    PERMISSIONS.SEARCH_GLOBAL,
    PERMISSIONS.SEARCH_PUBLICATIONS,
    PERMISSIONS.SEARCH_COMMENTS,
    PERMISSIONS.SEARCH_REVIEWS
  ],

  // ----------------------------------------------------------
  // SUPPORT
  // ----------------------------------------------------------

  support: [
    PERMISSIONS.PARTICIPANTS_VIEW,
    PERMISSIONS.PARTICIPANTS_SEARCH,
    PERMISSIONS.PARTICIPANTS_EDIT,
    PERMISSIONS.PARTICIPANTS_ACTIVITY,

    PERMISSIONS.PROFILES_VIEW,
    PERMISSIONS.PROFILES_EDIT,

    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_SEARCH,
    PERMISSIONS.REPORTS_RESOLVE,

    PERMISSIONS.CHAT_VIEW,
    PERMISSIONS.CHAT_SEARCH,
    PERMISSIONS.CHAT_CREATE,
    PERMISSIONS.CHAT_SEND,
    PERMISSIONS.CHAT_REPLY,
    PERMISSIONS.CHAT_ATTACHMENTS,
    PERMISSIONS.CHAT_MEDIA,
    PERMISSIONS.CHAT_INITIATE,

    PERMISSIONS.NOTIFICATIONS_VIEW,
    PERMISSIONS.NOTIFICATIONS_SEND,
    PERMISSIONS.NOTIFICATIONS_USER_SETTINGS,

    PERMISSIONS.SEARCH_GLOBAL,
    PERMISSIONS.SEARCH_PARTICIPANTS,
    PERMISSIONS.SEARCH_CHATS,

    PERMISSIONS.ACTIVITY_VIEW
  ]

} as const;


// ============================================================
// ROLE TYPE
// ============================================================

export type AdminRole = keyof typeof ROLE_PRESETS;


// ============================================================
// PERMISSION CHECK
// ============================================================

export function hasPermission(
  permissions: Iterable<string>,
  permission: string
): boolean {
  for (const value of permissions) {
    if (value === permission) {
      return true;
    }
  }

  return false;
}


// ============================================================
// ANY PERMISSION
// ============================================================

export function hasAnyPermission(
  permissions: Iterable<string>,
  required: readonly string[]
): boolean {

  const set = new Set(permissions);

  return required.some(permission =>
    set.has(permission)
  );
}


// ============================================================
// ALL PERMISSIONS
// ============================================================

export function hasAllPermissions(
  permissions: Iterable<string>,
  required: readonly string[]
): boolean {

  const set = new Set(permissions);

  return required.every(permission =>
    set.has(permission)
  );
}


// ============================================================
// GET ROLE PERMISSIONS
// ============================================================

export function getRolePermissions(
  role: AdminRole
): PermissionKey[] {

  return [...ROLE_PRESETS[role]];
}


// ============================================================
// MERGE PERMISSIONS
// ============================================================

export function mergePermissions(
  ...permissionSets: readonly string[][]
): PermissionKey[] {

  const result = new Set<string>();

  for (const permissions of permissionSets) {
    for (const permission of permissions) {
      result.add(permission);
    }
  }

  return [...result] as PermissionKey[];
}


// ============================================================
// REMOVE PERMISSIONS
// ============================================================

export function removePermissions(
  permissions: readonly string[],
  denied: readonly string[]
): PermissionKey[] {

  const deniedSet = new Set(denied);

  return permissions.filter(
    permission => !deniedSet.has(permission)
  ) as PermissionKey[];
}


// ============================================================
// ADMIN OVERRIDE
// ============================================================
//
// Три состояния:
//
// inherit = использовать роль
// allow   = принудительно разрешить
// deny    = принудительно запретить
//
// ============================================================

export type PermissionOverrideState =
  | "inherit"
  | "allow"
  | "deny";

export interface PermissionOverride {
  permission: PermissionKey;
  state: PermissionOverrideState;
}


// ============================================================
// APPLY OVERRIDES
// ============================================================

export function applyPermissionOverrides(
  basePermissions: readonly string[],
  overrides: readonly PermissionOverride[]
): PermissionKey[] {

  const result = new Set<string>(basePermissions);

  for (const override of overrides) {

    if (override.state === "allow") {
      result.add(override.permission);
    }

    if (override.state === "deny") {
      result.delete(override.permission);
    }
  }

  return [...result] as PermissionKey[];
}


// ============================================================
// DANGEROUS PERMISSIONS
// ============================================================

export function isDangerousPermission(
  permission: string
): boolean {

  return (
    permission.includes("delete") ||
    permission.includes("database") ||
    permission.includes("restore") ||
    permission.includes("emergency") ||
    permission.includes("impersonate") ||
    permission.includes("force_settings") ||
    permission.includes("full_control")
  );
}


// ============================================================
// CATEGORY FILTER
// ============================================================

export function permissionsByCategory(
  category: string
): PermissionDefinition[] {

  return PERMISSION_DEFINITIONS.filter(
    definition => definition.category === category
  );
}


// ============================================================
// PERMISSION CATEGORIES
// ============================================================

export const PERMISSION_CATEGORIES = [
  "system",
  "admins",
  "participants",
  "profiles",
  "publications",
  "comments",
  "reviews",
  "reactions",
  "shares",
  "bookmarks",
  "metrics",
  "reports",
  "chat",
  "notifications",
  "payments",
  "premium",
  "pro",
  "top",
  "vip",
  "levels",
  "badges",
  "categories",
  "search",
  "activity",
  "audit",
  "security",
  "analytics",
  "features",
  "media",
  "data"
] as const;


// ============================================================
// VALIDATE PERMISSION
// ============================================================

export function isValidPermission(
  value: string
): value is PermissionKey {

  return (ALL_PERMISSIONS as readonly string[])
    .includes(value);
}


// ============================================================
// NORMALIZE PERMISSIONS
// ============================================================

export function normalizePermissions(
  permissions: readonly string[]
): PermissionKey[] {

  return [
    ...new Set(
      permissions.filter(isValidPermission)
    )
  ];
}


// ============================================================
// PERMISSION MAP
// ============================================================

export function permissionMap(
  permissions: readonly string[]
): Record<string, boolean> {

  const set = new Set(permissions);

  return Object.fromEntries(
    ALL_PERMISSIONS.map(permission => [
      permission,
      set.has(permission)
    ])
  );
}


// ============================================================
// DEFAULT USER / ADMIN MODES
// ============================================================

export const PERMISSION_MODES = {
  INHERIT: "inherit",
  ALLOW: "allow",
  DENY: "deny"
} as const;

export type PermissionMode =
  typeof PERMISSION_MODES[keyof typeof PERMISSION_MODES];


// ============================================================
// END
// ============================================================
