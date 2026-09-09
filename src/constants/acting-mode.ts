/* ============================================================
   🇹🇯 TAJIK OPPORTUNITIES
   SUPER ADMIN — ACT AS PARTICIPANT
   ------------------------------------------------------------
   Полноценный режим управления участником.

   ВАЖНО:
   • Super Admin может выполнять все доступные действия
     от имени выбранного профиля.
   • Функциональных искусственных ограничений нет.
   • Реальный администратор всегда сохраняется в audit trail.
   • Выбранный профиль и реальный admin — разные сущности.
   • Режим действует только на сервере после проверки прав.
   ============================================================ */

export const ACTING_MODE = {
  ID: "acting_mode",

  DEFAULT_DURATION_SECONDS: 3600,

  MAX_DURATION_SECONDS: 86400,

  HEADER_NAME: "X-TO-Acting-Profile",

  ADMIN_HEADER_NAME: "X-TO-Admin-Session",

  AUDIT_HEADER_NAME: "X-TO-Acting-Audit",

  SESSION_COOKIE: "to_acting_session",

  ENABLED: true,

  REQUIRE_SUPERADMIN: true,

  REQUIRE_AUDIT: true,

  REQUIRE_CONFIRMATION_FOR_EXIT: false,

  ALLOW_PROFILE_SWITCH: true,

  ALLOW_NESTED_SWITCH: false,

  ALLOW_FULL_PARTICIPANT_UI: true,

  ALLOW_ALL_PARTICIPANT_ACTIONS: true,

  ALLOW_ALL_MEDIA_ACTIONS: true,

  ALLOW_ALL_CHAT_ACTIONS: true,

  ALLOW_ALL_PUBLICATION_ACTIONS: true,

  ALLOW_ALL_COMMENT_ACTIONS: true,

  ALLOW_ALL_REACTION_ACTIONS: true,

  ALLOW_ALL_REVIEW_ACTIONS: true,

  ALLOW_ALL_NOTIFICATION_ACTIONS: true,

  ALLOW_ALL_SETTINGS_ACTIONS: true,

  ALLOW_ALL_PERMISSION_ACTIONS: true,

  ALLOW_ALL_LEVEL_ACTIONS: true,

  ALLOW_ALL_SERVICE_ACTIONS: true,

  ALLOW_ALL_MODERATION_ACTIONS: true,

  ALLOW_ALL_SEARCH_ACTIONS: true,

  ALLOW_ALL_BOOKMARK_ACTIONS: true,

  ALLOW_ALL_SHARE_ACTIONS: true,
} as const;


/* ============================================================
   РЕЖИМЫ
   ============================================================ */

export enum ActingModeType {
  NONE = "none",

  PARTICIPANT = "participant",

  ADMIN_PREVIEW = "admin_preview",

  ADMIN_SUPPORT = "admin_support",
}


/* ============================================================
   СОСТОЯНИЯ
   ============================================================ */

export enum ActingModeStatus {
  ACTIVE = "active",

  PAUSED = "paused",

  SWITCHING = "switching",

  ENDED = "ended",

  EXPIRED = "expired",

  REVOKED = "revoked",
}


/* ============================================================
   ПОЛНОМОЧИЯ ACT AS PARTICIPANT
   ============================================================ */

export const ACTING_PERMISSIONS = {

  /* ---------- PROFILE ---------- */

  PROFILE_VIEW:
    "acting.profile.view",

  PROFILE_EDIT:
    "acting.profile.edit",

  PROFILE_AVATAR:
    "acting.profile.avatar",

  PROFILE_USERNAME:
    "acting.profile.username",

  PROFILE_NAME:
    "acting.profile.name",

  PROFILE_STATUS:
    "acting.profile.status",

  PROFILE_LEVEL:
    "acting.profile.level",

  PROFILE_BADGES:
    "acting.profile.badges",

  PROFILE_TAGS:
    "acting.profile.tags",

  PROFILE_PRIVACY:
    "acting.profile.privacy",

  PROFILE_SETTINGS:
    "acting.profile.settings",


  /* ---------- PUBLICATIONS ---------- */

  PUBLICATIONS_VIEW:
    "acting.publications.view",

  PUBLICATIONS_CREATE:
    "acting.publications.create",

  PUBLICATIONS_EDIT:
    "acting.publications.edit",

  PUBLICATIONS_DELETE:
    "acting.publications.delete",

  PUBLICATIONS_RESTORE:
    "acting.publications.restore",

  PUBLICATIONS_PUBLISH:
    "acting.publications.publish",

  PUBLICATIONS_REACTION:
    "acting.publications.reaction",

  PUBLICATIONS_COMMENT:
    "acting.publications.comment",

  PUBLICATIONS_SHARE:
    "acting.publications.share",

  PUBLICATIONS_SAVE:
    "acting.publications.save",

  PUBLICATIONS_REPORT:
    "acting.publications.report",

  PUBLICATIONS_APPLY:
    "acting.publications.apply",

  PUBLICATIONS_CONTACT:
    "acting.publications.contact",


  /* ---------- COMMENTS ---------- */

  COMMENTS_VIEW:
    "acting.comments.view",

  COMMENTS_CREATE:
    "acting.comments.create",

  COMMENTS_EDIT:
    "acting.comments.edit",

  COMMENTS_DELETE:
    "acting.comments.delete",

  COMMENTS_REPLY:
    "acting.comments.reply",

  COMMENTS_REACTION:
    "acting.comments.reaction",

  COMMENTS_REPORT:
    "acting.comments.report",


  /* ---------- REACTIONS ---------- */

  REACTIONS_VIEW:
    "acting.reactions.view",

  REACTIONS_CREATE:
    "acting.reactions.create",

  REACTIONS_CHANGE:
    "acting.reactions.change",

  REACTIONS_DELETE:
    "acting.reactions.delete",


  /* ---------- REVIEWS ---------- */

  REVIEWS_VIEW:
    "acting.reviews.view",

  REVIEWS_CREATE:
    "acting.reviews.create",

  REVIEWS_EDIT:
    "acting.reviews.edit",

  REVIEWS_DELETE:
    "acting.reviews.delete",

  REVIEWS_REPLY:
    "acting.reviews.reply",

  REVIEWS_REACTION:
    "acting.reviews.reaction",

  REVIEWS_REPORT:
    "acting.reviews.report",


  /* ---------- CHAT ---------- */

  CHAT_VIEW:
    "acting.chat.view",

  CHAT_CREATE:
    "acting.chat.create",

  CHAT_SEND:
    "acting.chat.send",

  CHAT_EDIT:
    "acting.chat.edit",

  CHAT_DELETE:
    "acting.chat.delete",

  CHAT_REPLY:
    "acting.chat.reply",

  CHAT_FORWARD:
    "acting.chat.forward",

  CHAT_REACTION:
    "acting.chat.reaction",

  CHAT_PIN:
    "acting.chat.pin",

  CHAT_READ:
    "acting.chat.read",

  CHAT_TYPING:
    "acting.chat.typing",

  CHAT_MEDIA:
    "acting.chat.media",

  CHAT_SEARCH:
    "acting.chat.search",


  /* ---------- NOTIFICATIONS ---------- */

  NOTIFICATIONS_VIEW:
    "acting.notifications.view",

  NOTIFICATIONS_READ:
    "acting.notifications.read",

  NOTIFICATIONS_DELETE:
    "acting.notifications.delete",

  NOTIFICATIONS_SETTINGS:
    "acting.notifications.settings",

  NOTIFICATIONS_TEST:
    "acting.notifications.test",


  /* ---------- SAVED ---------- */

  SAVED_VIEW:
    "acting.saved.view",

  SAVED_CREATE:
    "acting.saved.create",

  SAVED_DELETE:
    "acting.saved.delete",

  SAVED_FOLDERS:
    "acting.saved.folders",


  /* ---------- SUBSCRIPTIONS ---------- */

  SUBSCRIPTIONS_VIEW:
    "acting.subscriptions.view",

  SUBSCRIPTIONS_FOLLOW:
    "acting.subscriptions.follow",

  SUBSCRIPTIONS_UNFOLLOW:
    "acting.subscriptions.unfollow",


  /* ---------- SERVICES ---------- */

  SERVICE_FREE:
    "acting.service.free",

  SERVICE_PREMIUM:
    "acting.service.premium",

  SERVICE_PRO:
    "acting.service.pro",

  SERVICE_TOP:
    "acting.service.top",

  SERVICE_VIP:
    "acting.service.vip",

  SERVICE_GIFT:
    "acting.service.gift",


  /* ---------- PERMISSIONS ---------- */

  PERMISSIONS_VIEW:
    "acting.permissions.view",

  PERMISSIONS_EDIT:
    "acting.permissions.edit",

  PERMISSIONS_ALLOW:
    "acting.permissions.allow",

  PERMISSIONS_DENY:
    "acting.permissions.deny",

  PERMISSIONS_RESET:
    "acting.permissions.reset",


  /* ---------- MODERATION ---------- */

  MODERATION_VIEW:
    "acting.moderation.view",

  MODERATION_REPORT:
    "acting.moderation.report",

  MODERATION_BLOCK:
    "acting.moderation.block",

  MODERATION_UNBLOCK:
    "acting.moderation.unblock",


  /* ---------- SEARCH ---------- */

  SEARCH_GLOBAL:
    "acting.search.global",

  SEARCH_PARTICIPANTS:
    "acting.search.participants",

  SEARCH_PUBLICATIONS:
    "acting.search.publications",

  SEARCH_COMMENTS:
    "acting.search.comments",

  SEARCH_CHATS:
    "acting.search.chats",


  /* ---------- ADMIN ---------- */

  ADMIN_SWITCH_PROFILE:
    "acting.admin.switch_profile",

  ADMIN_END_SESSION:
    "acting.admin.end_session",

  ADMIN_VIEW_AUDIT:
    "acting.admin.view_audit",

} as const;


/* ============================================================
   ДЕЙСТВИЯ, КОТОРЫЕ МОЖЕТ ВЫПОЛНЯТЬ ADMIN
   ============================================================ */

export const ACTING_ACTIONS = {

  START:
    "acting.start",

  END:
    "acting.end",

  SWITCH:
    "acting.switch",

  PAUSE:
    "acting.pause",

  RESUME:
    "acting.resume",

  PROFILE_VIEW:
    "profile.view",

  PROFILE_EDIT:
    "profile.edit",

  PROFILE_AVATAR_CHANGE:
    "profile.avatar.change",

  PROFILE_USERNAME_CHANGE:
    "profile.username.change",

  PROFILE_NAME_CHANGE:
    "profile.name.change",

  PROFILE_LEVEL_CHANGE:
    "profile.level.change",

  PROFILE_STATUS_CHANGE:
    "profile.status.change",

  PUBLICATION_CREATE:
    "publication.create",

  PUBLICATION_EDIT:
    "publication.edit",

  PUBLICATION_DELETE:
    "publication.delete",

  PUBLICATION_RESTORE:
    "publication.restore",

  PUBLICATION_PUBLISH:
    "publication.publish",

  COMMENT_CREATE:
    "comment.create",

  COMMENT_EDIT:
    "comment.edit",

  COMMENT_DELETE:
    "comment.delete",

  COMMENT_REPLY:
    "comment.reply",

  REACTION_ADD:
    "reaction.add",

  REACTION_CHANGE:
    "reaction.change",

  REACTION_REMOVE:
    "reaction.remove",

  REVIEW_CREATE:
    "review.create",

  REVIEW_EDIT:
    "review.edit",

  REVIEW_DELETE:
    "review.delete",

  REVIEW_REPLY:
    "review.reply",

  MESSAGE_SEND:
    "message.send",

  MESSAGE_EDIT:
    "message.edit",

  MESSAGE_DELETE:
    "message.delete",

  MESSAGE_REPLY:
    "message.reply",

  MESSAGE_FORWARD:
    "message.forward",

  MESSAGE_REACTION:
    "message.reaction",

  MESSAGE_PIN:
    "message.pin",

  CHAT_CREATE:
    "chat.create",

  CHAT_ARCHIVE:
    "chat.archive",

  CHAT_BLOCK:
    "chat.block",

  CHAT_UNBLOCK:
    "chat.unblock",

  SAVE:
    "save",

  UNSAVE:
    "unsave",

  SHARE:
    "share",

  FOLLOW:
    "follow",

  UNFOLLOW:
    "unfollow",

  NOTIFICATION_READ:
    "notification.read",

  NOTIFICATION_DELETE:
    "notification.delete",

  NOTIFICATION_SETTING_CHANGE:
    "notification.setting.change",

  PERMISSION_CHANGE:
    "permission.change",

  LEVEL_CHANGE:
    "level.change",

  SERVICE_CHANGE:
    "service.change",

  BLOCK:
    "participant.block",

  UNBLOCK:
    "participant.unblock",

  RESTORE:
    "participant.restore",

  CUSTOM_ACTION:
    "custom.action",

} as const;


/* ============================================================
   АУДИТ
   ============================================================ */

export enum ActingAuditType {
  SESSION_STARTED = "session_started",

  SESSION_ENDED = "session_ended",

  PROFILE_SWITCHED = "profile_switched",

  PROFILE_VIEWED = "profile_viewed",

  PROFILE_EDITED = "profile_edited",

  PUBLICATION_CREATED = "publication_created",

  PUBLICATION_EDITED = "publication_edited",

  PUBLICATION_DELETED = "publication_deleted",

  COMMENT_CREATED = "comment_created",

  COMMENT_EDITED = "comment_edited",

  COMMENT_DELETED = "comment_deleted",

  REACTION_CREATED = "reaction_created",

  REACTION_CHANGED = "reaction_changed",

  REACTION_DELETED = "reaction_deleted",

  REVIEW_CREATED = "review_created",

  REVIEW_EDITED = "review_edited",

  REVIEW_DELETED = "review_deleted",

  MESSAGE_SENT = "message_sent",

  MESSAGE_EDITED = "message_edited",

  MESSAGE_DELETED = "message_deleted",

  CHAT_CREATED = "chat_created",

  CHAT_CHANGED = "chat_changed",

  SERVICE_CHANGED = "service_changed",

  PERMISSION_CHANGED = "permission_changed",

  LEVEL_CHANGED = "level_changed",

  NOTIFICATION_CHANGED = "notification_changed",

  BLOCK_CHANGED = "block_changed",

  CUSTOM_ACTION = "custom_action",
}


/* ============================================================
   КОНТЕКСТ СЕССИИ
   ============================================================ */

export interface ActingModeContext {
  enabled: boolean;

  type: ActingModeType;

  status: ActingModeStatus;

  sessionId: string;

  realAdminId: string;

  realAdminSessionId: string;

  actingProfileId: string;

  previousProfileId?: string;

  startedAt: string;

  expiresAt?: string;

  lastActivityAt: string;

  requestId?: string;

  ipHash?: string;

  userAgentHash?: string;

  permissions: string[];

  metadata?: Record<string, unknown>;
}


/* ============================================================
   ЗАПРОС НА ЗАПУСК
   ============================================================ */

export interface StartActingModeRequest {
  participantId: string;

  durationSeconds?: number;

  reason?: string;

  source?: string;

  metadata?: Record<string, unknown>;
}


/* ============================================================
   ЗАПРОС НА ПЕРЕКЛЮЧЕНИЕ
   ============================================================ */

export interface SwitchActingProfileRequest {
  sessionId: string;

  participantId: string;

  reason?: string;
}


/* ============================================================
   ЗАПРОС НА ЗАВЕРШЕНИЕ
   ============================================================ */

export interface EndActingModeRequest {
  sessionId: string;

  reason?: string;
}


/* ============================================================
   РЕЗУЛЬТАТ ПРОВЕРКИ
   ============================================================ */

export interface ActingAuthorizationResult {
  allowed: boolean;

  isSuperAdmin: boolean;

  actingMode: boolean;

  realAdminId?: string;

  actingProfileId?: string;

  sessionId?: string;

  permission?: string;

  reason?: string;
}


/* ============================================================
   AUDIT RECORD
   ============================================================ */

export interface ActingAuditRecord {
  id: string;

  type: ActingAuditType;

  action: string;

  realAdminId: string;

  realAdminSessionId?: string;

  actingSessionId?: string;

  actingProfileId?: string;

  targetId?: string;

  targetType?: string;

  before?: unknown;

  after?: unknown;

  metadata?: Record<string, unknown>;

  ipHash?: string;

  userAgentHash?: string;

  requestId?: string;

  createdAt: string;
}


/* ============================================================
   ПОЛНЫЙ НАБОР ДЕЙСТВИЙ
   ============================================================ */

export const ALL_ACTING_PERMISSIONS = Object.values(
  ACTING_PERMISSIONS,
);


/* ============================================================
   SUPER ADMIN НЕ ДОЛЖЕН ПОЛУЧАТЬ УРЕЗАННЫЙ PARTICIPANT UI
   ============================================================ */

export const SUPERADMIN_ACTING_POLICY = {
  canUseParticipantInterface: true,

  canOpenAnyParticipant: true,

  canSwitchParticipant: true,

  canCreateContent: true,

  canEditContent: true,

  canDeleteContent: true,

  canRestoreContent: true,

  canSendMessages: true,

  canEditMessages: true,

  canDeleteMessages: true,

  canCreateComments: true,

  canEditComments: true,

  canDeleteComments: true,

  canAddReactions: true,

  canChangeReactions: true,

  canDeleteReactions: true,

  canCreateReviews: true,

  canEditReviews: true,

  canDeleteReviews: true,

  canShare: true,

  canSave: true,

  canFollow: true,

  canManageNotifications: true,

  canManageServices: true,

  canManagePermissions: true,

  canManageLevels: true,

  canManageProfile: true,

  canManageMedia: true,

  canManageChats: true,

  canManageParticipantSettings: true,

  canPerformAnyParticipantAction: true,

  artificialFeatureRestrictions: false,

  serverSideAuthorizationRequired: true,

  auditRequired: true,
} as const;


/* ============================================================
   ПРОВЕРКА: ЯВЛЯЕТСЯ ЛИ ДЕЙСТВИЕ ACTING ACTION
   ============================================================ */

export function isActingPermission(
  permission: string,
): boolean {
  return permission.startsWith("acting.");
}


/* ============================================================
   ПРОВЕРКА: РАЗРЕШЕНО ЛИ SUPER ADMIN
   ============================================================ */

export function isSuperAdminActingAllowed(
  isSuperAdmin: boolean,
): boolean {
  return (
    isSuperAdmin &&
    SUPERADMIN_ACTING_POLICY.canPerformAnyParticipantAction
  );
}


/* ============================================================
   НОРМАЛИЗАЦИЯ ДЛИТЕЛЬНОСТИ
   ============================================================ */

export function normalizeActingDuration(
  durationSeconds?: number,
): number {
  if (!Number.isFinite(durationSeconds)) {
    return ACTING_MODE.DEFAULT_DURATION_SECONDS;
  }

  return Math.max(
    60,
    Math.min(
      Math.floor(durationSeconds as number),
      ACTING_MODE.MAX_DURATION_SECONDS,
    ),
  );
}


/* ============================================================
   ПРОВЕРКА СРОКА
   ============================================================ */

export function isActingSessionExpired(
  expiresAt?: string,
  now = Date.now(),
): boolean {
  if (!expiresAt) {
    return false;
  }

  const timestamp = Date.parse(expiresAt);

  if (!Number.isFinite(timestamp)) {
    return true;
  }

  return timestamp <= now;
}


/* ============================================================
   СОЗДАНИЕ AUDIT METADATA
   ============================================================ */

export function createActingAuditMetadata(
  context: ActingModeContext,
  action: string,
): Record<string, unknown> {
  return {
    acting_mode: true,

    acting_session_id: context.sessionId,

    real_admin_id: context.realAdminId,

    real_admin_session_id:
      context.realAdminSessionId,

    acting_profile_id:
      context.actingProfileId,

    action,

    timestamp: new Date().toISOString(),
  };
}


/* ============================================================
   БЕЗОПАСНАЯ МОДЕЛЬ:

   Реальный администратор:
        ↓
   Admin Session
        ↓
   Acting Session
        ↓
   Selected Participant Profile
        ↓
   Participant Action

   При этом:

   realAdminId НЕ заменяется actingProfileId.

   actingProfileId используется только как
   профиль, от имени которого выполняется действие.

   Поэтому система всегда может установить:

   КТО реально выполнил действие
          +
   ОТ ИМЕНИ КОГО оно было выполнено
          +
   ЧТО именно было сделано.
   ============================================================ */
