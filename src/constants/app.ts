// ============================================================
// 🇹🇯 TAJIK OPPORTUNITIES
// APPLICATION CONSTANTS
// Version: 2026.09
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
// API
// ============================================================

export const API = {
  PREFIX: "/api",

  ROOT: "/api",

  HEALTH: "/api/health",

  CATEGORIES: "/api/categories",

  PUBLICATIONS: "/api/publications",
  PUBLICATION: "/api/publications",

  AUTH: "/api/auth",
  VISITOR: "/api/visitor",
  PROFILE: "/api/profile",
  PROFILES: "/api/profiles",
  USERS: "/api/users",

  COMMENTS: "/api/comments",
  REACTIONS: "/api/reactions",
  REVIEWS: "/api/reviews",
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

  LEVELS: "/api/levels",
  BADGES: "/api/badges",

  PAYMENTS: "/api/payments",
  PREMIUM: "/api/premium",
  PRO: "/api/pro",
  TOP: "/api/top",
  VIP: "/api/vip",

  SETTINGS: "/api/settings",
  FEATURES: "/api/features",

  MEDIA: "/api/media",

  ADMIN: "/api/admin",
  ADMIN_LOGIN: "/api/admin/login",
  ADMIN_LOGOUT: "/api/admin/logout",
  ADMIN_ME: "/api/admin/me",
  ADMIN_DASHBOARD: "/api/admin/dashboard",
  ADMIN_SEARCH: "/api/admin/search",
  ADMIN_PARTICIPANTS: "/api/admin/participants",
  ADMIN_PUBLICATIONS: "/api/admin/publications",
  ADMIN_COMMENTS: "/api/admin/comments",
  ADMIN_REVIEWS: "/api/admin/reviews",
  ADMIN_CHATS: "/api/admin/chats",
  ADMIN_NOTIFICATIONS: "/api/admin/notifications",
  ADMIN_REPORTS: "/api/admin/reports",
  ADMIN_MODERATION: "/api/admin/moderation",
  ADMIN_PAYMENTS: "/api/admin/payments",
  ADMIN_LEVELS: "/api/admin/levels",
  ADMIN_BADGES: "/api/admin/badges",
  ADMIN_ANALYTICS: "/api/admin/analytics",
  ADMIN_ACTIVITY: "/api/admin/activity",
  ADMIN_AUDIT: "/api/admin/audit",
  ADMIN_SECURITY: "/api/admin/security",
  ADMIN_PERMISSIONS: "/api/admin/permissions",
  ADMIN_FEATURES: "/api/admin/features",
  ADMIN_SETTINGS: "/api/admin/settings",
  ADMIN_SYSTEM: "/api/admin/system",
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
    PAYMENT_REQUIRED: 402,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    NOT_ACCEPTABLE: 406,
    CONFLICT: 409,
    GONE: 410,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,

    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
  },
} as const;

// ============================================================
// HEADERS
// ============================================================

export const HEADERS = {
  REQUEST_ID: "X-Request-ID",
  CONTENT_TYPE: "Content-Type",
  ACCEPT: "Accept",
  AUTHORIZATION: "Authorization",
  COOKIE: "Cookie",
  SET_COOKIE: "Set-Cookie",
  CACHE_CONTROL: "Cache-Control",
  ETAG: "ETag",
  IF_NONE_MATCH: "If-None-Match",
  LOCATION: "Location",
  ORIGIN: "Origin",
  REFERER: "Referer",
  USER_AGENT: "User-Agent",
  X_FORWARDED_FOR: "X-Forwarded-For",
  X_REAL_IP: "X-Real-IP",
  CF_CONNECTING_IP: "CF-Connecting-IP",
} as const;

// ============================================================
// CONTENT TYPES
// ============================================================

export const CONTENT_TYPES = {
  JSON: "application/json; charset=utf-8",
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

  MP3: "audio/mpeg",
  WAV: "audio/wav",
  OGG_AUDIO: "audio/ogg",

  MP4: "video/mp4",
  WEBM: "video/webm",

  ZIP: "application/zip",
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
  MAX_UPLOAD_REQUESTS_PER_WINDOW: 20,

  CSRF_TOKEN_LENGTH: 64,

  API_TOKEN_LENGTH: 128,

  MAX_IP_ENTRIES: 10000,

  PASSWORD_HASH_ITERATIONS: 100000,
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

  MAX_IMAGE_WIDTH: 10000,
  MAX_IMAGE_HEIGHT: 10000,

  MAX_FILENAME_LENGTH: 255,
} as const;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
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

  PUBLICATION_TITLE_MAX: 300,
  PUBLICATION_TEXT_MAX: 50000,

  LINK_MAX: 5000,

  TAG_MAX: 100,
  MAX_TAGS: 50,
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

  NOTIFICATION_DEFAULT_LIMIT: 30,
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
  typeof SORT_DIRECTION[keyof typeof SORT_DIRECTION];

export const SORT = {
  ASC: "asc",
  DESC: "desc",

  NEWEST: "newest",
  OLDEST: "oldest",

  POPULAR: "popular",
  TRENDING: "trending",

  RELEVANT: "relevant",

  MOST_VIEWED: "most_viewed",
  MOST_REACTED: "most_reacted",
  MOST_COMMENTED: "most_commented",
  MOST_SHARED: "most_shared",
  MOST_SAVED: "most_saved",

  RATING_HIGH: "rating_high",
  RATING_LOW: "rating_low",
} as const;

// ============================================================
// LANGUAGES
// ============================================================

export const LANGUAGES = {
  RU: "ru",
  TJ: "tj",
  EN: "en",
} as const;

export type Language =
  typeof LANGUAGES[keyof typeof LANGUAGES];

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

  MAX_CONTENT_WIDTH: 1400,

  TOAST_DURATION_MS: 4000,

  MODAL_ANIMATION_MS: 200,

  SEARCH_DEBOUNCE_MS: 300,

  AUTOSAVE_INTERVAL_MS: 5000,
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
  ],

  SEARCHABLE_COMMENT_FIELDS: [
    "text",
    "author_name",
    "username",
  ],

  SEARCHABLE_CHAT_FIELDS: [
    "message",
    "author_name",
    "username",
  ],

  TYPES: [
    "all",
    "publications",
    "participants",
    "comments",
    "companies",
    "categories",
    "chats",
    "reviews",
    "saved",
  ] as const,
} as const;

// ============================================================
// CHAT
// ============================================================

export const CHAT = {
  MAX_MESSAGE_LENGTH: 10000,

  MAX_MESSAGES_PER_PAGE: 100,
  DEFAULT_MESSAGES_PER_PAGE: 50,

  MAX_CONVERSATIONS_PER_PAGE: 50,

  MAX_ATTACHMENTS_PER_MESSAGE: 10,

  MAX_REPLY_DEPTH: 10,

  EDIT_WINDOW_MINUTES: 0,

  MAX_PINNED_MESSAGES: 100,

  MAX_MESSAGE_REACTIONS: 100,

  TYPING_TIMEOUT_SECONDS: 10,

  ONLINE_TIMEOUT_SECONDS: 60,

  READ_RECEIPT_ENABLED: true,

  DELIVERY_RECEIPT_ENABLED: true,

  FEATURES: {
    TEXT: true,
    PHOTO: true,
    VIDEO: true,
    VOICE: true,
    AUDIO: true,
    DOCUMENT: true,
    LINK: true,

    REPLY: true,
    FORWARD: true,
    EDIT: true,
    DELETE: true,
    PIN: true,
    REACTION: true,

    SEARCH: true,
    UNREAD: true,
    READ_STATUS: true,

    ADMIN_NOTES: true,
    ADMIN_ACTING_MODE: true,
  },
} as const;

// ============================================================
// NOTIFICATIONS
// ============================================================

export const NOTIFICATIONS = {
  DEFAULT_LIMIT: 30,
  MAX_LIMIT: 100,

  MAX_TITLE_LENGTH: 300,
  MAX_BODY_LENGTH: 5000,

  RETENTION_DAYS: 365,

  CHANNELS: [
    "in_app",
    "push",
    "email",
    "sound",
    "vibration",
    "badge",
    "system_chat",
  ] as const,

  CATEGORIES: [
    "reports",
    "participants",
    "comments",
    "publications",
    "chats",
    "reactions",
    "reviews",
    "shares",
    "payments",
    "premium",
    "pro",
    "top",
    "vip",
    "levels",
    "system",
    "statistics",
    "activity",
    "security",
    "all",
  ] as const,

  PRIORITIES: [
    "low",
    "normal",
    "high",
    "urgent",
    "critical",
  ] as const,

  DELIVERY: [
    "instant",
    "grouped",
    "silent",
  ] as const,
} as const;

// ============================================================
// COMMENTS
// ============================================================

export const COMMENTS = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 5000,

  MAX_REPLY_DEPTH: 20,

  MAX_REACTIONS_PER_COMMENT: 100,

  MAX_PINNED_COMMENTS_PER_PUBLICATION: 10,

  FEATURES: {
    REPLIES: true,
    REACTIONS: true,
    EDIT: true,
    DELETE: true,
    PIN: true,
    REPORT: true,
    MENTIONS: true,
  },
} as const;

// ============================================================
// REACTIONS
// ============================================================

export const REACTIONS = {
  DEFAULT: "like",

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
  ] as const,

  MAX_PER_USER_PER_TARGET: 1,

  TARGETS: [
    "publication",
    "comment",
    "review",
    "message",
  ] as const,
} as const;

// ============================================================
// VIEWS
// ============================================================

export const VIEWS = {
  UNIQUE_SESSION_WINDOW_MINUTES: 30,

  COUNT_REPEAT_VIEWS: true,

  TRACK_FIELDS: [
    "publication_id",
    "visitor_id",
    "session_id",
    "user_id",
    "ip_hash",
    "country",
    "region",
    "city",
    "referrer",
    "user_agent",
  ] as const,
} as const;

// ============================================================
// PUBLICATIONS
// ============================================================

export const PUBLICATIONS = {
  DEFAULT_TYPE: "free",

  TYPES: [
    "free",
    "premium",
    "vip",
    "custom",
  ] as const,

  STATUSES: [
    "draft",
    "pending",
    "approved",
    "published",
    "rejected",
    "hidden",
    "archived",
    "deleted",
  ] as const,

  VISIBILITY: [
    "public",
    "unlisted",
    "private",
  ] as const,

  PRIORITIES: [
    "normal",
    "high",
    "top",
    "urgent",
  ] as const,

  DEFAULT_PRIORITY: "normal",

  FREE_AUTO_DELETE_DAYS: 10,

  PREMIUM_DEFAULT_PRICE: 10,
  VIP_DEFAULT_PRICE: 20,

  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  MAX_MEDIA: 50,

  MAX_TITLE_LENGTH: 300,
  MAX_TEXT_LENGTH: 50000,

  FEATURES: {
    COMMENTS: true,
    REACTIONS: true,
    REVIEWS: true,
    SHARES: true,
    BOOKMARKS: true,
    VIEWS: true,

    POLLS: true,
    LINKS: true,
    DOCUMENTS: true,

    PIN: true,
    FEATURED: true,

    ADMIN_OVERRIDE: true,
    ADMIN_ACTING_MODE: true,
  },

  PUBLIC_URL_PREFIX: "/",
} as const;

// ============================================================
// REVIEWS
// ============================================================

export const REVIEWS = {
  MIN_RATING: 1,
  MAX_RATING: 5,

  MIN_TEXT_LENGTH: 1,
  MAX_TEXT_LENGTH: 10000,

  MAX_TITLE_LENGTH: 300,

  MAX_REPLIES: 100,

  ALLOW_ANONYMOUS: true,

  FEATURES: {
    RATING: true,
    REPLIES: true,
    REACTIONS: true,
    REPORTS: true,
    VERIFICATION: true,
    PIN: true,
    MODERATION: true,
  },
} as const;

// ============================================================
// SHARE
// ============================================================

export const SHARE = {
  TYPES: [
    "copy_link",
    "private_chat",
    "participant",
    "system_share",
    "image",
    "external",
  ] as const,

  TRACK_SOURCE: true,

  COUNT_COPIED_LINKS: true,

  FEATURES: {
    COPY_LINK: true,
    SEND_TO_CHAT: true,
    SEND_TO_PARTICIPANT: true,
    SYSTEM_SHARE: true,
    SHARE_AS_IMAGE: true,
  },
} as const;

// ============================================================
// PROFILES
// ============================================================

export const PROFILE = {
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,

  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 100,

  BIO_MAX_LENGTH: 2000,

  MAX_AVATAR_SIZE_MB: 5,

  MAX_PROFILE_IMAGES: 10,

  FEATURES: {
    AVATAR: true,
    BIO: true,
    PUBLICATIONS: true,
    COMMENTS: true,
    REVIEWS: true,
    REACTIONS: true,
    SAVED: true,
    HISTORY: true,
    FOLLOWERS: true,
    FOLLOWING: true,
    BADGES: true,
    LEVEL: true,
    STATS: true,
  },
} as const;

// ============================================================
// LEVELS
// ============================================================

export const LEVELS = {
  MIN: 0,
  MAX: 12,

  PUBLIC_MIN: 1,

  DEFAULT: 0,

  DISPLAY_ZERO: false,

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

  MODES: [
    "automatic",
    "manual",
    "hybrid",
  ] as const,
} as const;

// ============================================================
// SERVICES / PLANS
// ============================================================

export const SERVICES = {
  FREE: "free",
  TOP: "top",
  PREMIUM: "premium",
  PRO: "pro",
  VIP: "vip",
} as const;

export const PRICES = {
  PREMIUM: 10,
  VIP: 20,

  TOP_3_MONTHS: 30,
  TOP_1_YEAR: 100,

  PRO_3_MONTHS: 50,
  PRO_1_YEAR: 120,
} as const;

// ============================================================
// ADMIN
// ============================================================

export const ADMIN = {
  SESSION_HOURS: 12,

  DEFAULT_ROLE: "support",

  ROLES: [
    "superadmin",
    "admin",
    "moderator",
    "editor",
    "support",
  ] as const,

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
  ] as const,

  CONFIRM_DANGEROUS_ACTIONS: true,

  AUDIT_ALL_ACTIONS: true,

  ACTING_MODE: true,

  INTERNAL_NOTES: true,
} as const;

// ============================================================
// ADMIN SECTIONS
// ============================================================

export const ADMIN_SECTIONS = {
  DASHBOARD: "dashboard",
  PARTICIPANTS: "participants",
  PUBLICATIONS: "publications",
  COMMENTS: "comments",
  REVIEWS: "reviews",
  CHATS: "chats",
  NOTIFICATIONS: "notifications",
  REPORTS: "reports",
  MODERATION: "moderation",
  PAYMENTS: "payments",
  PREMIUM: "premium",
  PRO: "pro",
  TOP: "top",
  VIP: "vip",
  LEVELS: "levels",
  BADGES: "badges",
  CATEGORIES: "categories",
  ANALYTICS: "analytics",
  ACTIVITY: "activity",
  AUDIT: "audit",
  SECURITY: "security",
  PERMISSIONS: "permissions",
  FEATURE_FLAGS: "feature_flags",
  SETTINGS: "settings",
  SYSTEM: "system",
} as const;

// ============================================================
// BULK ACTIONS
// ============================================================

export const BULK_ACTIONS = {
  APPROVE: "approve",
  REJECT: "reject",
  PUBLISH: "publish",
  HIDE: "hide",
  ARCHIVE: "archive",
  DELETE: "delete",
  RESTORE: "restore",

  PIN: "pin",
  UNPIN: "unpin",

  FEATURE: "feature",
  UNFEATURE: "unfeature",

  BLOCK: "block",
  UNBLOCK: "unblock",

  MARK_READ: "mark_read",
  MARK_UNREAD: "mark_unread",

  EXPORT: "export",
} as const;

// ============================================================
// AUDIT
// ============================================================

export const AUDIT = {
  ACTIONS: [
    "create",
    "update",
    "delete",
    "restore",
    "approve",
    "reject",
    "publish",
    "hide",
    "archive",
    "pin",
    "unpin",
    "block",
    "unblock",
    "grant",
    "revoke",
    "login",
    "logout",
    "impersonate",
    "acting_mode",
    "system_change",
  ] as const,

  RETENTION_DAYS: 3650,

  STORE_IP_HASH: true,
  STORE_USER_AGENT: true,
  STORE_REQUEST_ID: true,
} as const;

// ============================================================
// FEATURE FLAGS
// ============================================================

export const FEATURES = {
  CHAT: true,
  PRIVATE_ADMIN_CHAT: true,
  SYSTEM_CHAT: true,

  PUBLICATIONS: true,
  COMMENTS: true,
  REACTIONS: true,
  REVIEWS: true,
  SHARES: true,
  BOOKMARKS: true,
  VIEWS: true,

  SEARCH: true,
  SMART_SEARCH: true,

  NOTIFICATIONS: true,
  PUSH_NOTIFICATIONS: true,
  EMAIL_NOTIFICATIONS: true,

  LEVELS: true,
  BADGES: true,

  PREMIUM: true,
  PRO: true,
  TOP: true,
  VIP: true,

  POLLS: true,

  AI_CENTER: false,

  LIVE: false,

  ACTIVITY_MONITOR: true,

  ADMIN_ACTING_MODE: true,

  ADMIN_FULL_CONTROL: true,

  MAINTENANCE_MODE: false,
} as const;

// ============================================================
// DEFAULT FEATURES
// ============================================================

export const DEFAULT_FEATURES = {
  publications: true,
  comments: true,
  reactions: true,
  reviews: true,
  shares: true,
  bookmarks: true,
  views: true,

  chat: true,
  privateAdminChat: true,
  systemChat: true,

  notifications: true,
  pushNotifications: true,

  search: true,
  levels: true,
  badges: true,

  premium: true,
  pro: true,
  top: true,
  vip: true,

  maintenanceMode: false,
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
  REACTIONS_ENABLED: "reactions_enabled",

  CHAT_ENABLED: "chat_enabled",
  PRIVATE_ADMIN_CHAT_ENABLED: "private_admin_chat_enabled",
  SYSTEM_CHAT_ENABLED: "system_chat_enabled",

  MEDIA_UPLOAD_ENABLED: "media_upload_enabled",

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

  MAX_UPLOAD_SIZE_MB: "max_upload_size_mb",

  FREE_PUBLICATION_AUTO_DELETE_DAYS:
    "free_publication_auto_delete_days",

  DEFAULT_LANGUAGE: "default_language",

  DEFAULT_TIMEZONE: "default_timezone",
} as const;

// ============================================================
// NOTIFICATION SETTINGS
// ============================================================

export const NOTIFICATION_SETTINGS = {
  CATEGORIES: [
    "reports",
    "participants",
    "comments",
    "publications",
    "chats",
    "reactions",
    "reviews",
    "shares",
    "payments",
    "premium",
    "pro",
    "top",
    "vip",
    "levels",
    "system",
    "statistics",
    "activity",
    "security",
  ] as const,

  CHANNELS: [
    "in_app",
    "push",
    "email",
    "sound",
    "vibration",
    "badge",
    "system_chat",
  ] as const,

  MODES: [
    "instant",
    "grouped",
    "silent",
  ] as const,

  DEFAULT_ENABLED: true,

  FORCED_SECURITY_NOTIFICATIONS: true,

  ALLOW_PARTICIPANT_OVERRIDE: true,

  ADMIN_CAN_DISABLE_PER_USER: true,

  ADMIN_CAN_DISABLE_GLOBALLY: true,
} as const;

// ============================================================
// DATABASE
// ============================================================

export const DATABASE = {
  MAX_QUERY_PARAMS: 100,

  DEFAULT_TRANSACTION_RETRIES: 3,

  BUSY_TIMEOUT_MS: 5000,

  TABLES: {
    VISITORS: "visitors",
    VISITOR_SESSIONS: "visitor_sessions",

    USERS_PROFILES: "users_profiles",

    CATEGORIES: "categories",

    PUBLICATIONS: "publications",
    PUBLICATION_IMAGES: "publication_images",
    PUBLICATION_HISTORY: "publication_history",
    PUBLICATION_METRICS: "publication_metrics",
    PUBLICATION_METRIC_TOTALS: "publication_metric_totals",

    COMMENTS: "comments",
    COMMENT_HISTORY: "comment_history",

    REVIEWS: "reviews",
    REVIEW_HISTORY: "review_history",
    REVIEW_REPLIES: "review_replies",
    REVIEW_REACTIONS: "review_reactions",

    REACTIONS: "reactions",

    BOOKMARKS: "bookmarks",
    SHARES: "shares",
    PUBLICATION_SHARE_EVENTS: "publication_share_events",
    PUBLICATION_VIEWS: "publication_views",

    REPORTS: "reports",
    REPORT_HISTORY: "report_history",

    CONVERSATIONS: "conversations",
    CONVERSATION_PARTICIPANTS: "conversation_participants",
    MESSAGES: "messages",
    MESSAGE_READS: "message_reads",
    MESSAGE_REACTIONS: "message_reactions",

    NOTIFICATIONS: "notifications",
    USER_NOTIFICATION_SETTINGS: "user_notification_settings",
    NOTIFICATION_GLOBAL_SETTINGS:
      "notification_global_settings",

    USER_ACTIVITY: "user_activity",

    ADMIN_ACTIVITY_LOGS: "admin_activity_logs",

    SYSTEM_SETTINGS: "system_settings",
    FEATURE_FLAGS: "feature_flags",

    ADMIN_USERS: "admin_users",
    ADMIN_SESSIONS: "admin_sessions",
    ADMIN_PERMISSIONS: "admin_permissions",
    ADMIN_ROLE_PERMISSIONS: "admin_role_permissions",

    PARTICIPANT_PRESENCE: "participant_presence",

    SEARCH_INDEX_ENTRIES: "search_index_entries",

    FEATURE_FLAG_OVERRIDES: "feature_flag_overrides",

    ADMIN_ACTING_SESSIONS: "admin_acting_sessions",
  },
} as const;

// ============================================================
// ENVIRONMENTS
// ============================================================

export const ENVIRONMENTS = {
  DEVELOPMENT: "development",
  PREVIEW: "preview",
  STAGING: "staging",
  PRODUCTION: "production",
} as const;

// ============================================================
// ERROR CODES
// ============================================================

export const ERROR_CODES = {
  UNKNOWN: "UNKNOWN_ERROR",

  VALIDATION: "VALIDATION_ERROR",
  INVALID_REQUEST: "INVALID_REQUEST",

  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",

  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",

  RATE_LIMITED: "RATE_LIMITED",

  DATABASE_ERROR: "DATABASE_ERROR",

  NETWORK_ERROR: "NETWORK_ERROR",

  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  INVALID_FILE_TYPE: "INVALID_FILE_TYPE",

  PUBLICATION_NOT_FOUND: "PUBLICATION_NOT_FOUND",
  COMMENT_NOT_FOUND: "COMMENT_NOT_FOUND",
  REVIEW_NOT_FOUND: "REVIEW_NOT_FOUND",

  USER_NOT_FOUND: "USER_NOT_FOUND",

  USERNAME_TAKEN: "USERNAME_TAKEN",

  CHAT_NOT_FOUND: "CHAT_NOT_FOUND",
  MESSAGE_NOT_FOUND: "MESSAGE_NOT_FOUND",

  NOTIFICATION_NOT_FOUND:
    "NOTIFICATION_NOT_FOUND",

  PERMISSION_DENIED: "PERMISSION_DENIED",

  ADMIN_AUTH_FAILED: "ADMIN_AUTH_FAILED",

  MAINTENANCE_MODE: "MAINTENANCE_MODE",
} as const;

// ============================================================
// RESPONSE
// ============================================================

export const RESPONSE = {
  SUCCESS: "success",
  ERROR: "error",

  DEFAULT_ERROR_MESSAGE:
    "Произошла внутренняя ошибка сервера.",

  DEFAULT_NOT_FOUND_MESSAGE:
    "Запрашиваемый ресурс не найден.",

  DEFAULT_FORBIDDEN_MESSAGE:
    "У вас недостаточно прав для выполнения этого действия.",

  DEFAULT_UNAUTHORIZED_MESSAGE:
    "Необходима авторизация.",
} as const;

// ============================================================
// CATEGORIES
// ============================================================

export const CATEGORIES = {
  JOBS: "jobs",
  EDUCATION: "education",
  INTERNSHIPS: "internships",
  GRANTS: "grants",
  SCHOLARSHIPS: "scholarships",
  COMPETITIONS: "competitions",
  EVENTS: "events",
  BUSINESS: "business",
  INVESTMENT: "investment",
  SERVICES: "services",
  PROJECTS: "projects",
  COLLABORATION: "collaboration",
  ANNOUNCEMENTS: "announcements",
  INTERNATIONAL: "international",
} as const;

// ============================================================
// TAJIKISTAN
// ============================================================

export const TAJIKISTAN = {
  COUNTRY_CODE: "TJ",
  COUNTRY_NAME: "Tajikistan",

  CURRENCY: "TJS",
  CURRENCY_NAME: "Somoni",

  TIMEZONE: "Asia/Dushanbe",

  LANGUAGE: "tg",

  REGIONS: [
    "Dushanbe",
    "Sughd",
    "Khatlon",
    "Gorno-Badakhshan Autonomous Province",
    "Districts of Republican Subordination",
  ] as const,
} as const;

// ============================================================
// ROUTES
// ============================================================

export const ROUTES = {
  HOME: "/",

  PUBLICATIONS: "/publications",
  PUBLICATION: "/publication",

  PROFILE: "/profile",

  SEARCH: "/search",

  CHAT: "/chat",
  CHATS: "/chats",

  NOTIFICATIONS: "/notifications",

  SAVED: "/saved",

  SETTINGS: "/settings",

  ADMIN: "/admin",
} as const;

// ============================================================
// URL
// ============================================================

export const URLS = {
  PUBLICATION_PATTERN: /^\/\d+$/,

  USERNAME_PATTERN: /^[a-zA-Z0-9_.-]{3,50}$/,

  SLUG_PATTERN: /^[a-z0-9-]+$/i,
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
    FILE: "file",
  },

  VISIBILITY: {
    PUBLIC: "public",
    PRIVATE: "private",
    ADMIN_ONLY: "admin_only",
  },

  STORAGE: {
    R2: "r2",
    EXTERNAL: "external",
  },
} as const;

// ============================================================
// PUBLICATION NUMBERING
// ============================================================

export const PUBLICATION_NUMBERING = {
  START: 1,

  MIN: 1,

  URL_TYPE: "number",

  SEQUENTIAL: true,

  REUSE_DELETED_NUMBERS: false,

  RENUMBER_AFTER_DELETE: true,
} as const;

// ============================================================
// ACTING MODE
// ============================================================

export const ACTING_MODE = {
  ENABLED: true,

  REQUIRE_ADMIN_PERMISSION: true,

  REQUIRE_CONFIRMATION: true,

  AUDIT_REQUIRED: true,

  SHOW_ADMIN_MARKER: true,

  ALLOW_POSTS: true,
  ALLOW_COMMENTS: true,
  ALLOW_REACTIONS: true,
  ALLOW_REVIEWS: true,
  ALLOW_MESSAGES: true,
} as const;

// ============================================================
// PRESENCE
// ============================================================

export const PRESENCE = {
  ONLINE_TIMEOUT_SECONDS: 60,

  LAST_SEEN_ENABLED: true,

  ADMIN_MONITORING_ENABLED: true,

  STORE_TECHNICAL_ACTIVITY: true,

  STORE_IP_HASH_ONLY: true,
} as const;

// ============================================================
// SECURITY / PRIVACY
// ============================================================

export const PRIVACY = {
  REPORTS_PRIVATE: true,

  REPORT_AUTHOR_VISIBLE_TO_PUBLIC: false,

  ADMIN_NOTES_VISIBLE_TO_PARTICIPANT: false,

  ADMIN_ACTIVITY_AUDITABLE: true,

  TECHNICAL_ID_ADMIN_ONLY: true,

  LAST_SEEN_ADMIN_ACCESS: true,

  ACTING_MODE_PUBLICLY_MARKED: true,
} as const;

// ============================================================
// APPLICATION MODES
// ============================================================

export const MODES = {
  USER: "user",
  ADMIN: "admin",
  MODERATOR: "moderator",
  SUPPORT: "support",
  EDITOR: "editor",

  ACTING_AS_PARTICIPANT: "acting_as_participant",
} as const;

// ============================================================
// DEFAULT SYSTEM CONFIGURATION
// ============================================================

export const DEFAULT_SYSTEM_CONFIG = {
  app_name: APP.NAME,
  environment: APP.ENVIRONMENT,

  default_language: APP.DEFAULT_LANGUAGE,
  timezone: APP.TIMEZONE,

  maintenance_mode: false,

  registration_enabled: true,

  publications_enabled: true,
  comments_enabled: true,
  reviews_enabled: true,
  reactions_enabled: true,

  chat_enabled: true,
  private_admin_chat_enabled: true,
  system_chat_enabled: true,

  media_upload_enabled: true,

  notifications_enabled: true,
  push_notifications_enabled: true,
  email_notifications_enabled: true,

  search_enabled: true,

  payments_enabled: true,

  premium_enabled: true,
  pro_enabled: true,
  top_enabled: true,
  vip_enabled: true,

  levels_enabled: true,
  badges_enabled: true,

  free_publication_auto_delete_days:
    PUBLICATIONS.FREE_AUTO_DELETE_DAYS,

  premium_price: PRICES.PREMIUM,
  vip_price: PRICES.VIP,
} as const;

// ============================================================
// TYPE HELPERS
// ============================================================

export type AppLanguage =
  typeof APP.SUPPORTED_LANGUAGES[number];

export type HttpMethod =
  typeof HTTP.METHODS[keyof typeof HTTP.METHODS];

export type NotificationChannel =
  typeof NOTIFICATIONS.CHANNELS[number];

export type NotificationCategory =
  typeof NOTIFICATIONS.CATEGORIES[number];

export type PublicationType =
  typeof PUBLICATIONS.TYPES[number];

export type PublicationStatus =
  typeof PUBLICATIONS.STATUSES[number];

export type ReactionType =
  typeof REACTIONS.TYPES[number];

export type ChatMode =
  typeof MODES[keyof typeof MODES];

export type AdminRole =
  typeof ADMIN.ROLES[number];

export type ServiceType =
  typeof SERVICES[keyof typeof SERVICES];

// ============================================================
// VALIDATION HELPERS
// ============================================================

export function isSupportedLanguage(
  value: string,
): value is AppLanguage {
  return (
    APP.SUPPORTED_LANGUAGES as readonly string[]
  ).includes(value);
}

export function isValidPublicationType(
  value: string,
): value is PublicationType {
  return (
    PUBLICATIONS.TYPES as readonly string[]
  ).includes(value);
}

export function isValidPublicationStatus(
  value: string,
): value is PublicationStatus {
  return (
    PUBLICATIONS.STATUSES as readonly string[]
  ).includes(value);
}

export function isValidReactionType(
  value: string,
): value is ReactionType {
  return (
    REACTIONS.TYPES as readonly string[]
  ).includes(value);
}

export function isValidAdminRole(
  value: string,
): value is AdminRole {
  return (
    ADMIN.ROLES as readonly string[]
  ).includes(value);
}

// ============================================================
// NUMERIC HELPERS
// ============================================================

export const NUMBERS = {
  MIN_LEVEL: LEVELS.MIN,
  MAX_LEVEL: LEVELS.MAX,

  MIN_RATING: REVIEWS.MIN_RATING,
  MAX_RATING: REVIEWS.MAX_RATING,

  MIN_PUBLICATION_NUMBER:
    PUBLICATION_NUMBERING.MIN,

  DEFAULT_PAGE_SIZE:
    PAGINATION.DEFAULT_LIMIT,

  MAX_PAGE_SIZE:
    PAGINATION.MAX_LIMIT,
} as const;

// ============================================================
// END
// ============================================================
