// ============================================================
// 🇹🇯 TAJIK OPPORTUNITIES
// STATUS CONSTANTS
// Version: 2026.09
// ============================================================

/**
 * Все статусы и состояния платформы находятся в одном месте.
 *
 * ВАЖНО:
 * - значения должны совпадать со значениями, используемыми в D1;
 * - не удаляй старые статусы после запуска системы;
 * - новые статусы добавляй в конец соответствующей группы;
 * - статусы используются одновременно API, админ-панелью,
 *   уведомлениями, фильтрами и журналом действий.
 */

// ============================================================
// PUBLICATIONS
// ============================================================

export const PUBLICATION_STATUSES = {
  DRAFT: "draft",
  PENDING: "pending",
  PUBLISHED: "published",
  REJECTED: "rejected",
  HIDDEN: "hidden",
  DELETED: "deleted",
} as const;

export type PublicationStatus =
  typeof PUBLICATION_STATUSES[keyof typeof PUBLICATION_STATUSES];

export const PUBLICATION_STATUS_LABELS: Record<
  PublicationStatus,
  string
> = {
  draft: "Черновик",
  pending: "На модерации",
  published: "Опубликовано",
  rejected: "Отклонено",
  hidden: "Скрыто",
  deleted: "Удалено",
};

export const PUBLICATION_STATUS_LABELS_TJ: Record<
  PublicationStatus,
  string
> = {
  draft: "Лоиҳа",
  pending: "Дар санҷиш",
  published: "Нашр шудааст",
  rejected: "Рад карда шуд",
  hidden: "Пинҳон",
  deleted: "Нестшуда",
};

export const PUBLICATION_STATUS_DESCRIPTIONS: Record<
  PublicationStatus,
  string
> = {
  draft: "Публикация сохранена как черновик и ещё не отправлена на модерацию.",
  pending: "Публикация ожидает проверки администратора.",
  published: "Публикация доступна пользователям.",
  rejected: "Публикация была отклонена модератором или администратором.",
  hidden: "Публикация временно скрыта от обычных пользователей.",
  deleted: "Публикация удалена из публичного доступа.",
};

// ============================================================
// PUBLICATION EVENTS / WORKFLOW
// ============================================================

export const PUBLICATION_WORKFLOW_STATUSES = [
  PUBLICATION_STATUSES.DRAFT,
  PUBLICATION_STATUSES.PENDING,
  PUBLICATION_STATUSES.PUBLISHED,
  PUBLICATION_STATUSES.REJECTED,
  PUBLICATION_STATUSES.HIDDEN,
  PUBLICATION_STATUSES.DELETED,
] as const;

export const PUBLICATION_PUBLIC_STATUSES = [
  PUBLICATION_STATUSES.PUBLISHED,
] as const;

export const PUBLICATION_MODERATION_STATUSES = [
  PUBLICATION_STATUSES.PENDING,
  PUBLICATION_STATUSES.PUBLISHED,
  PUBLICATION_STATUSES.REJECTED,
  PUBLICATION_STATUSES.HIDDEN,
] as const;

// ============================================================
// COMMENTS
// ============================================================

export const COMMENT_STATUSES = {
  ACTIVE: "active",
  PENDING: "pending",
  HIDDEN: "hidden",
  DELETED: "deleted",
  FLAGGED: "flagged",
  BLOCKED: "blocked",
} as const;

export type CommentStatus =
  typeof COMMENT_STATUSES[keyof typeof COMMENT_STATUSES];

export const COMMENT_STATUS_LABELS: Record<
  CommentStatus,
  string
> = {
  active: "Активен",
  pending: "На проверке",
  hidden: "Скрыт",
  deleted: "Удалён",
  flagged: "Отмечен жалобой",
  blocked: "Заблокирован",
};

export const COMMENT_STATUS_LABELS_TJ: Record<
  CommentStatus,
  string
> = {
  active: "Фаъол",
  pending: "Дар санҷиш",
  hidden: "Пинҳон",
  deleted: "Нестшуда",
  flagged: "Бо шикоят қайд шудааст",
  blocked: "Баста шудааст",
};

// ============================================================
// REPORTS
// ============================================================

export const REPORT_STATUSES = {
  OPEN: "open",
  REVIEWING: "reviewing",
  CONFIRMED: "confirmed",
  REJECTED: "rejected",
  RESOLVED: "resolved",
  CLOSED: "closed",
  DELETED: "deleted",
} as const;

export type ReportStatus =
  typeof REPORT_STATUSES[keyof typeof REPORT_STATUSES];

export const REPORT_STATUS_LABELS: Record<
  ReportStatus,
  string
> = {
  open: "Новая",
  reviewing: "На рассмотрении",
  confirmed: "Подтверждена",
  rejected: "Отклонена",
  resolved: "Решена",
  closed: "Закрыта",
  deleted: "Удалена",
};

export const REPORT_STATUS_LABELS_TJ: Record<
  ReportStatus,
  string
> = {
  open: "Нав",
  reviewing: "Дар баррасӣ",
  confirmed: "Тасдиқшуда",
  rejected: "Радшуда",
  resolved: "Ҳалшуда",
  closed: "Пӯшида",
  deleted: "Нестшуда",
};

// ============================================================
// REPORT PRIORITY
// ============================================================

export const REPORT_PRIORITIES = {
  LOW: "low",
  NORMAL: "normal",
  HIGH: "high",
  URGENT: "urgent",
  CRITICAL: "critical",
} as const;

export type ReportPriority =
  typeof REPORT_PRIORITIES[keyof typeof REPORT_PRIORITIES];

export const REPORT_PRIORITY_LABELS: Record<
  ReportPriority,
  string
> = {
  low: "Низкий",
  normal: "Обычный",
  high: "Высокий",
  urgent: "Срочный",
  critical: "Критический",
};

// ============================================================
// REPORT TYPES
// ============================================================

export const REPORT_TYPES = {
  PUBLICATION: "publication",
  COMMENT: "comment",
  PROFILE: "profile",
  USER: "user",
  MESSAGE: "message",
  SPAM: "spam",
  FRAUD: "fraud",
  ABUSE: "abuse",
  COPYRIGHT: "copyright",
  PRIVACY: "privacy",
  OTHER: "other",
} as const;

export type ReportType =
  typeof REPORT_TYPES[keyof typeof REPORT_TYPES];

// ============================================================
// CHAT / CONVERSATIONS
// ============================================================

export const CONVERSATION_STATUSES = {
  OPEN: "open",
  PENDING: "pending",
  WAITING_USER: "waiting_user",
  WAITING_ADMIN: "waiting_admin",
  ACTIVE: "active",
  CLOSED: "closed",
  ARCHIVED: "archived",
  DELETED: "deleted",
  BLOCKED: "blocked",
} as const;

export type ConversationStatus =
  typeof CONVERSATION_STATUSES[
    keyof typeof CONVERSATION_STATUSES
  ];

export const CONVERSATION_STATUS_LABELS: Record<
  ConversationStatus,
  string
> = {
  open: "Открыт",
  pending: "Ожидает ответа",
  waiting_user: "Ожидает пользователя",
  waiting_admin: "Ожидает администратора",
  active: "Активен",
  closed: "Закрыт",
  archived: "Архив",
  deleted: "Удалён",
  blocked: "Заблокирован",
};

// ============================================================
// MESSAGE STATUSES
// ============================================================

export const MESSAGE_STATUSES = {
  SENT: "sent",
  DELIVERED: "delivered",
  READ: "read",
  EDITED: "edited",
  DELETED: "deleted",
  FAILED: "failed",
  BLOCKED: "blocked",
} as const;

export type MessageStatus =
  typeof MESSAGE_STATUSES[keyof typeof MESSAGE_STATUSES];

export const MESSAGE_STATUS_LABELS: Record<
  MessageStatus,
  string
> = {
  sent: "Отправлено",
  delivered: "Доставлено",
  read: "Прочитано",
  edited: "Изменено",
  deleted: "Удалено",
  failed: "Ошибка",
  blocked: "Заблокировано",
};

// ============================================================
// PARTICIPANTS / VISITORS
// ============================================================

export const PARTICIPANT_STATUSES = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  BLOCKED: "blocked",
  SUSPENDED: "suspended",
  DELETED: "deleted",
  ANONYMOUS: "anonymous",
} as const;

export type ParticipantStatus =
  typeof PARTICIPANT_STATUSES[
    keyof typeof PARTICIPANT_STATUSES
  ];

export const PARTICIPANT_STATUS_LABELS: Record<
  ParticipantStatus,
  string
> = {
  active: "Активен",
  inactive: "Неактивен",
  blocked: "Заблокирован",
  suspended: "Приостановлен",
  deleted: "Удалён",
  anonymous: "Анонимный",
};

// ============================================================
// PROFILE STATUSES
// ============================================================

export const PROFILE_STATUSES = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  BLOCKED: "blocked",
  SUSPENDED: "suspended",
  DELETED: "deleted",
} as const;

export type ProfileStatus =
  typeof PROFILE_STATUSES[keyof typeof PROFILE_STATUSES];

export const PROFILE_VISIBILITY = {
  PUBLIC: "public",
  PRIVATE: "private",
  HIDDEN: "hidden",
  ANONYMOUS: "anonymous",
} as const;

export type ProfileVisibility =
  typeof PROFILE_VISIBILITY[
    keyof typeof PROFILE_VISIBILITY
  ];

// ============================================================
// ADMIN STATUSES
// ============================================================

export const ADMIN_STATUSES = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  BLOCKED: "blocked",
  SUSPENDED: "suspended",
  DELETED: "deleted",
} as const;

export type AdminStatus =
  typeof ADMIN_STATUSES[keyof typeof ADMIN_STATUSES];

// ============================================================
// ADMIN SESSION STATUSES
// ============================================================

export const ADMIN_SESSION_STATUSES = {
  ACTIVE: "active",
  EXPIRED: "expired",
  REVOKED: "revoked",
  LOGGED_OUT: "logged_out",
  BLOCKED: "blocked",
} as const;

export type AdminSessionStatus =
  typeof ADMIN_SESSION_STATUSES[
    keyof typeof ADMIN_SESSION_STATUSES
  ];

// ============================================================
// USER SESSION STATUSES
// ============================================================

export const USER_SESSION_STATUSES = {
  ACTIVE: "active",
  EXPIRED: "expired",
  CLOSED: "closed",
  REVOKED: "revoked",
  BLOCKED: "blocked",
} as const;

export type UserSessionStatus =
  typeof USER_SESSION_STATUSES[
    keyof typeof USER_SESSION_STATUSES
  ];

// ============================================================
// NOTIFICATION STATUSES
// ============================================================

export const NOTIFICATION_STATUSES = {
  UNREAD: "unread",
  READ: "read",
  ARCHIVED: "archived",
  DELETED: "deleted",
} as const;

export type NotificationStatus =
  typeof NOTIFICATION_STATUSES[
    keyof typeof NOTIFICATION_STATUSES
  ];

// ============================================================
// NOTIFICATION TYPES
// ============================================================

export const NOTIFICATION_TYPES = {
  SYSTEM: "system",

  PUBLICATION_SUBMITTED: "publication_submitted",
  PUBLICATION_APPROVED: "publication_approved",
  PUBLICATION_REJECTED: "publication_rejected",
  PUBLICATION_PUBLISHED: "publication_published",
  PUBLICATION_HIDDEN: "publication_hidden",
  PUBLICATION_RESTORED: "publication_restored",
  PUBLICATION_UPDATED: "publication_updated",

  COMMENT_CREATED: "comment_created",
  COMMENT_REPLY: "comment_reply",
  COMMENT_UPDATED: "comment_updated",
  COMMENT_DELETED: "comment_deleted",

  REACTION: "reaction",
  LIKE: "like",
  BOOKMARK: "bookmark",
  SHARE: "share",

  REPORT_CREATED: "report_created",
  REPORT_UPDATED: "report_updated",
  REPORT_RESOLVED: "report_resolved",

  CHAT_MESSAGE: "chat_message",
  CHAT_ASSIGNED: "chat_assigned",
  CHAT_CLOSED: "chat_closed",

  PROFILE_UPDATED: "profile_updated",
  ACCOUNT_BLOCKED: "account_blocked",
  ACCOUNT_UNBLOCKED: "account_unblocked",

  ADMIN_MESSAGE: "admin_message",
  SECURITY: "security",
} as const;

export type NotificationType =
  typeof NOTIFICATION_TYPES[
    keyof typeof NOTIFICATION_TYPES
  ];

// ============================================================
// CATEGORY STATUSES
// ============================================================

export const CATEGORY_STATUSES = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  HIDDEN: "hidden",
  DELETED: "deleted",
} as const;

export type CategoryStatus =
  typeof CATEGORY_STATUSES[keyof typeof CATEGORY_STATUSES];

// ============================================================
// BOOKMARK STATUSES
// ============================================================

export const BOOKMARK_STATUSES = {
  ACTIVE: "active",
  REMOVED: "removed",
} as const;

export type BookmarkStatus =
  typeof BOOKMARK_STATUSES[keyof typeof BOOKMARK_STATUSES];

// ============================================================
// SHARE STATUSES
// ============================================================

export const SHARE_STATUSES = {
  CREATED: "created",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
} as const;

export type ShareStatus =
  typeof SHARE_STATUSES[keyof typeof SHARE_STATUSES];

// ============================================================
// REACTION STATUSES
// ============================================================

export const REACTION_STATUSES = {
  ACTIVE: "active",
  REMOVED: "removed",
} as const;

export type ReactionStatus =
  typeof REACTION_STATUSES[keyof typeof REACTION_STATUSES];

// ============================================================
// VIEW STATUSES
// ============================================================

export const VIEW_STATUSES = {
  RECORDED: "recorded",
  UNIQUE: "unique",
  DUPLICATE: "duplicate",
  BLOCKED: "blocked",
} as const;

export type ViewStatus =
  typeof VIEW_STATUSES[keyof typeof VIEW_STATUSES];

// ============================================================
// SEARCH STATUSES
// ============================================================

export const SEARCH_STATUSES = {
  COMPLETED: "completed",
  EMPTY: "empty",
  FAILED: "failed",
} as const;

export type SearchStatus =
  typeof SEARCH_STATUSES[keyof typeof SEARCH_STATUSES];

// ============================================================
// FEATURE FLAG STATUSES
// ============================================================

export const FEATURE_FLAG_STATUSES = {
  ENABLED: "enabled",
  DISABLED: "disabled",
} as const;

export type FeatureFlagStatus =
  typeof FEATURE_FLAG_STATUSES[
    keyof typeof FEATURE_FLAG_STATUSES
  ];

// ============================================================
// SYSTEM / MAINTENANCE STATUSES
// ============================================================

export const SYSTEM_STATUSES = {
  ONLINE: "online",
  MAINTENANCE: "maintenance",
  READ_ONLY: "read_only",
  DEGRADED: "degraded",
  OFFLINE: "offline",
} as const;

export type SystemStatus =
  typeof SYSTEM_STATUSES[keyof typeof SYSTEM_STATUSES];

// ============================================================
// MODERATION ACTIONS
// ============================================================

export const MODERATION_ACTIONS = {
  APPROVE: "approve",
  REJECT: "reject",
  PUBLISH: "publish",
  UNPUBLISH: "unpublish",
  HIDE: "hide",
  RESTORE: "restore",
  DELETE: "delete",
  BLOCK: "block",
  UNBLOCK: "unblock",
  SUSPEND: "suspend",
  UNSUSPEND: "unsuspend",
  EDIT: "edit",
  ASSIGN: "assign",
  UNASSIGN: "unassign",
  CLOSE: "close",
  REOPEN: "reopen",
} as const;

export type ModerationAction =
  typeof MODERATION_ACTIONS[
    keyof typeof MODERATION_ACTIONS
  ];

// ============================================================
// STATUS HELPERS
// ============================================================

export function isPublicationPublic(
  status: PublicationStatus
): boolean {
  return status === PUBLICATION_STATUSES.PUBLISHED;
}

export function isPublicationDeleted(
  status: PublicationStatus
): boolean {
  return status === PUBLICATION_STATUSES.DELETED;
}

export function isPublicationHidden(
  status: PublicationStatus
): boolean {
  return status === PUBLICATION_STATUSES.HIDDEN;
}

export function isPublicationPending(
  status: PublicationStatus
): boolean {
  return status === PUBLICATION_STATUSES.PENDING;
}

export function isPublicationRejected(
  status: PublicationStatus
): boolean {
  return status === PUBLICATION_STATUSES.REJECTED;
}

export function isCommentVisible(
  status: CommentStatus
): boolean {
  return status === COMMENT_STATUSES.ACTIVE;
}

export function isReportOpen(
  status: ReportStatus
): boolean {
  return (
    status === REPORT_STATUSES.OPEN ||
    status === REPORT_STATUSES.REVIEWING
  );
}

export function isConversationOpen(
  status: ConversationStatus
): boolean {
  return (
    status === CONVERSATION_STATUSES.OPEN ||
    status === CONVERSATION_STATUSES.PENDING ||
    status === CONVERSATION_STATUSES.WAITING_USER ||
    status === CONVERSATION_STATUSES.WAITING_ADMIN ||
    status === CONVERSATION_STATUSES.ACTIVE
  );
}

export function isMessageVisible(
  status: MessageStatus
): boolean {
  return (
    status !== MESSAGE_STATUSES.DELETED &&
    status !== MESSAGE_STATUSES.BLOCKED
  );
}

// ============================================================
// VALIDATION ARRAYS
// ============================================================

export const ALL_PUBLICATION_STATUSES =
  Object.values(PUBLICATION_STATUSES);

export const ALL_COMMENT_STATUSES =
  Object.values(COMMENT_STATUSES);

export const ALL_REPORT_STATUSES =
  Object.values(REPORT_STATUSES);

export const ALL_REPORT_PRIORITIES =
  Object.values(REPORT_PRIORITIES);

export const ALL_CONVERSATION_STATUSES =
  Object.values(CONVERSATION_STATUSES);

export const ALL_MESSAGE_STATUSES =
  Object.values(MESSAGE_STATUSES);

export const ALL_PARTICIPANT_STATUSES =
  Object.values(PARTICIPANT_STATUSES);

export const ALL_PROFILE_STATUSES =
  Object.values(PROFILE_STATUSES);

export const ALL_PROFILE_VISIBILITIES =
  Object.values(PROFILE_VISIBILITY);

export const ALL_ADMIN_STATUSES =
  Object.values(ADMIN_STATUSES);

export const ALL_ADMIN_SESSION_STATUSES =
  Object.values(ADMIN_SESSION_STATUSES);

export const ALL_USER_SESSION_STATUSES =
  Object.values(USER_SESSION_STATUSES);

export const ALL_NOTIFICATION_STATUSES =
  Object.values(NOTIFICATION_STATUSES);

export const ALL_NOTIFICATION_TYPES =
  Object.values(NOTIFICATION_TYPES);

export const ALL_CATEGORY_STATUSES =
  Object.values(CATEGORY_STATUSES);

export const ALL_REACTION_STATUSES =
  Object.values(REACTION_STATUSES);

export const ALL_BOOKMARK_STATUSES =
  Object.values(BOOKMARK_STATUSES);

export const ALL_SHARE_STATUSES =
  Object.values(SHARE_STATUSES);

export const ALL_VIEW_STATUSES =
  Object.values(VIEW_STATUSES);

export const ALL_SYSTEM_STATUSES =
  Object.values(SYSTEM_STATUSES);

// ============================================================
// DEFAULTS
// ============================================================

export const DEFAULT_STATUSES = {
  publication: PUBLICATION_STATUSES.DRAFT,
  comment: COMMENT_STATUSES.ACTIVE,
  report: REPORT_STATUSES.OPEN,
  reportPriority: REPORT_PRIORITIES.NORMAL,
  conversation: CONVERSATION_STATUSES.OPEN,
  message: MESSAGE_STATUSES.SENT,
  participant: PARTICIPANT_STATUSES.ACTIVE,
  profile: PROFILE_STATUSES.ACTIVE,
  profileVisibility: PROFILE_VISIBILITY.PUBLIC,
  notification: NOTIFICATION_STATUSES.UNREAD,
  category: CATEGORY_STATUSES.ACTIVE,
  reaction: REACTION_STATUSES.ACTIVE,
  bookmark: BOOKMARK_STATUSES.ACTIVE,
  share: SHARE_STATUSES.CREATED,
  system: SYSTEM_STATUSES.ONLINE,
} as const;

// ============================================================
// STATUS TRANSITIONS
// ============================================================

export const PUBLICATION_STATUS_TRANSITIONS: Record<
  PublicationStatus,
  readonly PublicationStatus[]
> = {
  draft: [
    "draft",
    "pending",
    "deleted",
  ],

  pending: [
    "pending",
    "published",
    "rejected",
    "hidden",
    "deleted",
  ],

  published: [
    "published",
    "hidden",
    "rejected",
    "deleted",
  ],

  rejected: [
    "rejected",
    "draft",
    "pending",
    "deleted",
  ],

  hidden: [
    "hidden",
    "published",
    "rejected",
    "deleted",
  ],

  deleted: [
    "deleted",
    "draft",
  ],
};

export function canTransitionPublicationStatus(
  from: PublicationStatus,
  to: PublicationStatus
): boolean {
  return PUBLICATION_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

// ============================================================
// END
// ============================================================
