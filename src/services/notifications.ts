import type { Env } from "../index";

// ============================================================
// 🇹🇯 TAJIK OPPORTUNITIES
// NOTIFICATION SERVICE
// Version: 2026.09.09 POWER PRODUCTION
// ============================================================

export type NotificationCategory =
  | "reports"
  | "participants"
  | "comments"
  | "publications"
  | "chats"
  | "reactions"
  | "reviews"
  | "shares"
  | "bookmarks"
  | "payments"
  | "premium"
  | "pro"
  | "top"
  | "vip"
  | "levels"
  | "badges"
  | "system"
  | "statistics"
  | "activity"
  | "security";

export type NotificationChannel =
  | "in_app"
  | "push"
  | "sound"
  | "vibration"
  | "badge"
  | "email"
  | "system_chat";

export type NotificationPriority =
  | "low"
  | "normal"
  | "high"
  | "urgent";

export type NotificationStatus =
  | "unread"
  | "read"
  | "deleted";

export type NotificationEvent =
  | "new_report"
  | "report_updated"
  | "report_resolved"
  | "new_participant"
  | "participant_updated"
  | "participant_blocked"
  | "participant_unblocked"
  | "new_comment"
  | "comment_reply"
  | "comment_mention"
  | "comment_reaction"
  | "comment_deleted"
  | "new_publication"
  | "publication_pending"
  | "publication_approved"
  | "publication_rejected"
  | "publication_hidden"
  | "publication_deleted"
  | "publication_expiring"
  | "new_chat"
  | "new_message"
  | "message_reply"
  | "message_reaction"
  | "reaction_received"
  | "new_review"
  | "review_reply"
  | "review_reaction"
  | "review_reported"
  | "publication_shared"
  | "publication_saved"
  | "payment_received"
  | "payment_confirmed"
  | "payment_rejected"
  | "premium_granted"
  | "premium_expiring"
  | "pro_granted"
  | "pro_expiring"
  | "top_granted"
  | "top_expiring"
  | "vip_granted"
  | "vip_expiring"
  | "level_changed"
  | "badge_granted"
  | "system_message"
  | "system_warning"
  | "maintenance"
  | "security_alert"
  | "admin_action";

export interface Notification {
  id: string;

  userId: string | null;

  category: NotificationCategory;
  event: NotificationEvent;

  title: string;
  message: string;

  status: NotificationStatus;

  priority: NotificationPriority;

  entityType: string | null;
  entityId: string | null;

  actionUrl: string | null;

  icon: string | null;
  imageUrl: string | null;

  metadata: Record<string, unknown>;

  readAt: string | null;
  deletedAt: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface NotificationCreateInput {
  userId?: string | null;

  category: NotificationCategory;
  event: NotificationEvent;

  title: string;
  message: string;

  priority?: NotificationPriority;

  entityType?: string | null;
  entityId?: string | null;

  actionUrl?: string | null;

  icon?: string | null;
  imageUrl?: string | null;

  metadata?: Record<string, unknown>;

  force?: boolean;
}

export interface NotificationFilters {
  userId?: string | null;

  category?: NotificationCategory;
  event?: NotificationEvent;

  status?: NotificationStatus;

  unreadOnly?: boolean;

  search?: string;

  page?: number;
  limit?: number;

  before?: string;
  after?: string;
}

export interface NotificationListResult {
  items: Notification[];
  total: string;

  unread: string;

  page: number;
  limit: number;

  hasMore: boolean;
}

export interface NotificationCounts {
  all: string;

  reports: string;
  participants: string;
  comments: string;
  publications: string;
  chats: string;
  reactions: string;
  reviews: string;
  shares: string;
  bookmarks: string;
  payments: string;
  premium: string;
  pro: string;
  top: string;
  vip: string;
  levels: string;
  badges: string;
  system: string;
  statistics: string;
  activity: string;
  security: string;
}

export interface NotificationChannelSettings {
  in_app: boolean;
  push: boolean;
  sound: boolean;
  vibration: boolean;
  badge: boolean;
  email: boolean;
  system_chat: boolean;
}

export interface NotificationCategorySettings {
  enabled: boolean;

  channels: NotificationChannelSettings;

  priority: NotificationPriority;

  grouped: boolean;

  instant: boolean;

  history: boolean;

  retentionDays: number | null;

  userCanChange: boolean;
}

export interface NotificationEventSettings {
  enabled: boolean;

  channels?: Partial<NotificationChannelSettings>;

  priority?: NotificationPriority;

  userCanChange?: boolean;
}

export interface NotificationSettings {
  userId: string | null;

  enabled: boolean;

  categories: Record<
    NotificationCategory,
    NotificationCategorySettings
  >;

  events: Partial<
    Record<
      NotificationEvent,
      NotificationEventSettings
    >
  >;

  quietHours: {
    enabled: boolean;
    start: string | null;
    end: string | null;
  };

  forced: {
    enabled: boolean;
    events: NotificationEvent[];
  };

  updatedAt: string | null;
}

// ============================================================
// CONSTANTS
// ============================================================

export const NOTIFICATION_CATEGORIES:
  readonly NotificationCategory[] = [
    "reports",
    "participants",
    "comments",
    "publications",
    "chats",
    "reactions",
    "reviews",
    "shares",
    "bookmarks",
    "payments",
    "premium",
    "pro",
    "top",
    "vip",
    "levels",
    "badges",
    "system",
    "statistics",
    "activity",
    "security",
  ];

export const NOTIFICATION_CHANNELS:
  readonly NotificationChannel[] = [
    "in_app",
    "push",
    "sound",
    "vibration",
    "badge",
    "email",
    "system_chat",
  ];

export const NOTIFICATION_PRIORITIES:
  readonly NotificationPriority[] = [
    "low",
    "normal",
    "high",
    "urgent",
  ];

export const NOTIFICATION_EVENTS:
  readonly NotificationEvent[] = [
    "new_report",
    "report_updated",
    "report_resolved",

    "new_participant",
    "participant_updated",
    "participant_blocked",
    "participant_unblocked",

    "new_comment",
    "comment_reply",
    "comment_mention",
    "comment_reaction",
    "comment_deleted",

    "new_publication",
    "publication_pending",
    "publication_approved",
    "publication_rejected",
    "publication_hidden",
    "publication_deleted",
    "publication_expiring",

    "new_chat",
    "new_message",
    "message_reply",
    "message_reaction",

    "reaction_received",

    "new_review",
    "review_reply",
    "review_reaction",
    "review_reported",

    "publication_shared",
    "publication_saved",

    "payment_received",
    "payment_confirmed",
    "payment_rejected",

    "premium_granted",
    "premium_expiring",
    "pro_granted",
    "pro_expiring",
    "top_granted",
    "top_expiring",
    "vip_granted",
    "vip_expiring",

    "level_changed",
    "badge_granted",

    "system_message",
    "system_warning",
    "maintenance",

    "security_alert",
    "admin_action",
  ];

// ============================================================
// CATEGORY → EVENTS
// ============================================================

export const EVENTS_BY_CATEGORY:
  Record<
    NotificationCategory,
    readonly NotificationEvent[]
  > = {
    reports: [
      "new_report",
      "report_updated",
      "report_resolved",
    ],

    participants: [
      "new_participant",
      "participant_updated",
      "participant_blocked",
      "participant_unblocked",
    ],

    comments: [
      "new_comment",
      "comment_reply",
      "comment_mention",
      "comment_reaction",
      "comment_deleted",
    ],

    publications: [
      "new_publication",
      "publication_pending",
      "publication_approved",
      "publication_rejected",
      "publication_hidden",
      "publication_deleted",
      "publication_expiring",
    ],

    chats: [
      "new_chat",
      "new_message",
      "message_reply",
      "message_reaction",
    ],

    reactions: [
      "reaction_received",
      "comment_reaction",
      "message_reaction",
      "review_reaction",
    ],

    reviews: [
      "new_review",
      "review_reply",
      "review_reaction",
      "review_reported",
    ],

    shares: [
      "publication_shared",
    ],

    bookmarks: [
      "publication_saved",
    ],

    payments: [
      "payment_received",
      "payment_confirmed",
      "payment_rejected",
    ],

    premium: [
      "premium_granted",
      "premium_expiring",
    ],

    pro: [
      "pro_granted",
      "pro_expiring",
    ],

    top: [
      "top_granted",
      "top_expiring",
    ],

    vip: [
      "vip_granted",
      "vip_expiring",
    ],

    levels: [
      "level_changed",
    ],

    badges: [
      "badge_granted",
    ],

    system: [
      "system_message",
      "system_warning",
      "maintenance",
    ],

    statistics: [],

    activity: [
      "admin_action",
    ],

    security: [
      "security_alert",
    ],
  };

// ============================================================
// DEFAULT SETTINGS
// ============================================================

function defaultChannels():
  NotificationChannelSettings {
  return {
    in_app: true,
    push: true,
    sound: true,
    vibration: true,
    badge: true,
    email: false,
    system_chat: true,
  };
}

function defaultCategorySettings(
  category: NotificationCategory
): NotificationCategorySettings {
  const critical =
    category === "security" ||
    category === "system";

  return {
    enabled: true,

    channels:
      defaultChannels(),

    priority:
      critical
        ? "high"
        : "normal",

    grouped:
      !critical,

    instant:
      critical,

    history: true,

    retentionDays:
      null,

    userCanChange:
      !critical,
  };
}

export function createDefaultNotificationSettings(
  userId: string | null = null
): NotificationSettings {
  const categories =
    {} as Record<
      NotificationCategory,
      NotificationCategorySettings
    >;

  for (
    const category of
      NOTIFICATION_CATEGORIES
  ) {
    categories[category] =
      defaultCategorySettings(
        category
      );
  }

  return {
    userId,

    enabled: true,

    categories,

    events: {},

    quietHours: {
      enabled: false,
      start: null,
      end: null,
    },

    forced: {
      enabled: true,
      events: [
        "security_alert",
        "system_warning",
        "maintenance",
      ],
    },

    updatedAt: null,
  };
}

// ============================================================
// VALIDATION
// ============================================================

function isCategory(
  value: unknown
): value is NotificationCategory {
  return (
    typeof value === "string" &&
    NOTIFICATION_CATEGORIES.includes(
      value as NotificationCategory
    )
  );
}

function isEvent(
  value: unknown
): value is NotificationEvent {
  return (
    typeof value === "string" &&
    NOTIFICATION_EVENTS.includes(
      value as NotificationEvent
    )
  );
}

function isPriority(
  value: unknown
): value is NotificationPriority {
  return (
    typeof value === "string" &&
    NOTIFICATION_PRIORITIES.includes(
      value as NotificationPriority
    )
  );
}

function isChannel(
  value: unknown
): value is NotificationChannel {
  return (
    typeof value === "string" &&
    NOTIFICATION_CHANNELS.includes(
      value as NotificationChannel
    )
  );
}

function normalizeString(
  value: unknown
): string | null {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const result =
    value.trim();

  return result || null;
}

function safeJson(
  value: unknown
): string {
  try {
    return JSON.stringify(
      value ?? {}
    );
  } catch {
    return "{}";
  }
}

function parseJsonObject(
  value: unknown
): Record<string, unknown> {
  if (
    typeof value !== "string"
  ) {
    if (
      value &&
      typeof value === "object"
    ) {
      return value as Record<
        string,
        unknown
      >;
    }

    return {};
  }

  try {
    const parsed =
      JSON.parse(value);

    if (
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
    ) {
      return parsed as Record<
        string,
        unknown
      >;
    }
  } catch {
    // ignore
  }

  return {};
}

function clampLimit(
  value: unknown
): number {
  const number =
    Number(value);

  if (
    !Number.isFinite(number)
  ) {
    return 20;
  }

  return Math.min(
    100,
    Math.max(
      1,
      Math.floor(number)
    )
  );
}

function clampPage(
  value: unknown
): number {
  const number =
    Number(value);

  if (
    !Number.isFinite(number)
  ) {
    return 1;
  }

  return Math.max(
    1,
    Math.floor(number)
  );
}

// ============================================================
// SERVICE
// ============================================================

export class NotificationService {
  constructor(
    private readonly env: Env
  ) {}

  // ==========================================================
  // CREATE
  // ==========================================================

  async create(
    input: NotificationCreateInput
  ): Promise<Notification | null> {
    if (
      !isCategory(
        input.category
      )
    ) {
      throw new Error(
        "Invalid notification category"
      );
    }

    if (
      !isEvent(
        input.event
      )
    ) {
      throw new Error(
        "Invalid notification event"
      );
    }

    if (
      !input.title.trim()
    ) {
      throw new Error(
        "Notification title is required"
      );
    }

    if (
      !input.message.trim()
    ) {
      throw new Error(
        "Notification message is required"
      );
    }

    const allowed =
      await this.isEventEnabled(
        input.userId ?? null,
        input.category,
        input.event,
        Boolean(
          input.force
        )
      );

    if (!allowed) {
      return null;
    }

    const id =
      crypto.randomUUID();

    const timestamp =
      new Date().toISOString();

    await this.env.DB.prepare(
      `
      INSERT INTO notifications (
        id,
        user_id,
        category,
        event,
        title,
        message,
        status,
        priority,
        entity_type,
        entity_id,
        action_url,
        icon,
        image_url,
        metadata,
        read_at,
        deleted_at,
        created_at,
        updated_at
      )
      VALUES (
        ?, ?, ?, ?, ?, ?, 'unread', ?, ?, ?, ?, ?, ?, ?,
        NULL, NULL, ?, ?
      )
      `
    )
      .bind(
        id,
        input.userId ??
          null,

        input.category,
        input.event,

        input.title.trim(),
        input.message.trim(),

        input.priority ??
          "normal",

        input.entityType ??
          null,

        input.entityId ??
          null,

        input.actionUrl ??
          null,

        input.icon ??
          null,

        input.imageUrl ??
          null,

        safeJson(
          input.metadata
        ),

        timestamp,
        timestamp
      )
      .run();

    return this.getById(
      id
    );
  }

  // ==========================================================
  // GET
  // ==========================================================

  async getById(
    id: string
  ): Promise<Notification | null> {
    const row =
      await this.env.DB.prepare(
        `
        SELECT *
        FROM notifications
        WHERE id = ?
        LIMIT 1
        `
      )
        .bind(id)
        .first<Record<string, unknown>>();

    return row
      ? this.mapRow(row)
      : null;
  }

  // ==========================================================
  // LIST
  // ==========================================================

  async list(
    filters: NotificationFilters = {}
  ): Promise<NotificationListResult> {
    const page =
      clampPage(
        filters.page
      );

    const limit =
      clampLimit(
        filters.limit
      );

    const offset =
      (page - 1) *
      limit;

    const where: string[] = [];
    const bindings: unknown[] = [];

    if (
      filters.userId !== undefined
    ) {
      if (
        filters.userId === null
      ) {
        where.push(
          "n.user_id IS NULL"
        );
      } else {
        where.push(
          "n.user_id = ?"
        );
        bindings.push(
          filters.userId
        );
      }
    }

    where.push(
      "n.status != 'deleted'"
    );

    if (
      filters.category &&
      isCategory(
        filters.category
      )
    ) {
      where.push(
        "n.category = ?"
      );
      bindings.push(
        filters.category
      );
    }

    if (
      filters.event &&
      isEvent(
        filters.event
      )
    ) {
      where.push(
        "n.event = ?"
      );
      bindings.push(
        filters.event
      );
    }

    if (
      filters.status
    ) {
      where.push(
        "n.status = ?"
      );
      bindings.push(
        filters.status
      );
    }

    if (
      filters.unreadOnly
    ) {
      where.push(
        "n.status = 'unread'"
      );
    }

    if (
      filters.before
    ) {
      where.push(
        "n.created_at < ?"
      );
      bindings.push(
        filters.before
      );
    }

    if (
      filters.after
    ) {
      where.push(
        "n.created_at > ?"
      );
      bindings.push(
        filters.after
      );
    }

    if (
      filters.search
    ) {
      where.push(
        `
        (
          n.title LIKE ?
          OR n.message LIKE ?
          OR n.event LIKE ?
          OR n.category LIKE ?
        )
        `
      );

      const search =
        `%${filters.search}%`;

      bindings.push(
        search,
        search,
        search,
        search
      );
    }

    const whereSql =
      where.length
        ? `WHERE ${where.join(" AND ")}`
        : "";

    const totalRow =
      await this.env.DB.prepare(
        `
        SELECT COUNT(*) AS total
        FROM notifications n
        ${whereSql}
        `
      )
        .bind(...bindings)
        .first<{
          total: number;
        }>();

    const unreadWhere =
      [
        ...where.filter(
          clause =>
            clause !==
            "n.status = 'unread'"
        ),
        "n.status = 'unread'",
      ];

    const unreadSql =
      unreadWhere.length
        ? `WHERE ${unreadWhere.join(
            " AND "
          )}`
        : "";

    const unreadBindings =
      [...bindings];

    const unreadRow =
      await this.env.DB.prepare(
        `
        SELECT COUNT(*) AS unread
        FROM notifications n
        ${unreadSql}
        `
      )
        .bind(
          ...unreadBindings
        )
        .first<{
          unread: number;
        }>();

    const rows =
      await this.env.DB.prepare(
        `
        SELECT n.*
        FROM notifications n
        ${whereSql}
        ORDER BY
          CASE
            WHEN n.priority = 'urgent'
              THEN 0
            WHEN n.priority = 'high'
              THEN 1
            WHEN n.priority = 'normal'
              THEN 2
            ELSE 3
          END,
          n.created_at DESC
        LIMIT ? OFFSET ?
        `
      )
        .bind(
          ...bindings,
          limit,
          offset
        )
        .all<Record<string, unknown>>();

    const items =
      (
        rows.results ??
        []
      ).map(
        row =>
          this.mapRow(row)
      );

    const total =
      String(
        totalRow?.total ??
          0
      );

    return {
      items,

      total,

      unread:
        String(
          unreadRow?.unread ??
            0
        ),

      page,
      limit,

      hasMore:
        offset +
          items.length <
        Number(total),
    };
  }

  // ==========================================================
  // UNREAD COUNT
  // ==========================================================

  async unreadCount(
    userId: string | null
  ): Promise<string> {
    const row =
      await this.env.DB.prepare(
        `
        SELECT COUNT(*) AS count
        FROM notifications
        WHERE
          ${
            userId === null
              ? "user_id IS NULL"
              : "user_id = ?"
          }
          AND status = 'unread'
        `
      )
        .bind(
          ...(userId === null
            ? []
            : [userId])
        )
        .first<{
          count: number;
        }>();

    return String(
      row?.count ??
        0
    );
  }

  // ==========================================================
  // CATEGORY COUNTS
  // ==========================================================

  async counts(
    userId: string | null
  ): Promise<NotificationCounts> {
    const result =
      await this.unreadCount(
        userId
      );

    const counts =
      await this.env.DB.prepare(
        `
        SELECT
          category,
          COUNT(*) AS count
        FROM notifications
        WHERE
          ${
            userId === null
              ? "user_id IS NULL"
              : "user_id = ?"
          }
          AND status = 'unread'
        GROUP BY category
        `
      )
        .bind(
          ...(userId === null
            ? []
            : [userId])
        )
        .all<{
          category: string;
          count: number;
        }>();

    const output: NotificationCounts =
      {
        all: result,

        reports: "0",
        participants: "0",
        comments: "0",
        publications: "0",
        chats: "0",
        reactions: "0",
        reviews: "0",
        shares: "0",
        bookmarks: "0",
        payments: "0",
        premium: "0",
        pro: "0",
        top: "0",
        vip: "0",
        levels: "0",
        badges: "0",
        system: "0",
        statistics: "0",
        activity: "0",
        security: "0",
      };

    for (
      const row of
        counts.results ??
        []
    ) {
      if (
        isCategory(
          row.category
        )
      ) {
        output[
          row.category
        ] =
          String(
            row.count ??
              0
          );
      }
    }

    return output;
  }

  // ==========================================================
  // MARK READ
  // ==========================================================

  async markRead(
    id: string,
    userId?: string | null
  ): Promise<boolean> {
    const timestamp =
      new Date().toISOString();

    const conditions =
      userId === undefined
        ? "id = ?"
        : userId === null
          ? "id = ? AND user_id IS NULL"
          : "id = ? AND user_id = ?";

    const bindings =
      userId === undefined
        ? [timestamp, id]
        : [
            timestamp,
            id,
            ...(userId === null
              ? []
              : [userId]),
          ];

    const result =
      await this.env.DB.prepare(
        `
        UPDATE notifications
        SET
          status = 'read',
          read_at = ?,
          updated_at = ?
        WHERE
          ${conditions}
          AND status != 'deleted'
        `
      )
        .bind(
          ...(userId === undefined
            ? [
                timestamp,
                timestamp,
                id,
              ]
            : [
                timestamp,
                timestamp,
                id,
                ...(userId === null
                  ? []
                  : [userId]),
              ])
        )
        .run();

    return (
      (result.meta?.changes ??
        0) > 0
    );
  }

  // ==========================================================
  // MARK ALL READ
  // ==========================================================

  async markAllRead(
    userId: string | null,
    category?: NotificationCategory
  ): Promise<number> {
    const conditions: string[] = [];

    const bindings: unknown[] = [];

    if (
      userId === null
    ) {
      conditions.push(
        "user_id IS NULL"
      );
    } else {
      conditions.push(
        "user_id = ?"
      );
      bindings.push(
        userId
      );
    }

    conditions.push(
      "status = 'unread'"
    );

    if (
      category &&
      isCategory(
        category
      )
    ) {
      conditions.push(
        "category = ?"
      );

      bindings.push(
        category
      );
    }

    const timestamp =
      new Date().toISOString();

    const result =
      await this.env.DB.prepare(
        `
        UPDATE notifications
        SET
          status = 'read',
          read_at = ?,
          updated_at = ?
        WHERE
          ${conditions.join(
            " AND "
          )}
        `
      )
        .bind(
          timestamp,
          timestamp,
          ...bindings
        )
        .run();

    return (
      result.meta?.changes ??
      0
    );
  }

  // ==========================================================
  // DELETE
  // ==========================================================

  async delete(
    id: string,
    userId?: string | null
  ): Promise<boolean> {
    const timestamp =
      new Date().toISOString();

    let sql = `
      UPDATE notifications
      SET
        status = 'deleted',
        deleted_at = ?,
        updated_at = ?
      WHERE
        id = ?
    `;

    const bindings: unknown[] = [
      timestamp,
      timestamp,
      id,
    ];

    if (
      userId !== undefined
    ) {
      if (
        userId === null
      ) {
        sql +=
          " AND user_id IS NULL";
      } else {
        sql +=
          " AND user_id = ?";
        bindings.push(
          userId
        );
      }
    }

    const result =
      await this.env.DB.prepare(
        sql
      )
        .bind(
          ...bindings
        )
        .run();

    return (
      (result.meta?.changes ??
        0) > 0
    );
  }

  // ==========================================================
  // DELETE READ
  // ==========================================================

  async deleteRead(
    userId: string | null
  ): Promise<number> {
    const timestamp =
      new Date().toISOString();

    const userSql =
      userId === null
        ? "user_id IS NULL"
        : "user_id = ?";

    const result =
      await this.env.DB.prepare(
        `
        UPDATE notifications
        SET
          status = 'deleted',
          deleted_at = ?,
          updated_at = ?
        WHERE
          ${userSql}
          AND status = 'read'
        `
      )
        .bind(
          timestamp,
          timestamp,
          ...(userId === null
            ? []
            : [userId])
        )
        .run();

    return (
      result.meta?.changes ??
      0
    );
  }

  // ==========================================================
  // SEARCH
  // ==========================================================

  async search(
    userId: string | null,
    query: string,
    limit = 50
  ): Promise<Notification[]> {
    const cleanQuery =
      query.trim();

    if (!cleanQuery) {
      return [];
    }

    const search =
      `%${cleanQuery}%`;

    const userSql =
      userId === null
        ? "user_id IS NULL"
        : "user_id = ?";

    const result =
      await this.env.DB.prepare(
        `
        SELECT *
        FROM notifications
        WHERE
          ${userSql}
          AND status != 'deleted'
          AND (
            title LIKE ?
            OR message LIKE ?
            OR event LIKE ?
            OR category LIKE ?
          )
        ORDER BY created_at DESC
        LIMIT ?
        `
      )
        .bind(
          ...(userId === null
            ? []
            : [userId]),
          search,
          search,
          search,
          search,
          Math.min(
            100,
            Math.max(
              1,
              limit
            )
          )
        )
        .all<Record<string, unknown>>();

    return (
      result.results ??
      []
    ).map(
      row =>
        this.mapRow(row)
    );
  }

  // ==========================================================
  // SETTINGS
  // ==========================================================

  async getSettings(
    userId: string | null
  ): Promise<NotificationSettings> {
    const settings =
      createDefaultNotificationSettings(
        userId
      );

    /*
     * Системные настройки хранятся отдельно.
     * Если таблица/ключ отсутствует, используются
     * безопасные значения по умолчанию.
     */

    try {
      const rows =
        await this.env.DB.prepare(
          `
          SELECT
            key,
            value
          FROM system_settings
          WHERE
            key LIKE 'notifications.%'
          `
        )
          .all<{
            key: string;
            value: string;
          }>();

      for (
        const row of
          rows.results ??
          []
      ) {
        this.applySetting(
          settings,
          row.key,
          row.value
        );
      }
    } catch {
      // Используем defaults.
    }

    if (
      userId
    ) {
      try {
        const row =
          await this.env.DB.prepare(
            `
            SELECT
              notification_settings
            FROM users_profiles
            WHERE id = ?
            LIMIT 1
            `
          )
            .bind(userId)
            .first<{
              notification_settings:
                | string
                | null;
            }>();

        if (
          row?.notification_settings
        ) {
          this.mergeSettingsJson(
            settings,
            row.notification_settings
          );
        }
      } catch {
        // Не ломаем центр уведомлений.
      }
    }

    return settings;
  }

  async saveSettings(
    userId: string | null,
    input: Partial<NotificationSettings>
  ): Promise<NotificationSettings> {
    if (!userId) {
      throw new Error(
        "User ID is required for personal notification settings"
      );
    }

    const current =
      await this.getSettings(
        userId
      );

    const merged =
      this.mergeSettings(
        current,
        input
      );

    merged.updatedAt =
      new Date().toISOString();

    try {
      await this.env.DB.prepare(
        `
        UPDATE users_profiles
        SET
          notification_settings = ?,
          updated_at = ?
        WHERE id = ?
        `
      )
        .bind(
          safeJson(
            merged
          ),
          merged.updatedAt,
          userId
        )
        .run();
    } catch {
      /*
       * Совместимость со старой схемой:
       * настройки могут быть вынесены в отдельную
       * таблицу в следующей миграции.
       */
    }

    return merged;
  }

  // ==========================================================
  // EVENT ENABLE CHECK
  // ==========================================================

  async isEventEnabled(
    userId: string | null,
    category: NotificationCategory,
    event: NotificationEvent,
    force = false
  ): Promise<boolean> {
    if (
      force
    ) {
      return true;
    }

    const settings =
      await this.getSettings(
        userId
      );

    if (
      !settings.enabled
    ) {
      return (
        settings.forced.events.includes(
          event
        )
      );
    }

    const categorySettings =
      settings.categories[
        category
      ];

    if (
      !categorySettings ||
      !categorySettings.enabled
    ) {
      return (
        settings.forced.events.includes(
          event
        )
      );
    }

    const eventSettings =
      settings.events[
        event
      ];

    if (
      eventSettings &&
      eventSettings.enabled ===
        false
    ) {
      return (
        settings.forced.events.includes(
          event
        )
      );
    }

    return true;
  }

  // ==========================================================
  // CHANNEL CHECK
  // ==========================================================

  async isChannelEnabled(
    userId: string | null,
    category: NotificationCategory,
    event: NotificationEvent,
    channel: NotificationChannel
  ): Promise<boolean> {
    const settings =
      await this.getSettings(
        userId
      );

    if (
      settings.forced.events.includes(
        event
      )
    ) {
      return true;
    }

    if (
      !settings.enabled
    ) {
      return false;
    }

    const categorySettings =
      settings.categories[
        category
      ];

    if (
      !categorySettings ||
      !categorySettings.enabled
    ) {
      return false;
    }

    const eventSettings =
      settings.events[
        event
      ];

    if (
      eventSettings?.channels &&
      eventSettings.channels[
        channel
      ] !== undefined
    ) {
      return Boolean(
        eventSettings.channels[
          channel
        ]
      );
    }

    return Boolean(
      categorySettings.channels[
        channel
      ]
    );
  }

  // ==========================================================
  // APPLY SYSTEM SETTING
  // ==========================================================

  private applySetting(
    settings: NotificationSettings,
    key: string,
    rawValue: string
  ): void {
    const value =
      this.parseValue(
        rawValue
      );

    if (
      key ===
      "notifications.enabled"
    ) {
      settings.enabled =
        Boolean(value);
      return;
    }

    if (
      key ===
      "notifications.quiet_hours.enabled"
    ) {
      settings.quietHours.enabled =
        Boolean(value);
      return;
    }

    if (
      key ===
      "notifications.quiet_hours.start"
    ) {
      settings.quietHours.start =
        String(value);
      return;
    }

    if (
      key ===
      "notifications.quiet_hours.end"
    ) {
      settings.quietHours.end =
        String(value);
      return;
    }

    const categoryMatch =
      key.match(
        /^notifications\.categories\.([^.]+)\.enabled$/
      );

    if (
      categoryMatch &&
      isCategory(
        categoryMatch[1]
      )
    ) {
      settings.categories[
        categoryMatch[1]
      ].enabled =
        Boolean(value);
      return;
    }

    const channelMatch =
      key.match(
        /^notifications\.categories\.([^.]+)\.channels\.([^.]+)$/
      );

    if (
      channelMatch &&
      isCategory(
        channelMatch[1]
      ) &&
      isChannel(
        channelMatch[2]
      )
    ) {
      settings.categories[
        channelMatch[1]
      ].channels[
        channelMatch[2]
      ] = Boolean(value);
    }
  }

  private parseValue(
    value: unknown
  ): unknown {
    if (
      typeof value !== "string"
    ) {
      return value;
    }

    if (
      value === "true"
    ) {
      return true;
    }

    if (
      value === "false"
    ) {
      return false;
    }

    try {
      return JSON.parse(
        value
      );
    } catch {
      return value;
    }
  }

  private mergeSettingsJson(
    settings: NotificationSettings,
    raw: string
  ): void {
    try {
      const parsed =
        JSON.parse(raw);

      if (
        !parsed ||
        typeof parsed !== "object"
      ) {
        return;
      }

      const result =
        this.mergeSettings(
          settings,
          parsed
        );

      Object.assign(
        settings,
        result
      );
    } catch {
      // ignore malformed settings
    }
  }

  private mergeSettings(
    base: NotificationSettings,
    input: Partial<NotificationSettings>
  ): NotificationSettings {
    const result =
      structuredClone(
        base
      ) as NotificationSettings;

    if (
      typeof input.enabled ===
      "boolean"
    ) {
      result.enabled =
        input.enabled;
    }

    if (
      input.quietHours
    ) {
      result.quietHours = {
        ...result.quietHours,
        ...input.quietHours,
      };
    }

    if (
      input.forced
    ) {
      result.forced = {
        ...result.forced,
        ...input.forced,
      };
    }

    if (
      input.categories
    ) {
      for (
        const category of
          NOTIFICATION_CATEGORIES
      ) {
        const incoming =
          input.categories[
            category
          ];

        if (!incoming) {
          continue;
        }

        result.categories[
          category
        ] = {
          ...result.categories[
            category
          ],
          ...incoming,

          channels: {
            ...result.categories[
              category
            ].channels,
            ...incoming.channels,
          },
        };
      }
    }

    if (
      input.events
    ) {
      for (
        const event of
          Object.keys(
            input.events
          )
      ) {
        if (
          !isEvent(event)
        ) {
          continue;
        }

        const incoming =
          input.events[
            event
          ];

        if (!incoming) {
          continue;
        }

        result.events[
          event
        ] = {
          ...result.events[
            event
          ],
          ...incoming,

          channels: {
            ...result.events[
              event
            ]?.channels,
            ...incoming.channels,
          },
        };
      }
    }

    return result;
  }

  // ==========================================================
  // MAP DB ROW
  // ==========================================================

  private mapRow(
    row: Record<string, unknown>
  ): Notification {
    const category =
      isCategory(
        row.category
      )
        ? row.category
        : "system";

    const event =
      isEvent(
        row.event
      )
        ? row.event
        : "system_message";

    const priority =
      isPriority(
        row.priority
      )
        ? row.priority
        : "normal";

    const status =
      row.status === "read" ||
      row.status === "deleted"
        ? row.status
        : "unread";

    return {
      id:
        String(
          row.id ?? ""
        ),

      userId:
        normalizeString(
          row.user_id
        ),

      category,
      event,

      title:
        String(
          row.title ?? ""
        ),

      message:
        String(
          row.message ?? ""
        ),

      status,

      priority,

      entityType:
        normalizeString(
          row.entity_type
        ),

      entityId:
        normalizeString(
          row.entity_id
        ),

      actionUrl:
        normalizeString(
          row.action_url
        ),

      icon:
        normalizeString(
          row.icon
        ),

      imageUrl:
        normalizeString(
          row.image_url
        ),

      metadata:
        parseJsonObject(
          row.metadata
        ),

      readAt:
        normalizeString(
          row.read_at
        ),

      deletedAt:
        normalizeString(
          row.deleted_at
        ),

      createdAt:
        String(
          row.created_at ?? ""
        ),

      updatedAt:
        String(
          row.updated_at ?? ""
        ),
    };
  }
}

// ============================================================
// FACTORY
// ============================================================

export function createNotificationService(
  env: Env
): NotificationService {
  return new NotificationService(
    env
  );
}

// ============================================================
// SHORT API
// ============================================================

export async function createNotification(
  env: Env,
  input: NotificationCreateInput
): Promise<Notification | null> {
  return createNotificationService(
    env
  ).create(input);
}

export async function notifyParticipant(
  env: Env,
  userId: string,
  category: NotificationCategory,
  event: NotificationEvent,
  title: string,
  message: string,
  options: Partial<
    Omit<
      NotificationCreateInput,
      "userId" |
      "category" |
      "event" |
      "title" |
      "message"
    >
  > = {}
): Promise<Notification | null> {
  return createNotificationService(
    env
  ).create({
    userId,
    category,
    event,
    title,
    message,
    ...options,
  });
}

export async function notifyAdmin(
  env: Env,
  category: NotificationCategory,
  event: NotificationEvent,
  title: string,
  message: string,
  options: Partial<
    Omit<
      NotificationCreateInput,
      "category" |
      "event" |
      "title" |
      "message"
    >
  > = {}
): Promise<Notification | null> {
  /*
   * Для admin-центра user_id = NULL означает
   * системный/admin поток уведомлений.
   */
  return createNotificationService(
    env
  ).create({
    userId: null,
    category,
    event,
    title,
    message,
    ...options,
  });
      }
