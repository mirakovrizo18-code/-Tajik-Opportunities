// ============================================================
// 🇹🇯 TAJIK OPPORTUNITIES
// PUBLICATION CONSTANTS
// Version: 2026.09
// ============================================================

import {
  PUBLICATION_STATUSES,
  type PublicationStatus,
} from "./statuses";

// ============================================================
// PUBLICATION TYPES
// ============================================================

export const PUBLICATION_TYPES = {
  OPPORTUNITY: "opportunity",
  JOB: "job",
  EDUCATION: "education",
  INTERNSHIP: "internship",
  GRANT: "grant",
  COMPETITION: "competition",
  EVENT: "event",
  BUSINESS: "business",
  NEWS: "news",
  OTHER: "other",
} as const;

export type PublicationType =
  typeof PUBLICATION_TYPES[
    keyof typeof PUBLICATION_TYPES
  ];

// ============================================================
// LABELS
// ============================================================

export const PUBLICATION_TYPE_LABELS: Record<
  PublicationType,
  string
> = {
  opportunity: "Возможность",
  job: "Вакансия",
  education: "Образование",
  internship: "Стажировка",
  grant: "Грант",
  competition: "Конкурс",
  event: "Мероприятие",
  business: "Бизнес",
  news: "Новости",
  other: "Другое",
};

export const PUBLICATION_TYPE_LABELS_TJ: Record<
  PublicationType,
  string
> = {
  opportunity: "Имконият",
  job: "Вакансия",
  education: "Маориф",
  internship: "Таҷрибаомӯзӣ",
  grant: "Грант",
  competition: "Озмун",
  event: "Чорабинӣ",
  business: "Бизнес",
  news: "Хабарҳо",
  other: "Дигар",
};

// ============================================================
// SORTING
// ============================================================

export const PUBLICATION_SORTS = {
  NEWEST: "newest",
  OLDEST: "oldest",
  UPDATED: "updated",
  POPULAR: "popular",
  MOST_VIEWED: "most_viewed",
  MOST_LIKED: "most_liked",
  MOST_COMMENTED: "most_commented",
  MOST_REACTED: "most_reacted",
  MOST_SAVED: "most_saved",
  MOST_SHARED: "most_shared",
  MOST_SENT: "most_sent",
  MOST_REPORTED: "most_reported",
  PRIORITY: "priority",
  MANUAL: "manual",
  RANDOM: "random",
} as const;

export type PublicationSort =
  typeof PUBLICATION_SORTS[
    keyof typeof PUBLICATION_SORTS
  ];

// ============================================================
// DEFAULT SORT
// ============================================================

export const DEFAULT_PUBLICATION_SORT =
  PUBLICATION_SORTS.NEWEST;

// ============================================================
// PUBLICATION VISIBILITY
// ============================================================

export const PUBLICATION_VISIBILITY = {
  PUBLIC: "public",
  HIDDEN: "hidden",
  PRIVATE: "private",
  DELETED: "deleted",
} as const;

export type PublicationVisibility =
  typeof PUBLICATION_VISIBILITY[
    keyof typeof PUBLICATION_VISIBILITY
  ];

// ============================================================
// AUTHOR VISIBILITY
// ============================================================

export const AUTHOR_VISIBILITY = {
  PUBLIC: "public",
  ANONYMOUS: "anonymous",
  HIDDEN: "hidden",
} as const;

export type AuthorVisibility =
  typeof AUTHOR_VISIBILITY[
    keyof typeof AUTHOR_VISIBILITY
  ];

// ============================================================
// EMPLOYMENT TYPES
// ============================================================

export const EMPLOYMENT_TYPES = {
  FULL_TIME: "full_time",
  PART_TIME: "part_time",
  CONTRACT: "contract",
  TEMPORARY: "temporary",
  INTERNSHIP: "internship",
  VOLUNTEER: "volunteer",
  FREELANCE: "freelance",
  REMOTE: "remote",
  HYBRID: "hybrid",
} as const;

export type EmploymentType =
  typeof EMPLOYMENT_TYPES[
    keyof typeof EMPLOYMENT_TYPES
  ];

export const EMPLOYMENT_TYPE_LABELS: Record<
  EmploymentType,
  string
> = {
  full_time: "Полная занятость",
  part_time: "Частичная занятость",
  contract: "Контракт",
  temporary: "Временная работа",
  internship: "Стажировка",
  volunteer: "Волонтёрство",
  freelance: "Фриланс",
  remote: "Удалённая работа",
  hybrid: "Гибридный формат",
};

// ============================================================
// SALARY TYPES
// ============================================================

export const SALARY_TYPES = {
  NONE: "none",
  FIXED: "fixed",
  RANGE: "range",
  NEGOTIABLE: "negotiable",
  FROM: "from",
  UP_TO: "up_to",
  HOURLY: "hourly",
  MONTHLY: "monthly",
  YEARLY: "yearly",
} as const;

export type SalaryType =
  typeof SALARY_TYPES[keyof typeof SALARY_TYPES];

// ============================================================
// PUBLICATION PRIORITY
// ============================================================

export const PUBLICATION_PRIORITIES = {
  LOW: 0,
  NORMAL: 10,
  HIGH: 50,
  VERY_HIGH: 100,
  CRITICAL: 1000,
} as const;

// ============================================================
// FEATURED / PINNED
// ============================================================

export const FEATURE_STATES = {
  ENABLED: 1,
  DISABLED: 0,
} as const;

// ============================================================
// PUBLICATION COUNTERS
// ============================================================

export const PUBLICATION_COUNTERS = {
  VIEWS: "views_count",
  UNIQUE_VIEWS: "unique_views_count",
  LIKES: "likes_count",
  COMMENTS: "comments_count",
  REACTIONS: "reactions_count",
  BOOKMARKS: "bookmarks_count",
  SHARES: "shares_count",
  SENDS: "sends_count",
  REPORTS: "reports_count",
  CONTACTS: "contacts_count",
  APPLICATIONS: "applications_count",
  DOWNLOADS: "downloads_count",
  CLICKS: "clicks_count",
  EXTERNAL_CLICKS: "external_clicks_count",
} as const;

export type PublicationCounter =
  typeof PUBLICATION_COUNTERS[
    keyof typeof PUBLICATION_COUNTERS
  ];

// ============================================================
// ADMIN COUNTER ACTIONS
// ============================================================

export const PUBLICATION_COUNTER_ACTIONS = {
  SET: "set",
  INCREMENT: "increment",
  DECREMENT: "decrement",
  RESET: "reset",
} as const;

export type PublicationCounterAction =
  typeof PUBLICATION_COUNTER_ACTIONS[
    keyof typeof PUBLICATION_COUNTER_ACTIONS
  ];

// ============================================================
// PUBLICATION ADMIN ACTIONS
// ============================================================

export const PUBLICATION_ADMIN_ACTIONS = {
  VIEW: "view",
  SEARCH: "search",
  CREATE: "create",
  EDIT: "edit",
  DELETE: "delete",
  RESTORE: "restore",

  APPROVE: "approve",
  REJECT: "reject",

  PUBLISH: "publish",
  UNPUBLISH: "unpublish",

  HIDE: "hide",
  UNHIDE: "unhide",

  PIN: "pin",
  UNPIN: "unpin",

  FEATURE: "feature",
  UNFEATURE: "unfeature",

  CHANGE_STATUS: "change_status",
  CHANGE_TYPE: "change_type",
  CHANGE_CATEGORY: "change_category",
  CHANGE_AUTHOR: "change_author",

  CHANGE_DATE: "change_date",
  CHANGE_ORDER: "change_order",
  CHANGE_PRIORITY: "change_priority",

  EDIT_COUNTERS: "edit_counters",
  SET_COUNTER: "set_counter",
  INCREMENT_COUNTER: "increment_counter",
  DECREMENT_COUNTER: "decrement_counter",
  RESET_COUNTER: "reset_counter",

  VIEW_HISTORY: "view_history",
  EXPORT: "export",
} as const;

export type PublicationAdminAction =
  typeof PUBLICATION_ADMIN_ACTIONS[
    keyof typeof PUBLICATION_ADMIN_ACTIONS
  ];

// ============================================================
// PUBLICATION SOURCES
// ============================================================

export const PUBLICATION_SOURCES = {
  USER: "user",
  ADMIN: "admin",
  IMPORT: "import",
  API: "api",
  SYSTEM: "system",
  MIGRATION: "migration",
} as const;

export type PublicationSource =
  typeof PUBLICATION_SOURCES[
    keyof typeof PUBLICATION_SOURCES
  ];

// ============================================================
// PUBLICATION CREATION METHODS
// ============================================================

export const PUBLICATION_CREATION_METHODS = {
  USER_FORM: "user_form",
  ADMIN_PANEL: "admin_panel",
  API: "api",
  IMPORT: "import",
  DUPLICATE: "duplicate",
  SYSTEM: "system",
} as const;

export type PublicationCreationMethod =
  typeof PUBLICATION_CREATION_METHODS[
    keyof typeof PUBLICATION_CREATION_METHODS
  ];

// ============================================================
// MODERATION REASONS
// ============================================================

export const PUBLICATION_MODERATION_REASONS = {
  APPROVED: "approved",
  REJECTED_INCOMPLETE: "rejected_incomplete",
  REJECTED_INVALID: "rejected_invalid",
  REJECTED_SPAM: "rejected_spam",
  REJECTED_DUPLICATE: "rejected_duplicate",
  REJECTED_FRAUD: "rejected_fraud",
  REJECTED_RULES: "rejected_rules",
  REJECTED_OTHER: "rejected_other",

  HIDDEN_ADMIN: "hidden_admin",
  HIDDEN_REPORT: "hidden_report",
  HIDDEN_POLICY: "hidden_policy",
  HIDDEN_TEMPORARY: "hidden_temporary",
} as const;

export type PublicationModerationReason =
  typeof PUBLICATION_MODERATION_REASONS[
    keyof typeof PUBLICATION_MODERATION_REASONS
  ];

// ============================================================
// PUBLICATION EVENTS
// ============================================================

export const PUBLICATION_EVENTS = {
  CREATED: "created",
  UPDATED: "updated",
  SUBMITTED: "submitted",
  APPROVED: "approved",
  REJECTED: "rejected",
  PUBLISHED: "published",
  UNPUBLISHED: "unpublished",
  HIDDEN: "hidden",
  RESTORED: "restored",
  DELETED: "deleted",

  PINNED: "pinned",
  UNPINNED: "unpinned",

  FEATURED: "featured",
  UNFEATURED: "unfeatured",

  AUTHOR_CHANGED: "author_changed",
  CATEGORY_CHANGED: "category_changed",
  STATUS_CHANGED: "status_changed",
  ORDER_CHANGED: "order_changed",
  PRIORITY_CHANGED: "priority_changed",

  COUNTER_CHANGED: "counter_changed",

  VIEWED: "viewed",
  REACTED: "reacted",
  COMMENTED: "commented",
  BOOKMARKED: "bookmarked",
  SHARED: "shared",
  SENT: "sent",
  REPORTED: "reported",
  CONTACTED: "contacted",
  APPLIED: "applied",
  DOWNLOADED: "downloaded",
  CLICKED: "clicked",
  EXTERNAL_CLICKED: "external_clicked",
} as const;

export type PublicationEvent =
  typeof PUBLICATION_EVENTS[
    keyof typeof PUBLICATION_EVENTS
  ];

// ============================================================
// FILTERS
// ============================================================

export const PUBLICATION_FILTERS = {
  STATUS: "status",
  TYPE: "type",
  CATEGORY: "category",
  COUNTRY: "country",
  REGION: "region",
  CITY: "city",
  COMPANY: "company",
  AUTHOR: "author",
  DATE_FROM: "date_from",
  DATE_TO: "date_to",
  CREATED_FROM: "created_from",
  CREATED_TO: "created_to",
  UPDATED_FROM: "updated_from",
  UPDATED_TO: "updated_to",

  FEATURED: "featured",
  PINNED: "pinned",
  ANONYMOUS: "anonymous",

  HAS_CONTACT: "has_contact",
  HAS_APPLICATION: "has_application",

  MIN_VIEWS: "min_views",
  MAX_VIEWS: "max_views",

  MIN_LIKES: "min_likes",
  MAX_LIKES: "max_likes",

  MIN_COMMENTS: "min_comments",
  MAX_COMMENTS: "max_comments",

  MIN_REPORTS: "min_reports",
  MAX_REPORTS: "max_reports",
} as const;

export type PublicationFilter =
  typeof PUBLICATION_FILTERS[
    keyof typeof PUBLICATION_FILTERS
  ];

// ============================================================
// PAGINATION
// ============================================================

export const PUBLICATION_PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  DEFAULT_OFFSET: 0,
} as const;

// ============================================================
// TEXT LIMITS
// ============================================================

export const PUBLICATION_LIMITS = {
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 300,

  DESCRIPTION_MIN_LENGTH: 1,
  DESCRIPTION_MAX_LENGTH: 50000,

  COMPANY_MAX_LENGTH: 300,

  LOCATION_MAX_LENGTH: 300,

  SALARY_MAX_LENGTH: 500,

  CONTACT_NAME_MAX_LENGTH: 300,

  CONTACT_PHONE_MAX_LENGTH: 100,

  CONTACT_EMAIL_MAX_LENGTH: 320,

  CONTACT_TELEGRAM_MAX_LENGTH: 200,

  WEBSITE_MAX_LENGTH: 2048,

  SOURCE_URL_MAX_LENGTH: 2048,

  APPLICATION_URL_MAX_LENGTH: 2048,

  MAX_IMAGES: 50,
} as const;

// ============================================================
// PUBLICATION DEFAULTS
// ============================================================

export const DEFAULT_PUBLICATION = {
  status: PUBLICATION_STATUSES.DRAFT,
  type: PUBLICATION_TYPES.OPPORTUNITY,
  anonymous: 0,
  pinned: 0,
  featured: 0,
  priority: PUBLICATION_PRIORITIES.NORMAL,
  manualOrder: 0,
  viewsCount: 0,
  uniqueViewsCount: 0,
  likesCount: 0,
  commentsCount: 0,
  reactionsCount: 0,
  bookmarksCount: 0,
  sharesCount: 0,
  sendsCount: 0,
  reportsCount: 0,
  contactsCount: 0,
  applicationsCount: 0,
  downloadsCount: 0,
  clicksCount: 0,
  externalClicksCount: 0,
} as const;

// ============================================================
// PUBLICATION STATUS HELPERS
// ============================================================

export function isPublicationVisible(
  status: PublicationStatus
): boolean {
  return status === PUBLICATION_STATUSES.PUBLISHED;
}

export function canUserSeePublication(
  status: PublicationStatus
): boolean {
  return status === PUBLICATION_STATUSES.PUBLISHED;
}

export function canAdminSeePublication(
  status: PublicationStatus
): boolean {
  return Object.values(PUBLICATION_STATUSES).includes(
    status
  );
}

export function isEditablePublicationStatus(
  status: PublicationStatus
): boolean {
  return (
    status === PUBLICATION_STATUSES.DRAFT ||
    status === PUBLICATION_STATUSES.PENDING ||
    status === PUBLICATION_STATUSES.PUBLISHED ||
    status === PUBLICATION_STATUSES.REJECTED ||
    status === PUBLICATION_STATUSES.HIDDEN
  );
}

// ============================================================
// TYPE HELPERS
// ============================================================

export const ALL_PUBLICATION_TYPES =
  Object.values(PUBLICATION_TYPES);

export const ALL_PUBLICATION_SORTS =
  Object.values(PUBLICATION_SORTS);

export const ALL_EMPLOYMENT_TYPES =
  Object.values(EMPLOYMENT_TYPES);

export const ALL_SALARY_TYPES =
  Object.values(SALARY_TYPES);

export const ALL_PUBLICATION_COUNTERS =
  Object.values(PUBLICATION_COUNTERS);

export const ALL_PUBLICATION_ADMIN_ACTIONS =
  Object.values(PUBLICATION_ADMIN_ACTIONS);

export const ALL_PUBLICATION_EVENTS =
  Object.values(PUBLICATION_EVENTS);

// ============================================================
// END
// ============================================================
