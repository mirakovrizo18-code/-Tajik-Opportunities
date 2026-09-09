// ============================================================
// 🇹🇯 TAJIK OPPORTUNITIES
// APPLICATION CONSTANTS
// Version: 2026.09 PRODUCTION
// ============================================================

/**
 * Главный файл констант приложения.
 *
 * ВАЖНО:
 * - не использовать "магические" значения по проекту;
 * - все публичные значения находятся здесь;
 * - поддерживаются RU / TJ / EN / FA;
 * - значения совместимы с backend, frontend, admin и services;
 * - файл не содержит зависимостей от других файлов.
 */

// ============================================================
// APP
// ============================================================

export const APP = {
  NAME: "Tajik Opportunities",
  SHORT_NAME: "TO",
  VERSION: "2026.09",
  ENVIRONMENT: "production",

  DEFAULT_LANGUAGE: "ru",

  SUPPORTED_LANGUAGES: [
    "ru",
    "tj",
    "en",
    "fa",
  ] as const,

  DEFAULT_COUNTRY: "Tajikistan",

  TIMEZONE: "Asia/Dushanbe",

  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  SESSION_COOKIE_NAME: "to_session",
  VISITOR_COOKIE_NAME: "to_visitor",
  ADMIN_SESSION_COOKIE_NAME: "to_admin_session",

  REQUEST_ID_HEADER: "X-Request-ID",

  API_PREFIX: "/api",

  PUBLICATION_ROUTE: "/publication",
  PUBLICATIONS_ROUTE: "/publications",

  ADMIN_ROUTE: "/admin",

  DEFAULT_TITLE:
    "Tajik Opportunities — Возможности Таджикистана",

  DEFAULT_DESCRIPTION:
    "Вакансии, образование, стажировки, гранты, конкурсы, мероприятия и другие возможности в Таджикистане.",

  DEFAULT_KEYWORDS: [
    "Tajik Opportunities",
    "Таджикистан",
    "вакансии",
    "работа",
    "образование",
    "гранты",
    "стажировки",
    "конкурсы",
    "возможности",
    "Tajikistan",
    "Opportunities",
  ],
} as const;

// ============================================================
// API
// ============================================================

export const API = {
  PREFIX: "/api",

  HEALTH: "/api/health",
  CATEGORIES: "/api/categories",
  PUBLICATIONS: "/api/publications",

  AUTH: "/api/auth",
  VISITOR: "/api/visitor",
  PROFILE: "/api/profile",

  COMMENTS: "/api/comments",
  REACTIONS: "/api/reactions",
  BOOKMARKS: "/api/bookmarks",
  SHARES: "/api/shares",
  VIEWS: "/api/views",

  REPORTS: "/api/reports",

  CHAT: "/api/chat",
  CONVERSATIONS: "/api/conversations",
  MESSAGES: "/api/messages",

  NOTIFICATIONS: "/api/notifications",
  NOTIFICATION_SETTINGS: "/api/notifications/settings",
  NOTIFICATION_UNREAD: "/api/notifications/unread",

  REVIEWS: "/api/reviews",
  REVIEW_REPLIES: "/api/reviews/replies",
  REVIEW_REACTIONS: "/api/reviews/reactions",
  REVIEW_REPORTS: "/api/reviews/reports",

  SEARCH: "/api/search",
  ACTIVITY: "/api/activity",

  SETTINGS: "/api/settings",
  FEATURES: "/api/features",

  MEDIA: "/api/media",

  ADMIN: "/api/admin",
  ADMIN_LOGIN: "/api/admin/login",
  ADMIN_LOGOUT: "/api/admin/logout",
  ADMIN_ME: "/api/admin/me",
  ADMIN_DASHBOARD: "/api/admin/dashboard",

  ADMIN_PARTICIPANTS: "/api/admin/participants",
  ADMIN_PUBLICATIONS: "/api/admin/publications",
  ADMIN_COMMENTS: "/api/admin/comments",
  ADMIN_REVIEWS: "/api/admin/reviews",
  ADMIN_CHATS: "/api/admin/chats",
  ADMIN_NOTIFICATIONS: "/api/admin/notifications",
  ADMIN_REPORTS: "/api/admin/reports",
  ADMIN_PAYMENTS: "/api/admin/payments",
  ADMIN_LEVELS: "/api/admin/levels",
  ADMIN_BADGES: "/api/admin/badges",
  ADMIN_PERMISSIONS: "/api/admin/permissions",
  ADMIN_SETTINGS: "/api/admin/settings",
  ADMIN_FEATURES: "/api/admin/features",
  ADMIN_ACTIVITY: "/api/admin/activity",
  ADMIN_AUDIT: "/api/admin/audit",
  ADMIN_SEARCH: "/api/admin/search",
} as const;

// ============================================================
// HTTP
// ============================================================

export const HTTP = {
  METHODS: {
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
    PATCH: "PATCH",
    DELETE: "DELETE",
    OPTIONS: "OPTIONS",
    HEAD: "HEAD",
  },

  STATUS: {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,

    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,

    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
  },

  CONTENT_TYPE: {
    JSON: "application/json; charset=utf-8",
    TEXT: "text/plain; charset=utf-8",
    HTML: "text/html; charset=utf-8",
    FORM_URLENCODED:
      "application/x-www-form-urlencoded",
    MULTIPART:
      "multipart/form-data",
    OCTET_STREAM:
      "application/octet-stream",
  },
} as const;

// ============================================================
// SECURITY
// ============================================================

export const SECURITY = {
  REQUEST_ID_LENGTH: 32,

  VISITOR_ID_LENGTH: 64,
  SESSION_ID_LENGTH: 128,
  ADMIN_SESSION_ID_LENGTH: 128,

  MIN_ADMIN_PASSWORD_LENGTH: 12,

  MAX_LOGIN_ATTEMPTS: 10,
  LOGIN_WINDOW_MINUTES: 15,

  SESSION_DURATION_DAYS: 30,
  ADMIN_SESSION_DURATION_HOURS: 12,

  PASSWORD_RESET_MINUTES: 30,
  EMAIL_VERIFICATION_MINUTES: 30,

  RATE_LIMIT_WINDOW_SECONDS: 60,

  MAX_REQUESTS_PER_WINDOW: 120,
  MAX_AUTH_REQUESTS_PER_WINDOW: 20,
  MAX_ADMIN_REQUESTS_PER_WINDOW: 300,
  MAX_MESSAGE_REQUESTS_PER_WINDOW: 60,
  MAX_PUBLICATION_REQUESTS_PER_WINDOW: 30,
  MAX_COMMENT_REQUESTS_PER_WINDOW: 60,
  MAX_REACTION_REQUESTS_PER_WINDOW: 120,
  MAX_REPORT_REQUESTS_PER_WINDOW: 20,
  MAX_REVIEW_REQUESTS_PER_WINDOW: 30,
  MAX_SEARCH_REQUESTS_PER_WINDOW: 60,

  CSRF_TOKEN_LENGTH: 64,
  API_TOKEN_LENGTH: 128,

  MAX_SESSION_AGE_SECONDS:
    60 * 60 * 24 * 30,

  MAX_VISITOR_AGE_SECONDS:
    60 * 60 * 24 * 365 * 2,

  MAX_ADMIN_SESSION_AGE_SECONDS:
    60 * 60 * 12,
} as const;

// ============================================================
// COOKIES
// ============================================================

export const COOKIES = {
  VISITOR: {
    NAME: "to_visitor",
    MAX_AGE: 60 * 60 * 24 * 365 * 2,
    HTTP_ONLY: true,
    SECURE: true,
    SAME_SITE: "Lax",
    PATH: "/",
  },

  SESSION: {
    NAME: "to_session",
    MAX_AGE: 60 * 60 * 24 * 30,
    HTTP_ONLY: true,
    SECURE: true,
    SAME_SITE: "Lax",
    PATH: "/",
  },

  ADMIN: {
    NAME: "to_admin_session",
    MAX_AGE: 60 * 60 * 12,
    HTTP_ONLY: true,
    SECURE: true,
    SAME_SITE: "Strict",
    PATH: "/",
  },
} as const;

// ============================================================
// CACHE
// ============================================================

export const CACHE = {
  PUBLICATION_SECONDS: 60,
  PUBLICATIONS_LIST_SECONDS: 30,
  CATEGORIES_SECONDS: 300,

  PROFILE_SECONDS: 30,

  SEARCH_SECONDS: 15,

  ADMIN_DASHBOARD_SECONDS: 10,

  NOTIFICATIONS_SECONDS: 5,

  REVIEWS_SECONDS: 15,

  NO_CACHE: 0,
} as const;

// ============================================================
// FILES
// ============================================================

export const FILE_LIMITS = {
  MAX_UPLOAD_SIZE_MB: 20,
  MAX_IMAGE_SIZE_MB: 10,
  MAX_AVATAR_SIZE_MB: 5,
  MAX_DOCUMENT_SIZE_MB: 20,

  MAX_VIDEO_SIZE_MB: 100,
  MAX_AUDIO_SIZE_MB: 50,
  MAX_VOICE_SIZE_MB: 30,

  MAX_FILES_PER_PUBLICATION: 50,
  MAX_FILES_PER_MESSAGE: 10,
  MAX_PROFILE_IMAGES: 10,

  MAX_ATTACHMENTS_PER_MESSAGE: 10,
  MAX_MEDIA_PER_PUBLICATION: 50,

  // Совместимость с кодом, который работает в байтах.
  MAX_UPLOAD_SIZE_BYTES:
    20 * 1024 * 1024,

  MAX_IMAGE_SIZE_BYTES:
    10 * 1024 * 1024,

  MAX_AVATAR_SIZE_BYTES:
    5 * 1024 * 1024,

  MAX_DOCUMENT_SIZE_BYTES:
    20 * 1024 * 1024,

  MAX_VIDEO_SIZE_BYTES:
    100 * 1024 * 1024,

  MAX_AUDIO_SIZE_BYTES:
    50 * 1024 * 1024,

  MAX_VOICE_SIZE_BYTES:
    30 * 1024 * 1024,
} as const;

// ============================================================
// MIME / FILE TYPES
// ============================================================

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;

export const ALLOWED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
  "audio/mp4",
  "audio/aac",
] as const;

export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
] as const;

export const ALLOWED_MEDIA_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_VIDEO_TYPES,
  ...ALLOWED_AUDIO_TYPES,
  ...ALLOWED_DOCUMENT_TYPES,
] as const;

// ============================================================
// CONTENT
// ============================================================

export const CONTENT_LIMITS = {
  USERNAME_MIN: 3,
  USERNAME_MAX: 50,

  NAME_MIN: 1,
  NAME_MAX: 100,

  SURNAME_MAX: 100,

  BIO_MAX: 2000,

  TITLE_MIN: 1,
  TITLE_MAX: 300,

  DESCRIPTION_MAX: 30000,

  COMMENT_MIN: 1,
  COMMENT_MAX: 5000,

  MESSAGE_MIN: 1,
  MESSAGE_MAX: 10000,

  REPORT_REASON_MIN: 1,
  REPORT_REASON_MAX: 5000,

  REVIEW_TITLE_MAX: 300,
  REVIEW_TEXT_MIN: 1,
  REVIEW_TEXT_MAX: 10000,

  SEARCH_QUERY_MIN: 1,
  SEARCH_QUERY_MAX: 300,

  SEARCH_RESULTS_MAX: 100,

  NOTIFICATION_TITLE_MAX: 300,
  NOTIFICATION_BODY_MAX: 5000,

  TAG_MAX: 100,
  TAGS_PER_OBJECT_MAX: 30,

  URL_MAX: 4096,

  LINK_PREVIEW_TITLE_MAX: 300,
  LINK_PREVIEW_DESCRIPTION_MAX: 1000,
} as const;

// ============================================================
// PAGINATION
// ============================================================

export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,

  DEFAULT_OFFSET: 0,

  ADMIN_DEFAULT_LIMIT: 50,
  ADMIN_MAX_LIMIT: 200,

  CHAT_DEFAULT_LIMIT: 50,
  CHAT_MAX_LIMIT: 100,

  COMMENT_DEFAULT_LIMIT: 30,
  COMMENT_MAX_LIMIT: 100,

  REVIEW_DEFAULT_LIMIT: 20,
  REVIEW_MAX_LIMIT: 100,

  SEARCH_DEFAULT_LIMIT: 20,
  SEARCH_MAX_LIMIT: 100,
} as const;

// ============================================================
// SORTING
// ============================================================

export const SORT_DIRECTION = {
  ASC: "asc",
  DESC: "desc",
} as const;

export type SortDirection =
  typeof SORT_DIRECTION[
    keyof typeof SORT_DIRECTION
  ];

// ============================================================
// LANGUAGES
// ============================================================

export const LANGUAGES = {
  RU: "ru",
  TJ: "tj",
  EN: "en",
  FA: "fa",
} as const;

export type Language =
  typeof LANGUAGES[
    keyof typeof LANGUAGES
  ];

// Алиасы для мест, где язык может называться иначе.
export const LANGUAGE_CODES = LANGUAGES;

// ============================================================
// LANGUAGE METADATA
// ============================================================

export const LANGUAGE_INFO = {
  ru: {
    code: "ru",
    name: "Русский",
    nativeName: "Русский",
    direction: "ltr",
  },

  tj: {
    code: "tj",
    name: "Таджикский",
    nativeName: "Тоҷикӣ",
    direction: "ltr",
  },

  en: {
    code: "en",
    name: "English",
    nativeName: "English",
    direction: "ltr",
  },

  fa: {
    code: "fa",
    name: "Persian",
    nativeName: "فارسی",
    direction: "rtl",
  },
} as const;

export type LanguageDirection =
  "ltr" | "rtl";

// ============================================================
// RTL
// ============================================================

export const RTL_LANGUAGES = [
  "fa",
] as const;

export const LTR_LANGUAGES = [
  "ru",
  "tj",
  "en",
] as const;

// ============================================================
// USER INTERFACE
// ============================================================

export const UI = {
  THEME: {
    LIGHT: "light",
    DARK: "dark",
    SYSTEM: "system",
  },

  DEFAULT_THEME: "system",

  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  DESKTOP_BREAKPOINT: 1280,

  MOBILE_MAX_WIDTH: 767,
  TABLET_MIN_WIDTH: 768,
  TABLET_MAX_WIDTH: 1023,
  DESKTOP_MIN_WIDTH: 1024,

  ANIMATION_FAST_MS: 150,
  ANIMATION_NORMAL_MS: 250,
  ANIMATION_SLOW_MS: 400,

  TOAST_DURATION_MS: 4000,

  MODAL_Z_INDEX: 1000,
  DROPDOWN_Z_INDEX: 1100,
  NOTIFICATION_Z_INDEX: 1200,
  CHAT_Z_INDEX: 1300,
  SYSTEM_Z_INDEX: 2000,
} as const;

// ============================================================
// SEARCH
// ============================================================

export const SEARCH = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,

  MIN_QUERY_LENGTH: 1,
  MAX_QUERY_LENGTH: 300,

  MIN_FUZZY_DISTANCE: 0,
  MAX_FUZZY_DISTANCE: 3,

  SEARCHABLE_PUBLICATION_FIELDS: [
    "title",
    "description",
    "company",
    "country",
    "region",
    "city",
    "category",
    "tags",
  ],

  SEARCHABLE_PROFILE_FIELDS: [
    "display_name",
    "first_name",
    "last_name",
    "username",
    "city",
    "country",
    "bio",
  ],

  SEARCHABLE_COMMENT_FIELDS: [
    "text",
    "author_name",
    "username",
  ],

  SEARCHABLE_REVIEW_FIELDS: [
    "title",
    "text",
    "author_name",
    "username",
  ],

  SEARCHABLE_CHAT_FIELDS: [
    "text",
    "sender_name",
    "username",
  ],

  TYPES: {
    ALL: "all",
    PUBLICATIONS: "publications",
    USERS: "users",
    COMMENTS: "comments",
    REVIEWS: "reviews",
    CHATS: "chats",
    CATEGORIES: "categories",
  },
} as const;

// ============================================================
// CHAT
// ============================================================

export const CHAT = {
  MAX_MESSAGE_LENGTH: 10000,

  MAX_MESSAGES_PER_PAGE: 100,
  DEFAULT_MESSAGES_PER_PAGE: 50,

  MAX_CONVERSATIONS_PER_PAGE: 50,
  DEFAULT_CONVERSATIONS_PER_PAGE: 20,

  MAX_ATTACHMENTS_PER_MESSAGE: 10,

  MAX_MESSAGE_EDIT_MINUTES: 60 * 24,

  MAX_FORWARD_COUNT: 100,

  MAX_PINNED_MESSAGES: 100,

  TYPING_TIMEOUT_SECONDS: 10,

  PRESENCE_TIMEOUT_SECONDS: 60,

  MESSAGE_SEARCH_LIMIT: 100,

  MAX_REACTIONS_PER_MESSAGE: 100,

  MAX_REPLY_DEPTH: 20,

  SYSTEM_CHAT_ID: "system",

  ADMIN_CHAT_TYPE: "admin_private",

  SYSTEM_CHAT_TYPE: "system_only",

  PRIVATE_CHAT_TYPE: "private",

  GROUP_CHAT_TYPE: "group",

  CHANNEL_CHAT_TYPE: "channel",
} as const;

// ============================================================
// NOTIFICATIONS
// ============================================================

export const NOTIFICATIONS = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,

  TITLE_MAX_LENGTH: 300,
  BODY_MAX_LENGTH: 5000,

  RETENTION_DAYS: 365,

  CHANNELS: {
    IN_APP: "in_app",
    PUSH: "push",
    SOUND: "sound",
    VIBRATION: "vibration",
    EMAIL: "email",
    SYSTEM_CHAT: "system_chat",
    BADGE: "badge",
  },

  PRIORITIES: {
    LOW: "low",
    NORMAL: "normal",
    HIGH: "high",
    URGENT: "urgent",
  },

  STATUS: {
    UNREAD: "unread",
    READ: "read",
    ARCHIVED: "archived",
    DELETED: "deleted",
  },

  CATEGORIES: {
    REPORTS: "reports",
    PARTICIPANTS: "participants",
    COMMENTS: "comments",
    PUBLICATIONS: "publications",
    CHATS: "chats",
    REACTIONS: "reactions",
    REVIEWS: "reviews",
    SHARES: "shares",
    PAYMENTS: "payments",
    PREMIUM: "premium",
    VIP: "vip",
    PRO: "pro",
    TOP: "top",
    LEVELS: "levels",
    SYSTEM: "system",
    STATISTICS: "statistics",
    ACTIVITY: "activity",
    SECURITY: "security",
    ALL: "all",
  },

  DELIVERY: {
    INSTANT: "instant",
    GROUPED: "grouped",
    SILENT: "silent",
  },
} as const;

// ============================================================
// REVIEWS
// ============================================================

export const REVIEWS = {
  MIN_RATING: 1,
  MAX_RATING: 5,

  DEFAULT_RATING: 5,

  MAX_TITLE_LENGTH: 300,
  MAX_TEXT_LENGTH: 10000,

  MAX_REPLIES_PER_REVIEW: 1000,

  MAX_REACTIONS_PER_REVIEW: 100,

  MAX_REPORTS_PER_REVIEW: 100,

  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,

  SORT: {
    NEWEST: "newest",
    OLDEST: "oldest",
    HIGHEST_RATING: "highest_rating",
    LOWEST_RATING: "lowest_rating",
    MOST_HELPFUL: "most_helpful",
    MOST_REACTIONS: "most_reactions",
  },
} as const;

// ============================================================
// COMMENTS
// ============================================================

export const COMMENTS = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 5000,

  MAX_REPLY_DEPTH: 20,

  DEFAULT_LIMIT: 30,
  MAX_LIMIT: 100,

  MAX_REACTIONS_PER_COMMENT: 100,
} as const;

// ============================================================
// REACTIONS
// ============================================================

export const REACTIONS = {
  DEFAULT: "like",

  MAX_PER_TARGET: 1,

  TYPES: [
    "like",
    "love",
    "useful",
    "support",
    "interesting",
    "congratulations",
    "sad",
    "angry",
    "wow",
    "celebrate",
    "thanks",
  ],
} as const;

// ============================================================
// PUBLICATIONS
// ============================================================

export const PUBLICATIONS = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  TITLE_MAX_LENGTH: 300,

  TEXT_MAX_LENGTH: 30000,

  MAX_MEDIA: 50,

  FREE_AUTO_DELETE_DAYS: 10,

  TYPES: {
    FREE: "FREE",
    PREMIUM: "PREMIUM",
    VIP: "VIP",
    CUSTOM: "CUSTOM",
  },

  PRIORITIES: {
    LOW: 0,
    NORMAL: 10,
    HIGH: 50,
    TOP: 100,
    VIP: 1000,
  },

  VISIBILITY: {
    PUBLIC: "public",
    PRIVATE: "private",
    UNLISTED: "unlisted",
    ADMIN_ONLY: "admin_only",
  },

  AUTHOR_VISIBILITY: {
    PUBLIC: "public",
    ANONYMOUS: "anonymous",
    ADMIN_ONLY: "admin_only",
  },
} as const;

// ============================================================
// LEVELS
// ============================================================

export const LEVELS = {
  MIN: 0,
  MAX: 12,

  PUBLIC_MIN: 1,
  PUBLIC_MAX: 12,

  HIDDEN_LEVEL: 0,

  DEFAULT: 0,

  NAMES: {
    1: "Новичок",
    2: "Участник",
    3: "Активный",
    4: "Продвинутый",
    5: "Доверенный",
    6: "Опытный",
    7: "Проверенный участник",
    8: "Авторитетный",
    9: "Профессионал",
    10: "Лидер",
    11: "Элита",
    12: "Global",
  },

  BADGE_PREFIX: "Lv.",
} as const;

// ============================================================
// SERVICES / SUBSCRIPTIONS
// ============================================================

export const SERVICES = {
  FREE: "free",

  TOP: "top",
  TOP_3_MONTHS: "top_3_months",
  TOP_1_YEAR: "top_1_year",

  PREMIUM: "premium",

  PRO: "pro",
  PRO_3_MONTHS: "pro_3_months",
  PRO_1_YEAR: "pro_1_year",

  VIP_PUBLICATION: "vip_publication",
  PREMIUM_PUBLICATION: "premium_publication",
} as const;

export const SERVICE_PRICES = {
  TOP_3_MONTHS: 30,
  TOP_1_YEAR: 100,

  PREMIUM_PUBLICATION: 10,

  PRO_3_MONTHS: 50,
  PRO_1_YEAR: 120,

  VIP_PUBLICATION: 20,
} as const;

// ============================================================
// ADMIN
// ============================================================

export const ADMIN = {
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 200,

  SESSION_HOURS: 12,

  SEARCH_LIMIT: 100,

  MAX_BULK_ACTION_SIZE: 500,

  CONFIRMATION_REQUIRED_ACTIONS: [
    "delete",
    "hard_delete",
    "block",
    "unblock",
    "restore",
    "change_permissions",
    "change_level",
    "change_service",
    "change_price",
    "impersonate",
  ],

  SECTIONS: [
    "dashboard",
    "participants",
    "publications",
    "comments",
    "reviews",
    "chats",
    "notifications",
    "reports",
    "moderation",
    "payments",
    "premium",
    "pro",
    "top",
    "vip",
    "levels",
    "badges",
    "categories",
    "analytics",
    "activity",
    "audit",
    "security",
    "permissions",
    "feature_flags",
    "settings",
    "system",
  ],
} as const;

// ============================================================
// FEATURE FLAGS
// ============================================================

export const FEATURES = {
  PUBLICATIONS: "publications",
  COMMENTS: "comments",
  REACTIONS: "reactions",
  REVIEWS: "reviews",
  CHAT: "chat",
  PRIVATE_CHAT: "private_chat",
  SYSTEM_CHAT: "system_chat",
  MEDIA: "media",
  IMAGE_UPLOAD: "image_upload",
  VIDEO_UPLOAD: "video_upload",
  AUDIO_UPLOAD: "audio_upload",
  DOCUMENT_UPLOAD: "document_upload",
  SEARCH: "search",
  NOTIFICATIONS: "notifications",
  PUSH_NOTIFICATIONS: "push_notifications",
  EMAIL_NOTIFICATIONS: "email_notifications",
  SHARES: "shares",
  BOOKMARKS: "bookmarks",
  REPORTS: "reports",
  LEVELS: "levels",
  BADGES: "badges",
  PREMIUM: "premium",
  PRO: "pro",
  TOP: "top",
  VIP: "vip",
  PAYMENTS: "payments",
  AI: "ai",
  RECOMMENDATIONS: "recommendations",
  LIVE: "live",
  EVENTS: "events",
  INTERNATIONAL: "international",
  MAINTENANCE: "maintenance",
} as const;

// ============================================================
// SYSTEM SETTINGS
// ============================================================

export const SYSTEM_SETTINGS = {
  MAINTENANCE_MODE: "maintenance_mode",

  REGISTRATION_ENABLED: "registration_enabled",

  PUBLICATIONS_ENABLED: "publications_enabled",

  COMMENTS_ENABLED: "comments_enabled",

  REVIEWS_ENABLED: "reviews_enabled",

  CHAT_ENABLED: "chat_enabled",

  MEDIA_ENABLED: "media_enabled",

  SEARCH_ENABLED: "search_enabled",

  NOTIFICATIONS_ENABLED: "notifications_enabled",

  PUSH_NOTIFICATIONS_ENABLED:
    "push_notifications_enabled",

  EMAIL_NOTIFICATIONS_ENABLED:
    "email_notifications_enabled",

  PAYMENTS_ENABLED: "payments_enabled",

  PREMIUM_ENABLED: "premium_enabled",

  PRO_ENABLED: "pro_enabled",

  TOP_ENABLED: "top_enabled",

  VIP_ENABLED: "vip_enabled",

  LEVELS_ENABLED: "levels_enabled",

  AI_ENABLED: "ai_enabled",

  INTERNATIONAL_ENABLED:
    "international_enabled",

  DEFAULT_LANGUAGE: "default_language",

  SUPPORTED_LANGUAGES:
    "supported_languages",

  DEFAULT_COUNTRY: "default_country",

  TIMEZONE: "timezone",
} as const;

// ============================================================
// MEDIA
// ============================================================

export const MEDIA = {
  TYPES: {
    IMAGE: "image",
    VIDEO: "video",
    AUDIO: "audio",
    VOICE: "voice",
    DOCUMENT: "document",
  },

  IMAGE_FORMATS: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ],

  VIDEO_FORMATS: [
    "video/mp4",
    "video/webm",
    "video/quicktime",
  ],

  AUDIO_FORMATS: [
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/ogg",
    "audio/webm",
    "audio/mp4",
    "audio/aac",
  ],
} as const;

// ============================================================
// DATABASE
// ============================================================

export const DATABASE = {
  DEFAULT_LIMIT: 100,
  MAX_LIMIT: 1000,

  BUSY_TIMEOUT_MS: 5000,

  MAX_RETRIES: 3,

  RETRY_DELAY_MS: 100,

  MIGRATION_TABLE: "schema_migrations",
} as const;

// ============================================================
// ERROR CODES
// ============================================================

export const ERROR_CODES = {
  BAD_REQUEST: "BAD_REQUEST",
  VALIDATION_ERROR: "VALIDATION_ERROR",

  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",

  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",

  RATE_LIMITED: "RATE_LIMITED",

  INTERNAL_ERROR: "INTERNAL_ERROR",

  DATABASE_ERROR: "DATABASE_ERROR",

  MEDIA_ERROR: "MEDIA_ERROR",

  PUBLICATION_ERROR: "PUBLICATION_ERROR",
  COMMENT_ERROR: "COMMENT_ERROR",
  REVIEW_ERROR: "REVIEW_ERROR",

  CHAT_ERROR: "CHAT_ERROR",
  MESSAGE_ERROR: "MESSAGE_ERROR",

  NOTIFICATION_ERROR:
    "NOTIFICATION_ERROR",

  PERMISSION_ERROR: "PERMISSION_ERROR",

  ADMIN_ERROR: "ADMIN_ERROR",

  MAINTENANCE: "MAINTENANCE",
} as const;

// ============================================================
// RESPONSE
// ============================================================

export const RESPONSE = {
  SUCCESS: true,
  ERROR: false,

  DEFAULT_ERROR_MESSAGE:
    "Произошла внутренняя ошибка сервера.",

  DEFAULT_NOT_FOUND_MESSAGE:
    "Запрашиваемый ресурс не найден.",

  DEFAULT_UNAUTHORIZED_MESSAGE:
    "Требуется авторизация.",

  DEFAULT_FORBIDDEN_MESSAGE:
    "Недостаточно прав.",

  DEFAULT_VALIDATION_MESSAGE:
    "Проверьте правильность введённых данных.",
} as const;

// ============================================================
// HEADERS
// ============================================================

export const HEADERS = {
  REQUEST_ID: "X-Request-ID",

  CONTENT_TYPE: "Content-Type",

  AUTHORIZATION: "Authorization",

  ACCEPT: "Accept",

  USER_AGENT: "User-Agent",

  REFERER: "Referer",

  ORIGIN: "Origin",

  COOKIE: "Cookie",

  SET_COOKIE: "Set-Cookie",

  CACHE_CONTROL: "Cache-Control",

  ETAG: "ETag",

  IF_NONE_MATCH: "If-None-Match",

  LOCATION: "Location",

  X_FORWARDED_FOR: "X-Forwarded-For",

  CF_CONNECTING_IP: "CF-Connecting-IP",

  CF_COUNTRY: "CF-IPCountry",

  CF_RAY: "CF-Ray",
} as const;

// ============================================================
// CONTENT TYPES
// ============================================================

export const CONTENT_TYPES = {
  JSON: "application/json",
  JSON_UTF8:
    "application/json; charset=utf-8",

  TEXT: "text/plain",
  TEXT_UTF8:
    "text/plain; charset=utf-8",

  HTML: "text/html",
  HTML_UTF8:
    "text/html; charset=utf-8",

  FORM:
    "application/x-www-form-urlencoded",

  MULTIPART:
    "multipart/form-data",

  OCTET_STREAM:
    "application/octet-stream",
} as const;

// ============================================================
// PUBLICATION COUNTERS
// ============================================================

export const PUBLICATION_COUNTERS = {
  VIEWS: "views_count",
  UNIQUE_VIEWS: "unique_views_count",

  LIKES: "likes_count",
  REACTIONS: "reactions_count",

  COMMENTS: "comments_count",
  REVIEWS: "reviews_count",

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

// ============================================================
// USER ACTIVITY
// ============================================================

export const ACTIVITY = {
  ONLINE_TIMEOUT_SECONDS: 60,

  RECENT_ACTIVITY_DAYS: 30,

  MAX_HISTORY_ITEMS: 1000,

  EVENTS: {
    LOGIN: "login",
    LOGOUT: "logout",

    PROFILE_VIEW: "profile_view",
    PROFILE_UPDATE: "profile_update",

    PUBLICATION_CREATE: "publication_create",
    PUBLICATION_VIEW: "publication_view",
    PUBLICATION_EDIT: "publication_edit",
    PUBLICATION_DELETE: "publication_delete",

    COMMENT_CREATE: "comment_create",
    COMMENT_EDIT: "comment_edit",
    COMMENT_DELETE: "comment_delete",

    REACTION_ADD: "reaction_add",
    REACTION_REMOVE: "reaction_remove",

    REVIEW_CREATE: "review_create",
    REVIEW_EDIT: "review_edit",

    SHARE: "share",
    BOOKMARK: "bookmark",

    CHAT_OPEN: "chat_open",
    MESSAGE_SEND: "message_send",

    REPORT_CREATE: "report_create",

    SEARCH: "search",

    ADMIN_ACTION: "admin_action",
  },
} as const;

// ============================================================
// DEFAULT VALUES
// ============================================================

export const DEFAULTS = {
  LANGUAGE: APP.DEFAULT_LANGUAGE,

  COUNTRY: APP.DEFAULT_COUNTRY,

  TIMEZONE: APP.TIMEZONE,

  PAGE_SIZE: PAGINATION.DEFAULT_LIMIT,

  ADMIN_PAGE_SIZE:
    PAGINATION.ADMIN_DEFAULT_LIMIT,

  CHAT_PAGE_SIZE:
    PAGINATION.CHAT_DEFAULT_LIMIT,

  REVIEW_PAGE_SIZE:
    PAGINATION.REVIEW_DEFAULT_LIMIT,

  COMMENT_PAGE_SIZE:
    PAGINATION.COMMENT_DEFAULT_LIMIT,

  LEVEL: LEVELS.DEFAULT,

  RATING: REVIEWS.DEFAULT_RATING,

  PUBLICATION_TYPE:
    PUBLICATIONS.TYPES.FREE,

  PUBLICATION_PRIORITY:
    PUBLICATIONS.PRIORITIES.NORMAL,

  PUBLICATION_VISIBILITY:
    PUBLICATIONS.VISIBILITY.PUBLIC,
} as const;

// ============================================================
// TAJIKISTAN
// ============================================================

export const TAJIKISTAN = {
  COUNTRY_CODE: "TJ",

  COUNTRY_NAME: "Tajikistan",

  CAPITAL: "Dushanbe",

  CURRENCY: "TJS",

  CURRENCY_SYMBOL: "SM",

  TIMEZONE: "Asia/Dushanbe",

  REGIONS: [
    "Dushanbe",
    "Sughd",
    "Khatlon",
    "Gorno-Badakhshan",
    "Districts of Republican Subordination",
  ],
} as const;

// ============================================================
// ROUTES
// ============================================================

export const ROUTES = {
  HOME: "/",

  ADMIN: "/admin",

  PUBLICATIONS: "/publications",

  PUBLICATION: "/publication",

  PROFILE: "/profile",

  CHAT: "/chat",

  SEARCH: "/search",

  SETTINGS: "/settings",

  NOTIFICATIONS: "/notifications",
} as const;

// ============================================================
// TYPE HELPERS
// ============================================================

export type SupportedLanguage =
  typeof APP.SUPPORTED_LANGUAGES[number];

export type HttpMethod =
  typeof HTTP.METHODS[
    keyof typeof HTTP.METHODS
  ];

export type PublicationType =
  typeof PUBLICATIONS.TYPES[
    keyof typeof PUBLICATIONS.TYPES
  ];

export type PublicationVisibility =
  typeof PUBLICATIONS.VISIBILITY[
    keyof typeof PUBLICATIONS.VISIBILITY
  ];

export type NotificationPriority =
  typeof NOTIFICATIONS.PRIORITIES[
    keyof typeof NOTIFICATIONS.PRIORITIES
  ];

export type NotificationStatus =
  typeof NOTIFICATIONS.STATUS[
    keyof typeof NOTIFICATIONS.STATUS
  ];

export type ServiceType =
  typeof SERVICES[
    keyof typeof SERVICES
  ];

// ============================================================
// LANGUAGE HELPERS
// ============================================================

export function isSupportedLanguage(
  value: unknown,
): value is SupportedLanguage {
  return (
    typeof value === "string" &&
    (
      APP.SUPPORTED_LANGUAGES as readonly string[]
    ).includes(value)
  );
}

export function normalizeLanguage(
  value: unknown,
): SupportedLanguage {
  if (isSupportedLanguage(value)) {
    return value;
  }

  return APP.DEFAULT_LANGUAGE;
}

export function isRtlLanguage(
  value: unknown,
): boolean {
  return (
    value === "fa"
  );
}

export function getLanguageDirection(
  value: unknown,
): LanguageDirection {
  return isRtlLanguage(value)
    ? "rtl"
    : "ltr";
}

// ============================================================
// NUMBER HELPERS
// ============================================================

export function isValidLevel(
  value: unknown,
): boolean {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value)
  ) {
    return false;
  }

  return (
    value >= LEVELS.MIN &&
    value <= LEVELS.MAX
  );
}

export function isPublicLevel(
  value: unknown,
): boolean {
  if (!isValidLevel(value)) {
    return false;
  }

  return (
    (value as number) >= LEVELS.PUBLIC_MIN
  );
}

// ============================================================
// PUBLICATION HELPERS
// ============================================================

export function isPublicationType(
  value: unknown,
): value is PublicationType {
  return (
    typeof value === "string" &&
    Object.values(PUBLICATIONS.TYPES)
      .includes(
        value as PublicationType,
      )
  );
}

export function isPublicationVisibility(
  value: unknown,
): value is PublicationVisibility {
  return (
    typeof value === "string" &&
    Object.values(
      PUBLICATIONS.VISIBILITY,
    ).includes(
      value as PublicationVisibility,
    )
  );
}

// ============================================================
// EXPORT DEFAULT
// ============================================================

export default {
  APP,
  API,
  HTTP,
  SECURITY,
  COOKIES,
  CACHE,

  FILE_LIMITS,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  ALLOWED_AUDIO_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  ALLOWED_MEDIA_TYPES,

  CONTENT_LIMITS,
  PAGINATION,

  SORT_DIRECTION,
  LANGUAGES,
  LANGUAGE_INFO,
  LANGUAGE_CODES,

  RTL_LANGUAGES,
  LTR_LANGUAGES,

  UI,
  SEARCH,
  CHAT,
  NOTIFICATIONS,

  REVIEWS,
  COMMENTS,
  REACTIONS,
  PUBLICATIONS,

  LEVELS,

  SERVICES,
  SERVICE_PRICES,

  ADMIN,
  FEATURES,
  SYSTEM_SETTINGS,

  MEDIA,
  DATABASE,

  ERROR_CODES,
  RESPONSE,
  HEADERS,
  CONTENT_TYPES,

  PUBLICATION_COUNTERS,
  ACTIVITY,

  DEFAULTS,
  TAJIKISTAN,
  ROUTES,

  isSupportedLanguage,
  normalizeLanguage,
  isRtlLanguage,
  getLanguageDirection,

  isValidLevel,
  isPublicLevel,

  isPublicationType,
  isPublicationVisibility,
};
