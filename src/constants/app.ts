// ============================================================
// 🇹🇯 TAJIK OPPORTUNITIES
// APPLICATION CONSTANTS
// Version: 2026.09
// ============================================================

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
  ],
} as const;

// ============================================================
// INTERNATIONALIZATION
// ============================================================

export const LANGUAGES = {
  RU: "ru",
  TJ: "tj",
  EN: "en",
  FA: "fa",
} as const;

export type Language =
  typeof LANGUAGES[keyof typeof LANGUAGES];

export const LANGUAGE_METADATA = {
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
    name: "Английский",
    nativeName: "English",
    direction: "ltr",
  },

  fa: {
    code: "fa",
    name: "Персидский",
    nativeName: "فارسی",
    direction: "rtl",
  },
} as const;

export const I18N = {
  DEFAULT_LANGUAGE: "ru",

  FALLBACK_LANGUAGE: "ru",

  SUPPORTED_LANGUAGES: [
    "ru",
    "tj",
    "en",
    "fa",
  ] as const,

  RTL_LANGUAGES: [
    "fa",
  ] as const,

  LTR_LANGUAGES: [
    "ru",
    "tj",
    "en",
  ] as const,

  COOKIE_NAME: "to_language",

  STORAGE_KEY: "to_language",

  HTML_LANG_ATTRIBUTE: true,

  HTML_DIR_ATTRIBUTE: true,
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

  SEARCH: "/api/search",
  ACTIVITY: "/api/activity",

  ADMIN: "/api/admin",
  ADMIN_LOGIN: "/api/admin/login",
  ADMIN_LOGOUT: "/api/admin/logout",
  ADMIN_ME: "/api/admin/me",
  ADMIN_DASHBOARD: "/api/admin/dashboard",

  ADMIN_PARTICIPANTS: "/api/admin/participants",
  ADMIN_PUBLICATIONS: "/api/admin/publications",
  ADMIN_COMMENTS: "/api/admin/comments",
  ADMIN_REVIEWS: "/api/admin/reviews",
  ADMIN_REPORTS: "/api/admin/reports",
  ADMIN_CHATS: "/api/admin/chats",
  ADMIN_NOTIFICATIONS: "/api/admin/notifications",
  ADMIN_PAYMENTS: "/api/admin/payments",
  ADMIN_SETTINGS: "/api/admin/settings",
  ADMIN_PERMISSIONS: "/api/admin/permissions",
  ADMIN_ACTIVITY: "/api/admin/activity",
  ADMIN_AUDIT: "/api/admin/audit",
  ADMIN_FEATURES: "/api/admin/features",
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
} as const;

export type HttpMethod =
  typeof HTTP.METHODS[keyof typeof HTTP.METHODS];

// ============================================================
// HTTP HEADERS
// ============================================================

export const HEADERS = {
  REQUEST_ID: "X-Request-ID",
  CONTENT_TYPE: "Content-Type",
  CONTENT_LENGTH: "Content-Length",
  ACCEPT: "Accept",
  AUTHORIZATION: "Authorization",
  COOKIE: "Cookie",
  SET_COOKIE: "Set-Cookie",
  CACHE_CONTROL: "Cache-Control",
  ETAG: "ETag",
  IF_NONE_MATCH: "If-None-Match",
  ORIGIN: "Origin",
  REFERER: "Referer",
  USER_AGENT: "User-Agent",
  X_FORWARDED_FOR: "X-Forwarded-For",
  CF_CONNECTING_IP: "CF-Connecting-IP",
  CF_RAY: "CF-Ray",
  CF_COUNTRY: "CF-IPCountry",
} as const;

// ============================================================
// CONTENT TYPES
// ============================================================

export const CONTENT_TYPES = {
  JSON: "application/json",
  TEXT: "text/plain; charset=utf-8",
  HTML: "text/html; charset=utf-8",
  FORM: "application/x-www-form-urlencoded",
  MULTIPART: "multipart/form-data",
  OCTET_STREAM: "application/octet-stream",

  JPEG: "image/jpeg",
  PNG: "image/png",
  WEBP: "image/webp",
  GIF: "image/gif",

  PDF: "application/pdf",
  DOC: "application/msword",
  DOCX:
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
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

  MAX_SEARCH_REQUESTS_PER_WINDOW: 60,

  MAX_UPLOAD_REQUESTS_PER_WINDOW: 30,

  MAX_NOTIFICATION_REQUESTS_PER_WINDOW: 120,

  CSRF_TOKEN_LENGTH: 64,

  API_TOKEN_LENGTH: 128,

  PASSWORD_HASH_ITERATIONS: 310000,

  PBKDF2_HASH_LENGTH: 32,

  MAX_SESSION_AGE_SECONDS:
    60 * 60 * 24 * 30,

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
    PATH: "/admin",
  },

  LANGUAGE: {
    NAME: "to_language",
    MAX_AGE: 60 * 60 * 24 * 365,
    HTTP_ONLY: false,
    SECURE: true,
    SAME_SITE: "Lax",
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

  NO_CACHE: 0,
} as const;

// ============================================================
// FILES
// ============================================================

export const FILE_LIMITS = {
  MAX_UPLOAD_SIZE_MB: 20,
  MAX_UPLOAD_SIZE_BYTES: 20 * 1024 * 1024,

  MAX_IMAGE_SIZE_MB: 10,
  MAX_IMAGE_SIZE_BYTES: 10 * 1024 * 1024,

  MAX_VIDEO_SIZE_MB: 200,
  MAX_VIDEO_SIZE_BYTES: 200 * 1024 * 1024,

  MAX_AUDIO_SIZE_MB: 50,
  MAX_AUDIO_SIZE_BYTES: 50 * 1024 * 1024,

  MAX_VOICE_SIZE_MB: 25,
  MAX_VOICE_SIZE_BYTES: 25 * 1024 * 1024,

  MAX_AVATAR_SIZE_MB: 5,
  MAX_AVATAR_SIZE_BYTES: 5 * 1024 * 1024,

  MAX_DOCUMENT_SIZE_MB: 20,
  MAX_DOCUMENT_SIZE_BYTES: 20 * 1024 * 1024,

  MAX_FILES_PER_PUBLICATION: 50,

  MAX_FILES_PER_MESSAGE: 10,

  MAX_PROFILE_IMAGES: 10,

  MAX_PHOTOS_PER_PUBLICATION: 50,

  MAX_VIDEOS_PER_PUBLICATION: 10,

  MAX_DOCUMENTS_PER_PUBLICATION: 20,

  MAX_ATTACHMENTS_PER_MESSAGE: 10,
} as const;

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
  "text/plain",
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

  COMMENT_MIN: 1,
  COMMENT_MAX: 5000,

  MESSAGE_MIN: 1,
  MESSAGE_MAX: 10000,

  REPORT_REASON_MIN: 1,
  REPORT_REASON_MAX: 5000,

  SEARCH_QUERY_MIN: 1,
  SEARCH_QUERY_MAX: 300,

  SEARCH_RESULTS_MAX: 100,

  NOTIFICATION_TITLE_MAX: 300,
  NOTIFICATION_BODY_MAX: 5000,

  PUBLICATION_TITLE_MIN: 1,
  PUBLICATION_TITLE_MAX: 300,

  PUBLICATION_TEXT_MIN: 1,
  PUBLICATION_TEXT_MAX: 50000,

  LINK_MAX: 5000,

  TAG_MAX: 100,

  TAGS_PER_PUBLICATION: 30,

  POLL_QUESTION_MAX: 1000,

  POLL_OPTIONS_MAX: 50,

  PROFILE_LINKS_MAX: 20,
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

  COMMENT_DEFAULT_LIMIT: 50,
  COMMENT_MAX_LIMIT: 100,

  NOTIFICATION_DEFAULT_LIMIT: 50,
  NOTIFICATION_MAX_LIMIT: 100,
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

  RTL_LANGUAGES: [
    "fa",
  ] as const,

  LTR_LANGUAGES: [
    "ru",
    "tj",
    "en",
  ] as const,
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
  ],

  SEARCHABLE_PROFILE_FIELDS: [
    "display_name",
    "first_name",
    "last_name",
    "username",
    "city",
    "country",
  ],

  SEARCHABLE_COMMENT_FIELDS: [
    "text",
  ],

  SEARCHABLE_REVIEW_FIELDS: [
    "title",
    "text",
  ],

  SEARCHABLE_CHAT_FIELDS: [
    "text",
  ],
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

  MAX_MESSAGE_EDIT_MINUTES: 60,

  MAX_MESSAGE_DELETE_MINUTES: 60,

  MAX_FORWARD_COUNT: 100,

  MAX_REPLY_DEPTH: 50,

  MAX_SEARCH_RESULTS: 100,

  TYPING_TIMEOUT_SECONDS: 10,

  ONLINE_TIMEOUT_SECONDS: 60,

  LAST_SEEN_UPDATE_SECONDS: 30,

  MAX_PINNED_MESSAGES: 100,

  MAX_ADMIN_NOTES_PER_CONVERSATION: 100,

  SYSTEM_CHAT_ENABLED: true,

  ADMIN_CHAT_ENABLED: true,

  USER_TO_USER_CHAT_ENABLED: false,
} as const;

// ============================================================
// NOTIFICATIONS
// ============================================================

export const NOTIFICATIONS = {
  DEFAULT_PAGE_SIZE: 50,

  MAX_PAGE_SIZE: 100,

  MAX_TITLE_LENGTH: 300,

  MAX_BODY_LENGTH: 5000,

  MAX_UNREAD_BADGE: 999,

  RETENTION_DAYS: 365,

  ADMIN_RETENTION_DAYS: 730,

  CHANNELS: {
    IN_APP: "in_app",
    PUSH: "push",
    EMAIL: "email",
    SOUND: "sound",
    VIBRATION: "vibration",
    SYSTEM_CHAT: "system_chat",
    BADGE: "badge",
  },

  PRIORITIES: {
    LOW: "low",
    NORMAL: "normal",
    HIGH: "high",
    URGENT: "urgent",
    CRITICAL: "critical",
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
  },

  EVENTS: {
    NEW_REPORT: "new_report",
    REPORT_UPDATED: "report_updated",

    NEW_PARTICIPANT: "new_participant",
    PARTICIPANT_UPDATED: "participant_updated",
    PARTICIPANT_BLOCKED: "participant_blocked",
    PARTICIPANT_UNBLOCKED: "participant_unblocked",

    NEW_COMMENT: "new_comment",
    COMMENT_REPLY: "comment_reply",
    COMMENT_REACTION: "comment_reaction",

    NEW_PUBLICATION: "new_publication",
    PUBLICATION_APPROVED: "publication_approved",
    PUBLICATION_REJECTED: "publication_rejected",
    PUBLICATION_EDITED: "publication_edited",

    NEW_MESSAGE: "new_message",
    MESSAGE_REPLY: "message_reply",

    NEW_REACTION: "new_reaction",
    NEW_REVIEW: "new_review",

    NEW_SHARE: "new_share",

    PAYMENT_RECEIVED: "payment_received",
    PAYMENT_CONFIRMED: "payment_confirmed",

    PREMIUM_REQUEST: "premium_request",
    VIP_REQUEST: "vip_request",
    PRO_REQUEST: "pro_request",
    TOP_REQUEST: "top_request",

    LEVEL_CHANGED: "level_changed",
    BADGE_GRANTED: "badge_granted",

    SYSTEM_MESSAGE: "system_message",
    SECURITY_ALERT: "security_alert",
  },
} as const;

// ============================================================
// COMMENTS
// ============================================================

export const COMMENTS = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 5000,

  MAX_REPLY_DEPTH: 50,

  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 100,

  MAX_REACTIONS_PER_COMMENT: 100,

  EDIT_WINDOW_MINUTES: 60,

  MAX_MENTIONS: 20,

  ALLOW_GUEST_COMMENTS: true,

  ALLOW_REPLIES: true,

  ALLOW_REACTIONS: true,

  ALLOW_REPORTS: true,
} as const;

// ============================================================
// REACTIONS
// ============================================================

export const REACTIONS = {
  DEFAULT: "like",

  MAX_PER_USER_PER_TARGET: 1,

  MAX_CUSTOM_TYPES: 100,

  PUBLICATION_ENABLED: true,

  COMMENT_ENABLED: true,

  REVIEW_ENABLED: true,

  MESSAGE_ENABLED: true,

  ALLOWED_TYPES: [
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
  ] as const,
} as const;

// ============================================================
// VIEWS
// ============================================================

export const VIEWS = {
  UNIQUE_SESSION_WINDOW_MINUTES: 30,

  UNIQUE_VISITOR_WINDOW_MINUTES: 30,

  MAX_EVENTS_PER_MINUTE: 60,

  TRACK_PUBLICATIONS: true,

  TRACK_PROFILES: true,

  TRACK_MEDIA: true,

  TRACK_LINKS: true,
} as const;

// ============================================================
// PUBLICATIONS
// ============================================================

export const PUBLICATIONS = {
  DEFAULT_PAGE_SIZE: 20,

  MAX_PAGE_SIZE: 100,

  MAX_MEDIA: 50,

  MAX_IMAGES: 50,

  MAX_VIDEOS: 10,

  MAX_DOCUMENTS: 20,

  MAX_LINKS: 20,

  MAX_TAGS: 30,

  FREE_AUTO_DELETE_DAYS: 10,

  PREMIUM_AUTO_DELETE: false,

  VIP_AUTO_DELETE: false,

  DEFAULT_TYPE: "free",

  DEFAULT_VISIBILITY: "public",

  DEFAULT_PRIORITY: 0,

  MAX_TITLE_LENGTH: 300,

  MAX_TEXT_LENGTH: 50000,

  MAX_COMPANY_LENGTH: 300,

  MAX_LOCATION_LENGTH: 300,

  MAX_SALARY_LENGTH: 200,

  MAX_CONTACT_LENGTH: 1000,

  MAX_APPLICATION_TEXT_LENGTH: 10000,

  ALLOW_EDIT_BEFORE_MODERATION: true,

  ALLOW_ADMIN_OVERRIDE: true,

  ALLOW_ADMIN_PIN: true,

  ALLOW_ADMIN_FEATURED: true,

  ALLOW_ADMIN_CUSTOM_TYPE: true,
} as const;

// ============================================================
// ADMIN
// ============================================================

export const ADMIN = {
  SESSION_DURATION_HOURS: 12,

  MAX_SESSIONS_PER_ADMIN: 10,

  DEFAULT_PAGE_SIZE: 50,

  MAX_PAGE_SIZE: 200,

  SEARCH_MIN_LENGTH: 1,

  SEARCH_MAX_LENGTH: 300,

  MAX_BULK_ACTION_ITEMS: 500,

  ACTING_MODE_ENABLED: true,

  INTERNAL_NOTES_ENABLED: true,

  AUDIT_LOG_ENABLED: true,

  CONFIRM_DANGEROUS_ACTIONS: true,

  REQUIRE_STRONG_CONFIRMATION_FOR_DELETE: true,

  ALLOW_IMPERSONATION: true,

  ALLOW_ADMIN_ACTING_MODE: true,

  ALLOW_ADMIN_INITIATE_CHAT: true,

  ALLOW_ADMIN_MANAGE_NOTIFICATIONS: true,

  ALLOW_ADMIN_MANAGE_PERMISSIONS: true,

  ALLOW_ADMIN_MANAGE_LEVELS: true,

  ALLOW_ADMIN_MANAGE_PRICES: true,

  ALLOW_ADMIN_MANAGE_FEATURE_FLAGS: true,
} as const;

// ============================================================
// LEVELS
// ============================================================

export const LEVELS = {
  MIN: 0,

  MAX: 12,

  DISPLAY_MIN: 1,

  HIDDEN_LEVEL: 0,

  DEFAULT_LEVEL: 0,

  MAX_DISPLAY_LEVEL: 12,

  NAMES: [
    "Новичок",
    "Участник",
    "Активный",
    "Продвинутый",
    "Доверенный",
    "Опытный",
    "Проверенный участник",
    "Авторитетный",
    "Профессионал",
    "Лидер",
    "Элита",
    "Global",
  ] as const,
} as const;

// ============================================================
// SERVICES / MONETIZATION
// ============================================================

export const SERVICES = {
  PREMIUM: {
    CODE: "premium",
    DEFAULT_PRICE: "10",
    CURRENCY: "TJS",
  },

  VIP: {
    CODE: "vip",
    DEFAULT_PRICE: "20",
    CURRENCY: "TJS",
  },

  TOP: {
    CODE: "top",
    DEFAULT_PRICE_3_MONTHS: "30",
    DEFAULT_PRICE_1_YEAR: "100",
    CURRENCY: "TJS",
  },

  PRO: {
    CODE: "pro",
    DEFAULT_PRICE_3_MONTHS: "50",
    DEFAULT_PRICE_1_YEAR: "120",
    CURRENCY: "TJS",
  },
} as const;

// ============================================================
// RATINGS
// ============================================================

export const RATINGS = {
  MIN: 1,

  MAX: 5,

  DEFAULT: 5,

  ALLOWED: [
    1,
    2,
    3,
    4,
    5,
  ] as const,
} as const;

// ============================================================
// REPORTS
// ============================================================

export const REPORTS = {
  MAX_REASON_LENGTH: 5000,

  DEFAULT_PAGE_SIZE: 50,

  MAX_PAGE_SIZE: 200,

  PRIVATE: true,

  SHOW_PUBLIC_REPORT_MARKER: false,

  NOTIFY_ADMIN: true,

  ALLOW_REPORTER_STATUS: true,
} as const;

// ============================================================
// SHARING
// ============================================================

export const SHARES = {
  ENABLED: true,

  COPY_LINK_ENABLED: true,

  SYSTEM_SHARE_ENABLED: true,

  CHAT_SHARE_ENABLED: true,

  IMAGE_SHARE_ENABLED: true,

  TRACK_SOURCE: true,

  TRACK_USER: true,

  TRACK_TIME: true,
} as const;

// ============================================================
// DATABASE
// ============================================================

export const DATABASE = {
  NAME: "tajik-opportunities-db",

  DEFAULT_BATCH_SIZE: 100,

  MAX_BATCH_SIZE: 1000,

  QUERY_TIMEOUT_MS: 10000,

  TRANSACTION_RETRY_COUNT: 3,

  MIGRATION_TABLE: "schema_migrations",
} as const;

// ============================================================
// FEATURES
// ============================================================

export const FEATURES = {
  REGISTRATION: true,

  USERNAME_SYSTEM: true,

  PROFILES: true,

  PUBLICATIONS: true,

  COMMENTS: true,

  REPLIES: true,

  REACTIONS: true,

  REVIEWS: true,

  RATINGS: true,

  BOOKMARKS: true,

  SHARES: true,

  VIEWS: true,

  SEARCH: true,

  PRIVATE_CHAT: true,

  SYSTEM_CHAT: true,

  ADMIN_CHAT: true,

  MEDIA_UPLOADS: true,

  VIDEO: true,

  AUDIO: true,

  VOICE: true,

  DOCUMENTS: true,

  NOTIFICATIONS: true,

  PUSH_NOTIFICATIONS: true,

  EMAIL_NOTIFICATIONS: true,

  PREMIUM: true,

  PRO: true,

  TOP: true,

  VIP: true,

  LEVELS: true,

  BADGES: true,

  ACTIVITY_MONITOR: true,

  ADMIN_ACTING_MODE: true,

  SMART_FEED: true,

  SMART_SEARCH: true,

  RECOMMENDATIONS: true,

  POLLS: true,

  FOLLOWING: true,

  SAVED_FOLDERS: true,

  AI_CENTER: false,

  LIVE: false,

  INTERNATIONAL_MODE: true,
} as const;

// ============================================================
// SYSTEM SETTINGS
// ============================================================

export const SYSTEM_SETTINGS = {
  MAINTENANCE_MODE: "maintenance_mode",

  REGISTRATION_ENABLED: "registration_enabled",

  PUBLICATIONS_ENABLED: "publications_enabled",

  COMMENTS_ENABLED: "comments_enabled",

  REACTIONS_ENABLED: "reactions_enabled",

  REVIEWS_ENABLED: "reviews_enabled",

  CHAT_ENABLED: "chat_enabled",

  MEDIA_UPLOADS_ENABLED: "media_uploads_enabled",

  NOTIFICATIONS_ENABLED: "notifications_enabled",

  PUSH_NOTIFICATIONS_ENABLED: "push_notifications_enabled",

  EMAIL_NOTIFICATIONS_ENABLED: "email_notifications_enabled",

  SEARCH_ENABLED: "search_enabled",

  PAYMENTS_ENABLED: "payments_enabled",

  PREMIUM_ENABLED: "premium_enabled",

  PRO_ENABLED: "pro_enabled",

  TOP_ENABLED: "top_enabled",

  VIP_ENABLED: "vip_enabled",

  LEVELS_ENABLED: "levels_enabled",

  BADGES_ENABLED: "badges_enabled",

  SHARING_ENABLED: "sharing_enabled",

  REPORTS_ENABLED: "reports_enabled",

  ADMIN_ACTING_MODE_ENABLED: "admin_acting_mode_enabled",
} as const;

// ============================================================
// ERROR CODES
// ============================================================

export const ERROR_CODES = {
  UNKNOWN: "UNKNOWN_ERROR",

  BAD_REQUEST: "BAD_REQUEST",

  VALIDATION_ERROR: "VALIDATION_ERROR",

  UNAUTHORIZED: "UNAUTHORIZED",

  FORBIDDEN: "FORBIDDEN",

  NOT_FOUND: "NOT_FOUND",

  CONFLICT: "CONFLICT",

  RATE_LIMITED: "RATE_LIMITED",

  INTERNAL_ERROR: "INTERNAL_ERROR",

  DATABASE_ERROR: "DATABASE_ERROR",

  NETWORK_ERROR: "NETWORK_ERROR",

  MEDIA_ERROR: "MEDIA_ERROR",

  PUBLICATION_ERROR: "PUBLICATION_ERROR",

  COMMENT_ERROR: "COMMENT_ERROR",

  REACTION_ERROR: "REACTION_ERROR",

  REVIEW_ERROR: "REVIEW_ERROR",

  CHAT_ERROR: "CHAT_ERROR",

  NOTIFICATION_ERROR: "NOTIFICATION_ERROR",

  PERMISSION_ERROR: "PERMISSION_ERROR",

  ADMIN_ERROR: "ADMIN_ERROR",

  SECURITY_ERROR: "SECURITY_ERROR",

  MAINTENANCE: "MAINTENANCE",
} as const;

// ============================================================
// RESPONSE
// ============================================================

export const RESPONSE = {
  SUCCESS: "success",

  ERROR: "error",

  DATA: "data",

  MESSAGE: "message",

  CODE: "code",

  DETAILS: "details",

  FIELDS: "fields",

  REQUEST_ID: "requestId",

  META: "meta",

  PAGINATION: "pagination",

  TOTAL: "total",

  LIMIT: "limit",

  OFFSET: "offset",

  HAS_MORE: "hasMore",
} as const;

// ============================================================
// AUDIT
// ============================================================

export const AUDIT = {
  ENABLED: true,

  RETENTION_DAYS: 730,

  TRACK_IP: true,

  TRACK_USER_AGENT: true,

  TRACK_REQUEST_ID: true,

  TRACK_ADMIN_ACTIONS: true,

  TRACK_PERMISSION_CHANGES: true,

  TRACK_PROFILE_CHANGES: true,

  TRACK_PUBLICATION_CHANGES: true,

  TRACK_COMMENT_ACTIONS: true,

  TRACK_REVIEW_ACTIONS: true,

  TRACK_CHAT_ACTIONS: true,

  TRACK_NOTIFICATION_ACTIONS: true,

  TRACK_ACTING_MODE: true,
} as const;

// ============================================================
// ROUTES
// ============================================================

export const ROUTES = {
  HOME: "/",

  ADMIN: "/admin",

  PUBLICATIONS: "/publications",

  PUBLICATION: "/publication",

  COMMENTS: "/comments",

  PROFILE: "/profile",

  SEARCH: "/search",

  CHAT: "/chat",

  NOTIFICATIONS: "/notifications",

  SETTINGS: "/settings",

  HEALTH: "/health",
} as const;

// ============================================================
// TAJIKISTAN
// ============================================================

export const TAJIKISTAN = {
  COUNTRY_CODE: "TJ",

  COUNTRY_NAME: "Tajikistan",

  COUNTRY_NAME_RU: "Таджикистан",

  COUNTRY_NAME_TJ: "Тоҷикистон",

  COUNTRY_NAME_EN: "Tajikistan",

  COUNTRY_NAME_FA: "تاجیکستان",

  CURRENCY: "TJS",

  CURRENCY_SYMBOL: "SM",

  TIMEZONE: "Asia/Dushanbe",

  PHONE_CODE: "+992",

  DEFAULT_LANGUAGE: "ru",

  LANGUAGES: [
    "ru",
    "tj",
    "en",
    "fa",
  ] as const,
} as const;

// ============================================================
// ENVIRONMENTS
// ============================================================

export const ENVIRONMENTS = {
  DEVELOPMENT: "development",
  STAGING: "staging",
  PRODUCTION: "production",
  TEST: "test",
} as const;

export type Environment =
  typeof ENVIRONMENTS[
    keyof typeof ENVIRONMENTS
  ];

// ============================================================
// DEFAULTS
// ============================================================

export const DEFAULTS = {
  LANGUAGE: "ru",

  COUNTRY: "Tajikistan",

  TIMEZONE: "Asia/Dushanbe",

  PAGE_SIZE: 20,

  ADMIN_PAGE_SIZE: 50,

  LEVEL: 0,

  PUBLICATION_TYPE: "free",

  PUBLICATION_VISIBILITY: "public",

  PUBLICATION_PRIORITY: 0,

  REACTION: "like",

  RATING: 5,

  NOTIFICATION_PRIORITY: "normal",

  CHAT_PAGE_SIZE: 50,
} as const;

// ============================================================
// VALIDATION HELPERS
// ============================================================

export function isSupportedLanguage(
  value: unknown,
): value is Language {
  return (
    typeof value === "string" &&
    (
      value === "ru" ||
      value === "tj" ||
      value === "en" ||
      value === "fa"
    )
  );
}

export function isRTL(
  language: string,
): boolean {
  return language === "fa";
}

export function getLanguageDirection(
  language: string,
): "ltr" | "rtl" {
  return isRTL(language) ? "rtl" : "ltr";
}

export function getLanguageMetadata(
  language: string,
) {
  if (isSupportedLanguage(language)) {
    return LANGUAGE_METADATA[language];
  }

  return LANGUAGE_METADATA.ru;
}

export function normalizeLanguage(
  language: unknown,
): Language {
  if (typeof language !== "string") {
    return LANGUAGES.RU;
  }

  const normalized = language
    .trim()
    .toLowerCase()
    .split("-")[0];

  if (isSupportedLanguage(normalized)) {
    return normalized;
  }

  return LANGUAGES.RU;
}

// ============================================================
// END
// ============================================================
