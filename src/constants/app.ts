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

  SEARCH: "/api/search",
  ACTIVITY: "/api/activity",

  ADMIN: "/api/admin",
  ADMIN_LOGIN: "/api/admin/login",
  ADMIN_LOGOUT: "/api/admin/logout",
  ADMIN_ME: "/api/admin/me",
  ADMIN_DASHBOARD: "/api/admin/dashboard",
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

  MAX_FILES_PER_PUBLICATION: 50,

  MAX_FILES_PER_MESSAGE: 10,

  MAX_PROFILE_IMAGES: 10,
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
} as const;

// ============================================================
// CHAT
// ============================================================

export const CHAT = {
  MAX_MESSAGE_LENGTH: 10000,

  MAX_MESSAGES_PER_PAGE: 100,

  DEFAULT_MESSAGES_PER_PAGE: 50,

  MAX_CONVERSATIONS_PER_PAGE: 50,

  MAX_ATTACHMENTS_PER_MESSAGE:
