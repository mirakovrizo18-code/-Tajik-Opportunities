import type { AdminRole } from "../types";

// ============================================================
// TAJIK OPPORTUNITIES
// ADMIN PERMISSIONS
// Version: 2026.09
// ============================================================

export const PERMISSIONS = {

  // ----------------------------------------------------------
  // DASHBOARD
  // ----------------------------------------------------------

  DASHBOARD_VIEW: "dashboard.view",
  DASHBOARD_MANAGE: "dashboard.manage",

  // ----------------------------------------------------------
  // PUBLICATIONS
  // ----------------------------------------------------------

  PUBLICATIONS_VIEW: "publications.view",
  PUBLICATIONS_CREATE: "publications.create",
  PUBLICATIONS_EDIT: "publications.edit",
  PUBLICATIONS_DELETE: "publications.delete",

  PUBLICATIONS_APPROVE: "publications.approve",
  PUBLICATIONS_REJECT: "publications.reject",

  PUBLICATIONS_PUBLISH: "publications.publish",
  PUBLICATIONS_UNPUBLISH: "publications.unpublish",

  PUBLICATIONS_HIDE: "publications.hide",
  PUBLICATIONS_RESTORE: "publications.restore",

  PUBLICATIONS_PIN: "publications.pin",
  PUBLICATIONS_UNPIN: "publications.unpin",

  PUBLICATIONS_FEATURE: "publications.feature",
  PUBLICATIONS_UNFEATURE: "publications.unfeature",

  PUBLICATIONS_CHANGE_AUTHOR: "publications.change_author",
  PUBLICATIONS_CHANGE_CATEGORY: "publications.change_category",
  PUBLICATIONS_CHANGE_STATUS: "publications.change_status",
  PUBLICATIONS_CHANGE_DATE: "publications.change_date",
  PUBLICATIONS_CHANGE_ORDER: "publications.change_order",

  PUBLICATIONS_HISTORY_VIEW: "publications.history.view",

  // ----------------------------------------------------------
  // PUBLICATION METRICS
  // ----------------------------------------------------------

  METRICS_VIEW: "metrics.view",
  METRICS_EDIT: "metrics.edit",

  METRICS_SET: "metrics.set",
  METRICS_INCREMENT: "metrics.increment",
  METRICS_DECREMENT: "metrics.decrement",
  METRICS_RESET: "metrics.reset",

  METRICS_VIEWS: "metrics.views",
  METRICS_UNIQUE_VIEWS: "metrics.unique_views",

  METRICS_LIKES: "metrics.likes",
  METRICS_REACTIONS: "metrics.reactions",

  METRICS_COMMENTS: "metrics.comments",
  METRICS_BOOKMARKS: "metrics.bookmarks",

  METRICS_SHARES: "metrics.shares",
  METRICS_SENDS: "metrics.sends",

  METRICS_REPORTS: "metrics.reports",

  METRICS_CONTACTS: "metrics.contacts",
  METRICS_APPLICATIONS: "metrics.applications",

  METRICS_DOWNLOADS: "metrics.downloads",
  METRICS_CLICKS: "metrics.clicks",
  METRICS_EXTERNAL_CLICKS: "metrics.external_clicks",

  // ----------------------------------------------------------
  // PARTICIPANTS
  // ----------------------------------------------------------

  PARTICIPANTS_VIEW: "participants.view",
  PARTICIPANTS_SEARCH: "participants.search",

  PARTICIPANTS_EDIT: "participants.edit",

  PARTICIPANTS_BLOCK: "participants.block",
  PARTICIPANTS_UNBLOCK: "participants.unblock",

  PARTICIPANTS_DELETE: "participants.delete",
  PARTICIPANTS_RESTORE: "participants.restore",

  PARTICIPANTS_ACTIVITY_VIEW: "participants.activity.view",

  PARTICIPANTS_SESSIONS_VIEW: "participants.sessions.view",

  // ----------------------------------------------------------
  // PROFILES
  // ----------------------------------------------------------

  PROFILES_VIEW: "profiles.view",
  PROFILES_CREATE: "profiles.create",
  PROFILES_EDIT: "profiles.edit",
  PROFILES_DELETE: "profiles.delete",

  PROFILES_BLOCK: "profiles.block",
  PROFILES_UNBLOCK: "profiles.unblock",

  PROFILES_VERIFY: "profiles.verify",
  PROFILES_UNVERIFY: "profiles.unverify",

  PROFILES_CHANGE_VISIBILITY:
    "profiles.change_visibility",

  // ----------------------------------------------------------
  // COMMENTS
  // ----------------------------------------------------------

  COMMENTS_VIEW: "comments.view",
  COMMENTS_SEARCH: "comments.search",

  COMMENTS_CREATE: "comments.create",
  COMMENTS_EDIT: "comments.edit",
  COMMENTS_DELETE: "comments.delete",

  COMMENTS_HIDE: "comments.hide",
  COMMENTS_RESTORE: "comments.restore",

  COMMENTS_CHANGE_AUTHOR:
    "comments.change_author",

  COMMENTS_CHANGE_DATE:
    "comments.change_date",

  COMMENTS_CHANGE_STATUS:
    "comments.change_status",

  COMMENTS_CHANGE_COUNTERS:
    "comments.change_counters",

  COMMENTS_HISTORY_VIEW:
    "comments.history.view",

  // ----------------------------------------------------------
  // REACTIONS
  // ----------------------------------------------------------

  REACTIONS_VIEW: "reactions.view",
  REACTIONS_SEARCH: "reactions.search",

  REACTIONS_ADD: "reactions.add",
  REACTIONS_EDIT: "reactions.edit",
  REACTIONS_DELETE: "reactions.delete",

  REACTIONS_CHANGE_TYPE:
    "reactions.change_type",

  // ----------------------------------------------------------
  // BOOKMARKS
  // ----------------------------------------------------------

  BOOKMARKS_VIEW: "bookmarks.view",
  BOOKMARKS_SEARCH: "bookmarks.search",

  BOOKMARKS_CREATE: "bookmarks.create",
  BOOKMARKS_DELETE: "bookmarks.delete",

  // ----------------------------------------------------------
  // SHARES
  // ----------------------------------------------------------

  SHARES_VIEW: "shares.view",
  SHARES_SEARCH: "shares.search",

  SHARES_CREATE: "shares.create",
  SHARES_DELETE: "shares.delete",

  // ----------------------------------------------------------
  // SENDS
  // ----------------------------------------------------------

  SENDS_VIEW: "sends.view",
  SENDS_SEARCH: "sends.search",

  SENDS_CREATE: "sends.create",
  SENDS_DELETE: "sends.delete",

  // ----------------------------------------------------------
  // VIEWS
  // ----------------------------------------------------------

  VIEWS_VIEW: "views.view",
  VIEWS_SEARCH: "views.search",

  VIEWS_DELETE: "views.delete",

  // ----------------------------------------------------------
  // REPORTS
  // ----------------------------------------------------------

  REPORTS_VIEW: "reports.view",
  REPORTS_SEARCH: "reports.search",

  REPORTS_EDIT: "reports.edit",

  REPORTS_ASSIGN: "reports.assign",

  REPORTS_CONFIRM: "reports.confirm",
  REPORTS_REJECT: "reports.reject",

  REPORTS_RESOLVE: "reports.resolve",
  REPORTS_CLOSE: "reports.close",

  REPORTS_DELETE: "reports.delete",
  REPORTS_RESTORE: "reports.restore",

  REPORTS_HISTORY_VIEW:
    "reports.history.view",

  // ----------------------------------------------------------
  // CHAT
  // ----------------------------------------------------------

  CHAT_VIEW: "chat.view",
  CHAT_SEARCH: "chat.search",

  CHAT_CREATE: "chat.create",

  CHAT_SEND: "chat.send",
  CHAT_EDIT: "chat.edit",
  CHAT_DELETE: "chat.delete",

  CHAT_READ: "chat.read",
  CHAT_MARK_READ: "chat.mark_read",

  CHAT_ASSIGN: "chat.assign",
  CHAT_UNASSIGN: "chat.unassign",

  CHAT_CLOSE: "chat.close",
  CHAT_REOPEN: "chat.reopen",

  CHAT_ARCHIVE: "chat.archive",
  CHAT_RESTORE: "chat.restore",

  CHAT_ATTACHMENTS: "chat.attachments",

  CHAT_HISTORY_VIEW:
    "chat.history.view",

  // ----------------------------------------------------------
  // NOTIFICATIONS
  // ----------------------------------------------------------

  NOTIFICATIONS_VIEW:
    "notifications.view",

  NOTIFICATIONS_CREATE:
    "notifications.create",

  NOTIFICATIONS_SEND:
    "notifications.send",

  NOTIFICATIONS_EDIT:
    "notifications.edit",

  NOTIFICATIONS_DELETE:
    "notifications.delete",

  NOTIFICATIONS_MARK_READ:
    "notifications.mark_read",

  NOTIFICATIONS_BROADCAST:
    "notifications.broadcast",

  // ----------------------------------------------------------
  // CATEGORIES
  // ----------------------------------------------------------

  CATEGORIES_VIEW: "categories.view",
  CATEGORIES_CREATE: "categories.create",
  CATEGORIES_EDIT: "categories.edit",
  CATEGORIES_DELETE: "categories.delete",

  CATEGORIES_REORDER:
    "categories.reorder",

  CATEGORIES_ACTIVATE:
    "categories.activate",

  CATEGORIES_DEACTIVATE:
    "categories.deactivate",

  // ----------------------------------------------------------
  // SEARCH
  // ----------------------------------------------------------

  SEARCH_VIEW: "search.view",
  SEARCH_HISTORY_VIEW:
    "search.history.view",

  SEARCH_HISTORY_DELETE:
    "search.history.delete",

  // ----------------------------------------------------------
  // STATISTICS
  // ----------------------------------------------------------

  STATISTICS_VIEW:
    "statistics.view",

  STATISTICS_DETAILED:
    "statistics.detailed",

  STATISTICS_EXPORT:
    "statistics.export",

  STATISTICS_RESET:
    "statistics.reset",

  // ----------------------------------------------------------
  // USER ACTIVITY
  // ----------------------------------------------------------

  ACTIVITY_VIEW:
    "activity.view",

  ACTIVITY_SEARCH:
    "activity.search",

  ACTIVITY_EXPORT:
    "activity.export",

  // ----------------------------------------------------------
  // ADMIN ACTIVITY LOG
  // ----------------------------------------------------------

  ADMIN_LOG_VIEW:
    "admin_log.view",

  ADMIN_LOG_SEARCH:
    "admin_log.search",

  ADMIN_LOG_EXPORT:
    "admin_log.export",

  // ----------------------------------------------------------
  // SETTINGS
  // ----------------------------------------------------------

  SETTINGS_VIEW:
    "settings.view",

  SETTINGS_EDIT:
    "settings.edit",

  SETTINGS_CREATE:
    "settings.create",

  SETTINGS_DELETE:
    "settings.delete",

  // ----------------------------------------------------------
  // FEATURE FLAGS
  // ----------------------------------------------------------

  FEATURES_VIEW:
    "features.view",

  FEATURES_EDIT:
    "features.edit",

  FEATURES_ENABLE:
    "features.enable",

  FEATURES_DISABLE:
    "features.disable",

  // ----------------------------------------------------------
  // ADMIN USERS
  // ----------------------------------------------------------

  ADMINS_VIEW:
    "admins.view",

  ADMINS_CREATE:
    "admins.create",

  ADMINS_EDIT:
    "admins.edit",

  ADMINS_DELETE:
    "admins.delete",

  ADMINS_BLOCK:
    "admins.block",

  ADMINS_UNBLOCK:
    "admins.unblock",

  ADMINS_SESSIONS_VIEW:
    "admins.sessions.view",

  ADMINS_SESSIONS_REVOKE:
    "admins.sessions.revoke",

  ADMINS_PERMISSIONS_VIEW:
    "admins.permissions.view",

  ADMINS_PERMISSIONS_EDIT:
    "admins.permissions.edit",

  // ----------------------------------------------------------
  // DATABASE / SYSTEM
  // ----------------------------------------------------------

  SYSTEM_VIEW:
    "system.view",

  SYSTEM_FULL_CONTROL:
    "system.full_control",

  SYSTEM_DATABASE_VIEW:
    "system.database.view",

  SYSTEM_DATABASE_MANAGE:
    "system.database.manage",

  SYSTEM_MAINTENANCE:
    "system.maintenance",

  SYSTEM_BACKUP:
    "system.backup",

  SYSTEM_RESTORE:
    "system.restore",

  // ----------------------------------------------------------
  // SECURITY
  // ----------------------------------------------------------

  SECURITY_VIEW:
    "security.view",

  SECURITY_MANAGE:
    "security.manage",

  SECURITY_SESSIONS:
    "security.sessions",

  SECURITY_RATE_LIMIT:
    "security.rate_limit",

  SECURITY_BLOCK_IP:
    "security.block_ip",

  SECURITY_UNBLOCK_IP:
    "security.unblock_ip",

  // ----------------------------------------------------------
  // EXPORT / IMPORT
  // ----------------------------------------------------------

  DATA_EXPORT:
    "data.export",

  DATA_IMPORT:
    "data.import",

  DATA_DELETE:
    "data.delete",

  // ----------------------------------------------------------
  // SUPER ADMIN
  // ----------------------------------------------------------

  SUPERADMIN:
    "superadmin"
} as const;


// ============================================================
// TYPE
// ============================================================

export type Permission =
  typeof PERMISSIONS[keyof typeof PERMISSIONS];


// ============================================================
// ALL PERMISSIONS
// ============================================================

export const ALL_PERMISSIONS: Permission[] =
  Object.values(PERMISSIONS);


// ============================================================
// ROLE PERMISSION PRESETS
// ============================================================

export const ROLE_PERMISSIONS: Record<
  AdminRole,
  Permission[]
> = {

  // ----------------------------------------------------------
  // SUPERADMIN
  // ----------------------------------------------------------

  superadmin: ALL_PERMISSIONS,

  // ----------------------------------------------------------
  // ADMIN
  // ----------------------------------------------------------

  admin: ALL_PERMISSIONS.filter(
    permission =>
      permission !== PERMISSIONS.SYSTEM_FULL_CONTROL &&
      permission !== PERMISSIONS.SYSTEM_DATABASE_MANAGE &&
      permission !== PERMISSIONS.SYSTEM_RESTORE &&
      permission !== PERMISSIONS.ADMINS_DELETE
  ),

  // ----------------------------------------------------------
  // MODERATOR
  // ----------------------------------------------------------

  moderator: [
    PERMISSIONS.DASHBOARD_VIEW,

    PERMISSIONS.PUBLICATIONS_VIEW,
    PERMISSIONS.PUBLICATIONS_SEARCH,
    PERMISSIONS.PUBLICATIONS_APPROVE,
    PERMISSIONS.PUBLICATIONS_REJECT,
    PERMISSIONS.PUBLICATIONS_HIDE,
    PERMISSIONS.PUBLICATIONS_RESTORE,

    PERMISSIONS.PARTICIPANTS_VIEW,
    PERMISSIONS.PARTICIPANTS_SEARCH,
    PERMISSIONS.PARTICIPANTS_BLOCK,
    PERMISSIONS.PARTICIPANTS_UNBLOCK,

    PERMISSIONS.PROFILES_VIEW,

    PERMISSIONS.COMMENTS_VIEW,
    PERMISSIONS.COMMENTS_SEARCH,
    PERMISSIONS.COMMENTS_HIDE,
    PERMISSIONS.COMMENTS_RESTORE,

    PERMISSIONS.REACTIONS_VIEW,

    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_SEARCH,
    PERMISSIONS.REPORTS_EDIT,
    PERMISSIONS.REPORTS_ASSIGN,
    PERMISSIONS.REPORTS_CONFIRM,
    PERMISSIONS.REPORTS_REJECT,
    PERMISSIONS.REPORTS_RESOLVE,
    PERMISSIONS.REPORTS_CLOSE,

    PERMISSIONS.CHAT_VIEW,
    PERMISSIONS.CHAT_SEARCH,
    PERMISSIONS.CHAT_READ,
    PERMISSIONS.CHAT_MARK_READ,

    PERMISSIONS.NOTIFICATIONS_VIEW,

    PERMISSIONS.STATISTICS_VIEW,

    PERMISSIONS.ACTIVITY_VIEW
  ],

  // ----------------------------------------------------------
  // EDITOR
  // ----------------------------------------------------------

  editor: [
    PERMISSIONS.DASHBOARD_VIEW,

    PERMISSIONS.PUBLICATIONS_VIEW,
    PERMISSIONS.PUBLICATIONS_CREATE,
    PERMISSIONS.PUBLICATIONS_EDIT,
    PERMISSIONS.PUBLICATIONS_PUBLISH,
    PERMISSIONS.PUBLICATIONS_UNPUBLISH,
    PERMISSIONS.PUBLICATIONS_PIN,
    PERMISSIONS.PUBLICATIONS_UNPIN,
    PERMISSIONS.PUBLICATIONS_FEATURE,
    PERMISSIONS.PUBLICATIONS_UNFEATURE,
    PERMISSIONS.PUBLICATIONS_CHANGE_CATEGORY,
    PERMISSIONS.PUBLICATIONS_CHANGE_DATE,
    PERMISSIONS.PUBLICATIONS_CHANGE_ORDER,
    PERMISSIONS.PUBLICATIONS_HISTORY_VIEW,

    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.CATEGORIES_CREATE,
    PERMISSIONS.CATEGORIES_EDIT,
    PERMISSIONS.CATEGORIES_REORDER,

    PERMISSIONS.COMMENTS_VIEW,
    PERMISSIONS.COMMENTS_EDIT,

    PERMISSIONS.NOTIFICATIONS_VIEW,
    PERMISSIONS.NOTIFICATIONS_CREATE,
    PERMISSIONS.NOTIFICATIONS_SEND,

    PERMISSIONS.STATISTICS_VIEW
  ],

  // ----------------------------------------------------------
  // SUPPORT
  // ----------------------------------------------------------

  support: [
    PERMISSIONS.DASHBOARD_VIEW,

    PERMISSIONS.PARTICIPANTS_VIEW,
    PERMISSIONS.PARTICIPANTS_SEARCH,

    PERMISSIONS.PROFILES_VIEW,
    PERMISSIONS.PROFILES_EDIT,

    PERMISSIONS.PUBLICATIONS_VIEW,

    PERMISSIONS.COMMENTS_VIEW,

    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_SEARCH,
    PERMISSIONS.REPORTS_EDIT,
    PERMISSIONS.REPORTS_ASSIGN,

    PERMISSIONS.CHAT_VIEW,
    PERMISSIONS.CHAT_SEARCH,
    PERMISSIONS.CHAT_CREATE,
    PERMISSIONS.CHAT_SEND,
    PERMISSIONS.CHAT_EDIT,
    PERMISSIONS.CHAT_READ,
    PERMISSIONS.CHAT_MARK_READ,
    PERMISSIONS.CHAT_ASSIGN,
    PERMISSIONS.CHAT_UNASSIGN,
    PERMISSIONS.CHAT_CLOSE,
    PERMISSIONS.CHAT_REOPEN,

    PERMISSIONS.NOTIFICATIONS_VIEW,
    PERMISSIONS.NOTIFICATIONS_SEND
  ],

  // ----------------------------------------------------------
  // ANALYST
  // ----------------------------------------------------------

  analyst: [
    PERMISSIONS.DASHBOARD_VIEW,

    PERMISSIONS.PUBLICATIONS_VIEW,

    PERMISSIONS.PARTICIPANTS_VIEW,
    PERMISSIONS.PARTICIPANTS_SEARCH,

    PERMISSIONS.PROFILES_VIEW,

    PERMISSIONS.REACTIONS_VIEW,
    PERMISSIONS.BOOKMARKS_VIEW,
    PERMISSIONS.SHARES_VIEW,
    PERMISSIONS.SENDS_VIEW,
    PERMISSIONS.VIEWS_VIEW,

    PERMISSIONS.REPORTS_VIEW,

    PERMISSIONS.STATISTICS_VIEW,
    PERMISSIONS.STATISTICS_DETAILED,
    PERMISSIONS.STATISTICS_EXPORT,

    PERMISSIONS.ACTIVITY_VIEW,
    PERMISSIONS.ACTIVITY_SEARCH,
    PERMISSIONS.ACTIVITY_EXPORT,

    PERMISSIONS.ADMIN_LOG_VIEW,
    PERMISSIONS.ADMIN_LOG_SEARCH,
    PERMISSIONS.ADMIN_LOG_EXPORT
  ]
};


// ============================================================
// PERMISSION CHECK
// ============================================================

export function hasPermission(
  role: AdminRole,
  permission: Permission
): boolean {

  const permissions =
    ROLE_PERMISSIONS[role] ?? [];

  return permissions.includes(permission);
}


// ============================================================
// SUPERADMIN CHECK
// ============================================================

export function isSuperAdmin(
  role: AdminRole
): boolean {

  return role === "superadmin";
}


// ============================================================
// ADMIN ACCESS CHECK
// ============================================================

export function canAccessAdmin(
  role: AdminRole
): boolean {

  return [
    "superadmin",
    "admin",
    "moderator",
    "editor",
    "support",
    "analyst"
  ].includes(role);
    }
