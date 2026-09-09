// ============================================================
// 🇹🇯 TAJIK OPPORTUNITIES
// REVIEW SYSTEM CONSTANTS
// Version: 2026.09.10
// ============================================================
//
// Центральный модуль констант и типов системы отзывов.
//
// Принципы:
// - стабильный public API;
// - backward compatibility;
// - строгая типизация;
// - минимум дублирования;
// - безопасные validators/normalizers;
// - единый lifecycle отзывов;
// - готовность к большим services/reviews.ts;
// - отсутствие зависимости от БД / HTTP / runtime.
//
// Этот файл содержит только:
// - constants;
// - literal types;
// - validators;
// - normalizers;
// - pure helpers.
//
// ============================================================

// ============================================================
// LANGUAGE
// ============================================================

export const REVIEW_LANGUAGES = {
  RU: "ru",
  TJ: "tj",
} as const;

export type ReviewLanguage =
  (typeof REVIEW_LANGUAGES)[keyof typeof REVIEW_LANGUAGES];

// ============================================================
// REVIEW TYPE
// ============================================================

export const REVIEW_TYPES = {
  REVIEW: "review",
  REPLY: "reply",
  COMMENT: "comment",
} as const;

export type ReviewType =
  (typeof REVIEW_TYPES)[keyof typeof REVIEW_TYPES];

// ============================================================
// REVIEW STATUS
// ============================================================

export const REVIEW_STATUSES = {
  DRAFT: "draft",
  PENDING: "pending",
  PUBLISHED: "published",
  HIDDEN: "hidden",
  REJECTED: "rejected",
  DELETED: "deleted",
  ARCHIVED: "archived",
  SPAM: "spam",
} as const;

export type ReviewStatus =
  (typeof REVIEW_STATUSES)[keyof typeof REVIEW_STATUSES];

export type ReviewStatusValue =
  ReviewStatus;

// ============================================================
// STATUS COLLECTIONS
// ============================================================

export const REVIEW_PUBLIC_STATUSES = [
  REVIEW_STATUSES.PUBLISHED,
] as const;

export const REVIEW_VISIBLE_STATUSES = [
  REVIEW_STATUSES.PUBLISHED,
] as const;

export const REVIEW_MODERATION_STATUSES = [
  REVIEW_STATUSES.DRAFT,
  REVIEW_STATUSES.PENDING,
  REVIEW_STATUSES.PUBLISHED,
  REVIEW_STATUSES.HIDDEN,
  REVIEW_STATUSES.REJECTED,
  REVIEW_STATUSES.ARCHIVED,
  REVIEW_STATUSES.SPAM,
] as const;

export const REVIEW_DELETED_STATUSES = [
  REVIEW_STATUSES.DELETED,
] as const;

export const REVIEW_TERMINAL_STATUSES = [
  REVIEW_STATUSES.DELETED,
] as const;

// ============================================================
// STATUS LABELS
// ============================================================

export const REVIEW_STATUS_LABELS: Record<
  ReviewStatus,
  string
> = {
  draft: "Черновик",
  pending: "На модерации",
  published: "Опубликован",
  hidden: "Скрыт",
  rejected: "Отклонён",
  deleted: "Удалён",
  archived: "Архивирован",
  spam: "Спам",
};

export const REVIEW_STATUS_LABELS_TJ: Record<
  ReviewStatus,
  string
> = {
  draft: "Лоиҳа",
  pending: "Дар модератсия",
  published: "Нашршуда",
  hidden: "Пинҳон",
  rejected: "Радшуда",
  deleted: "Нестшуда",
  archived: "Бойгонӣ",
  spam: "Спам",
};

export const REVIEW_STATUS_DESCRIPTIONS: Record<
  ReviewStatus,
  string
> = {
  draft:
    "Отзыв находится в черновике и ещё не отправлен на публикацию.",

  pending:
    "Отзыв ожидает проверки модератором.",

  published:
    "Отзыв опубликован и доступен пользователям.",

  hidden:
    "Отзыв временно скрыт от публичного просмотра.",

  rejected:
    "Отзыв отклонён модерацией.",

  deleted:
    "Отзыв удалён.",

  archived:
    "Отзыв перенесён в архив.",

  spam:
    "Отзыв помечен как спам.",
};

// ============================================================
// STATUS TRANSITIONS
// ============================================================

export const REVIEW_STATUS_TRANSITIONS: Record<
  ReviewStatus,
  readonly ReviewStatus[]
> = {
  draft: [
    REVIEW_STATUSES.PENDING,
    REVIEW_STATUSES.DELETED,
  ],

  pending: [
    REVIEW_STATUSES.PUBLISHED,
    REVIEW_STATUSES.REJECTED,
    REVIEW_STATUSES.HIDDEN,
    REVIEW_STATUSES.SPAM,
    REVIEW_STATUSES.DELETED,
  ],

  published: [
    REVIEW_STATUSES.HIDDEN,
    REVIEW_STATUSES.SPAM,
    REVIEW_STATUSES.ARCHIVED,
    REVIEW_STATUSES.DELETED,
  ],

  hidden: [
    REVIEW_STATUSES.PUBLISHED,
    REVIEW_STATUSES.REJECTED,
    REVIEW_STATUSES.SPAM,
    REVIEW_STATUSES.ARCHIVED,
    REVIEW_STATUSES.DELETED,
  ],

  rejected: [
    REVIEW_STATUSES.PENDING,
    REVIEW_STATUSES.PUBLISHED,
    REVIEW_STATUSES.SPAM,
    REVIEW_STATUSES.ARCHIVED,
    REVIEW_STATUSES.DELETED,
  ],

  deleted: [
    REVIEW_STATUSES.PENDING,
    REVIEW_STATUSES.PUBLISHED,
    REVIEW_STATUSES.HIDDEN,
    REVIEW_STATUSES.ARCHIVED,
  ],

  archived: [
    REVIEW_STATUSES.PENDING,
    REVIEW_STATUSES.PUBLISHED,
    REVIEW_STATUSES.DELETED,
  ],

  spam: [
    REVIEW_STATUSES.PENDING,
    REVIEW_STATUSES.PUBLISHED,
    REVIEW_STATUSES.HIDDEN,
    REVIEW_STATUSES.ARCHIVED,
    REVIEW_STATUSES.DELETED,
  ],
};

// ============================================================
// REVIEW ACTIONS
// ============================================================

export const REVIEW_ACTIONS = {
  CREATE: "create",
  UPDATE: "update",
  EDIT: "edit",
  SUBMIT: "submit",

  APPROVE: "approve",
  REJECT: "reject",

  HIDE: "hide",
  SHOW: "show",

  DELETE: "delete",
  RESTORE: "restore",

  ARCHIVE: "archive",
  UNARCHIVE: "unarchive",

  PIN: "pin",
  UNPIN: "unpin",

  FEATURE: "feature",
  UNFEATURE: "unfeature",

  LOCK: "lock",
  UNLOCK: "unlock",

  SPAM: "spam",
  UNSPAM: "unspam",

  VERIFY: "verify",
  UNVERIFY: "unverify",

  MARK_HELPFUL: "mark_helpful",
  MARK_NOT_HELPFUL: "mark_not_helpful",

  ADD_REACTION: "add_reaction",
  REMOVE_REACTION: "remove_reaction",

  REPORT: "report",
  RESOLVE_REPORT: "resolve_report",
  REOPEN_REPORT: "reopen_report",

  RESTORE_FROM_BACKUP:
    "restore_from_backup",

  CHANGE_RATING:
    "change_rating",

  CHANGE_COUNTERS:
    "change_counters",

  CHANGE_AUTHOR:
    "change_author",

  CHANGE_DATE:
    "change_date",

  CHANGE_VISIBILITY:
    "change_visibility",

  CHANGE_SOURCE:
    "change_source",

  CHANGE_TARGET:
    "change_target",

  CHANGE_VERIFICATION:
    "change_verification",
} as const;

export type ReviewAction =
  (typeof REVIEW_ACTIONS)[keyof typeof REVIEW_ACTIONS];

// ============================================================
// TARGET TYPES
// ============================================================

export const REVIEW_TARGET_TYPES = {
  PUBLICATION: "publication",
  PROFILE: "profile",
  ORGANIZATION: "organization",
  USER: "user",
  COMPANY: "company",
  SERVICE: "service",
  EVENT: "event",
  COURSE: "course",
  OPPORTUNITY: "opportunity",
  PRODUCT: "product",
  PROJECT: "project",
  COMMUNITY: "community",
  BOT: "bot",
  CHANNEL: "channel",
  GROUP: "group",
  OTHER: "other",
} as const;

export type ReviewTargetType =
  (typeof REVIEW_TARGET_TYPES)[keyof typeof REVIEW_TARGET_TYPES];

// ============================================================
// AUTHOR MODES
// ============================================================

export const REVIEW_AUTHOR_MODES = {
  PUBLIC: "public",
  ANONYMOUS: "anonymous",
  HIDDEN: "hidden",
} as const;

export type ReviewAuthorMode =
  (typeof REVIEW_AUTHOR_MODES)[keyof typeof REVIEW_AUTHOR_MODES];

// ============================================================
// VISIBILITY
// ============================================================

export const REVIEW_VISIBILITY = {
  PUBLIC: "public",
  UNLISTED: "unlisted",
  HIDDEN: "hidden",
} as const;

export type ReviewVisibility =
  (typeof REVIEW_VISIBILITY)[keyof typeof REVIEW_VISIBILITY];

// ============================================================
// FEATURE STATES
// ============================================================

export const REVIEW_FEATURE_STATES = {
  NORMAL: "normal",
  FEATURED: "featured",
  PINNED: "pinned",
} as const;

export type ReviewFeatureState =
  (typeof REVIEW_FEATURE_STATES)[keyof typeof REVIEW_FEATURE_STATES];

// ============================================================
// RATINGS
// ============================================================

export const REVIEW_RATINGS = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
} as const;

export type ReviewRating =
  (typeof REVIEW_RATINGS)[keyof typeof REVIEW_RATINGS];

export const REVIEW_RATING_VALUES: ReviewRating[] = [
  1,
  2,
  3,
  4,
  5,
];

export const REVIEW_RATING_LABELS: Record<
  ReviewRating,
  string
> = {
  1: "1 звезда",
  2: "2 звезды",
  3: "3 звезды",
  4: "4 звезды",
  5: "5 звёзд",
};

export const REVIEW_RATING_LABELS_TJ: Record<
  ReviewRating,
  string
> = {
  1: "1 ситора",
  2: "2 ситора",
  3: "3 ситора",
  4: "4 ситора",
  5: "5 ситора",
};

export const REVIEW_RATING_DESCRIPTIONS: Record<
  ReviewRating,
  string
> = {
  1: "Очень плохо",
  2: "Плохо",
  3: "Удовлетворительно",
  4: "Хорошо",
  5: "Отлично",
};

export const REVIEW_RATING_DESCRIPTIONS_TJ: Record<
  ReviewRating,
  string
> = {
  1: "Хеле бад",
  2: "Бад",
  3: "Қаноатбахш",
  4: "Хуб",
  5: "Аъло",
};

// ============================================================
// RATING WEIGHTS
// ============================================================

export const REVIEW_RATING_WEIGHTS = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
} as const;

// ============================================================
// RATING DISTRIBUTION
// ============================================================

export type ReviewRatingDistribution =
  Record<ReviewRating, number>;

export const REVIEW_RATING_DISTRIBUTION_KEYS = {
  1: "rating_1",
  2: "rating_2",
  3: "rating_3",
  4: "rating_4",
  5: "rating_5",
} as const;

export function createEmptyRatingDistribution():
  ReviewRatingDistribution {
  return {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
}

export const REVIEW_DEFAULT_RATING_DISTRIBUTION =
  createEmptyRatingDistribution();

export function normalizeRatingDistribution(
  value:
    | Partial<ReviewRatingDistribution>
    | null
    | undefined,
): ReviewRatingDistribution {
  return {
    1: normalizeCounter(value?.[1]),
    2: normalizeCounter(value?.[2]),
    3: normalizeCounter(value?.[3]),
    4: normalizeCounter(value?.[4]),
    5: normalizeCounter(value?.[5]),
  };
}

export function getRatingDistributionTotal(
  distribution:
    ReviewRatingDistribution,
): number {
  return (
    distribution[1] +
    distribution[2] +
    distribution[3] +
    distribution[4] +
    distribution[5]
  );
}

export function calculateRatingAverage(
  distribution:
    ReviewRatingDistribution,
): number {
  const total =
    getRatingDistributionTotal(
      distribution,
    );

  if (total <= 0) {
    return 0;
  }

  const weighted =
    distribution[1] * 1 +
    distribution[2] * 2 +
    distribution[3] * 3 +
    distribution[4] * 4 +
    distribution[5] * 5;

  return Number(
    (weighted / total).toFixed(2),
  );
}

export function addRatingToDistribution(
  distribution:
    ReviewRatingDistribution,
  rating: ReviewRating,
  amount = 1,
): ReviewRatingDistribution {
  return {
    ...distribution,
    [rating]:
      distribution[rating] +
      normalizeCounter(amount),
  };
}

export function removeRatingFromDistribution(
  distribution:
    ReviewRatingDistribution,
  rating: ReviewRating,
  amount = 1,
): ReviewRatingDistribution {
  return {
    ...distribution,
    [rating]: Math.max(
      0,
      distribution[rating] -
        normalizeCounter(amount),
    ),
  };
}

export function getRatingPercentage(
  distribution:
    ReviewRatingDistribution,
  rating: ReviewRating,
): number {
  const total =
    getRatingDistributionTotal(
      distribution,
    );

  if (total <= 0) {
    return 0;
  }

  return Number(
    (
      (distribution[rating] /
        total) *
      100
    ).toFixed(2),
  );
}

// ============================================================
// SOURCES
// ============================================================

export const REVIEW_SOURCE_TYPES = {
  WEBSITE: "website",
  ADMIN: "admin",
  IMPORT: "import",
  API: "api",
  MIGRATION: "migration",
  SYSTEM: "system",
  INTERNAL: "internal",
  MODERATION: "moderation",
  BOT: "bot",
  MOBILE: "mobile",
  TELEGRAM: "telegram",
  WEBHOOK: "webhook",
  PARTNER: "partner",
} as const;

export type ReviewSourceType =
  (typeof REVIEW_SOURCE_TYPES)[keyof typeof REVIEW_SOURCE_TYPES];

// Compatibility aliases.
export const REVIEW_SOURCES =
  REVIEW_SOURCE_TYPES;

export type ReviewSource =
  ReviewSourceType;

// ============================================================
// VERIFICATION
// ============================================================

export const REVIEW_VERIFICATION_STATES = {
  UNVERIFIED: "unverified",
  VERIFIED: "verified",
  ADMIN_VERIFIED: "admin_verified",
  AUTOMATICALLY_VERIFIED:
    "automatically_verified",
  EMPLOYMENT_VERIFIED:
    "employment_verified",
} as const;

export type ReviewVerificationState =
  (typeof REVIEW_VERIFICATION_STATES)[keyof typeof REVIEW_VERIFICATION_STATES];

export const REVIEW_VERIFICATION_TYPES =
  REVIEW_VERIFICATION_STATES;

export type ReviewVerificationType =
  ReviewVerificationState;

// ============================================================
// SORTING
// ============================================================

export const REVIEW_SORTS = {
  NEWEST: "newest",
  OLDEST: "oldest",

  HIGHEST_RATING:
    "highest_rating",

  LOWEST_RATING:
    "lowest_rating",

  MOST_HELPFUL:
    "most_helpful",

  MOST_REACTIONS:
    "most_reactions",

  MOST_REPORTED:
    "most_reported",

  MOST_DISCUSSION:
    "most_discussion",

  FEATURED:
    "featured",

  PINNED:
    "pinned",
} as const;

export type ReviewSort =
  (typeof REVIEW_SORTS)[keyof typeof REVIEW_SORTS];

export const REVIEW_SORT_DIRECTIONS = {
  ASC: "asc",
  DESC: "desc",
} as const;

export type ReviewSortDirection =
  (typeof REVIEW_SORT_DIRECTIONS)[keyof typeof REVIEW_SORT_DIRECTIONS];

export const REVIEW_SORT_FIELD_MAP: Record<
  ReviewSort,
  string
> = {
  newest: "created_at",
  oldest: "created_at",
  highest_rating: "rating",
  lowest_rating: "rating",
  most_helpful: "helpful_count",
  most_reactions: "reactions_count",
  most_reported: "reports_count",
  most_discussion: "replies_count",
  featured: "featured",
  pinned: "pinned",
};

// ============================================================
// REPORT TYPES
// ============================================================

export const REVIEW_REPORT_TYPES = {
  SPAM: "spam",
  ABUSE: "abuse",
  HARASSMENT: "harassment",
  HATE: "hate",

  FALSE_INFORMATION:
    "false_information",

  ADVERTISEMENT:
    "advertisement",

  PERSONAL_DATA:
    "personal_data",

  COPYRIGHT:
    "copyright",

  OFF_TOPIC:
    "off_topic",

  DUPLICATE:
    "duplicate",

  FAKE_REVIEW:
    "fake_review",

  MANIPULATED_RATING:
    "manipulated_rating",

  OTHER: "other",
} as const;

export type ReviewReportType =
  (typeof REVIEW_REPORT_TYPES)[keyof typeof REVIEW_REPORT_TYPES];

// ============================================================
// REPORT STATUS
// ============================================================

export const REVIEW_REPORT_STATUSES = {
  OPEN: "open",
  UNDER_REVIEW: "under_review",
  RESOLVED: "resolved",
  REJECTED: "rejected",
  DISMISSED: "dismissed",
  ESCALATED: "escalated",
} as const;

export type ReviewReportStatus =
  (typeof REVIEW_REPORT_STATUSES)[keyof typeof REVIEW_REPORT_STATUSES];

// ============================================================
// REPORT PRIORITIES
// ============================================================

export const REVIEW_REPORT_PRIORITIES = {
  LOW: "low",
  NORMAL: "normal",
  HIGH: "high",
  CRITICAL: "critical",
} as const;

export type ReviewReportPriority =
  (typeof REVIEW_REPORT_PRIORITIES)[keyof typeof REVIEW_REPORT_PRIORITIES];

// ============================================================
// REPORT ACTIONS
// ============================================================

export const REVIEW_REPORT_ACTIONS = {
  REVIEW: "review",
  HIDE_REVIEW: "hide_review",
  DELETE_REVIEW: "delete_review",
  RESTORE_REVIEW: "restore_review",
  WARN_AUTHOR: "warn_author",
  BAN_AUTHOR: "ban_author",
  DISMISS: "dismiss",
  ESCALATE: "escalate",
  RESOLVE: "resolve",
} as const;

export type ReviewReportAction =
  (typeof REVIEW_REPORT_ACTIONS)[keyof typeof REVIEW_REPORT_ACTIONS];

// ============================================================
// MODERATION ACTIONS
// ============================================================
//
// REVIEW намеренно присутствует: старый сервис использует
// REVIEW как действие постановки жалобы/объекта на модерацию.
// ============================================================

export const REVIEW_MODERATION_ACTIONS = {
  REVIEW: "review",

  APPROVE: "approve",
  REJECT: "reject",

  HIDE: "hide",
  SHOW: "show",

  SPAM: "spam",
  UNSPAM: "unspam",

  DELETE: "delete",
  RESTORE: "restore",

  ARCHIVE: "archive",
  UNARCHIVE: "unarchive",

  PIN: "pin",
  UNPIN: "unpin",

  FEATURE: "feature",
  UNFEATURE: "unfeature",

  LOCK: "lock",
  UNLOCK: "unlock",

  VERIFY: "verify",
  UNVERIFY: "unverify",

  EDIT: "edit",
} as const;

export type ReviewModerationAction =
  (typeof REVIEW_MODERATION_ACTIONS)[keyof typeof REVIEW_MODERATION_ACTIONS];

// ============================================================
// MODERATION REASONS
// ============================================================

export const REVIEW_MODERATION_REASONS = {
  SPAM: "spam",
  ABUSE: "abuse",
  HARASSMENT: "harassment",
  HATE: "hate",

  FALSE_INFORMATION:
    "false_information",

  ADVERTISEMENT:
    "advertisement",

  PERSONAL_DATA:
    "personal_data",

  OFF_TOPIC:
    "off_topic",

  DUPLICATE:
    "duplicate",

  FAKE_REVIEW:
    "fake_review",

  MANIPULATION:
    "rating_manipulation",

  LOW_QUALITY:
    "low_quality",

  POLICY_VIOLATION:
    "policy_violation",

  OTHER: "other",
} as const;

export type ReviewModerationReason =
  (typeof REVIEW_MODERATION_REASONS)[keyof typeof REVIEW_MODERATION_REASONS];

// ============================================================
// REACTIONS
// ============================================================

export const REVIEW_REACTION_TARGETS = {
  REVIEW: "review",
  REPLY: "reply",
} as const;

export type ReviewReactionTarget =
  (typeof REVIEW_REACTION_TARGETS)[keyof typeof REVIEW_REACTION_TARGETS];

export const REVIEW_REACTION_TYPES = {
  LIKE: "like",
  HELPFUL: "helpful",
  THANKS: "thanks",
  SUPPORT: "support",
  INTERESTING: "interesting",
} as const;

export type ReviewReactionType =
  (typeof REVIEW_REACTION_TYPES)[keyof typeof REVIEW_REACTION_TYPES];

// ============================================================
// METRICS
// ============================================================

export const REVIEW_METRICS = {
  TOTAL: "total",

  PUBLISHED: "published",
  PENDING: "pending",
  HIDDEN: "hidden",
  REJECTED: "rejected",
  DELETED: "deleted",
  SPAM: "spam",

  TOTAL_RATINGS:
    "total_ratings",

  RATING_SUM:
    "rating_sum",

  RATING_AVERAGE:
    "rating_average",

  RATING_1:
    "rating_1",

  RATING_2:
    "rating_2",

  RATING_3:
    "rating_3",

  RATING_4:
    "rating_4",

  RATING_5:
    "rating_5",

  TOTAL_REACTIONS:
    "total_reactions",

  TOTAL_HELPFUL:
    "total_helpful",

  TOTAL_NOT_HELPFUL:
    "total_not_helpful",

  TOTAL_REPORTS:
    "total_reports",

  TOTAL_REPLIES:
    "total_replies",

  TOTAL_VIEWS:
    "total_views",

  TOTAL_SHARES:
    "total_shares",

  VERIFIED_REVIEWS:
    "verified_reviews",

  ANONYMOUS_REVIEWS:
    "anonymous_reviews",

  FEATURED_REVIEWS:
    "featured_reviews",

  PINNED_REVIEWS:
    "pinned_reviews",

  SPAM_REVIEWS:
    "spam_reviews",
} as const;

export type ReviewMetric =
  (typeof REVIEW_METRICS)[keyof typeof REVIEW_METRICS];

export const REVIEW_METRIC_KEYS: ReviewMetric[] =
  Object.values(
    REVIEW_METRICS,
  );

// ============================================================
// COUNTERS
// ============================================================

export const REVIEW_COUNTER_FIELDS = {
  VIEWS: "views_count",
  HELPFUL: "helpful_count",
  NOT_HELPFUL: "not_helpful_count",
  REACTIONS: "reactions_count",
  REPORTS: "reports_count",
  REPLIES: "replies_count",
  SHARES: "shares_count",
} as const;

export type ReviewCounterField =
  (typeof REVIEW_COUNTER_FIELDS)[keyof typeof REVIEW_COUNTER_FIELDS];

// ============================================================
// FILTERS
// ============================================================

export const REVIEW_FILTERS = {
  STATUS: "status",
  RATING: "rating",

  TARGET_TYPE: "target_type",
  TARGET_ID: "target_id",

  AUTHOR_ID: "author_id",
  AUTHOR_MODE: "author_mode",

  VERIFIED: "verified",
  FEATURED: "featured",
  PINNED: "pinned",

  VISIBILITY: "visibility",
  SOURCE: "source",

  HAS_REPLIES: "has_replies",
  HAS_REPORTS: "has_reports",

  CREATED_FROM: "created_from",
  CREATED_TO: "created_to",

  UPDATED_FROM: "updated_from",
  UPDATED_TO: "updated_to",

  SEARCH: "search",
} as const;

export type ReviewFilter =
  (typeof REVIEW_FILTERS)[keyof typeof REVIEW_FILTERS];

// ============================================================
// SEARCH FIELDS
// ============================================================

export const REVIEW_SEARCH_FIELDS = [
  "title",
  "text",
  "author_name",
  "publication_title",
  "profile_name",
  "target_name",
  "reply_text",
] as const;

export type ReviewSearchField =
  (typeof REVIEW_SEARCH_FIELDS)[number];

// ============================================================
// ADMIN EDITABLE FIELDS
// ============================================================

export const REVIEW_EDITABLE_ADMIN_FIELDS = [
  "title",
  "text",
  "rating",

  "status",
  "visibility",

  "author_mode",
  "author_id",
  "author_name",

  "verified",
  "featured",
  "pinned",

  "created_at",
  "updated_at",

  "views_count",
  "helpful_count",
  "not_helpful_count",
  "reactions_count",
  "reports_count",
  "replies_count",
  "shares_count",

  "source",
] as const;

export type ReviewEditableAdminField =
  (typeof REVIEW_EDITABLE_ADMIN_FIELDS)[number];

// ============================================================
// HISTORY ACTIONS
// ============================================================

export const REVIEW_HISTORY_ACTIONS = {
  CREATED: "created",

  UPDATED: "updated",
  EDITED: "edited",

  SUBMITTED: "submitted",

  APPROVED: "approved",
  REJECTED: "rejected",

  HIDDEN: "hidden",
  SHOWN: "shown",

  DELETED: "deleted",
  RESTORED: "restored",

  ARCHIVED: "archived",

  PINNED: "pinned",
  UNPINNED: "unpinned",

  FEATURED: "featured",
  UNFEATURED: "unfeatured",

  SPAMMED: "spammed",
  UNSPAMMED: "unspammed",

  STATUS_CHANGED:
    "status_changed",

  RATING_CHANGED:
    "rating_changed",

  AUTHOR_CHANGED:
    "author_changed",

  VISIBILITY_CHANGED:
    "visibility_changed",

  SOURCE_CHANGED:
    "source_changed",

  COUNTER_CHANGED:
    "counter_changed",

  REACTION_CHANGED:
    "reaction_changed",

  MODERATION:
    "moderation",

  VERIFIED:
    "verified",

  UNVERIFIED:
    "unverified",

  LOCKED:
    "locked",

  UNLOCKED:
    "unlocked",

  TARGET_CHANGED:
    "target_changed",
} as const;

export type ReviewHistoryAction =
  (typeof REVIEW_HISTORY_ACTIONS)[keyof typeof REVIEW_HISTORY_ACTIONS];

// ============================================================
// BULK ACTIONS
// ============================================================

export const REVIEW_BULK_ACTIONS = {
  APPROVE: "approve",
  REJECT: "reject",

  HIDE: "hide",
  SHOW: "show",

  DELETE: "delete",
  RESTORE: "restore",

  ARCHIVE: "archive",

  PIN: "pin",
  UNPIN: "unpin",

  FEATURE: "feature",
  UNFEATURE: "unfeature",

  VERIFY: "verify",
  UNVERIFY: "unverify",

  SPAM: "spam",
  UNSPAM: "unspam",
} as const;

export type ReviewBulkAction =
  (typeof REVIEW_BULK_ACTIONS)[keyof typeof REVIEW_BULK_ACTIONS];

// ============================================================
// EVENT TYPES
// ============================================================

export const REVIEW_EVENT_TYPES = {
  CREATED: "created",
  UPDATED: "updated",
  SUBMITTED: "submitted",

  APPROVED: "approved",
  REJECTED: "rejected",

  HIDDEN: "hidden",
  SHOWN: "shown",

  DELETED: "deleted",
  RESTORED: "restored",

  ARCHIVED: "archived",

  PINNED: "pinned",
  UNPINNED: "unpinned",

  FEATURED: "featured",
  UNFEATURED: "unfeatured",

  SPAMMED: "spammed",
  UNSPAMMED: "unspammed",

  RATING_CHANGED:
    "rating_changed",

  REACTION_ADDED:
    "reaction_added",

  REACTION_REMOVED:
    "reaction_removed",

  REPORT_CREATED:
    "report_created",

  REPORT_RESOLVED:
    "report_resolved",

  REPORT_REJECTED:
    "report_rejected",

  REPLY_CREATED:
    "reply_created",

  COUNTERS_CHANGED:
    "counters_changed",

  AUTHOR_CHANGED:
    "author_changed",

  VISIBILITY_CHANGED:
    "visibility_changed",

  SOURCE_CHANGED:
    "source_changed",

  VERIFIED:
    "verified",

  UNVERIFIED:
    "unverified",

  LOCKED:
    "locked",

  UNLOCKED:
    "unlocked",

  TARGET_CHANGED:
    "target_changed",
} as const;

export type ReviewEventType =
  (typeof REVIEW_EVENT_TYPES)[keyof typeof REVIEW_EVENT_TYPES];

// ============================================================
// NOTIFICATIONS
// ============================================================

export const REVIEW_NOTIFICATION_EVENTS = {
  NEW_REVIEW:
    "new_review",

  REVIEW_UPDATED:
    "review_updated",

  REVIEW_APPROVED:
    "review_approved",

  REVIEW_REJECTED:
    "review_rejected",

  REVIEW_HIDDEN:
    "review_hidden",

  REVIEW_REPLY:
    "review_reply",

  REVIEW_REACTION:
    "review_reaction",

  REVIEW_REPORT:
    "review_report",

  REVIEW_MENTION:
    "review_mention",

  REVIEW_FEATURED:
    "review_featured",

  REVIEW_PINNED:
    "review_pinned",

  REVIEW_VERIFIED:
    "review_verified",

  REVIEW_RESTORED:
    "review_restored",
} as const;

export type ReviewNotificationEvent =
  (typeof REVIEW_NOTIFICATION_EVENTS)[keyof typeof REVIEW_NOTIFICATION_EVENTS];

// ============================================================
// PERMISSIONS
// ============================================================

export const REVIEW_PERMISSIONS = {
  VIEW:
    "reviews.view",

  VIEW_HIDDEN:
    "reviews.view_hidden",

  VIEW_DELETED:
    "reviews.view_deleted",

  CREATE:
    "reviews.create",

  EDIT:
    "reviews.edit",

  DELETE:
    "reviews.delete",

  RESTORE:
    "reviews.restore",

  MODERATE:
    "reviews.moderate",

  APPROVE:
    "reviews.approve",

  REJECT:
    "reviews.reject",

  HIDE:
    "reviews.hide",

  SHOW:
    "reviews.show",

  PIN:
    "reviews.pin",

  FEATURE:
    "reviews.feature",

  REPLY:
    "reviews.reply",

  REACTIONS_VIEW:
    "reviews.reactions.view",

  REACTIONS_MANAGE:
    "reviews.reactions.manage",

  REPORTS_VIEW:
    "reviews.reports.view",

  REPORTS_MANAGE:
    "reviews.reports.manage",

  RATINGS_VIEW:
    "reviews.ratings.view",

  RATINGS_MANAGE:
    "reviews.ratings.manage",

  METRICS_VIEW:
    "reviews.metrics.view",

  METRICS_MANAGE:
    "reviews.metrics.manage",

  COUNTERS_VIEW:
    "reviews.counters.view",

  COUNTERS_MANAGE:
    "reviews.counters.manage",

  AUTHOR_MANAGE:
    "reviews.author.manage",

  DATE_MANAGE:
    "reviews.date.manage",

  HISTORY_VIEW:
    "reviews.history.view",

  EXPORT:
    "reviews.export",

  IMPORT:
    "reviews.import",

  BULK_MANAGE:
    "reviews.bulk.manage",

  FULL_CONTROL:
    "reviews.full_control",
} as const;

export type ReviewPermission =
  (typeof REVIEW_PERMISSIONS)[keyof typeof REVIEW_PERMISSIONS];

// ============================================================
// ADMIN ACTIONS
// ============================================================

export const REVIEW_ADMIN_ACTIONS = {
  APPROVE: "approve",
  REJECT: "reject",

  HIDE: "hide",
  SHOW: "show",

  DELETE: "delete",
  RESTORE: "restore",

  ARCHIVE: "archive",

  PIN: "pin",
  UNPIN: "unpin",

  FEATURE: "feature",
  UNFEATURE: "unfeature",

  LOCK: "lock",
  UNLOCK: "unlock",

  SPAM: "spam",
  UNSPAM: "unspam",

  EDIT_TEXT: "edit_text",
  EDIT_TITLE: "edit_title",
  EDIT_RATING: "edit_rating",
  EDIT_AUTHOR: "edit_author",
  EDIT_STATUS: "edit_status",
  EDIT_DATE: "edit_date",
  EDIT_VISIBILITY:
    "edit_visibility",

  SET_VIEWS: "set_views",
  SET_HELPFUL: "set_helpful",
  SET_NOT_HELPFUL:
    "set_not_helpful",

  SET_REACTIONS:
    "set_reactions",

  SET_REPORTS:
    "set_reports",

  SET_REPLIES:
    "set_replies",

  SET_SHARES:
    "set_shares",

  ADD_REACTION:
    "add_reaction",

  REMOVE_REACTION:
    "remove_reaction",

  VERIFY: "verify",
  UNVERIFY: "unverify",

  RESTORE_VERSION:
    "restore_version",

  VIEW_HISTORY:
    "view_history",

  EXPORT: "export",
} as const;

export type ReviewAdminAction =
  (typeof REVIEW_ADMIN_ACTIONS)[keyof typeof REVIEW_ADMIN_ACTIONS];

// ============================================================
// DEFAULTS
// ============================================================

export const REVIEW_DEFAULTS = {
  TYPE:
    REVIEW_TYPES.REVIEW,

  STATUS:
    REVIEW_STATUSES.PENDING,

  AUTHOR_MODE:
    REVIEW_AUTHOR_MODES.PUBLIC,

  VISIBILITY:
    REVIEW_VISIBILITY.PUBLIC,

  RATING:
    REVIEW_RATINGS.FIVE,

  SOURCE:
    REVIEW_SOURCE_TYPES.WEBSITE,

  VERIFICATION:
    REVIEW_VERIFICATION_STATES.UNVERIFIED,

  PAGE: 1,

  LIMIT: 20,

  MAX_LIMIT: 100,

  MIN_TITLE_LENGTH: 2,

  MAX_TITLE_LENGTH: 200,

  MIN_TEXT_LENGTH: 1,

  MAX_TEXT_LENGTH: 5000,

  MAX_IMAGES: 10,

  MAX_REPLIES: 100,

  MAX_MENTIONS: 20,

  MAX_LINKS: 20,
} as const;

// ============================================================
// LIMITS
// ============================================================

export const REVIEW_LIMITS = {
  TITLE_MIN: 2,
  TITLE_MAX: 200,

  TEXT_MIN: 1,
  TEXT_MAX: 5000,

  SHORT_TEXT_MAX: 500,
  PREVIEW_MAX: 300,

  IMAGES_MAX: 10,

  REPLIES_MAX: 100,
  REPLY_MAX: 100,

  MENTIONS_MAX: 20,
  LINKS_MAX: 20,

  REACTIONS_PER_REVIEW:
    1_000_000_000,

  REPORTS_PER_REVIEW:
    1_000_000_000,

  EDIT_WINDOW_MINUTES:
    60 * 24 * 7,

  MIN_RATING: 1,
  MAX_RATING: 5,

  PAGE_MAX: 100,

  MAX_HISTORY_ENTRIES:
    10_000,

  MAX_EXPORT_ROWS:
    100_000,
} as const;

// ============================================================
// SEARCH LIMITS
// ============================================================

export const REVIEW_SEARCH_LIMITS = {
  MIN_QUERY_LENGTH: 1,
  MAX_QUERY_LENGTH: 200,
  MAX_RESULTS: 100,
  MAX_TERMS: 20,
} as const;

// ============================================================
// REPORT DEFAULTS
// ============================================================

export const REVIEW_REPORT_DEFAULTS = {
  STATUS:
    REVIEW_REPORT_STATUSES.OPEN,

  PRIORITY:
    REVIEW_REPORT_PRIORITIES.NORMAL,

  TYPE:
    REVIEW_REPORT_TYPES.OTHER,
} as const;

// ============================================================
// MODERATION DEFAULTS
// ============================================================

export const REVIEW_MODERATION_DEFAULTS = {
  STATUS:
    REVIEW_STATUSES.PENDING,

  ACTION:
    REVIEW_MODERATION_ACTIONS.REVIEW,

  REASON:
    REVIEW_MODERATION_REASONS.OTHER,
} as const;

// ============================================================
// QUERY DEFAULTS
// ============================================================

export const REVIEW_QUERY_DEFAULTS = {
  PAGE:
    REVIEW_DEFAULTS.PAGE,

  LIMIT:
    REVIEW_DEFAULTS.LIMIT,

  MAX_LIMIT:
    REVIEW_DEFAULTS.MAX_LIMIT,

  SORT:
    REVIEW_SORTS.NEWEST,

  DIRECTION:
    REVIEW_SORT_DIRECTIONS.DESC,
} as const;

// ============================================================
// EXPORT FIELDS
// ============================================================

export const REVIEW_EXPORT_FIELDS = [
  "id",
  "type",

  "target_type",
  "target_id",

  "author_id",
  "author_name",
  "author_mode",

  "title",
  "text",
  "rating",

  "status",
  "visibility",

  "verified",
  "featured",
  "pinned",

  "views_count",
  "helpful_count",
  "not_helpful_count",
  "reactions_count",
  "reports_count",
  "replies_count",
  "shares_count",

  "source",

  "created_at",
  "updated_at",
] as const;

// ============================================================
// FEATURES
// ============================================================

export const REVIEW_FEATURES = {
  ANONYMOUS: true,
  REPLIES: true,
  REACTIONS: true,
  REPORTS: true,
  VERIFICATION: true,
  MODERATION: true,
  HISTORY: true,
  FEATURED: true,
  PINNED: true,
  SEARCH: true,
  FILTERS: true,
  ANALYTICS: true,
  EXPORT: true,
  IMPORT: true,
  NOTIFICATIONS: true,
  BULK_OPERATIONS: true,
} as const;

// ============================================================
// VALIDATORS
// ============================================================

export function isValidReviewStatus(
  value: unknown,
): value is ReviewStatus {
  return (
    typeof value ===
      "string" &&
    Object.values(
      REVIEW_STATUSES,
    ).includes(
      value as ReviewStatus,
    )
  );
}

export function isValidReviewType(
  value: unknown,
): value is ReviewType {
  return (
    typeof value ===
      "string" &&
    Object.values(
      REVIEW_TYPES,
    ).includes(
      value as ReviewType,
    )
  );
}

export function isValidReviewTargetType(
  value: unknown,
): value is ReviewTargetType {
  return (
    typeof value ===
      "string" &&
    Object.values(
      REVIEW_TARGET_TYPES,
    ).includes(
      value as ReviewTargetType,
    )
  );
}

export function isValidReviewAuthorMode(
  value: unknown,
): value is ReviewAuthorMode {
  return (
    typeof value ===
      "string" &&
    Object.values(
      REVIEW_AUTHOR_MODES,
    ).includes(
      value as ReviewAuthorMode,
    )
  );
}

export function isValidReviewVisibility(
  value: unknown,
): value is ReviewVisibility {
  return (
    typeof value ===
      "string" &&
    Object.values(
      REVIEW_VISIBILITY,
    ).includes(
      value as ReviewVisibility,
    )
  );
}

export function isValidReviewFeatureState(
  value: unknown,
): value is ReviewFeatureState {
  return (
    typeof value ===
      "string" &&
    Object.values(
      REVIEW_FEATURE_STATES,
    ).includes(
      value as ReviewFeatureState,
    )
  );
}

export function isValidReviewRating(
  value: unknown,
): value is ReviewRating {
  return (
    typeof value ===
      "number" &&
    Number.isInteger(value) &&
    value >=
      REVIEW_LIMITS.MIN_RATING &&
    value <=
      REVIEW_LIMITS.MAX_RATING
  );
}

export function isValidReviewSort(
  value: unknown,
): value is ReviewSort {
  return (
    typeof value ===
      "string" &&
    Object.values(
      REVIEW_SORTS,
    ).includes(
      value as ReviewSort,
    )
  );
}

export function isValidReviewSource(
  value: unknown,
): value is ReviewSource {
  return (
    typeof value ===
      "string" &&
    Object.values(
      REVIEW_SOURCES,
    ).includes(
      value as ReviewSource,
    )
  );
}

export function isValidReviewVerificationType(
  value: unknown,
): value is ReviewVerificationType {
  return (
    typeof value ===
      "string" &&
    Object.values(
      REVIEW_VERIFICATION_TYPES,
    ).includes(
      value as ReviewVerificationType,
    )
  );
}

export function isValidReviewReportType(
  value: unknown,
): value is ReviewReportType {
  return (
    typeof value ===
      "string" &&
    Object.values(
      REVIEW_REPORT_TYPES,
    ).includes(
      value as ReviewReportType,
    )
  );
}

export function isValidReviewReportStatus(
  value: unknown,
): value is ReviewReportStatus {
  return (
    typeof value ===
      "string" &&
    Object.values(
      REVIEW_REPORT_STATUSES,
    ).includes(
      value as ReviewReportStatus,
    )
  );
}

export function isValidReviewModerationAction(
  value: unknown,
): value is ReviewModerationAction {
  return (
    typeof value ===
      "string" &&
    Object.values(
      REVIEW_MODERATION_ACTIONS,
    ).includes(
      value as ReviewModerationAction,
    )
  );
}

export function isValidReviewMetric(
  value: unknown,
): value is ReviewMetric {
  return (
    typeof value ===
      "string" &&
    Object.values(
      REVIEW_METRICS,
    ).includes(
      value as ReviewMetric,
    )
  );
}

export function isValidReviewPermission(
  value: unknown,
): value is ReviewPermission {
  return (
    typeof value ===
      "string" &&
    Object.values(
      REVIEW_PERMISSIONS,
    ).includes(
      value as ReviewPermission,
    )
  );
}

export function isValidReviewAction(
  value: unknown,
): value is ReviewAction {
  return (
    typeof value ===
      "string" &&
    Object.values(
      REVIEW_ACTIONS,
    ).includes(
      value as ReviewAction,
    )
  );
}

export function isValidReviewAdminAction(
  value: unknown,
): value is ReviewAdminAction {
  return (
    typeof value ===
      "string" &&
    Object.values(
      REVIEW_ADMIN_ACTIONS,
    ).includes(
      value as ReviewAdminAction,
    )
  );
}

export function isValidReviewBulkAction(
  value: unknown,
): value is ReviewBulkAction {
  return (
    typeof value ===
      "string" &&
    Object.values(
      REVIEW_BULK_ACTIONS,
    ).includes(
      value as ReviewBulkAction,
    )
  );
}

export function isValidReviewHistoryAction(
  value: unknown,
): value is ReviewHistoryAction {
  return (
    typeof value ===
      "string" &&
    Object.values(
      REVIEW_HISTORY_ACTIONS,
    ).includes(
      value as ReviewHistoryAction,
    )
  );
}

// ============================================================
// NORMALIZERS
// ============================================================

export function normalizeReviewRating(
  value: unknown,
): ReviewRating {
  const numeric =
    Number(value);

  if (
    !Number.isFinite(
      numeric,
    )
  ) {
    return REVIEW_RATINGS.FIVE;
  }

  const rounded =
    Math.round(numeric);

  if (
    rounded <
    REVIEW_LIMITS.MIN_RATING
  ) {
    return REVIEW_RATINGS.ONE;
  }

  if (
    rounded >
    REVIEW_LIMITS.MAX_RATING
  ) {
    return REVIEW_RATINGS.FIVE;
  }

  return rounded as ReviewRating;
}

export function normalizeReviewSort(
  value: unknown,
  fallback:
    ReviewSort =
      REVIEW_SORTS.NEWEST,
): ReviewSort {
  return isValidReviewSort(
    value,
  )
    ? value
    : fallback;
}

export function normalizeReviewSource(
  value: unknown,
  fallback:
    ReviewSource =
      REVIEW_SOURCE_TYPES.WEBSITE,
): ReviewSource {
  return isValidReviewSource(
    value,
  )
    ? value
    : fallback;
}

export function normalizeReviewVerificationType(
  value: unknown,
  fallback:
    ReviewVerificationType =
      REVIEW_VERIFICATION_STATES.UNVERIFIED,
): ReviewVerificationType {
  return isValidReviewVerificationType(
    value,
  )
    ? value
    : fallback;
}

export function normalizeReviewTitle(
  value: unknown,
): string {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value
    .trim()
    .replace(
      /\s+/g,
      " ",
    )
    .slice(
      0,
      REVIEW_LIMITS.TITLE_MAX,
    );
}

export function normalizeReviewText(
  value: unknown,
): string {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value
    .trim()
    .replace(
      /\r\n/g,
      "\n",
    )
    .replace(
      /[ \t]+/g,
      " ",
    )
    .slice(
      0,
      REVIEW_LIMITS.TEXT_MAX,
    );
}

export function normalizeReviewSearchQuery(
  value: unknown,
): string {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value
    .trim()
    .replace(
      /\s+/g,
      " ",
    )
    .slice(
      0,
      REVIEW_SEARCH_LIMITS.MAX_QUERY_LENGTH,
    );
}

// ============================================================
// COUNTER HELPERS
// ============================================================

export function normalizeCounter(
  value: unknown,
): number {
  const number =
    typeof value ===
      "number"
      ? value
      : Number(value);

  if (
    !Number.isFinite(
      number,
    ) ||
    number < 0
  ) {
    return 0;
  }

  return Math.floor(
    number,
  );
}

export function normalizeBoolean(
  value: unknown,
  fallback = false,
): boolean {
  if (
    typeof value ===
    "boolean"
  ) {
    return value;
  }

  if (
    value === true ||
    value === 1 ||
    value === "1" ||
    value === "true" ||
    value === "yes"
  ) {
    return true;
  }

  if (
    value === false ||
    value === 0 ||
    value === "0" ||
    value === "false" ||
    value === "no"
  ) {
    return false;
  }

  return fallback;
}

// ============================================================
// PRESENTATION HELPERS
// ============================================================

export function ratingToStars(
  rating: ReviewRating,
): string {
  return (
    "★".repeat(rating) +
    "☆".repeat(
      5 - rating,
    )
  );
}

export function getRatingLabel(
  rating: ReviewRating,
  language:
    ReviewLanguage = REVIEW_LANGUAGES.RU,
): string {
  return language ===
    REVIEW_LANGUAGES.TJ
    ? REVIEW_RATING_LABELS_TJ[
        rating
      ]
    : REVIEW_RATING_LABELS[
        rating
      ];
}

export function getRatingDescription(
  rating: ReviewRating,
  language:
    ReviewLanguage = REVIEW_LANGUAGES.RU,
): string {
  return language ===
    REVIEW_LANGUAGES.TJ
    ? REVIEW_RATING_DESCRIPTIONS_TJ[
        rating
      ]
    : REVIEW_RATING_DESCRIPTIONS[
        rating
      ];
}

export function getReviewStatusLabel(
  status: ReviewStatus,
  language:
    ReviewLanguage = REVIEW_LANGUAGES.RU,
): string {
  return language ===
    REVIEW_LANGUAGES.TJ
    ? REVIEW_STATUS_LABELS_TJ[
        status
      ]
    : REVIEW_STATUS_LABELS[
        status
      ];
}

// ============================================================
// PUBLICITY HELPERS
// ============================================================

export function isPublicReviewStatus(
  value: unknown,
): value is "published" {
  return (
    value ===
    REVIEW_STATUSES.PUBLISHED
  );
}

export function isDeletedReviewStatus(
  value: unknown,
): value is "deleted" {
  return (
    value ===
    REVIEW_STATUSES.DELETED
  );
}

export function isSpamReviewStatus(
  value: unknown,
): value is "spam" {
  return (
    value ===
    REVIEW_STATUSES.SPAM
  );
}

export function isReviewPublic(
  status: unknown,
  visibility:
    | ReviewVisibility
    | undefined =
      REVIEW_VISIBILITY.PUBLIC,
): boolean {
  return (
    status ===
      REVIEW_STATUSES.PUBLISHED &&
    visibility ===
      REVIEW_VISIBILITY.PUBLIC
  );
}

export function canReviewBePublic(
  status: ReviewStatus,
  visibility:
    ReviewVisibility =
      REVIEW_VISIBILITY.PUBLIC,
): boolean {
  return (
    status ===
      REVIEW_STATUSES.PUBLISHED &&
    visibility ===
      REVIEW_VISIBILITY.PUBLIC
  );
}

export function shouldReviewAppearInPublicFeed(
  status: ReviewStatus,
  visibility: ReviewVisibility,
  deleted = false,
): boolean {
  if (deleted) {
    return false;
  }

  return canReviewBePublic(
    status,
    visibility,
  );
}

// ============================================================
// LIFECYCLE HELPERS
// ============================================================

export function canTransitionReviewStatus(
  from: ReviewStatus,
  to: ReviewStatus,
): boolean {
  if (from === to) {
    return true;
  }

  return (
    REVIEW_STATUS_TRANSITIONS[
      from
    ]?.includes(to) ??
    false
  );
}

export function canEditReview(
  status: ReviewStatus,
): boolean {
  return (
    status !==
      REVIEW_STATUSES.DELETED &&
    status !==
      REVIEW_STATUSES.ARCHIVED &&
    status !==
      REVIEW_STATUSES.SPAM
  );
}

export function canDeleteReview(
  status: ReviewStatus,
): boolean {
  return (
    status !==
    REVIEW_STATUSES.DELETED
  );
}

export function canRestoreReview(
  status: ReviewStatus,
): boolean {
  return (
    status ===
      REVIEW_STATUSES.DELETED ||
    status ===
      REVIEW_STATUSES.HIDDEN ||
    status ===
      REVIEW_STATUSES.REJECTED ||
    status ===
      REVIEW_STATUSES.ARCHIVED ||
    status ===
      REVIEW_STATUSES.SPAM
  );
}

export function canModerateReview(
  status: ReviewStatus,
): boolean {
  return (
    status !==
    REVIEW_STATUSES.DELETED
  );
}

// ============================================================
// FEATURE HELPERS
// ============================================================

export function isFeaturedReview(
  value: unknown,
): boolean {
  return normalizeBoolean(
    value,
  );
}

export function isPinnedReview(
  value: unknown,
): boolean {
  return normalizeBoolean(
    value,
  );
}

export function isVerifiedReview(
  value: unknown,
): boolean {
  return normalizeBoolean(
    value,
  );
}

export function getReviewFeatureState(
  pinned: unknown,
  featured: unknown,
): ReviewFeatureState {
  if (
    isPinnedReview(pinned)
  ) {
    return REVIEW_FEATURE_STATES.PINNED;
  }

  if (
    isFeaturedReview(featured)
  ) {
    return REVIEW_FEATURE_STATES.FEATURED;
  }

  return REVIEW_FEATURE_STATES.NORMAL;
}

// ============================================================
// AUTHOR HELPERS
// ============================================================

export function isPublicAuthorMode(
  value: unknown,
): value is "public" {
  return (
    value ===
    REVIEW_AUTHOR_MODES.PUBLIC
  );
}

export function isAnonymousAuthorMode(
  value: unknown,
): value is "anonymous" {
  return (
    value ===
    REVIEW_AUTHOR_MODES.ANONYMOUS
  );
}

export function isHiddenAuthorMode(
  value: unknown,
): value is "hidden" {
  return (
    value ===
    REVIEW_AUTHOR_MODES.HIDDEN
  );
}

// ============================================================
// EDIT WINDOW
// ============================================================

export function isWithinReviewEditWindow(
  createdAt:
    | string
    | number
    | Date,
  now = Date.now(),
): boolean {
  const timestamp =
    createdAt instanceof Date
      ? createdAt.getTime()
      : typeof createdAt ===
          "number"
        ? createdAt
        : Date.parse(
            createdAt,
          );

  if (
    !Number.isFinite(
      timestamp,
    )
  ) {
    return false;
  }

  const ageMinutes =
    (now - timestamp) /
    60_000;

  return (
    ageMinutes >= 0 &&
    ageMinutes <=
      REVIEW_LIMITS.EDIT_WINDOW_MINUTES
  );
}

// ============================================================
// SEARCH HELPERS
// ============================================================

export function isValidReviewSearchField(
  value: unknown,
): value is ReviewSearchField {
  return (
    typeof value ===
      "string" &&
    (
      REVIEW_SEARCH_FIELDS as readonly string[]
    ).includes(value)
  );
}

// ============================================================
// REPORT HELPERS
// ============================================================

export function isOpenReviewReport(
  status: ReviewReportStatus,
): boolean {
  return (
    status ===
      REVIEW_REPORT_STATUSES.OPEN ||
    status ===
      REVIEW_REPORT_STATUSES.UNDER_REVIEW ||
    status ===
      REVIEW_REPORT_STATUSES.ESCALATED
  );
}

export function isCriticalReviewReport(
  priority:
    ReviewReportPriority,
): boolean {
  return (
    priority ===
    REVIEW_REPORT_PRIORITIES.CRITICAL
  );
}

// ============================================================
// SORT HELPERS
// ============================================================

export function getReviewSortField(
  sort: ReviewSort,
): string {
  return (
    REVIEW_SORT_FIELD_MAP[
      sort
    ] ??
    REVIEW_SORT_FIELD_MAP[
      REVIEW_SORTS.NEWEST
    ]
  );
}

export function getReviewSortDirection(
  sort: ReviewSort,
): ReviewSortDirection {
  switch (sort) {
    case REVIEW_SORTS.OLDEST:
    case REVIEW_SORTS.LOWEST_RATING:
      return REVIEW_SORT_DIRECTIONS.ASC;

    default:
      return REVIEW_SORT_DIRECTIONS.DESC;
  }
}

// ============================================================
// BULK HELPERS
// ============================================================

export function isBulkReviewActionAllowed(
  action: ReviewBulkAction,
  status: ReviewStatus,
): boolean {
  switch (action) {
    case REVIEW_BULK_ACTIONS.DELETE:
      return canDeleteReview(
        status,
      );

    case REVIEW_BULK_ACTIONS.RESTORE:
      return canRestoreReview(
        status,
      );

    case REVIEW_BULK_ACTIONS.APPROVE:
      return (
        status ===
          REVIEW_STATUSES.PENDING ||
        status ===
          REVIEW_STATUSES.REJECTED ||
        status ===
          REVIEW_STATUSES.HIDDEN
      );

    case REVIEW_BULK_ACTIONS.REJECT:
    case REVIEW_BULK_ACTIONS.HIDE:
    case REVIEW_BULK_ACTIONS.SPAM:
      return canModerateReview(
        status,
      );

    default:
      return (
        status !==
        REVIEW_STATUSES.DELETED
      );
  }
}

// ============================================================
// STATUS LIST HELPERS
// ============================================================

export function isActiveReviewStatus(
  status: ReviewStatus,
): boolean {
  return (
    status !==
    REVIEW_STATUSES.DELETED
  );
}

export function isTerminalReviewStatus(
  status: ReviewStatus,
): boolean {
  return (
    (
      REVIEW_TERMINAL_STATUSES as readonly ReviewStatus[]
    ).includes(status)
  );
}

// ============================================================
// GENERIC VALUE HELPERS
// ============================================================

export function isNonEmptyString(
  value: unknown,
): value is string {
  return (
    typeof value ===
      "string" &&
    value.trim().length >
      0
  );
}

export function isValidReviewTitle(
  value: unknown,
): value is string {
  if (
    typeof value !==
    "string"
  ) {
    return false;
  }

  const normalized =
    value.trim();

  return (
    normalized.length >=
      REVIEW_LIMITS.TITLE_MIN &&
    normalized.length <=
      REVIEW_LIMITS.TITLE_MAX
  );
}

export function isValidReviewText(
  value: unknown,
): value is string {
  if (
    typeof value !==
    "string"
  ) {
    return false;
  }

  const normalized =
    value.trim();

  return (
    normalized.length >=
      REVIEW_LIMITS.TEXT_MIN &&
    normalized.length <=
      REVIEW_LIMITS.TEXT_MAX
  );
}

// ============================================================
// COLLECTIONS
// ============================================================

export const REVIEW_ALL_STATUSES: ReviewStatus[] =
  Object.values(
    REVIEW_STATUSES,
  );

export const REVIEW_ALL_TYPES: ReviewType[] =
  Object.values(
    REVIEW_TYPES,
  );

export const REVIEW_ALL_RATINGS: ReviewRating[] =
  [...REVIEW_RATING_VALUES];

export const REVIEW_ALL_SORTS: ReviewSort[] =
  Object.values(
    REVIEW_SORTS,
  );

export const REVIEW_ALL_SOURCES: ReviewSource[] =
  Object.values(
    REVIEW_SOURCES,
  );

export const REVIEW_ALL_VERIFICATION_TYPES: ReviewVerificationType[] =
  Object.values(
    REVIEW_VERIFICATION_TYPES,
  );

// ============================================================
// END
// ============================================================
