// ============================================================
// 🇹🇯 TAJIK OPPORTUNITIES
// Publication Service
// File: src/services/publications.ts
// Version: 2026.09.09-modern-fixed-v2
//
// PRODUCTION-READY PUBLICATION SERVICE
//
// Поддерживает:
// • FREE / PREMIUM / VIP / CUSTOM
// • DRAFT / PENDING / PUBLISHED / HIDDEN / REJECTED
// • ARCHIVED / EXPIRED / DELETED
// • публичные номера /1 /2 /3...
// • админские override
// • PIN / FEATURED / TOP / VIP
// • auto-delete
// • scheduled publish
// • редактирование
// • история изменений
// • медиа
// • комментарии / реакции / отзывы
// • Share / View events
// • огромные TEXT-счётчики
// • decimal-safe metrics
// • pagination
// • поиск
// • безопасные URL
// • массовые операции
// • автоматическая очистка просроченных публикаций
// • Cloudflare D1 compatible
// • TypeScript strict-mode compatible
// ============================================================

import type { Env } from "../index";

import {
  generateId,
  generatePublicationId,
} from "../utils/id";

import {
  addDecimalStrings,
  normalizeDecimalString,
} from "../utils/number";

import {
  normalizePublicationNumber,
  normalizePublicationId,
  publicationUrl,
} from "../utils/publication";


// ============================================================
// TYPES
// ============================================================

export type PublicationType =
  | "FREE"
  | "PREMIUM"
  | "VIP"
  | "CUSTOM";

export type PublicationStatus =
  | "DRAFT"
  | "PENDING"
  | "PUBLISHED"
  | "HIDDEN"
  | "REJECTED"
  | "DELETED"
  | "ARCHIVED"
  | "EXPIRED";

export type PublicationVisibility =
  | "PUBLIC"
  | "PRIVATE"
  | "UNLISTED"
  | "FOLLOWERS";

export type PublicationPriority =
  | "LOW"
  | "NORMAL"
  | "HIGH"
  | "URGENT"
  | "TOP"
  | "VIP";

export type PublicationSource =
  | "PARTICIPANT"
  | "ADMIN"
  | "SYSTEM"
  | "ACTING_MODE";

export type PublicationHistoryAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "RESTORE"
  | "PUBLISH"
  | "REJECT"
  | "HIDE"
  | "ARCHIVE"
  | "PIN"
  | "UNPIN"
  | "FEATURE"
  | "UNFEATURE"
  | "ADMIN_OVERRIDE"
  | "AUTO_EXPIRE"
  | "PERMANENT_DELETE";

export type PublicationMetric =
  | "views_count"
  | "unique_views_count"
  | "likes_count"
  | "reactions_count"
  | "comments_count"
  | "replies_count"
  | "bookmarks_count"
  | "shares_count"
  | "sends_count"
  | "reports_count"
  | "contacts_count"
  | "applications_count"
  | "downloads_count"
  | "clicks_count"
  | "external_clicks_count"
  | "rating_count"
  | "rating_sum"
  | "review_count";


export interface Publication {
  id: string;
  public_number: number | string;

  author_id?: string | null;
  author_name?: string | null;
  author_username?: string | null;
  author_avatar_url?: string | null;

  category_id?: string | null;

  title?: string | null;
  text?: string | null;

  type: PublicationType;
  status: PublicationStatus;
  visibility: PublicationVisibility;
  priority: PublicationPriority;

  featured: boolean;
  pinned: boolean;

  auto_delete_enabled: boolean;
  delete_at?: string | null;

  publish_at?: string | null;

  background?: string | null;
  font?: string | null;
  color?: string | null;

  tag?: string | null;
  tag_icon?: string | null;
  tag_color?: string | null;

  comments_enabled: boolean;
  reactions_enabled: boolean;
  reviews_enabled: boolean;
  sharing_enabled: boolean;
  bookmarks_enabled: boolean;

  views_count: string;
  unique_views_count: string;
  likes_count: string;
  comments_count: string;
  reactions_count: string;
  bookmarks_count: string;
  shares_count: string;
  reports_count: string;

  contacts_count: string;
  applications_count: string;
  downloads_count: string;
  clicks_count: string;
  external_clicks_count: string;

  created_at: string;
  updated_at: string;
}


export interface PublicationMedia {
  id: string;
  publication_id: string;
  type: string;
  url?: string | null;
  key?: string | null;
  mime_type?: string | null;
  filename?: string | null;
  size?: string | null;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  position: number;
  status: string;
  created_at: string;
}


export interface CreatePublicationInput {
  author_id?: string | null;
  author_name?: string | null;
  author_username?: string | null;
  author_avatar_url?: string | null;

  category_id?: string | null;

  title?: string | null;
  text?: string | null;

  type?: PublicationType;
  status?: PublicationStatus;
  visibility?: PublicationVisibility;
  priority?: PublicationPriority;

  background?: string | null;
  font?: string | null;
  color?: string | null;

  tag?: string | null;
  tag_icon?: string | null;
  tag_color?: string | null;

  comments_enabled?: boolean;
  reactions_enabled?: boolean;
  reviews_enabled?: boolean;
  sharing_enabled?: boolean;
  bookmarks_enabled?: boolean;

  auto_delete_enabled?: boolean;
  delete_at?: string | null;
  publish_at?: string | null;

  source?: PublicationSource;

  media?: Array<{
    type: string;
    url?: string;
    key?: string;
    mime_type?: string;
    filename?: string;
    size?: string | number;
    width?: number;
    height?: number;
    duration?: number;
    position?: number;
  }>;
}


export interface UpdatePublicationInput {
  title?: string | null;
  text?: string | null;
  category_id?: string | null;

  type?: PublicationType;
  status?: PublicationStatus;
  visibility?: PublicationVisibility;
  priority?: PublicationPriority;

  background?: string | null;
  font?: string | null;
  color?: string | null;

  tag?: string | null;
  tag_icon?: string | null;
  tag_color?: string | null;

  comments_enabled?: boolean;
  reactions_enabled?: boolean;
  reviews_enabled?: boolean;
  sharing_enabled?: boolean;
  bookmarks_enabled?: boolean;

  auto_delete_enabled?: boolean;
  delete_at?: string | null;
  publish_at?: string | null;

  author_name?: string | null;
  author_username?: string | null;
  author_avatar_url?: string | null;
}


export interface AdminPublicationOverrideInput {
  forced_type?: PublicationType | null;
  forced_status?: PublicationStatus | null;
  forced_visibility?: PublicationVisibility | null;
  forced_priority?: PublicationPriority | null;

  pinned?: boolean | null;
  featured?: boolean | null;

  auto_delete_enabled?: boolean | null;
  custom_delete_at?: string | null;
  custom_publish_at?: string | null;

  custom_author_name?: string | null;
  custom_author_username?: string | null;
  custom_author_avatar_url?: string | null;

  custom_background?: string | null;
  custom_font?: string | null;
  custom_color?: string | null;

  custom_tag?: string | null;
  custom_tag_icon?: string | null;
  custom_tag_color?: string | null;

  comments_enabled?: boolean | null;
  reactions_enabled?: boolean | null;
  reviews_enabled?: boolean | null;
  sharing_enabled?: boolean | null;
  bookmarks_enabled?: boolean | null;

  admin_note?: string | null;
}


export interface PublicationFilter {
  status?: PublicationStatus;
  type?: PublicationType;
  category_id?: string;
  author_id?: string;
  visibility?: PublicationVisibility;

  search?: string;

  featured?: boolean;
  pinned?: boolean;

  min_public_number?: number;
  max_public_number?: number;

  limit?: number;
  offset?: number;

  sort?: PublicationSort;
}


export type PublicationSort =
  | "newest"
  | "oldest"
  | "popular"
  | "most_commented"
  | "most_shared"
  | "highest_priority"
  | "public_number";


export interface PublicationListResult {
  items: Publication[];
  total: string;
  limit: number;
  offset: number;
  hasMore: boolean;
}


export interface PublicationMetrics {
  publication_id: string;

  views_count: string;
  unique_views_count: string;

  likes_count: string;
  reactions_count: string;

  comments_count: string;
  replies_count: string;

  bookmarks_count: string;
  shares_count: string;
  sends_count: string;

  reports_count: string;

  contacts_count: string;
  applications_count: string;

  downloads_count: string;
  clicks_count: string;
  external_clicks_count: string;

  rating_count: string;
  rating_sum: string;
  review_count: string;

  created_at: string;
  updated_at: string;
}


export interface PublicationDetails {
  publication: Publication;
  media: PublicationMedia[];
  url: string;
  metrics?: PublicationMetrics | null;
}


export interface PublicationSearchOptions {
  search?: string;
  categoryId?: string;
  type?: PublicationType;
  status?: PublicationStatus;
  visibility?: PublicationVisibility;
  limit?: number;
  offset?: number;
  sort?: PublicationSort;
}


export interface PublicationBulkResult {
  changed: number;
  requested: number;
  failed: number;
}


// ============================================================
// CONSTANTS
// ============================================================

const DEFAULT_TYPE:
  PublicationType = "FREE";

const DEFAULT_STATUS:
  PublicationStatus = "PENDING";

const DEFAULT_VISIBILITY:
  PublicationVisibility = "PUBLIC";

const DEFAULT_PRIORITY:
  PublicationPriority = "NORMAL";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const FREE_AUTO_DELETE_DAYS = 10;

const MAX_MEDIA_PER_PUBLICATION = 50;

const MAX_PROCESS_EXPIRED_LIMIT = 500;

const DEFAULT_AUTHOR_NAME = null;

const ALLOWED_STATUSES:
  readonly PublicationStatus[] = [
    "DRAFT",
    "PENDING",
    "PUBLISHED",
    "HIDDEN",
    "REJECTED",
    "DELETED",
    "ARCHIVED",
    "EXPIRED",
  ];

const ALLOWED_TYPES:
  readonly PublicationType[] = [
    "FREE",
    "PREMIUM",
    "VIP",
    "CUSTOM",
  ];

const ALLOWED_VISIBILITIES:
  readonly PublicationVisibility[] = [
    "PUBLIC",
    "PRIVATE",
    "UNLISTED",
    "FOLLOWERS",
  ];

const ALLOWED_PRIORITIES:
  readonly PublicationPriority[] = [
    "LOW",
    "NORMAL",
    "HIGH",
    "URGENT",
    "TOP",
    "VIP",
  ];


// ============================================================
// GENERAL HELPERS
// ============================================================

function now(): string {
  return new Date().toISOString();
}


function stringValue(
  value: unknown
): string {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value);
}


function nullableString(
  value: unknown
): string | null {
  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }

  const result =
    String(value).trim();

  return result.length > 0
    ? result
    : null;
}


function requiredString(
  value: unknown,
  fallback = ""
): string {
  return (
    nullableString(value) ??
    fallback
  );
}


function normalizeWhitespace(
  value: unknown
): string | null {
  const result =
    nullableString(value);

  if (!result) {
    return null;
  }

  return result
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}


function bool(
  value: unknown,
  fallback = false
): boolean {
  if (
    value === undefined ||
    value === null
  ) {
    return fallback;
  }

  if (
    value === true ||
    value === 1 ||
    value === "1" ||
    value === "true" ||
    value === "TRUE" ||
    value === "yes"
  ) {
    return true;
  }

  if (
    value === false ||
    value === 0 ||
    value === "0" ||
    value === "false" ||
    value === "FALSE" ||
    value === "no"
  ) {
    return false;
  }

  return fallback;
}


function limitValue(
  value?: number
): number {
  if (
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return DEFAULT_LIMIT;
  }

  return Math.min(
    MAX_LIMIT,
    Math.max(
      1,
      Math.floor(value)
    )
  );
}


function offsetValue(
  value?: number
): number {
  if (
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(value)
  );
}


function finitePositiveNumber(
  value: unknown
): number | null {
  const number =
    Number(value);

  if (
    !Number.isFinite(number) ||
    number <= 0
  ) {
    return null;
  }

  return number;
}


function normalizeDate(
  value: unknown
): string | null {
  const input =
    nullableString(value);

  if (!input) {
    return null;
  }

  const date =
    new Date(input);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date.toISOString();
}


function datePlusDays(
  days: number
): string {
  const date =
    new Date();

  date.setUTCDate(
    date.getUTCDate() +
    days
  );

  return date.toISOString();
}


function normalizeMetric(
  value: unknown
): string {
  const raw =
    value === undefined ||
    value === null
      ? "0"
      : String(value);

  return normalizeDecimalString(
    raw
  );
}


function parseTotal(
  value: unknown
): number {
  const result =
    Number(value ?? 0);

  return Number.isFinite(
    result
  )
    ? Math.max(
        0,
        result
      )
    : 0;
}


// ============================================================
// ENUM VALIDATORS
// ============================================================

function normalizeType(
  value: unknown
): PublicationType {
  const candidate =
    String(value ?? "")
      .toUpperCase();

  return (
    ALLOWED_TYPES.includes(
      candidate as PublicationType
    )
      ? candidate
      : DEFAULT_TYPE
  ) as PublicationType;
}


function normalizeStatus(
  value: unknown
): PublicationStatus {
  const candidate =
    String(value ?? "")
      .toUpperCase();

  return (
    ALLOWED_STATUSES.includes(
      candidate as PublicationStatus
    )
      ? candidate
      : DEFAULT_STATUS
  ) as PublicationStatus;
}


function normalizeVisibility(
  value: unknown
): PublicationVisibility {
  const candidate =
    String(value ?? "")
      .toUpperCase();

  return (
    ALLOWED_VISIBILITIES.includes(
      candidate as PublicationVisibility
    )
      ? candidate
      : DEFAULT_VISIBILITY
  ) as PublicationVisibility;
}


function normalizePriority(
  value: unknown
): PublicationPriority {
  const candidate =
    String(value ?? "")
      .toUpperCase();

  return (
    ALLOWED_PRIORITIES.includes(
      candidate as PublicationPriority
    )
      ? candidate
      : DEFAULT_PRIORITY
  ) as PublicationPriority;
}


// ============================================================
// MAPPING
// ============================================================

function mapPublication(
  row: Record<string, unknown>
): Publication {
  return {
    id:
      requiredString(
        row.id
      ),

    public_number:
      row.public_number === null ||
      row.public_number === undefined
        ? ""
        : String(
            row.public_number
          ),

    author_id:
      nullableString(
        row.author_id
      ),

    author_name:
      nullableString(
        row.author_name
      ),

    author_username:
      nullableString(
        row.author_username
      ),

    author_avatar_url:
      nullableString(
        row.author_avatar_url
      ),

    category_id:
      nullableString(
        row.category_id
      ),

    title:
      nullableString(
        row.title
      ),

    text:
      nullableString(
        row.text
      ),

    type:
      normalizeType(
        row.type
      ),

    status:
      normalizeStatus(
        row.status
      ),

    visibility:
      normalizeVisibility(
        row.visibility
      ),

    priority:
      normalizePriority(
        row.priority
      ),

    featured:
      bool(
        row.featured
      ),

    pinned:
      bool(
        row.pinned
      ),

    auto_delete_enabled:
      bool(
        row.auto_delete_enabled
      ),

    delete_at:
      nullableString(
        row.delete_at
      ),

    publish_at:
      nullableString(
        row.publish_at
      ),

    background:
      nullableString(
        row.background
      ),

    font:
      nullableString(
        row.font
      ),

    color:
      nullableString(
        row.color
      ),

    tag:
      nullableString(
        row.tag
      ),

    tag_icon:
      nullableString(
        row.tag_icon
      ),

    tag_color:
      nullableString(
        row.tag_color
      ),

    comments_enabled:
      bool(
        row.comments_enabled,
        true
      ),

    reactions_enabled:
      bool(
        row.reactions_enabled,
        true
      ),

    reviews_enabled:
      bool(
        row.reviews_enabled,
        true
      ),

    sharing_enabled:
      bool(
        row.sharing_enabled,
        true
      ),

    bookmarks_enabled:
      bool(
        row.bookmarks_enabled,
        true
      ),

    views_count:
      normalizeMetric(
        row.views_count
      ),

    unique_views_count:
      normalizeMetric(
        row.unique_views_count
      ),

    likes_count:
      normalizeMetric(
        row.likes_count
      ),

    comments_count:
      normalizeMetric(
        row.comments_count
      ),

    reactions_count:
      normalizeMetric(
        row.reactions_count
      ),

    bookmarks_count:
      normalizeMetric(
        row.bookmarks_count
      ),

    shares_count:
      normalizeMetric(
        row.shares_count
      ),

    reports_count:
      normalizeMetric(
        row.reports_count
      ),

    contacts_count:
      normalizeMetric(
        row.contacts_count
      ),

    applications_count:
      normalizeMetric(
        row.applications_count
      ),

    downloads_count:
      normalizeMetric(
        row.downloads_count
      ),

    clicks_count:
      normalizeMetric(
        row.clicks_count
      ),

    external_clicks_count:
      normalizeMetric(
        row.external_clicks_count
      ),

    created_at:
      requiredString(
        row.created_at
      ),

    updated_at:
      requiredString(
        row.updated_at
      ),
  };
}


function mapMedia(
  row: Record<string, unknown>
): PublicationMedia {
  return {
    id:
      requiredString(
        row.id
      ),

    publication_id:
      requiredString(
        row.publication_id
      ),

    type:
      requiredString(
        row.type,
        "image"
      ),

    url:
      nullableString(
        row.url
      ),

    key:
      nullableString(
        row.key
      ),

    mime_type:
      nullableString(
        row.mime_type
      ),

    filename:
      nullableString(
        row.filename
      ),

    size:
      nullableString(
        row.size
      ),

    width:
      row.width === null ||
      row.width === undefined
        ? null
        : finitePositiveNumber(
            row.width
          ),

    height:
      row.height === null ||
      row.height === undefined
        ? null
        : finitePositiveNumber(
            row.height
          ),

    duration:
      row.duration === null ||
      row.duration === undefined
        ? null
        : finitePositiveNumber(
            row.duration
          ),

    position:
      Math.max(
        0,
        Math.floor(
          Number(
            row.position ?? 0
          )
        )
      ),

    status:
      requiredString(
        row.status,
        "ACTIVE"
      ),

    created_at:
      requiredString(
        row.created_at
      ),
  };
}


// ============================================================
// SAFE PUBLIC URL
// ============================================================

function safePublicationUrl(
  publicNumber: number | string
): string {
  const input =
    String(
      publicNumber
    ).trim();

  if (!input) {
    return "/";
  }

  try {
    const generated =
      publicationUrl(
        input,
        ""
      );

    const result =
      String(
        generated ?? ""
      ).trim();

    if (result) {
      return result;
    }
  } catch {
    // fallback
  }

  try {
    const normalizedNumber =
      normalizePublicationNumber(
        input
      );

    if (
      Number.isFinite(
        normalizedNumber
      ) &&
      normalizedNumber >= 1
    ) {
      return `/${Math.floor(
        normalizedNumber
      )}`;
    }
  } catch {
    // fallback
  }

  return `/${input}`;
}


// ============================================================
// PUBLICATION SERVICE
// ============================================================

export class PublicationService {
  constructor(
    private readonly env: Env
  ) {}

  private get db(): D1Database {
    return this.env.DB;
  }


  // ==========================================================
  // NEXT PUBLIC NUMBER
  // ==========================================================

  async getNextPublicNumber(): Promise<number> {
    const row =
      await this.db
        .prepare(`
          SELECT public_number
          FROM publications
          ORDER BY CAST(public_number AS INTEGER) DESC
          LIMIT 1
        `)
        .first<{
          public_number?:
            number | string;
        }>();

    if (
      !row ||
      row.public_number === null ||
      row.public_number === undefined
    ) {
      return 1;
    }

    const current =
      Number(
        row.public_number
      );

    if (
      !Number.isFinite(
        current
      ) ||
      current < 0
    ) {
      return 1;
    }

    return (
      Math.floor(
        current
      ) + 1
    );
  }


  // ==========================================================
  // CREATE
  // ==========================================================

  async create(
    input: CreatePublicationInput
  ): Promise<Publication> {
    const id =
      requiredString(
        generatePublicationId()
      );

    if (!id) {
      throw new Error(
        "Не удалось сгенерировать ID публикации"
      );
    }

    const createdAt =
      now();

    const type =
      normalizeType(
        input.type
      );

    const visibility =
      normalizeVisibility(
        input.visibility
      );

    const priority =
      normalizePriority(
        input.priority
      );

    const status:
      PublicationStatus =
      input.source === "ADMIN" ||
      input.source === "ACTING_MODE"
        ? "PUBLISHED"
        : normalizeStatus(
            input.status ??
              DEFAULT_STATUS
          );

    const publicNumber =
      await this.getNextPublicNumber();

    let autoDelete =
      input.auto_delete_enabled;

    let deleteAt =
      normalizeDate(
        input.delete_at
      );

    if (
      autoDelete === undefined &&
      type === "FREE"
    ) {
      autoDelete = true;
    }

    if (
      autoDelete &&
      !deleteAt &&
      type === "FREE"
    ) {
      deleteAt =
        datePlusDays(
          FREE_AUTO_DELETE_DAYS
        );
    }

    if (
      autoDelete === undefined
    ) {
      autoDelete = false;
    }

    const publishAt =
      normalizeDate(
        input.publish_at
      );

    const title =
      normalizeWhitespace(
        input.title
      );

    const text =
      input.text === null ||
      input.text === undefined
        ? null
        : String(
            input.text
          ).trim();

    const result =
      await this.db
        .prepare(`
          INSERT INTO publications (
            id,
            public_number,
            author_id,
            author_name,
            author_username,
            author_avatar_url,
            category_id,
            title,
            text,
            type,
            status,
            visibility,
            priority,
            featured,
            pinned,
            auto_delete_enabled,
            delete_at,
            publish_at,
            background,
            font,
            color,
            tag,
            tag_icon,
            tag_color,
            comments_enabled,
            reactions_enabled,
            reviews_enabled,
            sharing_enabled,
            bookmarks_enabled,
            views_count,
            unique_views_count,
            likes_count,
            comments_count,
            reactions_count,
            bookmarks_count,
            shares_count,
            reports_count,
            contacts_count,
            applications_count,
            downloads_count,
            clicks_count,
            external_clicks_count,
            created_at,
            updated_at
          )
          VALUES (
            ?, ?,
            ?, ?, ?, ?,
            ?,
            ?, ?,
            ?, ?, ?, ?,
            0,
            0,
            ?,
            ?, ?,
            ?, ?, ?,
            ?, ?, ?,
            ?, ?, ?, ?, ?,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0,
            ?, ?
          )
        `)
        .bind(
          id,
          publicNumber,

          input.author_id ??
            null,

          normalizeWhitespace(
            input.author_name
          ) ??
            DEFAULT_AUTHOR_NAME,

          nullableString(
            input.author_username
          ),

          nullableString(
            input.author_avatar_url
          ),

          nullableString(
            input.category_id
          ),

          title,
          text,

          type,
          status,

          visibility,
          priority,

          autoDelete
            ? 1
            : 0,

          deleteAt,
          publishAt,

          nullableString(
            input.background
          ),

          nullableString(
            input.font
          ),

          nullableString(
            input.color
          ),

          nullableString(
            input.tag
          ),

          nullableString(
            input.tag_icon
          ),

          nullableString(
            input.tag_color
          ),

          input.comments_enabled !== false
            ? 1
            : 0,

          input.reactions_enabled !== false
            ? 1
            : 0,

          input.reviews_enabled !== false
            ? 1
            : 0,

          input.sharing_enabled !== false
            ? 1
            : 0,

          input.bookmarks_enabled !== false
            ? 1
            : 0,

          createdAt,
          createdAt
        )
        .run();

    if (!result.success) {
      throw new Error(
        "Не удалось создать публикацию"
      );
    }

    await this.ensureMetricRow(
      id
    );

    if (
      input.media?.length
    ) {
      await this.addMedia(
        id,
        input.media
      );
    }

    await this.addHistory(
      id,
      null,
      "CREATE",
      input.source ||
        "PARTICIPANT"
    );

    const publication =
      await this.getById(
        id
      );

    if (!publication) {
      throw new Error(
        "Публикация создана, но не найдена"
      );
    }

    return publication;
  }


  // ==========================================================
  // GET BY ID
  // ==========================================================

  async getById(
    id: string
  ): Promise<Publication | null> {
    const normalized =
      normalizePublicationId(
        id
      );

    if (!normalized) {
      return null;
    }

    const row =
      await this.db
        .prepare(`
          SELECT *
          FROM publications
          WHERE id = ?
          LIMIT 1
        `)
        .bind(
          normalized
        )
        .first<
          Record<
            string,
            unknown
          >
        >();

    if (!row) {
      return null;
    }

    return mapPublication(
      row
    );
  }


  // ==========================================================
  // GET BY PUBLIC NUMBER
  // ==========================================================

  async getByPublicNumber(
    value: number | string
  ): Promise<Publication | null> {
    let number: number;

    try {
      number =
        normalizePublicationNumber(
          String(value)
        );
    } catch {
      return null;
    }

    if (
      !Number.isFinite(
        number
      ) ||
      number < 1
    ) {
      return null;
    }

    const row =
      await this.db
        .prepare(`
          SELECT *
          FROM publications
          WHERE public_number = ?
          LIMIT 1
        `)
        .bind(
          number
        )
        .first<
          Record<
            string,
            unknown
          >
        >();

    if (!row) {
      return null;
    }

    return mapPublication(
      row
    );
  }


  // ==========================================================
  // DETAILS
  // ==========================================================

  async getDetails(
    id: string,
    includeMetrics = false
  ): Promise<
    PublicationDetails | null
  > {
    const publication =
      await this.getById(
        id
      );

    if (!publication) {
      return null;
    }

    const media =
      await this.getMedia(
        publication.id
      );

    const metrics =
      includeMetrics
        ? await this.getMetrics(
            publication.id
          )
        : undefined;

    return {
      publication,
      media,
      url:
        safePublicationUrl(
          publication.public_number
        ),
      metrics,
    };
  }


  // ==========================================================
  // LIST
  // ==========================================================

  async list(
    filter: PublicationFilter = {}
  ): Promise<PublicationListResult> {
    const limit =
      limitValue(
        filter.limit
      );

    const offset =
      offsetValue(
        filter.offset
      );

    const conditions:
      string[] = [];

    const values:
      unknown[] = [];

    if (filter.status) {
      conditions.push(
        "p.status = ?"
      );

      values.push(
        normalizeStatus(
          filter.status
        )
      );
    }

    if (filter.type) {
      conditions.push(
        "p.type = ?"
      );

      values.push(
        normalizeType(
          filter.type
        )
      );
    }

    if (
      filter.category_id
    ) {
      conditions.push(
        "p.category_id = ?"
      );

      values.push(
        filter.category_id
      );
    }

    if (
      filter.author_id
    ) {
      conditions.push(
        "p.author_id = ?"
      );

      values.push(
        filter.author_id
      );
    }

    if (
      filter.visibility
    ) {
      conditions.push(
        "p.visibility = ?"
      );

      values.push(
        normalizeVisibility(
          filter.visibility
        )
      );
    }

    if (
      filter.featured !==
      undefined
    ) {
      conditions.push(
        "p.featured = ?"
      );

      values.push(
        filter.featured
          ? 1
          : 0
      );
    }

    if (
      filter.pinned !==
      undefined
    ) {
      conditions.push(
        "p.pinned = ?"
      );

      values.push(
        filter.pinned
          ? 1
          : 0
      );
    }

    if (
      filter.min_public_number !==
      undefined
    ) {
      conditions.push(
        "CAST(p.public_number AS INTEGER) >= ?"
      );

      values.push(
        filter.min_public_number
      );
    }

    if (
      filter.max_public_number !==
      undefined
    ) {
      conditions.push(
        "CAST(p.public_number AS INTEGER) <= ?"
      );

      values.push(
        filter.max_public_number
      );
    }

    if (
      filter.search?.trim()
    ) {
      const search =
        `%${filter.search.trim()}%`;

      conditions.push(`
        (
          p.title LIKE ?
          OR p.text LIKE ?
          OR p.author_name LIKE ?
          OR p.author_username LIKE ?
        )
      `);

      values.push(
        search,
        search,
        search,
        search
      );
    }

    const where =
      conditions.length > 0
        ? `WHERE ${conditions.join(
            " AND "
          )}`
        : "";

    let orderBy =
      "p.created_at DESC";

    switch (
      filter.sort
    ) {
      case "oldest":
        orderBy =
          "p.created_at ASC";
        break;

      case "popular":
        orderBy =
          "CAST(p.views_count AS INTEGER) DESC, p.created_at DESC";
        break;

      case "most_commented":
        orderBy =
          "CAST(p.comments_count AS INTEGER) DESC, p.created_at DESC";
        break;

      case "most_shared":
        orderBy =
          "CAST(p.shares_count AS INTEGER) DESC, p.created_at DESC";
        break;

      case "highest_priority":
        orderBy = `
          CASE p.priority
            WHEN 'VIP' THEN 6
            WHEN 'TOP' THEN 5
            WHEN 'URGENT' THEN 4
            WHEN 'HIGH' THEN 3
            WHEN 'NORMAL' THEN 2
            ELSE 1
          END DESC,
          p.pinned DESC,
          p.featured DESC,
          p.created_at DESC
        `;
        break;

      case "public_number":
        orderBy =
          "CAST(p.public_number AS INTEGER) ASC";
        break;

      case "newest":
      default:
        orderBy = `
          p.pinned DESC,
          p.featured DESC,
          p.created_at DESC
        `;
        break;
    }

    const countRow =
      await this.db
        .prepare(`
          SELECT COUNT(*) AS total
          FROM publications p
          ${where}
        `)
        .bind(
          ...values
        )
        .first<{
          total?: number | string;
        }>();

    const rows =
      await this.db
        .prepare(`
          SELECT p.*
          FROM publications p
          ${where}
          ORDER BY ${orderBy}
          LIMIT ? OFFSET ?
        `)
        .bind(
          ...values,
          limit,
          offset
        )
        .all<
          Record<
            string,
            unknown
          >
        >();

    const items =
      (
        rows.results ||
        []
      ).map(
        mapPublication
      );

    const numericTotal =
      parseTotal(
        countRow?.total
      );

    return {
      items,

      total:
        String(
          numericTotal
        ),

      limit,
      offset,

      hasMore:
        offset +
          items.length <
        numericTotal,
    };
  }


  // ==========================================================
  // ADVANCED SEARCH
  // ==========================================================

  async search(
    options:
      PublicationSearchOptions = {}
  ): Promise<PublicationListResult> {
    return this.list({
      search:
        options.search,

      category_id:
        options.categoryId,

      type:
        options.type,

      status:
        options.status,

      visibility:
        options.visibility,

      limit:
        options.limit,

      offset:
        options.offset,

      sort:
        options.sort ||
        "newest",
    });
  }


  // ==========================================================
  // UPDATE
  // ==========================================================

  async update(
    id: string,
    input: UpdatePublicationInput,
    changedBy = "SYSTEM"
  ): Promise<Publication | null> {
    const current =
      await this.getById(
        id
      );

    if (!current) {
      return null;
    }

    const fields:
      string[] = [];

    const values:
      unknown[] = [];

    const add = (
      field: string,
      value: unknown
    ): void => {
      fields.push(
        `${field} = ?`
      );

      values.push(
        value
      );
    };

    if (
      "title" in input
    ) {
      add(
        "title",
        normalizeWhitespace(
          input.title
        )
      );
    }

    if (
      "text" in input
    ) {
      add(
        "text",
        input.text === null ||
        input.text === undefined
          ? null
          : String(
              input.text
            ).trim()
      );
    }

    if (
      "category_id" in
      input
    ) {
      add(
        "category_id",
        nullableString(
          input.category_id
        )
      );
    }

    if (
      "type" in input
    ) {
      add(
        "type",
        normalizeType(
          input.type
        )
      );
    }

    if (
      "status" in input
    ) {
      add(
        "status",
        normalizeStatus(
          input.status
        )
      );
    }

    if (
      "visibility" in
      input
    ) {
      add(
        "visibility",
        normalizeVisibility(
          input.visibility
        )
      );
    }

    if (
      "priority" in
      input
    ) {
      add(
        "priority",
        normalizePriority(
          input.priority
        )
      );
    }

    if (
      "background" in
      input
    ) {
      add(
        "background",
        nullableString(
          input.background
        )
      );
    }

    if (
      "font" in input
    ) {
      add(
        "font",
        nullableString(
          input.font
        )
      );
    }

    if (
      "color" in input
    ) {
      add(
        "color",
        nullableString(
          input.color
        )
      );
    }

    if (
      "tag" in input
    ) {
      add(
        "tag",
        nullableString(
          input.tag
        )
      );
    }

    if (
      "tag_icon" in
      input
    ) {
      add(
        "tag_icon",
        nullableString(
          input.tag_icon
        )
      );
    }

    if (
      "tag_color" in
      input
    ) {
      add(
        "tag_color",
        nullableString(
          input.tag_color
        )
      );
    }

    if (
      "comments_enabled" in
      input
    ) {
      add(
        "comments_enabled",
        input.comments_enabled
          ? 1
          : 0
      );
    }

    if (
      "reactions_enabled" in
      input
    ) {
      add(
        "reactions_enabled",
        input.reactions_enabled
          ? 1
          : 0
      );
    }

    if (
      "reviews_enabled" in
      input
    ) {
      add(
        "reviews_enabled",
        input.reviews_enabled
          ? 1
          : 0
      );
    }

    if (
      "sharing_enabled" in
      input
    ) {
      add(
        "sharing_enabled",
        input.sharing_enabled
          ? 1
          : 0
      );
    }

    if (
      "bookmarks_enabled" in
      input
    ) {
      add(
        "bookmarks_enabled",
        input.bookmarks_enabled
          ? 1
          : 0
      );
    }

    if (
      "auto_delete_enabled" in
      input
    ) {
      add(
        "auto_delete_enabled",
        input.auto_delete_enabled
          ? 1
          : 0
      );
    }

    if (
      "delete_at" in
      input
    ) {
      add(
        "delete_at",
        normalizeDate(
          input.delete_at
        )
      );
    }

    if (
      "publish_at" in
      input
    ) {
      add(
        "publish_at",
        normalizeDate(
          input.publish_at
        )
      );
    }

    if (
      "author_name" in
      input
    ) {
      add(
        "author_name",
        normalizeWhitespace(
          input.author_name
        )
      );
    }

    if (
      "author_username" in
      input
    ) {
      add(
        "author_username",
        nullableString(
          input.author_username
        )
      );
    }

    if (
      "author_avatar_url" in
      input
    ) {
      add(
        "author_avatar_url",
        nullableString(
          input.author_avatar_url
        )
      );
    }

    if (
      fields.length ===
      0
    ) {
      return current;
    }

    fields.push(
      "updated_at = ?"
    );

    values.push(
      now()
    );

    values.push(
      id
    );

    await this.db
      .prepare(`
        UPDATE publications
        SET ${fields.join(
          ", "
        )}
        WHERE id = ?
      `)
      .bind(
        ...values
      )
      .run();

    await this.addHistory(
      id,
      JSON.stringify(
        current
      ),
      "UPDATE",
      changedBy
    );

    return this.getById(
      id
    );
  }


  // ==========================================================
  // ADMIN OVERRIDE SAVE
  // ==========================================================

  async saveAdminOverride(
    publicationId: string,
    input: AdminPublicationOverrideInput,
    adminId: string
  ): Promise<void> {
    const publication =
      await this.getById(
        publicationId
      );

    if (!publication) {
      throw new Error(
        "Публикация не найдена"
      );
    }

    const existing =
      await this.db
        .prepare(`
          SELECT *
          FROM publication_admin_overrides
          WHERE publication_id = ?
          LIMIT 1
        `)
        .bind(
          publicationId
        )
        .first<
          Record<
            string,
            unknown
          >
        >();

    const values:
      unknown[] = [
      input.forced_type ??
        existing?.forced_type ??
        null,

      input.forced_status ??
        existing?.forced_status ??
        null,

      input.forced_visibility ??
        existing?.forced_visibility ??
        null,

      input.forced_priority ??
        existing?.forced_priority ??
        null,

      input.pinned ===
      undefined
        ? existing?.pinned ??
          null
        : input.pinned
          ? 1
          : 0,

      input.featured ===
      undefined
        ? existing?.featured ??
          null
        : input.featured
          ? 1
          : 0,

      input.auto_delete_enabled ===
      undefined
        ? existing?.auto_delete_enabled ??
          null
        : input.auto_delete_enabled
          ? 1
          : 0,

      input.custom_delete_at ??
        existing?.custom_delete_at ??
        null,

      input.custom_publish_at ??
        existing?.custom_publish_at ??
        null,

      input.custom_author_name ??
        existing?.custom_author_name ??
        null,

      input.custom_author_username ??
        existing?.custom_author_username ??
        null,

      input.custom_author_avatar_url ??
        existing?.custom_author_avatar_url ??
        null,

      input.custom_background ??
        existing?.custom_background ??
        null,

      input.custom_font ??
        existing?.custom_font ??
        null,

      input.custom_color ??
        existing?.custom_color ??
        null,

      input.custom_tag ??
        existing?.custom_tag ??
        null,

      input.custom_tag_icon ??
        existing?.custom_tag_icon ??
        null,

      input.custom_tag_color ??
        existing?.custom_tag_color ??
        null,

      input.comments_enabled ===
      undefined
        ? existing?.comments_enabled ??
          null
        : input.comments_enabled
          ? 1
          : 0,

      input.reactions_enabled ===
      undefined
        ? existing?.reactions_enabled ??
          null
        : input.reactions_enabled
          ? 1
          : 0,

      input.reviews_enabled ===
      undefined
        ? existing?.reviews_enabled ??
          null
        : input.reviews_enabled
          ? 1
          : 0,

      input.sharing_enabled ===
      undefined
        ? existing?.sharing_enabled ??
          null
        : input.sharing_enabled
          ? 1
          : 0,

      input.bookmarks_enabled ===
      undefined
        ? existing?.bookmarks_enabled ??
          null
        : input.bookmarks_enabled
          ? 1
          : 0,

      input.admin_note ??
        existing?.admin_note ??
        null,

      adminId,
      now(),
    ];

    await this.db
      .prepare(`
        INSERT INTO publication_admin_overrides (
          publication_id,
          forced_type,
          forced_status,
          forced_visibility,
          forced_priority,
          pinned,
          featured,
          auto_delete_enabled,
          custom_delete_at,
          custom_publish_at,
          custom_author_name,
          custom_author_username,
          custom_author_avatar_url,
          custom_background,
          custom_font,
          custom_color,
          custom_tag,
          custom_tag_icon,
          custom_tag_color,
          comments_enabled,
          reactions_enabled,
          reviews_enabled,
          sharing_enabled,
          bookmarks_enabled,
          admin_note,
          updated_by,
          created_at,
          updated_at
        )
        VALUES (
          ?,
          ?, ?, ?, ?,
          ?, ?,
          ?,
          ?, ?,
          ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?,
          ?,
          COALESCE(
            (
              SELECT created_at
              FROM publication_admin_overrides
              WHERE publication_id = ?
            ),
            ?
          ),
          ?
        )
        ON CONFLICT(publication_id)
        DO UPDATE SET
          forced_type =
            excluded.forced_type,

          forced_status =
            excluded.forced_status,

          forced_visibility =
            excluded.forced_visibility,

          forced_priority =
            excluded.forced_priority,

          pinned =
            excluded.pinned,

          featured =
            excluded.featured,

          auto_delete_enabled =
            excluded.auto_delete_enabled,

          custom_delete_at =
            excluded.custom_delete_at,

          custom_publish_at =
            excluded.custom_publish_at,

          custom_author_name =
            excluded.custom_author_name,

          custom_author_username =
            excluded.custom_author_username,

          custom_author_avatar_url =
            excluded.custom_author_avatar_url,

          custom_background =
            excluded.custom_background,

          custom_font =
            excluded.custom_font,

          custom_color =
            excluded.custom_color,

          custom_tag =
            excluded.custom_tag,

          custom_tag_icon =
            excluded.custom_tag_icon,

          custom_tag_color =
            excluded.custom_tag_color,

          comments_enabled =
            excluded.comments_enabled,

          reactions_enabled =
            excluded.reactions_enabled,

          reviews_enabled =
            excluded.reviews_enabled,

          sharing_enabled =
            excluded.sharing_enabled,

          bookmarks_enabled =
            excluded.bookmarks_enabled,

          admin_note =
            excluded.admin_note,

          updated_by =
            excluded.updated_by,

          updated_at =
            excluded.updated_at
      `)
      .bind(
        ...values,
        publicationId,
        now(),
        now()
      )
      .run();

    await this.addHistory(
      publicationId,
      JSON.stringify(
        input
      ),
      "ADMIN_OVERRIDE",
      adminId
    );
  }


  // ==========================================================
  // APPLY ADMIN OVERRIDE
  // ==========================================================

  async applyAdminOverride(
    publicationId: string
  ): Promise<Publication | null> {
    const publication =
      await this.getById(
        publicationId
      );

    if (!publication) {
      return null;
    }

    const override =
      await this.db
        .prepare(`
          SELECT *
          FROM publication_admin_overrides
          WHERE publication_id = ?
          LIMIT 1
        `)
        .bind(
          publicationId
        )
        .first<
          Record<
            string,
            unknown
          >
        >();

    if (!override) {
      return publication;
    }

    const update:
      UpdatePublicationInput = {};

    if (
      override.forced_type
    ) {
      update.type =
        normalizeType(
          override.forced_type
        );
    }

    if (
      override.forced_status
    ) {
      update.status =
        normalizeStatus(
          override.forced_status
        );
    }

    if (
      override.forced_visibility
    ) {
      update.visibility =
        normalizeVisibility(
          override.forced_visibility
        );
    }

    if (
      override.forced_priority
    ) {
      update.priority =
        normalizePriority(
          override.forced_priority
        );
    }

    if (
      override.auto_delete_enabled !==
        null &&
      override.auto_delete_enabled !==
        undefined
    ) {
      update.auto_delete_enabled =
        bool(
          override.auto_delete_enabled
        );
    }

    if (
      override.custom_delete_at
    ) {
      update.delete_at =
        normalizeDate(
          override.custom_delete_at
        );
    }

    if (
      override.custom_publish_at
    ) {
      update.publish_at =
        normalizeDate(
          override.custom_publish_at
        );
    }

    if (
      override.custom_author_name !==
        null &&
      override.custom_author_name !==
        undefined
    ) {
      update.author_name =
        nullableString(
          override.custom_author_name
        );
    }

    if (
      override.custom_author_username !==
        null &&
      override.custom_author_username !==
        undefined
    ) {
      update.author_username =
        nullableString(
          override.custom_author_username
        );
    }

    if (
      override.custom_author_avatar_url !==
        null &&
      override.custom_author_avatar_url !==
        undefined
    ) {
      update.author_avatar_url =
        nullableString(
          override.custom_author_avatar_url
        );
    }

    if (
      override.custom_background !==
        null &&
      override.custom_background !==
        undefined
    ) {
      update.background =
        nullableString(
          override.custom_background
        );
    }

    if (
      override.custom_font !==
        null &&
      override.custom_font !==
        undefined
    ) {
      update.font =
        nullableString(
          override.custom_font
        );
    }

    if (
      override.custom_color !==
        null &&
      override.custom_color !==
        undefined
    ) {
      update.color =
        nullableString(
          override.custom_color
        );
    }

    if (
      override.custom_tag !==
        null &&
      override.custom_tag !==
        undefined
    ) {
      update.tag =
        nullableString(
          override.custom_tag
        );
    }

    if (
      override.custom_tag_icon !==
        null &&
      override.custom_tag_icon !==
        undefined
    ) {
      update.tag_icon =
        nullableString(
          override.custom_tag_icon
        );
    }

    if (
      override.custom_tag_color !==
        null &&
      override.custom_tag_color !==
        undefined
    ) {
      update.tag_color =
        nullableString(
          override.custom_tag_color
        );
    }

    if (
      override.comments_enabled !==
        null &&
      override.comments_enabled !==
        undefined
    ) {
      update.comments_enabled =
        bool(
          override.comments_enabled
        );
    }

    if (
      override.reactions_enabled !==
        null &&
      override.reactions_enabled !==
        undefined
    ) {
      update.reactions_enabled =
        bool(
          override.reactions_enabled
        );
    }

    if (
      override.reviews_enabled !==
        null &&
      override.reviews_enabled !==
        undefined
    ) {
      update.reviews_enabled =
        bool(
          override.reviews_enabled
        );
    }

    if (
      override.sharing_enabled !==
        null &&
      override.sharing_enabled !==
        undefined
    ) {
      update.sharing_enabled =
        bool(
          override.sharing_enabled
        );
    }

    if (
      override.bookmarks_enabled !==
        null &&
      override.bookmarks_enabled !==
        undefined
    ) {
      update.bookmarks_enabled =
        bool(
          override.bookmarks_enabled
        );
    }

    const statements:
      D1PreparedStatement[] = [];

    if (
      override.pinned !==
        null &&
      override.pinned !==
        undefined
    ) {
      statements.push(
        this.db
          .prepare(`
            UPDATE publications
            SET
              pinned = ?,
              updated_at = ?
            WHERE id = ?
          `)
          .bind(
            bool(
              override.pinned
            )
              ? 1
              : 0,
            now(),
            publicationId
          )
      );
    }

    if (
      override.featured !==
        null &&
      override.featured !==
        undefined
    ) {
      statements.push(
        this.db
          .prepare(`
            UPDATE publications
            SET
              featured = ?,
              updated_at = ?
            WHERE id = ?
          `)
          .bind(
            bool(
              override.featured
            )
              ? 1
              : 0,
            now(),
            publicationId
          )
      );
    }

    if (
      statements.length > 0
    ) {
      await this.db.batch(
        statements
      );
    }

    if (
      Object.keys(
        update
      ).length > 0
    ) {
      await this.update(
        publicationId,
        update,
        "ADMIN_OVERRIDE"
      );
    }

    return this.getById(
      publicationId
    );
  }


  // ==========================================================
  // DELETE
  // ==========================================================

  async delete(
    id: string,
    deletedBy = "SYSTEM"
  ): Promise<boolean> {
    const publication =
      await this.getById(
        id
      );

    if (!publication) {
      return false;
    }

    if (
      publication.status ===
      "DELETED"
    ) {
      return true;
    }

    await this.db
      .prepare(`
        UPDATE publications
        SET
          status = 'DELETED',
          updated_at = ?
        WHERE id = ?
      `)
      .bind(
        now(),
        id
      )
      .run();

    await this.addHistory(
      id,
      JSON.stringify(
        publication
      ),
      "DELETE",
      deletedBy
    );

    return true;
  }


  // ==========================================================
  // RESTORE
  // ==========================================================

  async restore(
    id: string,
    restoredBy = "ADMIN"
  ): Promise<Publication | null> {
    const publication =
      await this.getById(
        id
      );

    if (!publication) {
      return null;
    }

    await this.db
      .prepare(`
        UPDATE publications
        SET
          status = 'PUBLISHED',
          updated_at = ?
        WHERE id = ?
      `)
      .bind(
        now(),
        id
      )
      .run();

    await this.addHistory(
      id,
      JSON.stringify(
        publication
      ),
      "RESTORE",
      restoredBy
    );

    return this.getById(
      id
    );
  }


  // ==========================================================
  // PIN
  // ==========================================================

  async setPinned(
    id: string,
    pinned: boolean,
    adminId = "ADMIN"
  ): Promise<Publication | null> {
    const publication =
      await this.getById(
        id
      );

    if (!publication) {
      return null;
    }

    await this.db
      .prepare(`
        UPDATE publications
        SET
          pinned = ?,
          updated_at = ?
        WHERE id = ?
      `)
      .bind(
        pinned
          ? 1
          : 0,
        now(),
        id
      )
      .run();

    await this.addHistory(
      id,
      JSON.stringify({
        pinned,
      }),
      pinned
        ? "PIN"
        : "UNPIN",
      adminId
    );

    return this.getById(
      id
    );
  }


  // ==========================================================
  // FEATURED
  // ==========================================================

  async setFeatured(
    id: string,
    featured: boolean,
    adminId = "ADMIN"
  ): Promise<Publication | null> {
    const publication =
      await this.getById(
        id
      );

    if (!publication) {
      return null;
    }

    await this.db
      .prepare(`
        UPDATE publications
        SET
          featured = ?,
          updated_at = ?
        WHERE id = ?
      `)
      .bind(
        featured
          ? 1
          : 0,
        now(),
        id
      )
      .run();

    await this.addHistory(
      id,
      JSON.stringify({
        featured,
      }),
      featured
        ? "FEATURE"
        : "UNFEATURE",
      adminId
    );

    return this.getById(
      id
    );
  }


  // ==========================================================
  // PUBLISH
  // ==========================================================

  async publish(
    id: string,
    publishedBy = "ADMIN"
  ): Promise<Publication | null> {
    const result =
      await this.update(
        id,
        {
          status:
            "PUBLISHED",

          publish_at:
            now(),
        },
        publishedBy
      );

    if (result) {
      await this.addHistory(
        id,
        null,
        "PUBLISH",
        publishedBy
      );
    }

    return result;
  }


  // ==========================================================
  // REJECT
  // ==========================================================

  async reject(
    id: string,
    reason?: string,
    adminId = "ADMIN"
  ): Promise<Publication | null> {
    const result =
      await this.update(
        id,
        {
          status:
            "REJECTED",
        },
        adminId
      );

    if (result) {
      await this.addHistory(
        id,
        JSON.stringify({
          reason:
            nullableString(
              reason
            ),
        }),
        "REJECT",
        adminId
      );
    }

    return result;
  }


  // ==========================================================
  // HIDE
  // ==========================================================

  async hide(
    id: string,
    adminId = "ADMIN"
  ): Promise<Publication | null> {
    const result =
      await this.update(
        id,
        {
          status:
            "HIDDEN",
        },
        adminId
      );

    if (result) {
      await this.addHistory(
        id,
        null,
        "HIDE",
        adminId
      );
    }

    return result;
  }


  // ==========================================================
  // ARCHIVE
  // ==========================================================

  async archive(
    id: string,
    adminId = "ADMIN"
  ): Promise<Publication | null> {
    const result =
      await this.update(
        id,
        {
          status:
            "ARCHIVED",
        },
        adminId
      );

    if (result) {
      await this.addHistory(
        id,
        null,
        "ARCHIVE",
        adminId
      );
    }

    return result;
  }


  // ==========================================================
  // METRICS
  // ==========================================================

  async ensureMetricRow(
    publicationId: string
  ): Promise<void> {
    const timestamp =
      now();

    await this.db
      .prepare(`
        INSERT OR IGNORE INTO publication_metric_totals (
          publication_id,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?)
      `)
      .bind(
        publicationId,
        timestamp,
        timestamp
      )
      .run();
  }


  async getMetrics(
    publicationId: string
  ): Promise<PublicationMetrics | null> {
    await this.ensureMetricRow(
      publicationId
    );

    const row =
      await this.db
        .prepare(`
          SELECT *
          FROM publication_metric_totals
          WHERE publication_id = ?
          LIMIT 1
        `)
        .bind(
          publicationId
        )
        .first<
          Record<
            string,
            unknown
          >
        >();

    if (!row) {
      return null;
    }

    return {
      publication_id:
        publicationId,

      views_count:
        normalizeMetric(
          row.views_count
        ),

      unique_views_count:
        normalizeMetric(
          row.unique_views_count
        ),

      likes_count:
        normalizeMetric(
          row.likes_count
        ),

      reactions_count:
        normalizeMetric(
          row.reactions_count
        ),

      comments_count:
        normalizeMetric(
          row.comments_count
        ),

      replies_count:
        normalizeMetric(
          row.replies_count
        ),

      bookmarks_count:
        normalizeMetric(
          row.bookmarks_count
        ),

      shares_count:
        normalizeMetric(
          row.shares_count
        ),

      sends_count:
        normalizeMetric(
          row.sends_count
        ),

      reports_count:
        normalizeMetric(
          row.reports_count
        ),

      contacts_count:
        normalizeMetric(
          row.contacts_count
        ),

      applications_count:
        normalizeMetric(
          row.applications_count
        ),

      downloads_count:
        normalizeMetric(
          row.downloads_count
        ),

      clicks_count:
        normalizeMetric(
          row.clicks_count
        ),

      external_clicks_count:
        normalizeMetric(
          row.external_clicks_count
        ),

      rating_count:
        normalizeMetric(
          row.rating_count
        ),

      rating_sum:
        normalizeMetric(
          row.rating_sum
        ),

      review_count:
        normalizeMetric(
          row.review_count
        ),

      created_at:
        requiredString(
          row.created_at
        ),

      updated_at:
        requiredString(
          row.updated_at
        ),
    };
  }


  // ==========================================================
  // HUGE DECIMAL METRIC
  // ==========================================================

  async incrementMetric(
    publicationId: string,
    metric: PublicationMetric,
    amount:
      string | number = "1"
  ): Promise<string> {
    await this.ensureMetricRow(
      publicationId
    );

    const increment =
      normalizeMetric(
        amount
      );

    const current =
      await this.db
        .prepare(`
          SELECT ${metric}
          FROM publication_metric_totals
          WHERE publication_id = ?
          LIMIT 1
        `)
        .bind(
          publicationId
        )
        .first<
          Record<
            string,
            unknown
          >
        >();

    const oldValue =
      normalizeMetric(
        current?.[metric]
      );

    const newValue =
      addDecimalStrings(
        oldValue,
        increment
      );

    await this.db
      .prepare(`
        UPDATE publication_metric_totals
        SET
          ${metric} = ?,
          updated_at = ?
        WHERE publication_id = ?
      `)
      .bind(
        newValue,
        now(),
        publicationId
      )
      .run();

    return newValue;
  }


  // ==========================================================
  // MEDIA
  // ==========================================================

  async addMedia(
    publicationId: string,
    media:
      CreatePublicationInput["media"]
  ): Promise<void> {
    if (
      !media?.length
    ) {
      return;
    }

    const limited =
      media.slice(
        0,
        MAX_MEDIA_PER_PUBLICATION
      );

    const statements =
      limited.map(
        (
          item,
          index
        ) => {
          const id =
            requiredString(
              generateId()
            );

          if (!id) {
            throw new Error(
              "Не удалось сгенерировать ID медиа"
            );
          }

          const position =
            Number.isFinite(
              item.position
            )
              ? Math.max(
                  0,
                  Math.floor(
                    item.position as number
                  )
                )
              : index;

          return this.db
            .prepare(`
              INSERT INTO publication_images (
                id,
                publication_id,
                type,
                url,
                key,
                mime_type,
                filename,
                size,
                width,
                height,
                duration,
                position,
                status,
                created_at
              )
              VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?
              )
            `)
            .bind(
              id,
              publicationId,

              nullableString(
                item.type
              ) ||
                "image",

              nullableString(
                item.url
              ),

              nullableString(
                item.key
              ),

              nullableString(
                item.mime_type
              ),

              nullableString(
                item.filename
              ),

              item.size !==
              undefined
                ? String(
                    item.size
                  )
                : null,

              item.width ??
                null,

              item.height ??
                null,

              item.duration ??
                null,

              position,

              "ACTIVE",

              now()
            );
        }
      );

    if (
      statements.length
    ) {
      await this.db.batch(
        statements
      );
    }
  }


  async getMedia(
    publicationId: string
  ): Promise<PublicationMedia[]> {
    const result =
      await this.db
        .prepare(`
          SELECT *
          FROM publication_images
          WHERE publication_id = ?
          AND status != 'DELETED'
          ORDER BY position ASC, created_at ASC
        `)
        .bind(
          publicationId
        )
        .all<
          Record<
            string,
            unknown
          >
        >();

    return (
      result.results ||
      []
    ).map(
      mapMedia
    );
  }


  // ==========================================================
  // REMOVE MEDIA
  // ==========================================================

  async removeMedia(
    mediaId: string,
    adminId = "ADMIN"
  ): Promise<boolean> {
    const row =
      await this.db
        .prepare(`
          SELECT *
          FROM publication_images
          WHERE id = ?
          LIMIT 1
        `)
        .bind(
          mediaId
        )
        .first<
          Record<
            string,
            unknown
          >
        >();

    if (!row) {
      return false;
    }

    await this.db
      .prepare(`
        UPDATE publication_images
        SET status = 'DELETED'
        WHERE id = ?
      `)
      .bind(
        mediaId
      )
      .run();

    const publicationId =
      requiredString(
        row.publication_id
      );

    await this.db
      .prepare(`
        INSERT INTO publication_media_overrides (
          id,
          publication_id,
          media_id,
          action,
          admin_reason,
          updated_by,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        requiredString(
          generateId()
        ),
        publicationId,
        mediaId,
        "delete",
        "Удалено администратором",
        adminId,
        now(),
        now()
      )
      .run();

    return true;
  }


  // ==========================================================
  // HISTORY
  // ==========================================================

  async addHistory(
    publicationId: string,
    snapshot:
      string | null,
    action:
      | PublicationHistoryAction
      | string,
    changedBy: string
  ): Promise<void> {
    await this.db
      .prepare(`
        INSERT INTO publication_history (
          id,
          publication_id,
          action,
          snapshot,
          changed_by,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(
        requiredString(
          generateId()
        ),
        publicationId,
        action,
        snapshot,
        changedBy,
        now()
      )
      .run();
  }


  async getHistory(
    publicationId: string
  ): Promise<
    Record<
      string,
      unknown
    >[]
  > {
    const result =
      await this.db
        .prepare(`
          SELECT *
          FROM publication_history
          WHERE publication_id = ?
          ORDER BY created_at DESC
        `)
        .bind(
          publicationId
        )
        .all<
          Record<
            string,
            unknown
          >
        >();

    return (
      result.results ||
      []
    );
  }


  // ==========================================================
  // SHARE
  // ==========================================================

  async registerShare(
    publicationId: string,
    options: {
      userId?: string;
      visitorId?: string;
      sessionId?: string;
      shareType?: string;
      targetConversationId?: string;
      targetUserId?: string;
      source?: string;
    } = {}
  ): Promise<string> {
    const id =
      requiredString(
        generateId()
      );

    if (!id) {
      throw new Error(
        "Не удалось сгенерировать ID события share"
      );
    }

    await this.db
      .prepare(`
        INSERT INTO publication_share_events (
          id,
          publication_id,
          user_id,
          visitor_id,
          session_id,
          share_type,
          target_conversation_id,
          target_user_id,
          source,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        id,
        publicationId,

        nullableString(
          options.userId
        ),

        nullableString(
          options.visitorId
        ),

        nullableString(
          options.sessionId
        ),

        nullableString(
          options.shareType
        ) ||
          "share",

        nullableString(
          options.targetConversationId
        ),

        nullableString(
          options.targetUserId
        ),

        nullableString(
          options.source
        ) ||
          "publication",

        now()
      )
      .run();

    await this.incrementMetric(
      publicationId,
      "shares_count",
      "1"
    );

    return id;
  }


  // ==========================================================
  // VIEW
  // ==========================================================

  async registerView(
    publicationId: string,
    options: {
      userId?: string;
      visitorId?: string;
      sessionId?: string;
      unique?: boolean;
    } = {}
  ): Promise<void> {
    await this.incrementMetric(
      publicationId,
      "views_count",
      "1"
    );

    if (
      options.unique
    ) {
      await this.incrementMetric(
        publicationId,
        "unique_views_count",
        "1"
      );
    }

    await this.db
      .prepare(`
        INSERT INTO publication_views (
          id,
          publication_id,
          user_id,
          visitor_id,
          session_id,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(
        requiredString(
          generateId()
        ),
        publicationId,

        nullableString(
          options.userId
        ),

        nullableString(
          options.visitorId
        ),

        nullableString(
          options.sessionId
        ),

        now()
      )
      .run();
  }


  // ==========================================================
  // BULK STATUS
  // ==========================================================

  async bulkStatus(
    ids: string[],
    status: PublicationStatus,
    adminId = "ADMIN"
  ): Promise<number> {
    const uniqueIds =
      Array.from(
        new Set(
          ids
            .map(
              value =>
                String(
                  value
                ).trim()
            )
            .filter(
              Boolean
            )
        )
      );

    let changed = 0;

    const normalizedStatus =
      normalizeStatus(
        status
      );

    for (
      const id of
        uniqueIds
    ) {
      const result =
        await this.update(
          id,
          {
            status:
              normalizedStatus,
          },
          adminId
        );

      if (result) {
        changed++;
      }
    }

    return changed;
  }


  // ==========================================================
  // BULK STATUS DETAILED
  // ==========================================================

  async bulkStatusDetailed(
    ids: string[],
    status: PublicationStatus,
    adminId = "ADMIN"
  ): Promise<PublicationBulkResult> {
    const uniqueIds =
      Array.from(
        new Set(
          ids
            .map(
              value =>
                String(
                  value
                ).trim()
            )
            .filter(
              Boolean
            )
        )
      );

    let changed = 0;

    const normalizedStatus =
      normalizeStatus(
        status
      );

    for (
      const id of
        uniqueIds
    ) {
      const result =
        await this.update(
          id,
          {
            status:
              normalizedStatus,
          },
          adminId
        );

      if (result) {
        changed++;
      }
    }

    return {
      changed,
      requested:
        uniqueIds.length,
      failed:
        uniqueIds.length -
        changed,
    };
  }


  // ==========================================================
  // EXPIRATION
  // ==========================================================

  async processExpired(
    limit = 100
  ): Promise<number> {
    const currentTime =
      now();

    const safeLimit =
      Math.min(
        MAX_PROCESS_EXPIRED_LIMIT,
        Math.max(
          1,
          Math.floor(
            Number(limit) ||
              100
          )
        )
      );

    const result =
      await this.db
        .prepare(`
          SELECT id
          FROM publications
          WHERE status = 'PUBLISHED'
          AND auto_delete_enabled = 1
          AND delete_at IS NOT NULL
          AND delete_at <= ?
          ORDER BY delete_at ASC
          LIMIT ?
        `)
        .bind(
          currentTime,
          safeLimit
        )
        .all<{
          id: string;
        }>();

    let count = 0;

    for (
      const row of
        result.results ||
      []
    ) {
      const updated =
        await this.db
          .prepare(`
            UPDATE publications
            SET
              status = 'EXPIRED',
              updated_at = ?
            WHERE id = ?
            AND status = 'PUBLISHED'
          `)
          .bind(
            currentTime,
            row.id
          )
          .run();

      if (
        updated.success
      ) {
        await this.addHistory(
          row.id,
          null,
          "AUTO_EXPIRE",
          "SYSTEM"
        );

        count++;
      }
    }

    return count;
  }


  // ==========================================================
  // RENUMBER
  // ==========================================================

  async renumberPublications(
    deletedPublicNumber: number
  ): Promise<number> {
    if (
      !Number.isFinite(
        deletedPublicNumber
      ) ||
      deletedPublicNumber < 1
    ) {
      return 0;
    }

    const result =
      await this.db
        .prepare(`
          SELECT id, public_number
          FROM publications
          WHERE CAST(public_number AS INTEGER) > ?
          AND status != 'DELETED'
          ORDER BY CAST(public_number AS INTEGER) ASC
        `)
        .bind(
          deletedPublicNumber
        )
        .all<{
          id: string;
          public_number:
            number | string;
        }>();

    let changed = 0;

    for (
      const row of
        result.results ||
      []
    ) {
      const numericNumber =
        Number(
          row.public_number
        );

      if (
        !Number.isFinite(
          numericNumber
        )
      ) {
        continue;
      }

      const oldNumber =
        String(
          row.public_number
        );

      const newNumber =
        String(
          Math.floor(
            numericNumber
          ) - 1
        );

      await this.db
        .prepare(`
          UPDATE publications
          SET
            public_number = ?,
            updated_at = ?
          WHERE id = ?
        `)
        .bind(
          newNumber,
          now(),
          row.id
        )
        .run();

      await this.db
        .prepare(`
          INSERT INTO publication_number_history (
            id,
            publication_id,
            old_public_number,
            new_public_number,
            action,
            changed_by,
            created_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          requiredString(
            generateId()
          ),
          row.id,
          oldNumber,
          newNumber,
          "SHIFT_AFTER_DELETE",
          "SYSTEM",
          now()
        )
        .run();

      changed++;
    }

    return changed;
  }


  // ==========================================================
  // HARD DELETE
  // ==========================================================

  async permanentlyDelete(
    id: string,
    adminId = "ADMIN"
  ): Promise<boolean> {
    const publication =
      await this.getById(
        id
      );

    if (!publication) {
      return false;
    }

    const publicNumber =
      Number(
        publication.public_number
      );

    await this.db
      .prepare(`
        DELETE FROM publications
        WHERE id = ?
      `)
      .bind(
        id
      )
      .run();

    if (
      Number.isFinite(
        publicNumber
      )
    ) {
      await this.renumberPublications(
        publicNumber
      );
    }

    await this.addHistory(
      id,
      JSON.stringify({
        public_number:
          publication.public_number,
      }),
      "PERMANENT_DELETE",
      adminId
    ).catch(() => {
      // FK после hard delete.
    });

    return true;
  }


  // ==========================================================
  // PUBLIC FEED
  // ==========================================================

  async publicFeed(
    options: {
      categoryId?: string;
      search?: string;
      limit?: number;
      offset?: number;
      sort?: PublicationSort;
    } = {}
  ): Promise<PublicationListResult> {
    return this.list({
      status:
        "PUBLISHED",

      visibility:
        "PUBLIC",

      category_id:
        options.categoryId,

      search:
        options.search,

      limit:
        options.limit,

      offset:
        options.offset,

      sort:
        options.sort ||
        "newest",
    });
  }


  // ==========================================================
  // PUBLIC URL
  // ==========================================================

  getPublicUrl(
    publication: Publication
  ): string {
    return safePublicationUrl(
      publication.public_number
    );
  }


  // ==========================================================
  // ADMIN SEARCH
  // ==========================================================

  async adminSearch(
    search: string,
    limit = 50
  ): Promise<Publication[]> {
    const normalizedSearch =
      String(
        search
      ).trim();

    const value =
      `%${normalizedSearch}%`;

    const safeLimit =
      Math.min(
        MAX_LIMIT,
        Math.max(
          1,
          Math.floor(
            Number(limit) ||
              50
          )
        )
      );

    const result =
      await this.db
        .prepare(`
          SELECT *
          FROM publications
          WHERE
            id LIKE ?
            OR CAST(public_number AS TEXT) LIKE ?
            OR title LIKE ?
            OR text LIKE ?
            OR author_id LIKE ?
            OR author_name LIKE ?
            OR author_username LIKE ?
          ORDER BY
            pinned DESC,
            featured DESC,
            created_at DESC
          LIMIT ?
        `)
        .bind(
          value,
          value,
          value,
          value,
          value,
          value,
          value,
          safeLimit
        )
        .all<
          Record<
            string,
            unknown
          >
        >();

    return (
      result.results ||
      []
    ).map(
      mapPublication
    );
  }


  // ==========================================================
  // GET PUBLICATION BY REFERENCE
  // ==========================================================

  async getByReference(
    reference:
      | string
      | number
  ): Promise<Publication | null> {
    const value =
      String(
        reference
      ).trim();

    if (!value) {
      return null;
    }

    const byId =
      await this.getById(
        value
      );

    if (byId) {
      return byId;
    }

    return this.getByPublicNumber(
      value
    );
  }
}


// ============================================================
// FACTORY
// ============================================================

export function createPublicationService(
  env: Env
): PublicationService {
  return new PublicationService(
    env
  );
}


// ============================================================
// STANDALONE HELPERS
// ============================================================

export async function createPublication(
  env: Env,
  input: CreatePublicationInput
): Promise<Publication> {
  return createPublicationService(
    env
  ).create(
    input
  );
}


export async function getPublication(
  env: Env,
  id: string
): Promise<Publication | null> {
  return createPublicationService(
    env
  ).getById(
    id
  );
}


export async function getPublicationByNumber(
  env: Env,
  number:
    number | string
): Promise<Publication | null> {
  return createPublicationService(
    env
  ).getByPublicNumber(
    number
  );
}
