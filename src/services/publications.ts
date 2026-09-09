import type { Env } from "../types/env";

import {
  generateId,
  generatePublicationId,
  generatePublicationNumber,
} from "../utils/id";

import {
  addDecimalStrings,
  normalizeDecimalString,
} from "../utils/crypto";

import {
  normalizePublicationNumber,
  normalizePublicationId,
  publicationUrl,
} from "../utils/publication";

export type PublicationType =
  | "vacancy"
  | "education"
  | "career"
  | "news"
  | "event"
  | "announcement"
  | "other";

export type PublicationStatus =
  | "draft"
  | "pending"
  | "published"
  | "hidden"
  | "rejected"
  | "deleted"
  | "archived";

export type PublicationVisibility =
  | "public"
  | "private"
  | "unlisted";

export type PublicationPriority =
  | "low"
  | "normal"
  | "high"
  | "urgent";

export type PublicationSource =
  | "admin"
  | "user"
  | "operator"
  | "system"
  | "import"
  | "api";

export type PublicationHistoryAction =
  | "created"
  | "edited"
  | "status_changed"
  | "pinned"
  | "unpinned"
  | "featured"
  | "unfeatured"
  | "published"
  | "rejected"
  | "hidden"
  | "archived"
  | "restored"
  | "deleted"
  | "permanently_deleted"
  | "admin_override"
  | "media_added"
  | "media_removed"
  | "viewed"
  | "shared";

export interface Publication {
  id: string;
  publicNumber: string;
  title: string;
  shortText: string | null;
  content: string;
  type: PublicationType;
  status: PublicationStatus;
  visibility: PublicationVisibility;
  priority: PublicationPriority;
  source: PublicationSource;

  categoryId: string | null;
  authorId: string | null;
  authorName: string | null;

  city: string | null;
  region: string | null;

  companyName: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactTelegram: string | null;
  contactEmail: string | null;

  salaryFrom: string | null;
  salaryTo: string | null;
  salaryCurrency: string | null;
  salaryPeriod: string | null;

  isPinned: boolean;
  isFeatured: boolean;
  allowComments: boolean;

  expiresAt: string | null;
  publishedAt: string | null;

  viewsCount: string;
  sharesCount: string;
  applicationsCount: string;

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface PublicationMedia {
  id: string;
  publicationId: string;
  type: string;
  url: string;
  thumbnailUrl: string | null;
  title: string | null;
  alt: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface CreatePublicationInput {
  title: string;
  content?: string;
  shortText?: string | null;

  type?: PublicationType;
  status?: PublicationStatus;
  visibility?: PublicationVisibility;
  priority?: PublicationPriority;
  source?: PublicationSource;

  categoryId?: string | null;
  authorId?: string | null;
  authorName?: string | null;

  city?: string | null;
  region?: string | null;

  companyName?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  contactTelegram?: string | null;
  contactEmail?: string | null;

  salaryFrom?: string | number | null;
  salaryTo?: string | number | null;
  salaryCurrency?: string | null;
  salaryPeriod?: string | null;

  allowComments?: boolean;
  expiresAt?: string | null;
}

export interface UpdatePublicationInput {
  title?: string;
  content?: string;
  shortText?: string | null;

  type?: PublicationType;
  status?: PublicationStatus;
  visibility?: PublicationVisibility;
  priority?: PublicationPriority;

  categoryId?: string | null;
  authorId?: string | null;
  authorName?: string | null;

  city?: string | null;
  region?: string | null;

  companyName?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  contactTelegram?: string | null;
  contactEmail?: string | null;

  salaryFrom?: string | number | null;
  salaryTo?: string | number | null;
  salaryCurrency?: string | null;
  salaryPeriod?: string | null;

  allowComments?: boolean;
  expiresAt?: string | null;
}

export interface AdminPublicationOverrideInput {
  title?: string | null;
  content?: string | null;
  shortText?: string | null;

  type?: PublicationType | null;
  status?: PublicationStatus | null;
  visibility?: PublicationVisibility | null;
  priority?: PublicationPriority | null;

  categoryId?: string | null;
  authorId?: string | null;
  authorName?: string | null;

  city?: string | null;
  region?: string | null;

  companyName?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  contactTelegram?: string | null;
  contactEmail?: string | null;

  salaryFrom?: string | number | null;
  salaryTo?: string | number | null;
  salaryCurrency?: string | null;
  salaryPeriod?: string | null;

  allowComments?: boolean | null;
  expiresAt?: string | null;

  reason?: string | null;
  changedBy?: string | null;
}

export interface PublicationFilter {
  type?: PublicationType | string;
  status?: PublicationStatus | string;
  visibility?: PublicationVisibility | string;
  priority?: PublicationPriority | string;
  source?: PublicationSource | string;

  categoryId?: string;
  authorId?: string;

  city?: string;
  region?: string;

  pinned?: boolean;
  featured?: boolean;

  createdFrom?: string;
  createdTo?: string;
  publishedFrom?: string;
  publishedTo?: string;

  query?: string;
}

export interface PublicationListResult {
  items: Publication[];
  total: number;
  page: number;
  limit: number;
  offset: number;
  pages: number;
}

export interface PublicationMetrics {
  publicationId: string;
  viewsCount: string;
  sharesCount: string;
  applicationsCount: string;
  likesCount: string;
  commentsCount: string;
  savesCount: string;
  updatedAt: string;
}

export interface PublicationDetails {
  publication: Publication;
  media: PublicationMedia[];
  metrics: PublicationMetrics;
  history: unknown[];
}

export interface PublicationSearchOptions {
  query?: string;
  type?: PublicationType;
  status?: PublicationStatus;
  categoryId?: string;
  city?: string;
  limit?: number;
  offset?: number;
}

export interface PublicationBulkResult {
  requested: number;
  updated: number;
  failed: number;
  ids: string[];
  errors: Array<{
    id: string;
    error: string;
  }>;
}

type D1Row = Record<string, unknown>;

function now(): string {
  return new Date().toISOString();
}

function nullableString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const result = String(value).trim();

  return result.length > 0 ? result : null;
}

function requiredString(value: unknown, field: string): string {
  const result = nullableString(value);

  if (!result) {
    throw new Error(`${field} is required`);
  }

  return result;
}

function normalizeWhitespace(value: unknown): string {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function bool(value: unknown, fallback = false): boolean {
  if (value === undefined || value === null) {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  const normalized = String(value).trim().toLowerCase();

  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return fallback;
}

function limitValue(value: unknown, fallback = 20): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(Math.floor(parsed), 1), 100);
}

function offsetValue(value: unknown, fallback = 0): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.max(Math.floor(parsed), 0);
}

function normalizeDate(value: unknown): string | null {
  const input = nullableString(value);

  if (!input) {
    return null;
  }

  const date = new Date(input);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function datePlusDays(days: number): string {
  const date = new Date();

  date.setUTCDate(date.getUTCDate() + days);

  return date.toISOString();
}

function normalizeEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  const input = nullableString(value);

  if (!input) {
    return fallback;
  }

  return allowed.includes(input as T)
    ? (input as T)
    : fallback;
}

function normalizePublicationType(value: unknown): PublicationType {
  return normalizeEnum(
    value,
    [
      "vacancy",
      "education",
      "career",
      "news",
      "event",
      "announcement",
      "other",
    ] as const,
    "vacancy",
  );
}

function normalizePublicationStatus(
  value: unknown,
): PublicationStatus {
  return normalizeEnum(
    value,
    [
      "draft",
      "pending",
      "published",
      "hidden",
      "rejected",
      "deleted",
      "archived",
    ] as const,
    "draft",
  );
}

function normalizePublicationVisibility(
  value: unknown,
): PublicationVisibility {
  return normalizeEnum(
    value,
    ["public", "private", "unlisted"] as const,
    "public",
  );
}

function normalizePublicationPriority(
  value: unknown,
): PublicationPriority {
  return normalizeEnum(
    value,
    ["low", "normal", "high", "urgent"] as const,
    "normal",
  );
}

function normalizePublicationSource(
  value: unknown,
): PublicationSource {
  return normalizeEnum(
    value,
    [
      "admin",
      "user",
      "operator",
      "system",
      "import",
      "api",
    ] as const,
    "user",
  );
}

function safePublicationUrl(
  publicNumber: string,
  origin?: string | null,
): string {
  try {
    return publicationUrl(publicNumber, origin ?? undefined);
  } catch {
    const normalizedOrigin =
      nullableString(origin) || "";

    const base = normalizedOrigin.replace(/\/+$/, "");

    return `${base}/${encodeURIComponent(publicNumber)}`;
  }
}

function parseTotal(value: unknown): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(Math.floor(parsed), 0);
}

function generatedId(): string {
  const value = generateId();

  const id =
    value == null
      ? ""
      : String(value).trim();

  if (!id) {
    throw new Error("Failed to generate ID");
  }

  return id;
}

function mapPublication(row: D1Row): Publication {
  return {
    id: requiredString(row.id, "publication.id"),
    publicNumber:
      normalizePublicationNumber(
        String(row.public_number ?? row.publicNumber ?? ""),
      ),
    title: String(row.title ?? ""),
    shortText:
      nullableString(
        row.short_text ?? row.shortText,
      ),
    content: String(row.content ?? ""),
    type: normalizePublicationType(row.type),
    status: normalizePublicationStatus(row.status),
    visibility:
      normalizePublicationVisibility(row.visibility),
    priority:
      normalizePublicationPriority(row.priority),
    source:
      normalizePublicationSource(row.source),

    categoryId:
      nullableString(
        row.category_id ?? row.categoryId,
      ),

    authorId:
      nullableString(
        row.author_id ?? row.authorId,
      ),

    authorName:
      nullableString(
        row.author_name ?? row.authorName,
      ),

    city: nullableString(row.city),
    region: nullableString(row.region),

    companyName:
      nullableString(
        row.company_name ?? row.companyName,
      ),

    contactName:
      nullableString(
        row.contact_name ?? row.contactName,
      ),

    contactPhone:
      nullableString(
        row.contact_phone ?? row.contactPhone,
      ),

    contactTelegram:
      nullableString(
        row.contact_telegram ??
        row.contactTelegram,
      ),

    contactEmail:
      nullableString(
        row.contact_email ?? row.contactEmail,
      ),

    salaryFrom:
      nullableString(
        row.salary_from ?? row.salaryFrom,
      ),

    salaryTo:
      nullableString(
        row.salary_to ?? row.salaryTo,
      ),

    salaryCurrency:
      nullableString(
        row.salary_currency ??
        row.salaryCurrency,
      ),

    salaryPeriod:
      nullableString(
        row.salary_period ??
        row.salaryPeriod,
      ),

    isPinned:
      bool(
        row.is_pinned ??
        row.isPinned,
      ),

    isFeatured:
      bool(
        row.is_featured ??
        row.isFeatured,
      ),

    allowComments:
      bool(
        row.allow_comments ??
        row.allowComments,
        true,
      ),

    expiresAt:
      nullableString(
        row.expires_at ??
        row.expiresAt,
      ),

    publishedAt:
      nullableString(
        row.published_at ??
        row.publishedAt,
      ),

    viewsCount:
      normalizeDecimalString(
        String(
          row.views_count ??
          row.viewsCount ??
          "0",
        ),
      ),

    sharesCount:
      normalizeDecimalString(
        String(
          row.shares_count ??
          row.sharesCount ??
          "0",
        ),
      ),

    applicationsCount:
      normalizeDecimalString(
        String(
          row.applications_count ??
          row.applicationsCount ??
          "0",
        ),
      ),

    createdAt:
      String(
        row.created_at ??
        row.createdAt ??
        "",
      ),

    updatedAt:
      String(
        row.updated_at ??
        row.updatedAt ??
        "",
      ),

    deletedAt:
      nullableString(
        row.deleted_at ??
        row.deletedAt,
      ),
  };
}

function mapMedia(row: D1Row): PublicationMedia {
  return {
    id: requiredString(row.id, "media.id"),

    publicationId:
      requiredString(
        row.publication_id ??
        row.publicationId,
        "media.publicationId",
      ),

    type:
      String(
        row.type ?? "image",
      ),

    url:
      String(
        row.url ?? "",
      ),

    thumbnailUrl:
      nullableString(
        row.thumbnail_url ??
        row.thumbnailUrl,
      ),

    title:
      nullableString(
        row.title,
      ),

    alt:
      nullableString(
        row.alt,
      ),

    sortOrder:
      Number(
        row.sort_order ??
        row.sortOrder ??
        0,
      ),

    createdAt:
      String(
        row.created_at ??
        row.createdAt ??
        "",
      ),
  };
}

export class PublicationService {
  private readonly db: D1Database;

  constructor(envOrDb: Env | D1Database) {
    if (
      envOrDb &&
      typeof envOrDb === "object" &&
      "prepare" in envOrDb
    ) {
      this.db = envOrDb as D1Database;
      return;
    }

    const env = envOrDb as Env;

    if (!env?.DB) {
      throw new Error(
        "D1 database binding DB is not available",
      );
    }

    this.db = env.DB;
  }

  async getNextPublicNumber(): Promise<string> {
    const result = await this.db
      .prepare(`
        SELECT public_number
        FROM publications
        ORDER BY CAST(public_number AS INTEGER) DESC
        LIMIT 1
      `)
      .first<D1Row>();

    const current =
      result?.public_number ??
      result?.publicNumber ??
      null;

    if (current != null) {
      const normalized =
        normalizePublicationNumber(
          String(current),
        );

      const numeric = Number(
        normalized.replace(/\D/g, ""),
      );

      if (
        Number.isFinite(numeric) &&
        numeric > 0
      ) {
        return String(numeric + 1);
      }
    }

    try {
      const generated =
        generatePublicationNumber();

      if (generated != null) {
        return String(generated);
      }
    } catch {
      // fallback
    }

    return "1";
  }

  async create(
    input: CreatePublicationInput,
  ): Promise<Publication> {
    const id =
      generatePublicationId() ??
      generatedId();

    const publicNumber =
      normalizePublicationNumber(
        await this.getNextPublicNumber(),
      );

    const title =
      requiredString(
        normalizeWhitespace(input.title),
        "title",
      );

    const content =
      normalizeWhitespace(
        input.content ?? "",
      );

    const shortText =
      nullableString(
        input.shortText,
      );

    const status =
      normalizePublicationStatus(
        input.status ?? "draft",
      );

    const nowValue = now();

    const publishedAt =
      status === "published"
        ? nowValue
        : null;

    const expiresAt =
      normalizeDate(
        input.expiresAt,
      );

    const salaryFrom =
      input.salaryFrom == null
        ? null
        : normalizeDecimalString(
            String(input.salaryFrom),
          );

    const salaryTo =
      input.salaryTo == null
        ? null
        : normalizeDecimalString(
            String(input.salaryTo),
          );

    await this.db
      .prepare(`
        INSERT INTO publications (
          id,
          public_number,
          title,
          short_text,
          content,
          type,
          status,
          visibility,
          priority,
          source,
          category_id,
          author_id,
          author_name,
          city,
          region,
          company_name,
          contact_name,
          contact_phone,
          contact_telegram,
          contact_email,
          salary_from,
          salary_to,
          salary_currency,
          salary_period,
          is_pinned,
          is_featured,
          allow_comments,
          expires_at,
          published_at,
          views_count,
          shares_count,
          applications_count,
          created_at,
          updated_at,
          deleted_at
        )
        VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?
        )
      `)
      .bind(
        id,
        publicNumber,
        title,
        shortText,
        content,
        normalizePublicationType(input.type),
        status,
        normalizePublicationVisibility(
          input.visibility,
        ),
        normalizePublicationPriority(
          input.priority,
        ),
        normalizePublicationSource(
          input.source,
        ),
        nullableString(input.categoryId),
        nullableString(input.authorId),
        nullableString(input.authorName),
        nullableString(input.city),
        nullableString(input.region),
        nullableString(input.companyName),
        nullableString(input.contactName),
        nullableString(input.contactPhone),
        nullableString(input.contactTelegram),
        nullableString(input.contactEmail),
        salaryFrom,
        salaryTo,
        nullableString(input.salaryCurrency),
        nullableString(input.salaryPeriod),
        0,
        0,
        bool(input.allowComments, true) ? 1 : 0,
        expiresAt,
        publishedAt,
        "0",
        "0",
        "0",
        nowValue,
        nowValue,
        null,
      )
      .run();

    await this.addHistory(
      id,
      "created",
      null,
      input.authorId ?? null,
    );

    return this.getById(id) as Promise<Publication>;
  }

  async getById(
    id: string,
  ): Promise<Publication | null> {
    const publicationId =
      normalizePublicationId(id);

    const row =
      await this.db
        .prepare(`
          SELECT *
          FROM publications
          WHERE id = ?
          LIMIT 1
        `)
        .bind(publicationId)
        .first<D1Row>();

    return row
      ? mapPublication(row)
      : null;
  }

  async getByPublicNumber(
    publicNumber: string,
  ): Promise<Publication | null> {
    const normalized =
      normalizePublicationNumber(
        publicNumber,
      );

    const row =
      await this.db
        .prepare(`
          SELECT *
          FROM publications
          WHERE public_number = ?
          LIMIT 1
        `)
        .bind(normalized)
        .first<D1Row>();

    return row
      ? mapPublication(row)
      : null;
  }

  async getDetails(
    id: string,
  ): Promise<PublicationDetails | null> {
    const publication =
      await this.getById(id);

    if (!publication) {
      return null;
    }

    const [
      media,
      metrics,
      history,
    ] = await Promise.all([
      this.getMedia(publication.id),
      this.getMetrics(publication.id),
      this.getHistory(publication.id),
    ]);

    return {
      publication,
      media,
      metrics,
      history,
    };
  }

  async list(
    filter: PublicationFilter = {},
    page = 1,
    limit = 20,
  ): Promise<PublicationListResult> {
    const safeLimit =
      limitValue(limit);

    const safePage =
      Math.max(
        Number.isFinite(page)
          ? Math.floor(page)
          : 1,
        1,
      );

    const offset =
      (safePage - 1) * safeLimit;

    const where: string[] = [];
    const values: unknown[] = [];

    if (filter.type) {
      where.push("type = ?");
      values.push(filter.type);
    }

    if (filter.status) {
      where.push("status = ?");
      values.push(filter.status);
    }

    if (filter.visibility) {
      where.push("visibility = ?");
      values.push(filter.visibility);
    }

    if (filter.priority) {
      where.push("priority = ?");
      values.push(filter.priority);
    }

    if (filter.source) {
      where.push("source = ?");
      values.push(filter.source);
    }

    if (filter.categoryId) {
      where.push("category_id = ?");
      values.push(filter.categoryId);
    }

    if (filter.authorId) {
      where.push("author_id = ?");
      values.push(filter.authorId);
    }

    if (filter.city) {
      where.push("LOWER(city) = LOWER(?)");
      values.push(filter.city);
    }

    if (filter.region) {
      where.push(
        "LOWER(region) = LOWER(?)",
      );
      values.push(filter.region);
    }

    if (filter.pinned !== undefined) {
      where.push("is_pinned = ?");
      values.push(filter.pinned ? 1 : 0);
    }

    if (filter.featured !== undefined) {
      where.push("is_featured = ?");
      values.push(filter.featured ? 1 : 0);
    }

    if (filter.createdFrom) {
      where.push("created_at >= ?");
      values.push(filter.createdFrom);
    }

    if (filter.createdTo) {
      where.push("created_at <= ?");
      values.push(filter.createdTo);
    }

    if (filter.publishedFrom) {
      where.push("published_at >= ?");
      values.push(filter.publishedFrom);
    }

    if (filter.publishedTo) {
      where.push("published_at <= ?");
      values.push(filter.publishedTo);
    }

    if (filter.query) {
      where.push(`
        (
          title LIKE ?
          OR short_text LIKE ?
          OR content LIKE ?
          OR company_name LIKE ?
          OR city LIKE ?
          OR region LIKE ?
        )
      `);

      const search =
        `%${filter.query}%`;

      values.push(
        search,
        search,
        search,
        search,
        search,
        search,
      );
    }

    const condition =
      where.length > 0
        ? `WHERE ${where.join(" AND ")}`
        : "";

    const countRow =
      await this.db
        .prepare(`
          SELECT COUNT(*) AS total
          FROM publications
          ${condition}
        `)
        .bind(...values)
        .first<D1Row>();

    const total =
      parseTotal(
        countRow?.total,
      );

    const rows =
      await this.db
        .prepare(`
          SELECT *
          FROM publications
          ${condition}
          ORDER BY
            is_pinned DESC,
            is_featured DESC,
            CASE priority
              WHEN 'urgent' THEN 4
              WHEN 'high' THEN 3
              WHEN 'normal' THEN 2
              ELSE 1
            END DESC,
            created_at DESC
          LIMIT ? OFFSET ?
        `)
        .bind(
          ...values,
          safeLimit,
          offset,
        )
        .all<D1Row>();

    const items =
      rows.results.map(
        mapPublication,
      );

    const pages =
      total > 0
        ? Math.ceil(
            total / safeLimit,
          )
        : 0;

    return {
      items,
      total,
      page: safePage,
      limit: safeLimit,
      offset,
      pages,
    };
  }

  async search(
    options: PublicationSearchOptions = {},
  ): Promise<PublicationListResult> {
    return this.list(
      {
        query: options.query,
        type: options.type,
        status: options.status,
        categoryId:
          options.categoryId,
        city: options.city,
      },
      1,
      limitValue(options.limit),
    );
  }

  async update(
    id: string,
    input: UpdatePublicationInput,
    changedBy?: string | null,
  ): Promise<Publication | null> {
    const current =
      await this.getById(id);

    if (!current) {
      return null;
    }

    const assignments: string[] = [];
    const values: unknown[] = [];

    const add =
      (
        column: string,
        value: unknown,
      ) => {
        assignments.push(
          `${column} = ?`,
        );
        values.push(value);
      };

    if (input.title !== undefined) {
      add(
        "title",
        requiredString(
          input.title,
          "title",
        ),
      );
    }

    if (input.content !== undefined) {
      add(
        "content",
        normalizeWhitespace(
          input.content,
        ),
      );
    }

    if (
      input.shortText !== undefined
    ) {
      add(
        "short_text",
        nullableString(
          input.shortText,
        ),
      );
    }

    if (input.type !== undefined) {
      add(
        "type",
        normalizePublicationType(
          input.type,
        ),
      );
    }

    if (input.status !== undefined) {
      add(
        "status",
        normalizePublicationStatus(
          input.status,
        ),
      );

      if (
        input.status ===
        "published"
      ) {
        add(
          "published_at",
          current.publishedAt ??
            now(),
        );
      }
    }

    if (
      input.visibility !== undefined
    ) {
      add(
        "visibility",
        normalizePublicationVisibility(
          input.visibility,
        ),
      );
    }

    if (
      input.priority !== undefined
    ) {
      add(
        "priority",
        normalizePublicationPriority(
          input.priority,
        ),
      );
    }

    if (
      input.categoryId !== undefined
    ) {
      add(
        "category_id",
        nullableString(
          input.categoryId,
        ),
      );
    }

    if (
      input.authorId !== undefined
    ) {
      add(
        "author_id",
        nullableString(
          input.authorId,
        ),
      );
    }

    if (
      input.authorName !== undefined
    ) {
      add(
        "author_name",
        nullableString(
          input.authorName,
        ),
      );
    }

    if (input.city !== undefined) {
      add(
        "city",
        nullableString(
          input.city,
        ),
      );
    }

    if (input.region !== undefined) {
      add(
        "region",
        nullableString(
          input.region,
        ),
      );
    }

    if (
      input.companyName !==
      undefined
    ) {
      add(
        "company_name",
        nullableString(
          input.companyName,
        ),
      );
    }

    if (
      input.contactName !==
      undefined
    ) {
      add(
        "contact_name",
        nullableString(
          input.contactName,
        ),
      );
    }

    if (
      input.contactPhone !==
      undefined
    ) {
      add(
        "contact_phone",
        nullableString(
          input.contactPhone,
        ),
      );
    }

    if (
      input.contactTelegram !==
      undefined
    ) {
      add(
        "contact_telegram",
        nullableString(
          input.contactTelegram,
        ),
      );
    }

    if (
      input.contactEmail !==
      undefined
    ) {
      add(
        "contact_email",
        nullableString(
          input.contactEmail,
        ),
      );
    }

    if (
      input.salaryFrom !==
      undefined
    ) {
      add(
        "salary_from",
        input.salaryFrom == null
          ? null
          : normalizeDecimalString(
              String(
                input.salaryFrom,
              ),
            ),
      );
    }

    if (
      input.salaryTo !==
      undefined
    ) {
      add(
        "salary_to",
        input.salaryTo == null
          ? null
          : normalizeDecimalString(
              String(
                input.salaryTo,
              ),
            ),
      );
    }

    if (
      input.salaryCurrency !==
      undefined
    ) {
      add(
        "salary_currency",
        nullableString(
          input.salaryCurrency,
        ),
      );
    }

    if (
      input.salaryPeriod !==
      undefined
    ) {
      add(
        "salary_period",
        nullableString(
          input.salaryPeriod,
        ),
      );
    }

    if (
      input.allowComments !==
      undefined
    ) {
      add(
        "allow_comments",
        input.allowComments
          ? 1
          : 0,
      );
    }

    if (
      input.expiresAt !== undefined
    ) {
      add(
        "expires_at",
        normalizeDate(
          input.expiresAt,
        ),
      );
    }

    if (assignments.length === 0) {
      return current;
    }

    add(
      "updated_at",
      now(),
    );

    await this.db
      .prepare(`
        UPDATE publications
        SET ${assignments.join(", ")}
        WHERE id = ?
      `)
      .bind(
        ...values,
        id,
      )
      .run();

    await this.addHistory(
      id,
      "edited",
      input,
      changedBy,
    );

    return this.getById(id);
  }

  async saveAdminOverride(
    publicationId: string,
    input: AdminPublicationOverrideInput,
  ): Promise<void> {
    const id = generatedId();

    await this.db
      .prepare(`
        INSERT INTO publication_admin_overrides (
          id,
          publication_id,
          title,
          content,
          short_text,
          type,
          status,
          visibility,
          priority,
          category_id,
          author_id,
          author_name,
          city,
          region,
          company_name,
          contact_name,
          contact_phone,
          contact_telegram,
          contact_email,
          salary_from,
          salary_to,
          salary_currency,
          salary_period,
          allow_comments,
          expires_at,
          reason,
          changed_by,
          created_at
        )
        VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `)
      .bind(
        id,
        publicationId,
        nullableString(input.title),
        nullableString(input.content),
        nullableString(input.shortText),
        nullableString(input.type),
        nullableString(input.status),
        nullableString(input.visibility),
        nullableString(input.priority),
        nullableString(input.categoryId),
        nullableString(input.authorId),
        nullableString(input.authorName),
        nullableString(input.city),
        nullableString(input.region),
        nullableString(input.companyName),
        nullableString(input.contactName),
        nullableString(input.contactPhone),
        nullableString(input.contactTelegram),
        nullableString(input.contactEmail),
        input.salaryFrom == null
          ? null
          : normalizeDecimalString(
              String(
                input.salaryFrom,
              ),
            ),
        input.salaryTo == null
          ? null
          : normalizeDecimalString(
              String(
                input.salaryTo,
              ),
            ),
        nullableString(
          input.salaryCurrency,
        ),
        nullableString(
          input.salaryPeriod,
        ),
        input.allowComments == null
          ? null
          : input.allowComments
            ? 1
            : 0,
        normalizeDate(
          input.expiresAt,
        ),
        nullableString(
          input.reason,
        ),
        nullableString(
          input.changedBy,
        ),
        now(),
      )
      .run();
  }

  async applyAdminOverride(
    publicationId: string,
    input: AdminPublicationOverrideInput,
  ): Promise<Publication | null> {
    await this.saveAdminOverride(
      publicationId,
      input,
    );

    const update: UpdatePublicationInput =
      {};

    if (input.title !== undefined) {
      update.title =
        input.title ?? "";
    }

    if (
      input.content !== undefined
    ) {
      update.content =
        input.content ?? "";
    }

    if (
      input.shortText !== undefined
    ) {
      update.shortText =
        input.shortText;
    }

    if (input.type !== undefined) {
      update.type =
        input.type ?? "other";
    }

    if (
      input.status !== undefined
    ) {
      update.status =
        input.status ?? "draft";
    }

    if (
      input.visibility !== undefined
    ) {
      update.visibility =
        input.visibility ??
        "public";
    }

    if (
      input.priority !== undefined
    ) {
      update.priority =
        input.priority ??
        "normal";
    }

    if (
      input.categoryId !==
      undefined
    ) {
      update.categoryId =
        input.categoryId;
    }

    if (
      input.authorId !==
      undefined
    ) {
      update.authorId =
        input.authorId;
    }

    if (
      input.authorName !==
      undefined
    ) {
      update.authorName =
        input.authorName;
    }

    if (input.city !== undefined) {
      update.city =
        input.city;
    }

    if (
      input.region !== undefined
    ) {
      update.region =
        input.region;
    }

    if (
      input.companyName !==
      undefined
    ) {
      update.companyName =
        input.companyName;
    }

    if (
      input.contactName !==
      undefined
    ) {
      update.contactName =
        input.contactName;
    }

    if (
      input.contactPhone !==
      undefined
    ) {
      update.contactPhone =
        input.contactPhone;
    }

    if (
      input.contactTelegram !==
      undefined
    ) {
      update.contactTelegram =
        input.contactTelegram;
    }

    if (
      input.contactEmail !==
      undefined
    ) {
      update.contactEmail =
        input.contactEmail;
    }

    if (
      input.salaryFrom !==
      undefined
    ) {
      update.salaryFrom =
        input.salaryFrom;
    }

    if (
      input.salaryTo !==
      undefined
    ) {
      update.salaryTo =
        input.salaryTo;
    }

    if (
      input.salaryCurrency !==
      undefined
    ) {
      update.salaryCurrency =
        input.salaryCurrency;
    }

    if (
      input.salaryPeriod !==
      undefined
    ) {
      update.salaryPeriod =
        input.salaryPeriod;
    }

    if (
      input.allowComments !==
      undefined &&
      input.allowComments !== null
    ) {
      update.allowComments =
        input.allowComments;
    }

    if (
      input.expiresAt !==
      undefined
    ) {
      update.expiresAt =
        input.expiresAt;
    }

    return this.update(
      publicationId,
      update,
      input.changedBy,
    );
  }

  async delete(
    id: string,
    deletedBy?: string | null,
  ): Promise<boolean> {
    const result =
      await this.db
        .prepare(`
          UPDATE publications
          SET
            status = 'deleted',
            deleted_at = ?,
            updated_at = ?
          WHERE id = ?
        `)
        .bind(
          now(),
          now(),
          id,
        )
        .run();

    if (result.success) {
      await this.addHistory(
        id,
        "deleted",
        null,
        deletedBy,
      );
    }

    return result.success;
  }

  async restore(
    id: string,
    restoredBy?: string | null,
  ): Promise<boolean> {
    const result =
      await this.db
        .prepare(`
          UPDATE publications
          SET
            status = 'draft',
            deleted_at = NULL,
            updated_at = ?
          WHERE id = ?
        `)
        .bind(
          now(),
          id,
        )
        .run();

    if (result.success) {
      await this.addHistory(
        id,
        "restored",
        null,
        restoredBy,
      );
    }

    return result.success;
  }

  async setPinned(
    id: string,
    pinned: boolean,
    changedBy?: string | null,
  ): Promise<boolean> {
    const result =
      await this.db
        .prepare(`
          UPDATE publications
          SET
            is_pinned = ?,
            updated_at = ?
          WHERE id = ?
        `)
        .bind(
          pinned ? 1 : 0,
          now(),
          id,
        )
        .run();

    if (result.success) {
      await this.addHistory(
        id,
        pinned
          ? "pinned"
          : "unpinned",
        null,
        changedBy,
      );
    }

    return result.success;
  }

  async setFeatured(
    id: string,
    featured: boolean,
    changedBy?: string | null,
  ): Promise<boolean> {
    const result =
      await this.db
        .prepare(`
          UPDATE publications
          SET
            is_featured = ?,
            updated_at = ?
          WHERE id = ?
        `)
        .bind(
          featured ? 1 : 0,
          now(),
          id,
        )
        .run();

    if (result.success) {
      await this.addHistory(
        id,
        featured
          ? "featured"
          : "unfeatured",
        null,
        changedBy,
      );
    }

    return result.success;
  }

  async publish(
    id: string,
    changedBy?: string | null,
  ): Promise<Publication | null> {
    return this.update(
      id,
      {
        status: "published",
      },
      changedBy,
    );
  }

  async reject(
    id: string,
    changedBy?: string | null,
  ): Promise<Publication | null> {
    return this.update(
      id,
      {
        status: "rejected",
      },
      changedBy,
    );
  }

  async hide(
    id: string,
    changedBy?: string | null,
  ): Promise<Publication | null> {
    return this.update(
      id,
      {
        status: "hidden",
      },
      changedBy,
    );
  }

  async archive(
    id: string,
    changedBy?: string | null,
  ): Promise<Publication | null> {
    return this.update(
      id,
      {
        status: "archived",
      },
      changedBy,
    );
  }

  async ensureMetricRow(
    publicationId: string,
  ): Promise<void> {
    await this.db
      .prepare(`
        INSERT OR IGNORE INTO publication_metric_totals (
          publication_id,
          views_count,
          shares_count,
          applications_count,
          likes_count,
          comments_count,
          saves_count,
          updated_at
        )
        VALUES (?, '0', '0', '0', '0', '0', '0', ?)
      `)
      .bind(
        publicationId,
        now(),
      )
      .run();
  }

  async getMetrics(
    publicationId: string,
  ): Promise<PublicationMetrics> {
    await this.ensureMetricRow(
      publicationId,
    );

    const row =
      await this.db
        .prepare(`
          SELECT *
          FROM publication_metric_totals
          WHERE publication_id = ?
          LIMIT 1
        `)
        .bind(publicationId)
        .first<D1Row>();

    return {
      publicationId,

      viewsCount:
        normalizeDecimalString(
          String(
            row?.views_count ??
            "0",
          ),
        ),

      sharesCount:
        normalizeDecimalString(
          String(
            row?.shares_count ??
            "0",
          ),
        ),

      applicationsCount:
        normalizeDecimalString(
          String(
            row?.applications_count ??
            "0",
          ),
        ),

      likesCount:
        normalizeDecimalString(
          String(
            row?.likes_count ??
            "0",
          ),
        ),

      commentsCount:
        normalizeDecimalString(
          String(
            row?.comments_count ??
            "0",
          ),
        ),

      savesCount:
        normalizeDecimalString(
          String(
            row?.saves_count ??
            "0",
          ),
        ),

      updatedAt:
        String(
          row?.updated_at ??
          now(),
        ),
    };
  }

  async incrementMetric(
    publicationId: string,
    metric:
      | "views_count"
      | "shares_count"
      | "applications_count"
      | "likes_count"
      | "comments_count"
      | "saves_count",
    amount: string | number = "1",
  ): Promise<void> {
    await this.ensureMetricRow(
      publicationId,
    );

    const safeAmount =
      normalizeDecimalString(
        String(amount),
      );

    const row =
      await this.db
        .prepare(`
          SELECT ${metric} AS value
          FROM publication_metric_totals
          WHERE publication_id = ?
          LIMIT 1
        `)
        .bind(publicationId)
        .first<D1Row>();

    const current =
      normalizeDecimalString(
        String(
          row?.value ?? "0",
        ),
      );

    const next =
      addDecimalStrings(
        current,
        safeAmount,
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
        next,
        now(),
        publicationId,
      )
      .run();

    if (
      metric === "views_count"
    ) {
      await this.db
        .prepare(`
          UPDATE publications
          SET
            views_count = ?,
            updated_at = ?
          WHERE id = ?
        `)
        .bind(
          next,
          now(),
          publicationId,
        )
        .run();
    }

    if (
      metric === "shares_count"
    ) {
      await this.db
        .prepare(`
          UPDATE publications
          SET
            shares_count = ?,
            updated_at = ?
          WHERE id = ?
        `)
        .bind(
          next,
          now(),
          publicationId,
        )
        .run();
    }

    if (
      metric ===
      "applications_count"
    ) {
      await this.db
        .prepare(`
          UPDATE publications
          SET
            applications_count = ?,
            updated_at = ?
          WHERE id = ?
        `)
        .bind(
          next,
          now(),
          publicationId,
        )
        .run();
    }
  }

  async addMedia(
    publicationId: string,
    input: {
      type?: string;
      url: string;
      thumbnailUrl?: string | null;
      title?: string | null;
      alt?: string | null;
      sortOrder?: number;
    },
  ): Promise<PublicationMedia> {
    const id = generatedId();

    const mediaType =
      nullableString(
        input.type,
      ) || "image";

    const url =
      requiredString(
        input.url,
        "media.url",
      );

    await this.db
      .prepare(`
        INSERT INTO publication_images (
          id,
          publication_id,
          type,
          url,
          thumbnail_url,
          title,
          alt,
          sort_order,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        id,
        publicationId,
        mediaType,
        url,
        nullableString(
          input.thumbnailUrl,
        ),
        nullableString(
          input.title,
        ),
        nullableString(
          input.alt,
        ),
        Number(
          input.sortOrder ?? 0,
        ),
        now(),
      )
      .run();

    await this.addHistory(
      publicationId,
      "media_added",
      {
        mediaId: id,
      },
    );

    const media =
      await this.db
        .prepare(`
          SELECT *
          FROM publication_images
          WHERE id = ?
          LIMIT 1
        `)
        .bind(id)
        .first<D1Row>();

    if (!media) {
      throw new Error(
        "Media was created but could not be loaded",
      );
    }

    return mapMedia(media);
  }

  async getMedia(
    publicationId: string,
  ): Promise<PublicationMedia[]> {
    const result =
      await this.db
        .prepare(`
          SELECT *
          FROM publication_images
          WHERE publication_id = ?
          ORDER BY sort_order ASC, created_at ASC
        `)
        .bind(publicationId)
        .all<D1Row>();

    return result.results.map(
      mapMedia,
    );
  }

  async removeMedia(
    mediaId: string,
    changedBy?: string | null,
  ): Promise<boolean> {
    const row =
      await this.db
        .prepare(`
          SELECT publication_id
          FROM publication_images
          WHERE id = ?
          LIMIT 1
        `)
        .bind(mediaId)
        .first<D1Row>();

    const result =
      await this.db
        .prepare(`
          DELETE FROM publication_images
          WHERE id = ?
        `)
        .bind(mediaId)
        .run();

    if (
      result.success &&
      row?.publication_id
    ) {
      await this.addHistory(
        String(
          row.publication_id,
        ),
        "media_removed",
        {
          mediaId,
        },
        changedBy,
      );
    }

    return result.success;
  }

  async addHistory(
    publicationId: string,
    action: PublicationHistoryAction,
    payload?: unknown,
    actorId?: string | null,
  ): Promise<string> {
    const id = generatedId();

    await this.db
      .prepare(`
        INSERT INTO publication_history (
          id,
          publication_id,
          action,
          payload,
          actor_id,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(
        id,
        publicationId,
        action,
        payload == null
          ? null
          : JSON.stringify(
              payload,
            ),
        nullableString(actorId),
        now(),
      )
      .run();

    return id;
  }

  async getHistory(
    publicationId: string,
    limit = 100,
  ): Promise<unknown[]> {
    const result =
      await this.db
        .prepare(`
          SELECT *
          FROM publication_history
          WHERE publication_id = ?
          ORDER BY created_at DESC
          LIMIT ?
        `)
        .bind(
          publicationId,
          limitValue(limit, 100),
        )
        .all<D1Row>();

    return result.results;
  }

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
    } = {},
  ): Promise<string> {
    const generatedIdValue =
      generateId();

    const id =
      generatedIdValue == null
        ? ""
        : String(
            generatedIdValue,
          ).trim();

    if (!id) {
      throw new Error(
        "Не удалось сгенерировать ID события share",
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
          options.userId,
        ),
        nullableString(
          options.visitorId,
        ),
        nullableString(
          options.sessionId,
        ),
        nullableString(
          options.shareType,
        ) || "share",
        nullableString(
          options.targetConversationId,
        ),
        nullableString(
          options.targetUserId,
        ),
        nullableString(
          options.source,
        ) || "publication",
        now(),
      )
      .run();

    await this.incrementMetric(
      publicationId,
      "shares_count",
      "1",
    );

    await this.addHistory(
      publicationId,
      "shared",
      {
        shareType:
          options.shareType ??
          "share",
        source:
          options.source ??
          "publication",
      },
      options.userId ??
        null,
    );

    return id;
  }

  async registerView(
    publicationId: string,
    options: {
      userId?: string;
      visitorId?: string;
      sessionId?: string;
      source?: string;
    } = {},
  ): Promise<string> {
    const id = generatedId();

    await this.db
      .prepare(`
        INSERT INTO publication_views (
          id,
          publication_id,
          user_id,
          visitor_id,
          session_id,
          source,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        id,
        publicationId,
        nullableString(
          options.userId,
        ),
        nullableString(
          options.visitorId,
        ),
        nullableString(
          options.sessionId,
        ),
        nullableString(
          options.source,
        ) || "publication",
        now(),
      )
      .run();

    await this.incrementMetric(
      publicationId,
      "views_count",
      "1",
    );

    return id;
  }

  async bulkStatus(
    ids: string[],
    status: PublicationStatus,
    changedBy?: string | null,
  ): Promise<number> {
    const uniqueIds =
      Array.from(
        new Set(
          ids
            .map(
              (id) =>
                nullableString(id),
            )
            .filter(
              (
                id,
              ): id is string =>
                id !== null,
              ),
            ),
        ),
      );

    let updated = 0;

    for (const id of uniqueIds) {
      const publication =
        await this.update(
          id,
          { status },
          changedBy,
        );

      if (publication) {
        updated++;
      }
    }

    return updated;
  }

  async bulkStatusDetailed(
    ids: string[],
    status: PublicationStatus,
    changedBy?: string | null,
  ): Promise<PublicationBulkResult> {
    const uniqueIds =
      Array.from(
        new Set(
          ids
            .map(
              (id) =>
                nullableString(id),
            )
            .filter(
              (
                id,
              ): id is string =>
                id !== null,
            ),
        ),
      );

    const result: PublicationBulkResult =
      {
        requested:
          uniqueIds.length,
        updated: 0,
        failed: 0,
        ids: [],
        errors: [],
      };

    for (const id of uniqueIds) {
      try {
        const publication =
          await this.update(
            id,
            { status },
            changedBy,
          );

        if (!publication) {
          result.failed++;

          result.errors.push({
            id,
            error:
              "Publication not found",
          });

          continue;
        }

        result.updated++;
        result.ids.push(id);
      } catch (error) {
        result.failed++;

        result.errors.push({
          id,
          error:
            error instanceof Error
              ? error.message
              : String(error),
        });
      }
    }

    return result;
  }

  async processExpired(): Promise<number> {
    const timestamp = now();

    const result =
      await this.db
        .prepare(`
          UPDATE publications
          SET
            status = 'archived',
            updated_at = ?
          WHERE
            expires_at IS NOT NULL
            AND expires_at <= ?
            AND status = 'published'
        `)
        .bind(
          timestamp,
          timestamp,
        )
        .run();

    return Number(
      result.meta.changes ?? 0,
    );
  }

  async renumberPublications(
    fromNumber: string,
    toNumber: string,
  ): Promise<boolean> {
    const from =
      normalizePublicationNumber(
        fromNumber,
      );

    const to =
      normalizePublicationNumber(
        toNumber,
      );

    const result =
      await this.db
        .prepare(`
          UPDATE publications
          SET
            public_number = ?,
            updated_at = ?
          WHERE public_number = ?
        `)
        .bind(
          to,
          now(),
          from,
        )
        .run();

    return result.success;
  }

  async permanentlyDelete(
    id: string,
  ): Promise<boolean> {
    const result =
      await this.db
        .prepare(`
          DELETE FROM publications
          WHERE id = ?
        `)
        .bind(id)
        .run();

    return result.success;
  }

  async publicFeed(
    limit = 20,
    offset = 0,
  ): Promise<PublicationListResult> {
    return this.list(
      {
        status: "published",
        visibility: "public",
      },
      Math.floor(
        offsetValue(offset) /
          limitValue(limit),
      ) + 1,
      limitValue(limit),
    );
  }

  getPublicUrl(
    publication: Publication | string,
    origin?: string | null,
  ): string {
    const publicNumber =
      typeof publication === "string"
        ? normalizePublicationNumber(
            publication,
          )
        : publication.publicNumber;

    return safePublicationUrl(
      publicNumber,
      origin,
    );
  }

  async adminSearch(
    options: PublicationSearchOptions = {},
  ): Promise<PublicationListResult> {
    const page = 1;

    return this.list(
      {
        query: options.query,
        type: options.type,
        status: options.status,
        categoryId:
          options.categoryId,
        city: options.city,
      },
      page,
      limitValue(
        options.limit,
        50,
      ),
    );
  }

  async getByReference(
    reference: string,
  ): Promise<Publication | null> {
    const value =
      nullableString(
        reference,
      );

    if (!value) {
      return null;
    }

    if (
      value.startsWith("pub_")
    ) {
      return this.getById(
        value,
      );
    }

    return this.getByPublicNumber(
      value.replace(/^#/, ""),
    );
  }
}

export function createPublicationService(
  env: Env,
): PublicationService {
  return new PublicationService(
    env,
  );
}

export async function getPublication(
  env: Env,
  id: string,
): Promise<Publication | null> {
  return createPublicationService(
    env,
  ).getById(id);
}

export async function getPublicationByNumber(
  env: Env,
  publicNumber: string,
): Promise<Publication | null> {
  return createPublicationService(
    env,
  ).getByPublicNumber(
    publicNumber,
  );
}

export async function createPublication(
  env: Env,
  input: CreatePublicationInput,
): Promise<Publication> {
  return createPublicationService(
    env,
  ).create(input);
}

export async function updatePublication(
  env: Env,
  id: string,
  input: UpdatePublicationInput,
  changedBy?: string | null,
): Promise<Publication | null> {
  return createPublicationService(
    env,
  ).update(
    id,
    input,
    changedBy,
  );
}

export async function deletePublication(
  env: Env,
  id: string,
  deletedBy?: string | null,
): Promise<boolean> {
  return createPublicationService(
    env,
  ).delete(
    id,
    deletedBy,
  );
}

export async function registerPublicationShare(
  env: Env,
  publicationId: string,
  options: {
    userId?: string;
    visitorId?: string;
    sessionId?: string;
    shareType?: string;
    targetConversationId?: string;
    targetUserId?: string;
    source?: string;
  } = {},
): Promise<string> {
  return createPublicationService(
    env,
  ).registerShare(
    publicationId,
    options,
  );
}

export async function registerPublicationView(
  env: Env,
  publicationId: string,
  options: {
    userId?: string;
    visitorId?: string;
    sessionId?: string;
    source?: string;
  } = {},
): Promise<string> {
  return createPublicationService(
    env,
  ).registerView(
    publicationId,
    options,
  );
}
