/* ============================================================
   TAJIK OPPORTUNITIES
   CLOUDFLARE WORKER
   Version: 2026.09.07

   USER MODEL:
   - No registration
   - No login
   - No password
   - No profile
   - User only provides a name

   ADMIN:
   - Full moderation
   - Publications
   - Users/submitters
   - Admin chat
   - Notifications
   - Statistics
   - Audit log
============================================================ */

const VERSION = "2026.09.07";

const SITE_NAME = "Tajik Opportunities";
const COOKIE_NAME = "to_admin";

const ALLOWED_METHODS = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS"
];

const PUBLICATION_STATUSES = [
  "pending",
  "published",
  "rejected",
  "draft",
  "archived"
];

/* ============================================================
   MAIN
============================================================ */

export default {
  async fetch(request, env, ctx) {
    try {
      return await handleRequest(request, env, ctx);
    } catch (error) {
      console.error("WORKER ERROR:", error);

      return json(
        {
          ok: false,
          error: "SERVER_ERROR",
          message: error?.message || "Внутренняя ошибка сервера",
          version: VERSION
        },
        500
      );
    }
  }
};

/* ============================================================
   REQUEST
============================================================ */

async function handleRequest(request, env, ctx) {
  const url = new URL(request.url);
  const method = request.method.toUpperCase();

  if (!ALLOWED_METHODS.includes(method)) {
    return json(
      {
        ok: false,
        error: "METHOD_NOT_ALLOWED"
      },
      405
    );
  }

  if (method === "OPTIONS") {
    return corsResponse(request);
  }

  if (
    url.pathname === "/health" ||
    url.pathname === "/api/health"
  ) {
    return json({
      ok: true,
      service: SITE_NAME,
      version: VERSION,
      environment: env.ENVIRONMENT || "production",
      time: new Date().toISOString()
    });
  }

  if (url.pathname.startsWith("/api")) {
    return withSecurity(
      await handleApi(request, env, ctx)
    );
  }

  /*
   * Static assets
   */
  if (env.ASSETS) {
    const assetResponse = await env.ASSETS.fetch(request);

    if (assetResponse.status !== 404) {
      return withSecurity(assetResponse);
    }

    /*
     * SPA / HTML fallback
     */
    const accept = request.headers.get("Accept") || "";

    if (accept.includes("text/html")) {
      const fallbackRequest = new Request(
        new URL("/index.html", request.url),
        request
      );

      const fallback = await env.ASSETS.fetch(fallbackRequest);

      if (fallback.status !== 404) {
        return withSecurity(fallback);
      }
    }
  }

  return json(
    {
      ok: false,
      error: "NOT_FOUND"
    },
    404
  );
}

/* ============================================================
   API ROUTER
============================================================ */

async function handleApi(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === "/api" || path === "/api/") {
    return json({
      ok: true,
      service: SITE_NAME,
      version: VERSION,
      api: "v1",
      user_mode: "name_only",
      authentication: false,
      admin: true
    });
  }

  /* ----------------------------------------------------------
     Removed authentication/profile routes
  ---------------------------------------------------------- */

  if (
    path.startsWith("/api/auth") ||
    path === "/api/profile" ||
    path === "/api/profile/public" ||
    path === "/api/username/check"
  ) {
    return json(
      {
        ok: false,
        error: "AUTH_DISABLED",
        message:
          "Регистрация, вход, пароль и пользовательские профили отключены."
      },
      410
    );
  }

  /* ----------------------------------------------------------
     PUBLICATIONS
  ---------------------------------------------------------- */

  if (path === "/api/publications") {
    return handlePublications(request, env);
  }

  if (path.startsWith("/api/publications/")) {
    return handlePublicationById(request, env);
  }

  /* ----------------------------------------------------------
     ADMIN
  ---------------------------------------------------------- */

  if (path === "/api/admin" || path === "/api/admin/") {
    return handleAdminRoot(request, env);
  }

  if (path.startsWith("/api/admin/")) {
    return handleAdminApi(request, env, ctx);
  }

  /* ----------------------------------------------------------
     ADMIN CHAT
  ---------------------------------------------------------- */

  if (path === "/api/admin-chat") {
    return handleAdminChat(request, env);
  }

  if (path.startsWith("/api/admin-chat/")) {
    return handleAdminChatById(request, env);
  }

  /* ----------------------------------------------------------
     NOTIFICATIONS
  ---------------------------------------------------------- */

  if (path === "/api/notifications") {
    return handleNotifications(request, env);
  }

  /* ----------------------------------------------------------
     OLD / LEGACY FEATURES
  ---------------------------------------------------------- */

  if (path === "/api/opportunities") {
    return handleOpportunities(request, env);
  }

  if (path === "/api/messages") {
    return handleMessages(request, env);
  }

  return json(
    {
      ok: false,
      error: "API_ROUTE_NOT_FOUND",
      path
    },
    404
  );
}

/* ============================================================
   PUBLICATIONS
============================================================ */

async function handlePublications(request, env) {
  if (!env.DB) {
    return json(
      {
        ok: false,
        error: "D1_NOT_CONFIGURED"
      },
      500
    );
  }

  if (request.method === "GET") {
    return listPublications(request, env);
  }

  if (request.method === "POST") {
    return createPublication(request, env);
  }

  return json(
    {
      ok: false,
      error: "METHOD_NOT_ALLOWED"
    },
    405
  );
}

/* ============================================================
   LIST PUBLICATIONS
============================================================ */

async function listPublications(request, env) {
  const url = new URL(request.url);

  const category = clean(url.searchParams.get("category"));
  const city = clean(url.searchParams.get("city"));
  const status =
    clean(url.searchParams.get("status")) || "published";

  const search =
    clean(url.searchParams.get("search")) ||
    clean(url.searchParams.get("q"));

  const author =
    clean(url.searchParams.get("author")) ||
    clean(url.searchParams.get("name"));

  const limit = clampNumber(
    url.searchParams.get("limit"),
    1,
    100,
    30
  );

  const offset = clampNumber(
    url.searchParams.get("offset"),
    0,
    100000,
    0
  );

  const schema = await getTableSchema(
    env.DB,
    "publications"
  );

  if (!schema.length) {
    return json(
      {
        ok: false,
        error: "PUBLICATIONS_TABLE_NOT_FOUND"
      },
      500
    );
  }

  const columns = new Set(
    schema.map(x => x.name)
  );

  const where = [];
  const params = [];

  if (columns.has("status") && status !== "all") {
    where.push("status = ?");
    params.push(status);
  }

  if (category && columns.has("category")) {
    where.push("category = ?");
    params.push(category);
  }

  if (city && columns.has("city")) {
    where.push("city = ?");
    params.push(city);
  }

  if (author) {
    const authorConditions = [];

    if (columns.has("contact_name")) {
      authorConditions.push("contact_name = ?");
      params.push(author);
    }

    if (columns.has("author_name")) {
      authorConditions.push("author_name = ?");
      params.push(author);
    }

    if (authorConditions.length) {
      where.push(
        `(${authorConditions.join(" OR ")})`
      );
    }
  }

  if (search) {
    const searchConditions = [];

    if (columns.has("title")) {
      searchConditions.push("title LIKE ?");
      params.push(`%${search}%`);
    }

    if (columns.has("text")) {
      searchConditions.push("text LIKE ?");
      params.push(`%${search}%`);
    }

    if (columns.has("category")) {
      searchConditions.push("category LIKE ?");
      params.push(`%${search}%`);
    }

    if (columns.has("city")) {
      searchConditions.push("city LIKE ?");
      params.push(`%${search}%`);
    }

    if (columns.has("contact_name")) {
      searchConditions.push("contact_name LIKE ?");
      params.push(`%${search}%`);
    }

    if (searchConditions.length) {
      where.push(
        `(${searchConditions.join(" OR ")})`
      );
    }
  }

  const sql = `
    SELECT *
    FROM publications
    ${
      where.length
        ? `WHERE ${where.join(" AND ")}`
        : ""
    }
    ORDER BY
      ${
        columns.has("pinned")
          ? "pinned DESC,"
          : ""
      }
      ${
        columns.has("featured")
          ? "featured DESC,"
          : ""
      }
      ${
        columns.has("created_at")
          ? "created_at DESC"
          : "rowid DESC"
      }
    LIMIT ? OFFSET ?
  `;

  params.push(limit, offset);

  const result = await env.DB
    .prepare(sql)
    .bind(...params)
    .all();

  const rows = result.results || [];

  return json({
    ok: true,
    items: rows.map(normalizePublication),
    publications: rows.map(normalizePublication),
    count: rows.length,
    limit,
    offset
  });
}

/* ============================================================
   CREATE PUBLICATION
============================================================ */

async function createPublication(request, env) {
  let body;

  try {
    body = await request.json();
  } catch {
    return json(
      {
        ok: false,
        error: "INVALID_JSON"
      },
      400
    );
  }

  const title = clean(
    body.title ||
    body.name ||
    body.heading
  );

  const text = clean(
    body.text ||
    body.content ||
    body.description
  );

  const category = clean(
    body.category
  );

  /*
   * Только имя.
   * Никаких user_id/password/profile.
   */
  const contactName = clean(
    body.contact_name ||
    body.author_name ||
    body.name ||
    "Аноним"
  );

  if (!title) {
    return json(
      {
        ok: false,
        error: "TITLE_REQUIRED",
        message: "Укажите название публикации."
      },
      400
    );
  }

  if (!text) {
    return json(
      {
        ok: false,
        error: "CONTENT_REQUIRED",
        message: "Добавьте описание."
      },
      400
    );
  }

  if (!category) {
    return json(
      {
        ok: false,
        error: "CATEGORY_REQUIRED",
        message: "Выберите категорию."
      },
      400
    );
  }

  const now = new Date().toISOString();

  const id = crypto.randomUUID();

  const trackingCode =
    generateTrackingCode();

  const media =
    Array.isArray(body.media)
      ? body.media
      : [];

  const hashtags =
    body.tags ||
    body.hashtags ||
    "";

  const values = {
    id,
    title,
    text,
    category,
    subcategory: clean(body.subcategory),

    country: clean(body.country),
    city: clean(body.city),
    location: clean(body.location),
    scope: clean(body.scope),

    event_start: clean(body.event_start),
    event_end: clean(body.event_end),
    deadline: clean(body.deadline),

    price: numberOrZero(body.price),
    currency: clean(body.currency),

    employment_type:
      clean(body.employment_type),

    work_format:
      clean(body.work_format),

    experience:
      clean(body.experience),

    education:
      clean(body.education),

    languages:
      stringifyMaybe(body.languages),

    hashtags:
      stringifyMaybe(hashtags),

    contact_name: contactName,

    contact_phone:
      clean(body.contact_phone),

    contact_email:
      clean(body.contact_email),

    contact_telegram:
      clean(body.contact_telegram),

    external_url:
      clean(body.external_url),

    author_name:
      contactName,

    language:
      clean(body.language) || "ru",

    translate_all:
      body.translate_all ? 1 : 0,

    media:
      media.length
        ? JSON.stringify(media)
        : null,

    status: "pending",

    views: 0,
    likes: 0,
    comments: 0,
    saves: 0,
    shares: 0,
    love: 0,
    support: 0,
    funny: 0,
    wow: 0,
    sad: 0,
    angry: 0,

    price_value:
      numberOrZero(body.price),

    pinned: 0,
    featured: 0,

    created_at: now,
    updated_at: now,
    published_at: null,

    tracking_code: trackingCode
  };

  /*
   * publication user_id intentionally not required.
   */
  const inserted =
    await dynamicInsert(
      env.DB,
      "publications",
      values
    );

  if (!inserted.ok) {
    return json(
      {
        ok: false,
        error: "PUBLICATION_CREATE_FAILED",
        message: inserted.message
      },
      500
    );
  }

  /*
   * Save media into publication_media too.
   */
  if (media.length) {
    await savePublicationMedia(
      env.DB,
      id,
      media,
      now
    );
  }

  return json(
    {
      ok: true,
      success: true,

      id,

      publication_id: id,

      tracking_code: trackingCode,

      code: trackingCode,

      status: "pending",

      message:
        "Публикация отправлена на проверку администратора."
    },
    201
  );
}

/* ============================================================
   PUBLICATION BY ID
============================================================ */

async function handlePublicationById(
  request,
  env
) {
  const url = new URL(request.url);

  const parts =
    url.pathname
      .split("/")
      .filter(Boolean);

  const id = parts[2];

  if (!id) {
    return json(
      {
        ok: false,
        error: "PUBLICATION_ID_REQUIRED"
      },
      400
    );
  }

  if (request.method === "GET") {
    const publication =
      await getPublicationById(
        env.DB,
        id
      );

    if (!publication) {
      return json(
        {
          ok: false,
          error: "PUBLICATION_NOT_FOUND"
        },
        404
      );
    }

    /*
     * Increment views.
     */
    try {
      await incrementPublicationViews(
        env.DB,
        id
      );
    } catch {}

    return json({
      ok: true,
      publication: normalizePublication(
        publication
      )
    });
  }

  return json(
    {
      ok: false,
      error: "METHOD_NOT_ALLOWED"
    },
    405
  );
}

/* ============================================================
   ADMIN ROOT
============================================================ */

async function handleAdminRoot(
  request,
  env
) {
  const admin =
    await requireAdmin(
      request,
      env
    );

  if (!admin.ok) {
    return admin.response;
  }

  return json({
    ok: true,
    admin: {
      id: admin.admin.id,
      name: admin.admin.name,
      role: admin.admin.role,
      permissions:
        admin.admin.permissions
    },

    rights: [
      "dashboard",
      "publications",
      "publication_approve",
      "publication_reject",
      "publication_delete",
      "publication_edit",
      "publication_pin",
      "publication_feature",
      "users",
      "user_block",
      "user_delete",
      "admin_chat",
      "notifications",
      "audit",
      "statistics"
    ]
  });
}

/* ============================================================
   ADMIN ROUTER
============================================================ */

async function handleAdminApi(
  request,
  env,
  ctx
) {
  const url = new URL(request.url);
  const path = url.pathname;

  const admin =
    await requireAdmin(
      request,
      env
    );

  if (!admin.ok) {
    return admin.response;
  }

  /*
   * /api/admin/me
   */
  if (path === "/api/admin/me") {
    return json({
      ok: true,
      admin: sanitizeAdmin(
        admin.admin
      )
    });
  }

  /*
   * DASHBOARD
   */
  if (
    path === "/api/admin/dashboard" ||
    path === "/api/admin/stats"
  ) {
    return requirePermission(
      admin,
      "dashboard",
      () =>
        getAdminDashboard(
          request,
          env
        )
    );
  }

  /*
   * USERS
   */
  if (
    path === "/api/admin/users" ||
    path.startsWith("/api/admin/users/")
  ) {
    return requirePermission(
      admin,
      "users",
      () =>
        handleAdminUsers(
          request,
          env,
          admin
        )
    );
  }

  /*
   * PUBLICATIONS
   */
  if (
    path === "/api/admin/publications" ||
    path.startsWith("/api/admin/publications/")
  ) {
    return requirePermission(
      admin,
      "publications",
      () =>
        handleAdminPublications(
          request,
          env,
          admin
        )
    );
  }

  /*
   * CHAT
   */
  if (
    path === "/api/admin/chat" ||
    path.startsWith("/api/admin/chat/")
  ) {
    return requirePermission(
      admin,
      "admin_chat",
      () =>
        handleAdminChatApi(
          request,
          env,
          admin
        )
    );
  }

  /*
   * NOTIFICATIONS
   */
  if (
    path === "/api/admin/notifications"
  ) {
    return requirePermission(
      admin,
      "notifications",
      () =>
        handleAdminNotifications(
          request,
          env,
          admin
        )
    );
  }

  /*
   * AUDIT
   */
  if (
    path === "/api/admin/audit"
  ) {
    return requirePermission(
      admin,
      "audit",
      () =>
        handleAdminAudit(
          request,
          env
        )
    );
  }

  return json(
    {
      ok: false,
      error: "ADMIN_ROUTE_NOT_FOUND"
    },
    404
  );
}

/* ============================================================
   ADMIN DASHBOARD
============================================================ */

async function getAdminDashboard(
  request,
  env
) {
  const db = env.DB;

  const statistics = {
    publications: 0,
    pending: 0,
    published: 0,
    rejected: 0,
    users: 0,
    messages: 0,
    notifications: 0
  };

  if (db) {
    statistics.publications =
      await countTable(
        db,
        "publications"
      );

    statistics.pending =
      await countWhere(
        db,
        "publications",
        "status = ?",
        ["pending"]
      );

    statistics.published =
      await countWhere(
        db,
        "publications",
        "status = ?",
        ["published"]
      );

    statistics.rejected =
      await countWhere(
        db,
        "publications",
        "status = ?",
        ["rejected"]
      );

    statistics.users =
      await countTable(
        db,
        "users"
      );

    statistics.notifications =
      await countTable(
        db,
        "notifications"
      );
  }

  /*
   * KV chat statistics
   */
  const conversations =
    await getAdminConversations(
      env
    );

  statistics.messages =
    conversations.reduce(
      (total, item) =>
        total +
        (
          Array.isArray(item.messages)
            ? item.messages.length
            : 0
        ),
      0
    );

  return json({
    ok: true,
    statistics,

    generated_at:
      new Date().toISOString(),

    service: SITE_NAME
  });
}

/* ============================================================
   ADMIN PUBLICATIONS
============================================================ */

async function handleAdminPublications(
  request,
  env,
  admin
) {
  const url = new URL(request.url);

  const parts =
    url.pathname
      .split("/")
      .filter(Boolean);

  /*
   * /api/admin/publications
   */
  if (
    parts.length === 3
  ) {
    if (request.method === "GET") {
      return listAdminPublications(
        request,
        env
      );
    }

    return json(
      {
        ok: false,
        error: "METHOD_NOT_ALLOWED"
      },
      405
    );
  }

  const id = parts[3];

  if (!id) {
    return json(
      {
        ok: false,
        error: "PUBLICATION_ID_REQUIRED"
      },
      400
    );
  }

  /*
   * ACTION
   */
  const action = parts[4];

  if (action) {
    if (
      action === "approve"
    ) {
      return moderatePublication(
        request,
        env,
        admin,
        id,
        "published"
      );
    }

    if (
      action === "reject"
    ) {
      return moderatePublication(
        request,
        env,
        admin,
        id,
        "rejected"
      );
    }

    if (
      action === "pin"
    ) {
      return togglePublicationFlag(
        request,
        env,
        admin,
        id,
        "pinned"
      );
    }

    if (
      action === "feature"
    ) {
      return togglePublicationFlag(
        request,
        env,
        admin,
        id,
        "featured"
      );
    }

    return json(
      {
        ok: false,
        error: "UNKNOWN_PUBLICATION_ACTION"
      },
      404
    );
  }

  /*
   * /api/admin/publications/:id
   */
  if (request.method === "GET") {
    const publication =
      await getPublicationById(
        env.DB,
        id
      );

    if (!publication) {
      return json(
        {
          ok: false,
          error: "PUBLICATION_NOT_FOUND"
        },
        404
      );
    }

    return json({
      ok: true,
      publication:
        normalizePublication(
          publication
        )
    });
  }

  if (
    request.method === "PATCH" ||
    request.method === "PUT"
  ) {
    return updateAdminPublication(
      request,
      env,
      admin,
      id
    );
  }

  if (request.method === "DELETE") {
    return deleteAdminPublication(
      request,
      env,
      admin,
      id
    );
  }

  return json(
    {
      ok: false,
      error: "METHOD_NOT_ALLOWED"
    },
    405
  );
}

/* ============================================================
   ADMIN PUBLICATION LIST
============================================================ */

async function listAdminPublications(
  request,
  env
) {
  const url = new URL(request.url);

  const status =
    clean(url.searchParams.get("status")) ||
    "all";

  const search =
    clean(url.searchParams.get("search")) ||
    clean(url.searchParams.get("q"));

  const limit =
    clampNumber(
      url.searchParams.get("limit"),
      1,
      200,
      100
    );

  const offset =
    clampNumber(
      url.searchParams.get("offset"),
      0,
      100000,
      0
    );

  const schema =
    await getTableSchema(
      env.DB,
      "publications"
    );

  const columns =
    new Set(
      schema.map(
        x => x.name
      )
    );

  const where = [];
  const params = [];

  if (
    status !== "all" &&
    columns.has("status")
  ) {
    where.push(
      "status = ?"
    );
    params.push(status);
  }

  if (search) {
    const conditions = [];

    for (
      const field of [
        "title",
        "text",
        "category",
        "city",
        "contact_name",
        "tracking_code"
      ]
    ) {
      if (columns.has(field)) {
        conditions.push(
          `${field} LIKE ?`
        );

        params.push(
          `%${search}%`
        );
      }
    }

    if (conditions.length) {
      where.push(
        `(${conditions.join(
          " OR "
        )})`
      );
    }
  }

  params.push(
    limit,
    offset
  );

  const result =
    await env.DB
      .prepare(`
        SELECT *
        FROM publications
        ${
          where.length
            ? `WHERE ${where.join(
                " AND "
              )}`
            : ""
        }
        ORDER BY
          ${
            columns.has("created_at")
              ? "created_at DESC"
              : "rowid DESC"
          }
        LIMIT ? OFFSET ?
      `)
      .bind(...params)
      .all();

  const items =
    (result.results || [])
      .map(normalizePublication);

  return json({
    ok: true,
    items,
    publications: items,
    count: items.length,
    limit,
    offset
  });
}

/* ============================================================
   MODERATION
============================================================ */

async function moderatePublication(
  request,
  env,
  admin,
  id,
  status
) {
  let body = {};

  if (
    request.method === "POST" ||
    request.method === "PATCH"
  ) {
    try {
      body = await request.json();
    } catch {}
  }

  const now =
    new Date().toISOString();

  const values = {
    status,
    updated_at: now
  };

  if (
    status === "published"
  ) {
    values.published_at = now;
    values.rejection_reason = null;
  }

  if (
    status === "rejected"
  ) {
    values.rejection_reason =
      clean(
        body.reason ||
        body.rejection_reason
      ) ||
      "Отклонено администратором";
  }

  const updated =
    await updateById(
      env.DB,
      "publications",
      id,
      values
    );

  if (!updated) {
    return json(
      {
        ok: false,
        error: "PUBLICATION_NOT_FOUND"
      },
      404
    );
  }

  await writeAuditLog(
    env.DB,
    admin,
    `publication_${status}`,
    "publication",
    id,
    {
      status,
      reason:
        values.rejection_reason ||
        null
    }
  );

  return json({
    ok: true,
    id,
    status,
    message:
      status === "published"
        ? "Публикация одобрена."
        : "Публикация отклонена."
  });
}

/* ============================================================
   PIN / FEATURE
============================================================ */

async function togglePublicationFlag(
  request,
  env,
  admin,
  id,
  field
) {
  const publication =
    await getPublicationById(
      env.DB,
      id
    );

  if (!publication) {
    return json(
      {
        ok: false,
        error: "PUBLICATION_NOT_FOUND"
      },
      404
    );
  }

  let body = {};

  try {
    body =
      await request.json();
  } catch {}

  const current =
    Number(
      publication[field] || 0
    );

  const next =
    typeof body.enabled === "boolean"
      ? body.enabled
        ? 1
        : 0
      : current
        ? 0
        : 1;

  await updateById(
    env.DB,
    "publications",
    id,
    {
      [field]: next,
      updated_at:
        new Date().toISOString()
    }
  );

  await writeAuditLog(
    env.DB,
    admin,
    field,
    "publication",
    id,
    {
      enabled: Boolean(next)
    }
  );

  return json({
    ok: true,
    id,
    [field]: Boolean(next)
  });
}

/* ============================================================
   UPDATE PUBLICATION
============================================================ */

async function updateAdminPublication(
  request,
  env,
  admin,
  id
) {
  let body;

  try {
    body =
      await request.json();
  } catch {
    return json(
      {
        ok: false,
        error: "INVALID_JSON"
      },
      400
    );
  }

  const allowed = [
    "title",
    "text",
    "category",
    "subcategory",
    "country",
    "city",
    "location",
    "scope",
    "event_start",
    "event_end",
    "deadline",
    "price",
    "currency",
    "employment_type",
    "experience",
    "education",
    "languages",
    "hashtags",
    "contact_name",
    "contact_phone",
    "contact_email",
    "contact_telegram",
    "external_url",
    "language",
    "translate_all",
    "status",
    "rejection_reason",
    "pinned",
    "featured"
  ];

  const values = {};

  for (const key of allowed) {
    if (
      Object.prototype.hasOwnProperty.call(
        body,
        key
      )
    ) {
      values[key] =
        key === "translate_all" ||
        key === "pinned" ||
        key === "featured"
          ? body[key]
            ? 1
            : 0
          : body[key];
    }
  }

  values.updated_at =
    new Date().toISOString();

  const updated =
    await updateById(
      env.DB,
      "publications",
      id,
      values
    );

  if (!updated) {
    return json(
      {
        ok: false,
        error: "PUBLICATION_NOT_FOUND"
      },
      404
    );
  }

  await writeAuditLog(
    env.DB,
    admin,
    "publication_update",
    "publication",
    id,
    {
      fields:
        Object.keys(values)
    }
  );

  return json({
    ok: true,
    publication:
      normalizePublication(
        await getPublicationById(
          env.DB,
          id
        )
      )
  });
}

/* ============================================================
   DELETE PUBLICATION
============================================================ */

async function deleteAdminPublication(
  request,
  env,
  admin,
  id
) {
  const schema =
    await getTableSchema(
      env.DB,
      "publications"
    );

  if (!schema.length) {
    return json(
      {
        ok: false,
        error: "TABLE_NOT_FOUND"
      },
      500
    );
  }

  /*
   * Delete media first.
   */
  try {
    const mediaSchema =
      await getTableSchema(
        env.DB,
        "publication_media"
      );

    if (
      mediaSchema.some(
        x =>
          x.name ===
          "publication_id"
      )
    ) {
      await env.DB
        .prepare(`
          DELETE FROM publication_media
          WHERE publication_id = ?
        `)
        .bind(id)
        .run();
    }
  } catch {}

  const result =
    await env.DB
      .prepare(`
        DELETE FROM publications
        WHERE id = ?
      `)
      .bind(id)
      .run();

  if (
    !result.meta ||
    Number(result.meta.changes || 0) === 0
  ) {
    return json(
      {
        ok: false,
        error: "PUBLICATION_NOT_FOUND"
      },
      404
    );
  }

  await writeAuditLog(
    env.DB,
    admin,
    "publication_delete",
    "publication",
    id,
    {}
  );

  return json({
    ok: true,
    deleted: true,
    id
  });
}

/* ============================================================
   ADMIN USERS
============================================================ */

async function handleAdminUsers(
  request,
  env,
  admin
) {
  const url =
    new URL(request.url);

  const parts =
    url.pathname
      .split("/")
      .filter(Boolean);

  /*
   * /api/admin/users
   */
  if (parts.length === 3) {
    if (
      request.method === "GET"
    ) {
      return listAdminUsers(
        request,
        env
      );
    }

    return json(
      {
        ok: false,
        error: "METHOD_NOT_ALLOWED"
      },
      405
    );
  }

  const id = parts[3];

  if (!id) {
    return json(
      {
        ok: false,
        error: "USER_ID_REQUIRED"
      },
      400
    );
  }

  const action = parts[4];

  if (action === "ban") {
    return changeUserStatus(
      request,
      env,
      admin,
      id,
      false
    );
  }

  if (action === "unban") {
    return changeUserStatus(
      request,
      env,
      admin,
      id,
      true
    );
  }

  if (action === "delete") {
    return deleteAdminUser(
      request,
      env,
      admin,
      id
    );
  }

  if (
    request.method === "GET"
  ) {
    const user =
      await findUserById(
        env.DB,
        id
      );

    if (!user) {
      return json(
        {
          ok: false,
          error: "USER_NOT_FOUND"
        },
        404
      );
    }

    return json({
      ok: true,
      user:
        sanitizeUser(user)
    });
  }

  if (
    request.method === "PATCH" ||
    request.method === "PUT"
  ) {
    return updateAdminUser(
      request,
      env,
      admin,
      id
    );
  }

  if (
    request.method === "DELETE"
  ) {
    return deleteAdminUser(
      request,
      env,
      admin,
      id
    );
  }

  return json(
    {
      ok: false,
      error: "METHOD_NOT_ALLOWED"
    },
    405
  );
}

/* ============================================================
   LIST USERS
============================================================ */

async function listAdminUsers(
  request,
  env
) {
  const url =
    new URL(request.url);

  const search =
    clean(
      url.searchParams.get(
        "search"
      )
    );

  const limit =
    clampNumber(
      url.searchParams.get(
        "limit"
      ),
      1,
      200,
      100
    );

  const offset =
    clampNumber(
      url.searchParams.get(
        "offset"
      ),
      0,
      100000,
      0
    );

  const schema =
    await getTableSchema(
      env.DB,
      "users"
    );

  if (!schema.length) {
    return json({
      ok: true,
      users: [],
      count: 0,
      message:
        "Таблица пользователей пока не содержит пользователей."
    });
  }

  const columns =
    new Set(
      schema.map(
        x => x.name
      )
    );

  const where = [];
  const params = [];

  if (search) {
    const conditions = [];

    for (
      const field of [
        "id",
        "name",
        "username",
        "email",
        "city",
        "country"
      ]
    ) {
      if (columns.has(field)) {
        conditions.push(
          `${field} LIKE ?`
        );

        params.push(
          `%${search}%`
        );
      }
    }

    if (conditions.length) {
      where.push(
        `(${conditions.join(
          " OR "
        )})`
      );
    }
  }

  params.push(
    limit,
    offset
  );

  const result =
    await env.DB
      .prepare(`
        SELECT *
        FROM users
        ${
          where.length
            ? `WHERE ${where.join(
                " AND "
              )}`
            : ""
        }
        ORDER BY
          ${
            columns.has(
              "created_at"
            )
              ? "created_at DESC"
              : "rowid DESC"
          }
        LIMIT ? OFFSET ?
      `)
      .bind(...params)
      .all();

  const users =
    (result.results || [])
      .map(sanitizeUser);

  return json({
    ok: true,
    users,
    items: users,
    count: users.length,
    limit,
    offset
  });
}

/* ============================================================
   UPDATE USER
============================================================ */

async function updateAdminUser(
  request,
  env,
  admin,
  id
) {
  let body;

  try {
    body =
      await request.json();
  } catch {
    return json(
      {
        ok: false,
        error: "INVALID_JSON"
      },
      400
    );
  }

  const allowed = [
    "name",
    "status",
    "is_active",
    "is_verified",
    "is_admin",
    "is_super_admin",
    "role",
    "country",
    "city"
  ];

  const values = {};

  for (const key of allowed) {
    if (
      Object.prototype.hasOwnProperty.call(
        body,
        key
      )
    ) {
      values[key] =
        typeof body[key] ===
        "boolean"
          ? body[key]
            ? 1
            : 0
          : body[key];
    }
  }

  values.updated_at =
    new Date().toISOString();

  /*
   * Changing admin rights is restricted
   * to a real super admin.
   */
  const roleChange =
    [
      "role",
      "is_admin",
      "is_super_admin"
    ].some(
      x =>
        Object.prototype.hasOwnProperty.call(
          body,
          x
        )
    );

  if (
    roleChange &&
    admin.admin.role !==
      "super_admin"
  ) {
    return json(
      {
        ok: false,
        error: "SUPER_ADMIN_REQUIRED"
      },
      403
    );
  }

  const updated =
    await updateById(
      env.DB,
      "users",
      id,
      values
    );

  if (!updated) {
    return json(
      {
        ok: false,
        error: "USER_NOT_FOUND"
      },
      404
    );
  }

  await writeAuditLog(
    env.DB,
    admin,
    "user_update",
    "user",
    id,
    {
      fields:
        Object.keys(values)
    }
  );

  return json({
    ok: true,
    user:
      sanitizeUser(
        await findUserById(
          env.DB,
          id
        )
      )
  });
}

/* ============================================================
   USER BAN / UNBAN
============================================================ */

async function changeUserStatus(
  request,
  env,
  admin,
  id,
  active
) {
  const schema =
    await getTableSchema(
      env.DB,
      "users"
    );

  const columns =
    new Set(
      schema.map(
        x => x.name
      )
    );

  const values = {
    updated_at:
      new Date().toISOString()
  };

  if (
    columns.has("is_active")
  ) {
    values.is_active =
      active ? 1 : 0;
  }

  if (
    columns.has("status")
  ) {
    values.status =
      active
        ? "active"
        : "blocked";
  }

  const updated =
    await updateById(
      env.DB,
      "users",
      id,
      values
    );

  if (!updated) {
    return json(
      {
        ok: false,
        error: "USER_NOT_FOUND"
      },
      404
    );
  }

  await writeAuditLog(
    env.DB,
    admin,
    active
      ? "user_unban"
      : "user_ban",
    "user",
    id,
    {}
  );

  return json({
    ok: true,
    id,
    active
  });
}

/* ============================================================
   DELETE USER
============================================================ */

async function deleteAdminUser(
  request,
  env,
  admin,
  id
) {
  if (
    admin.admin.role !==
    "super_admin"
  ) {
    return json(
      {
        ok: false,
        error:
          "SUPER_ADMIN_REQUIRED"
      },
      403
    );
  }

  const result =
    await env.DB
      .prepare(`
        DELETE FROM users
        WHERE id = ?
      `)
      .bind(id)
      .run();

  const changes =
    Number(
      result?.meta?.changes || 0
    );

  if (!changes) {
    return json(
      {
        ok: false,
        error: "USER_NOT_FOUND"
      },
      404
    );
  }

  await writeAuditLog(
    env.DB,
    admin,
    "user_delete",
    "user",
    id,
    {}
  );

  return json({
    ok: true,
    deleted: true,
    id
  });
}

/* ============================================================
   ADMIN CHAT API
============================================================ */

async function handleAdminChatApi(
  request,
  env,
  admin
) {
  const url =
    new URL(request.url);

  const parts =
    url.pathname
      .split("/")
      .filter(Boolean);

  /*
   * /api/admin/chat
   */
  if (parts.length === 3) {
    if (
      request.method === "GET"
    ) {
      const conversations =
        await getAdminConversations(
          env
        );

      return json({
        ok: true,
        conversations,
        count:
          conversations.length
      });
    }

    if (
      request.method === "POST"
    ) {
      return adminSendChatMessage(
        request,
        env,
        admin
      );
    }
  }

  /*
   * /api/admin/chat/:id
   */
  const conversationId =
    parts[3];

  if (!conversationId) {
    return json(
      {
        ok: false,
        error:
          "CONVERSATION_ID_REQUIRED"
      },
      400
    );
  }

  const conversation =
    await getConversation(
      env,
      conversationId
    );

  if (!conversation) {
    return json(
      {
        ok: false,
        error:
          "CONVERSATION_NOT_FOUND"
      },
      404
    );
  }

  if (
    request.method === "GET"
  ) {
    return json({
      ok: true,
      conversation
    });
  }

  if (
    request.method === "POST" ||
    request.method === "PATCH"
  ) {
    return adminSendChatMessage(
      request,
      env,
      admin,
      conversationId
    );
  }

  return json(
    {
      ok: false,
      error:
        "METHOD_NOT_ALLOWED"
    },
    405
  );
}

/* ============================================================
   ADMIN CHAT MESSAGE
============================================================ */

async function adminSendChatMessage(
  request,
  env,
  admin,
  existingConversationId = null
) {
  let body;

  try {
    body =
      await request.json();
  } catch {
    return json(
      {
        ok: false,
        error: "INVALID_JSON"
      },
      400
    );
  }

  const text =
    clean(
      body.text ||
      body.message ||
      body.content
    );

  if (!text) {
    return json(
      {
        ok: false,
        error: "MESSAGE_REQUIRED"
      },
      400
    );
  }

  const conversationId =
    existingConversationId ||
    clean(
      body.conversationId
    );

  if (!conversationId) {
    return json(
      {
        ok: false,
        error:
          "CONVERSATION_ID_REQUIRED"
      },
      400
    );
  }

  const conversation =
    await getConversation(
      env,
      conversationId
    );

  if (!conversation) {
    return json(
      {
        ok: false,
        error:
          "CONVERSATION_NOT_FOUND"
      },
      404
    );
  }

  const message = {
    id: crypto.randomUUID(),
    sender: "admin",
    senderType: "admin",
    adminId:
      admin.admin.id || null,
    adminName:
      admin.admin.name || "Администратор",
    text,
    createdAt:
      new Date().toISOString()
  };

  if (
    !Array.isArray(
      conversation.messages
    )
  ) {
    conversation.messages = [];
  }

  conversation.messages.push(
    message
  );

  conversation.updatedAt =
    message.createdAt;

  conversation.unreadForUser =
    true;

  conversation.unreadForAdmin =
    false;

  await saveConversation(
    env,
    conversation
  );

  await writeAuditLog(
    env.DB,
    admin,
    "admin_chat_reply",
    "conversation",
    conversationId,
    {}
  );

  return json({
    ok: true,
    conversationId,
    message
  });
}

/* ============================================================
   PUBLIC ADMIN CHAT
============================================================ */

async function handleAdminChat(
  request,
  env
) {
  if (
    request.method === "POST"
  ) {
    return createUserChatMessage(
      request,
      env
    );
  }

  if (
    request.method === "GET"
  ) {
    const url =
      new URL(request.url);

    const conversationId =
      clean(
        url.searchParams.get(
          "conversationId"
        )
      );

    /*
     * User knows the conversation ID.
     */
    if (conversationId) {
      const conversation =
        await getConversation(
          env,
          conversationId
        );

      if (!conversation) {
        return json(
          {
            ok: false,
            error:
              "CONVERSATION_NOT_FOUND"
          },
          404
        );
      }

      return json({
        ok: true,
        conversation
      });
    }

    /*
     * No ID = no global conversation access.
     */
    return json({
      ok: true,
      conversations: []
    });
  }

  return json(
    {
      ok: false,
      error:
        "METHOD_NOT_ALLOWED"
    },
    405
  );
}

/* ============================================================
   PUBLIC CHAT BY ID
============================================================ */

async function handleAdminChatById(
  request,
  env
) {
  const parts =
    new URL(request.url)
      .pathname
      .split("/")
      .filter(Boolean);

  const conversationId =
    parts[2];

  if (!conversationId) {
    return json(
      {
        ok: false,
        error:
          "CONVERSATION_ID_REQUIRED"
      },
      400
    );
  }

  if (
    request.method === "GET"
  ) {
    const conversation =
      await getConversation(
        env,
        conversationId
      );

    if (!conversation) {
      return json(
        {
          ok: false,
          error:
            "CONVERSATION_NOT_FOUND"
        },
        404
      );
    }

    return json({
      ok: true,
      conversation
    });
  }

  if (
    request.method === "POST"
  ) {
    return createUserChatMessage(
      request,
      env,
      conversationId
    );
  }

  return json(
    {
      ok: false,
      error:
        "METHOD_NOT_ALLOWED"
    },
    405
  );
}

/* ============================================================
   USER CHAT MESSAGE
============================================================ */

async function createUserChatMessage(
  request,
  env,
  existingConversationId = null
) {
  let body;

  try {
    body =
      await request.json();
  } catch {
    return json(
      {
        ok: false,
        error:
          "INVALID_JSON"
      },
      400
    );
  }

  const text =
    clean(
      body.text ||
      body.message ||
      body.content
    );

  const name =
    clean(
      body.name ||
      body.author_name ||
      body.contact_name
    ) || "Аноним";

  if (!text) {
    return json(
      {
        ok: false,
        error:
          "MESSAGE_REQUIRED"
      },
      400
    );
  }

  let conversation;

  if (existingConversationId) {
    conversation =
      await getConversation(
        env,
        existingConversationId
      );
  }

  if (!conversation) {
    const id =
      existingConversationId ||
      `chat_${crypto.randomUUID()}`;

    const now =
      new Date().toISOString();

    conversation = {
      id,

      name,

      anonymous:
        !name ||
        name === "Аноним",

      createdAt: now,
      updatedAt: now,

      status: "open",

      unreadForAdmin: true,
      unreadForUser: false,

      messages: []
    };
  }

  const message = {
    id: crypto.randomUUID(),

    sender: "user",
    senderType: "user",

    name,

    text,

    createdAt:
      new Date().toISOString()
  };

  if (
    !Array.isArray(
      conversation.messages
    )
  ) {
    conversation.messages = [];
  }

  conversation.messages.push(
    message
  );

  conversation.name =
    name || conversation.name;

  conversation.updatedAt =
    message.createdAt;

  conversation.unreadForAdmin =
    true;

  conversation.unreadForUser =
    false;

  await saveConversation(
    env,
    conversation
  );

  return json({
    ok: true,

    conversationId:
      conversation.id,

    conversation,

    message
  });
}

/* ============================================================
   ADMIN CHAT STORAGE
============================================================ */

async function getAdminConversations(
  env
) {
  const ids =
    await kvGet(
      env,
      "admin-chat:index"
    );

  if (!Array.isArray(ids)) {
    return [];
  }

  const result = [];

  for (const id of ids) {
    const conversation =
      await getConversation(
        env,
        id
      );

    if (conversation) {
      result.push(
        conversation
      );
    }
  }

  result.sort(
    (a, b) =>
      String(
        b.updatedAt || ""
      ).localeCompare(
        String(
          a.updatedAt || ""
        )
      )
  );

  return result;
}

async function getConversation(
  env,
  id
) {
  if (!id) {
    return null;
  }

  return kvGet(
    env,
    `admin-chat:${id}`
  );
}

async function saveConversation(
  env,
  conversation
) {
  await kvPut(
    env,
    `admin-chat:${conversation.id}`,
    conversation
  );

  let ids =
    await kvGet(
      env,
      "admin-chat:index"
    );

  if (!Array.isArray(ids)) {
    ids = [];
  }

  if (
    !ids.includes(
      conversation.id
    )
  ) {
    ids.push(
      conversation.id
    );
  }

  await kvPut(
    env,
    "admin-chat:index",
    ids
  );
}

/* ============================================================
   NOTIFICATIONS
============================================================ */

async function handleNotifications(
  request,
  env
) {
  if (
    request.method === "GET"
  ) {
    const items =
      await kvGet(
        env,
        "notifications:public"
      );

    return json({
      ok: true,
      notifications:
        Array.isArray(items)
          ? items
          : []
    });
  }

  if (
    request.method === "POST"
  ) {
    let body;

    try {
      body =
        await request.json();
    } catch {
      return json(
        {
          ok: false,
          error:
            "INVALID_JSON"
        },
        400
      );
    }

    const notification = {
      id: crypto.randomUUID(),

      title:
        clean(body.title) ||
        "Уведомление",

      text:
        clean(
          body.text ||
          body.message
        ),

      type:
        clean(body.type) ||
        "info",

      createdAt:
        new Date().toISOString()
    };

    let items =
      await kvGet(
        env,
        "notifications:public"
      );

    if (!Array.isArray(items)) {
      items = [];
    }

    items.unshift(
      notification
    );

    items =
      items.slice(0, 200);

    await kvPut(
      env,
      "notifications:public",
      items
    );

    return json({
      ok: true,
      notification
    });
  }

  return json(
    {
      ok: false,
      error:
        "METHOD_NOT_ALLOWED"
    },
    405
  );
}

/* ============================================================
   ADMIN NOTIFICATIONS
============================================================ */

async function handleAdminNotifications(
  request,
  env,
  admin
) {
  if (
    request.method === "GET"
  ) {
    const items =
      await kvGet(
        env,
        "notifications:public"
      );

    return json({
      ok: true,
      notifications:
        Array.isArray(items)
          ? items
          : []
    });
  }

  if (
    request.method === "POST"
  ) {
    const response =
      await handleNotifications(
        request,
        env
      );

    await writeAuditLog(
      env.DB,
      admin,
      "notification_create",
      "notification",
      null,
      {}
    );

    return response;
  }

  if (
    request.method === "DELETE"
  ) {
    await kvDelete(
      env,
      "notifications:public"
    );

    await writeAuditLog(
      env.DB,
      admin,
      "notifications_clear",
      "notification",
      null,
      {}
    );

    return json({
      ok: true,
      cleared: true
    });
  }

  return json(
    {
      ok: false,
      error:
        "METHOD_NOT_ALLOWED"
    },
    405
  );
}

/* ============================================================
   ADMIN AUDIT
============================================================ */

async function handleAdminAudit(
  request,
  env
) {
  if (!env.DB) {
    return json({
      ok: true,
      logs: []
    });
  }

  const url =
    new URL(request.url);

  const limit =
    clampNumber(
      url.searchParams.get(
        "limit"
      ),
      1,
      200,
      100
    );

  const schema =
    await getTableSchema(
      env.DB,
      "audit_logs"
    );

  if (!schema.length) {
    return json({
      ok: true,
      logs: []
    });
  }

  const columns =
    new Set(
      schema.map(
        x => x.name
      )
    );

  const order =
    columns.has("created_at")
      ? "created_at DESC"
      : "rowid DESC";

  const result =
    await env.DB
      .prepare(`
        SELECT *
        FROM audit_logs
        ORDER BY ${order}
        LIMIT ?
      `)
      .bind(limit)
      .all();

  return json({
    ok: true,
    logs:
      result.results || []
  });
}

/* ============================================================
   ADMIN AUTHORIZATION
============================================================ */

async function requireAdmin(
  request,
  env
) {
  /*
   * 1. ADMIN KEY
   *
   * Set a Cloudflare secret:
   *
   * ADMIN_KEY
   *
   * The admin panel can send:
   *
   * X-Admin-Key: ...
   *
   * This is the safest way after removing
   * normal user authentication.
   */
  const configuredKey =
    env.ADMIN_KEY;

  const suppliedKey =
    request.headers.get(
      "X-Admin-Key"
    );

  if (
    configuredKey &&
    suppliedKey &&
    constantTimeEqual(
      configuredKey,
      suppliedKey
    )
  ) {
    return {
      ok: true,

      admin: {
        id: "key-admin",
        name:
          "Главный администратор",
        role:
          "super_admin",
        permissions: ["*"]
      }
    };
  }

  /*
   * 2. Existing admin table.
   *
   * This supports an already-existing
   * admins table without changing it.
   */
  if (env.DB) {
    const adminRow =
      await findAnyAdmin(
        env.DB,
        request
      );

    if (adminRow) {
      const active =
        adminIsActive(
          adminRow
        );

      if (!active) {
        return {
          ok: false,
          response: json(
            {
              ok: false,
              error:
                "ADMIN_DISABLED"
            },
            403
          )
        };
      }

      return {
        ok: true,

        admin:
          normalizeAdmin(
            adminRow
          )
      };
    }
  }

  return {
    ok: false,

    response: json(
      {
        ok: false,
        error:
          "ADMIN_AUTH_REQUIRED",
        message:
          "Требуется ключ администратора."
      },
      401
    )
  };
}

/* ============================================================
   PERMISSIONS
============================================================ */

function requirePermission(
  admin,
  permission,
  handler
) {
  if (
    admin.admin.role ===
    "super_admin"
  ) {
    return handler();
  }

  const permissions =
    admin.admin.permissions || [];

  if (
    permissions.includes("*") ||
    permissions.includes(permission)
  ) {
    return handler();
  }

  return json(
    {
      ok: false,
      error:
        "PERMISSION_DENIED",
      permission
    },
    403
  );
}

function normalizeAdmin(row) {
  const role =
    clean(
      row.role
    ) ||
    (
      Number(
        row.is_super_admin || 0
      )
        ? "super_admin"
        : Number(
            row.is_admin || 0
          )
          ? "admin"
          : "admin"
    );

  let permissions =
    parsePermissions(
      row.permissions
    );

  /*
   * Existing admin without
   * explicit permissions gets
   * full admin rights.
   */
  if (
    !permissions.length
  ) {
    permissions = ["*"];
  }

  return {
    id:
      row.id ||
      row.user_id ||
      row.admin_id ||
      null,

    name:
      row.name ||
      row.username ||
      "Администратор",

    username:
      row.username ||
      null,

    role,

    permissions,

    is_active:
      row.is_active ??
      row.status !== "blocked"
  };
}

function sanitizeAdmin(admin) {
  return {
    id: admin.id,
    name: admin.name,
    username:
      admin.username || null,
    role: admin.role,
    permissions:
      admin.permissions || []
  };
}

function adminIsActive(row) {
  if (
    row.is_active !== undefined
  ) {
    return Boolean(
      Number(row.is_active)
    );
  }

  if (
    row.status !== undefined
  ) {
    return (
      String(
        row.status
      ).toLowerCase() !==
      "blocked"
    );
  }

  return true;
}

async function findAnyAdmin(
  db,
  request
) {
  const schema =
    await getTableSchema(
      db,
      "admins"
    );

  if (!schema.length) {
    return null;
  }

  /*
   * Since normal user authentication
   * was removed, admin table access is
   * only accepted through explicit
   * admin identification headers.
   */
  const adminId =
    clean(
      request.headers.get(
        "X-Admin-ID"
      )
    );

  const adminUsername =
    clean(
      request.headers.get(
        "X-Admin-Username"
      )
    );

  if (!adminId && !adminUsername) {
    return null;
  }

  const columns =
    new Set(
      schema.map(
        x => x.name
      )
    );

  if (
    adminId &&
    columns.has("id")
  ) {
    const row =
      await db
        .prepare(`
          SELECT *
          FROM admins
          WHERE id = ?
          LIMIT 1
        `)
        .bind(adminId)
        .first();

    if (row) {
      return row;
    }
  }

  if (
    adminId &&
    columns.has("user_id")
  ) {
    const row =
      await db
        .prepare(`
          SELECT *
          FROM admins
          WHERE user_id = ?
          LIMIT 1
        `)
        .bind(adminId)
        .first();

    if (row) {
      return row;
    }
  }

  if (
    adminUsername &&
    columns.has("username")
  ) {
    const row =
      await db
        .prepare(`
          SELECT *
          FROM admins
          WHERE username = ?
          LIMIT 1
        `)
        .bind(
          adminUsername
        )
        .first();

    if (row) {
      return row;
    }
  }

  return null;
}

/* ============================================================
   AUDIT LOG
============================================================ */

async function writeAuditLog(
  db,
  admin,
  action,
  targetType,
  targetId,
  metadata
) {
  if (!db) {
    return;
  }

  try {
    const schema =
      await getTableSchema(
        db,
        "audit_logs"
      );

    if (!schema.length) {
      return;
    }

    const values = {
      id: crypto.randomUUID(),

      admin_id:
        admin?.admin?.id ||
        admin?.id ||
        null,

      admin_name:
        admin?.admin?.name ||
        admin?.name ||
        null,

      action,

      target_type:
        targetType || null,

      target_id:
        targetId || null,

      metadata:
        JSON.stringify(
          metadata || {}
        ),

      details:
        JSON.stringify(
          metadata || {}
        ),

      created_at:
        new Date().toISOString()
    };

    await dynamicInsert(
      db,
      "audit_logs",
      values
    );
  } catch (error) {
    console.error(
      "AUDIT ERROR:",
      error
    );
  }
}

/* ============================================================
   USERS
============================================================ */

async function findUserById(
  db,
  id
) {
  if (!db || !id) {
    return null;
  }

  const schema =
    await getTableSchema(
      db,
      "users"
    );

  if (!schema.length) {
    return null;
  }

  const columns =
    new Set(
      schema.map(
        x => x.name
      )
    );

  const idColumn =
    columns.has("id")
      ? "id"
      : columns.has("user_id")
        ? "user_id"
        : null;

  if (!idColumn) {
    return null;
  }

  return db
    .prepare(`
      SELECT *
      FROM users
      WHERE ${idColumn} = ?
      LIMIT 1
    `)
    .bind(id)
    .first();
}

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  const result = {
    id:
      user.id ||
      user.user_id ||
      null,

    name:
      user.name ||
      user.display_name ||
      null,

    username:
      user.username ||
      null,

    country:
      user.country ||
      null,

    city:
      user.city ||
      null,

    role:
      user.role ||
      null,

    status:
      user.status ||
      null,

    is_active:
      user.is_active !== undefined
        ? Boolean(
            Number(
              user.is_active
            )
          )
        : true,

    created_at:
      user.created_at ||
      null,

    updated_at:
      user.updated_at ||
      null
  };

  /*
   * Never expose password fields.
   */
  return result;
}

/* ============================================================
   PUBLICATION HELPERS
============================================================ */

async function getPublicationById(
  db,
  id
) {
  if (!db || !id) {
    return null;
  }

  return db
    .prepare(`
      SELECT *
      FROM publications
      WHERE id = ?
      LIMIT 1
    `)
    .bind(id)
    .first();
}

async function incrementPublicationViews(
  db,
  id
) {
  const schema =
    await getTableSchema(
      db,
      "publications"
    );

  if (
    schema.some(
      x => x.name === "views"
    )
  ) {
    await db
      .prepare(`
        UPDATE publications
        SET views = COALESCE(views, 0) + 1
        WHERE id = ?
      `)
      .bind(id)
      .run();
  }
}

function normalizePublication(
  row
) {
  if (!row) {
    return null;
  }

  let media = [];

  try {
    if (
      Array.isArray(
        row.media
      )
    ) {
      media = row.media;
    } else if (
      row.media
    ) {
      media =
        JSON.parse(
          row.media
        );
    }
  } catch {
    media = [];
  }

  return {
    ...row,

    content:
      row.text ??
      row.content ??
      "",

    text:
      row.text ??
      row.content ??
      "",

    tags:
      row.hashtags ??
      row.tags ??
      "",

    author_name:
      row.author_name ??
      row.contact_name ??
      "",

    media
  };
}

/* ============================================================
   PUBLICATION MEDIA
============================================================ */

async function savePublicationMedia(
  db,
  publicationId,
  media,
  now
) {
  try {
    const schema =
      await getTableSchema(
        db,
        "publication_media"
      );

    if (!schema.length) {
      return;
    }

    for (
      const item of media
    ) {
      const mediaUrl =
        typeof item === "string"
          ? item
          : item?.url ||
            item?.src ||
            item?.media_url;

      if (!mediaUrl) {
        continue;
      }

      await dynamicInsert(
        db,
        "publication_media",
        {
          id:
            crypto.randomUUID(),

          publication_id:
            publicationId,

          media_type:
            typeof item === "object"
              ? item.type ||
                item.media_type ||
                null
              : null,

          media_url:
            mediaUrl,

          media_caption:
            typeof item === "object"
              ? item.caption ||
                item.media_caption ||
                null
              : null,

          created_at: now
        }
      );
    }
  } catch (
    error
  ) {
    console.error(
      "MEDIA ERROR:",
      error
    );
  }
}

/* ============================================================
   D1 HELPERS
============================================================ */

async function getTableSchema(
  db,
  table
) {
  if (!db) {
    return [];
  }

  const safe =
    quoteIdentifier(table);

  try {
    const result =
      await db
        .prepare(
          `PRAGMA table_info(${safe})`
        )
        .all();

    return result.results || [];
  } catch {
    return [];
  }
}

function quoteIdentifier(
  identifier
) {
  if (
    !/^[A-Za-z_][A-Za-z0-9_]*$/.test(
      identifier
    )
  ) {
    throw new Error(
      "Unsafe SQL identifier"
    );
  }

  return `"${identifier}"`;
}

async function dynamicInsert(
  db,
  table,
  values
) {
  const schema =
    await getTableSchema(
      db,
      table
    );

  if (!schema.length) {
    return {
      ok: false,
      message:
        `Таблица ${table} не найдена.`
    };
  }

  const allowed =
    new Set(
      schema.map(
        x => x.name
      )
    );

  const entries =
    Object.entries(
      values
    ).filter(
      ([key, value]) =>
        allowed.has(key) &&
        value !== undefined
    );

  if (!entries.length) {
    return {
      ok: false,
      message:
        "Нет доступных полей для записи."
    };
  }

  const columns =
    entries
      .map(
        ([key]) =>
          quoteIdentifier(
            key
          )
      )
      .join(", ");

  const placeholders =
    entries
      .map(() => "?")
      .join(", ");

  try {
    await db
      .prepare(`
        INSERT INTO ${quoteIdentifier(
          table
        )}
        (${columns})
        VALUES (${placeholders})
      `)
      .bind(
        ...entries.map(
          ([, value]) =>
            value
        )
      )
      .run();

    return {
      ok: true
    };
  } catch (error) {
    console.error(
      `INSERT ${table}:`,
      error
    );

    return {
      ok: false,
      message:
        error?.message ||
        "Ошибка D1 INSERT"
    };
  }
}

async function updateById(
  db,
  table,
  id,
  values
) {
  const schema =
    await getTableSchema(
      db,
      table
    );

  if (!schema.length) {
    return false;
  }

  const columns =
    new Set(
      schema.map(
        x => x.name
      )
    );

  const idColumn =
    columns.has("id")
      ? "id"
      : columns.has("user_id")
        ? "user_id"
        : null;

  if (!idColumn) {
    return false;
  }

  const entries =
    Object.entries(
      values
    ).filter(
      ([key, value]) =>
        columns.has(key) &&
        value !== undefined
    );

  if (!entries.length) {
    return false;
  }

  const assignments =
    entries
      .map(
        ([key]) =>
          `${quoteIdentifier(
            key
          )} = ?`
      )
      .join(", ");

  const result =
    await db
      .prepare(`
        UPDATE ${quoteIdentifier(
          table
        )}
        SET ${assignments}
        WHERE ${quoteIdentifier(
          idColumn
        )} = ?
      `)
      .bind(
        ...entries.map(
          ([, value]) =>
            value
        ),
        id
      )
      .run();

  return (
    Number(
      result?.meta?.changes ||
      0
    ) > 0
  );
}

async function countTable(
  db,
  table
) {
  try {
    const schema =
      await getTableSchema(
        db,
        table
      );

    if (!schema.length) {
      return 0;
    }

    const result =
      await db
        .prepare(
          `SELECT COUNT(*) AS count FROM ${quoteIdentifier(
            table
          )}`
        )
        .first();

    return Number(
      result?.count || 0
    );
  } catch {
    return 0;
  }
}

async function countWhere(
  db,
  table,
  where,
  params
) {
  try {
    const schema =
      await getTableSchema(
        db,
        table
      );

    if (!schema.length) {
      return 0;
    }

    const result =
      await db
        .prepare(`
          SELECT COUNT(*) AS count
          FROM ${quoteIdentifier(
            table
          )}
          WHERE ${where}
        `)
        .bind(...params)
        .first();

    return Number(
      result?.count || 0
    );
  } catch {
    return 0;
  }
}

/* ============================================================
   KV
============================================================ */

function getKV(env) {
  return (
    env.DATA ||
    env.KV ||
    null
  );
}

async function kvGet(
  env,
  key
) {
  const kv =
    getKV(env);

  if (!kv) {
    return null;
  }

  try {
    const value =
      await kv.get(key);

    if (
      value === null ||
      value === undefined
    ) {
      return null;
    }

    try {
      return JSON.parse(
        value
      );
    } catch {
      return value;
    }
  } catch {
    return null;
  }
}

async function kvPut(
  env,
  key,
  value
) {
  const kv =
    getKV(env);

  if (!kv) {
    return false;
  }

  try {
    await kv.put(
      key,
      JSON.stringify(value)
    );

    return true;
  } catch {
    return false;
  }
}

async function kvDelete(
  env,
  key
) {
  const kv =
    getKV(env);

  if (!kv) {
    return false;
  }

  try {
    await kv.delete(key);
    return true;
  } catch {
    return false;
  }
}

/* ============================================================
   LEGACY OPPORTUNITIES
============================================================ */

async function handleOpportunities(
  request,
  env
) {
  const key =
    "opportunities";

  if (
    request.method === "GET"
  ) {
    const data =
      await kvGet(
        env,
        key
      );

    return json({
      ok: true,
      opportunities:
        Array.isArray(data)
          ? data
          : []
    });
  }

  if (
    request.method === "POST"
  ) {
    let body;

    try {
      body =
        await request.json();
    } catch {
      return json(
        {
          ok: false,
          error:
            "INVALID_JSON"
        },
        400
      );
    }

    const data =
      await kvGet(
        env,
        key
      );

    const items =
      Array.isArray(data)
        ? data
        : [];

    const item = {
      id:
        crypto.randomUUID(),

      ...body,

      created_at:
        new Date().toISOString()
    };

    items.unshift(item);

    await kvPut(
      env,
      key,
      items.slice(0, 500)
    );

    return json({
      ok: true,
      opportunity: item
    });
  }

  return json(
    {
      ok: false,
      error:
        "METHOD_NOT_ALLOWED"
    },
    405
  );
}

/* ============================================================
   LEGACY MESSAGES
============================================================ */

async function handleMessages(
  request,
  env
) {
  const key =
    "messages";

  if (
    request.method === "GET"
  ) {
    const messages =
      await kvGet(
        env,
        key
      );

    return json({
      ok: true,
      messages:
        Array.isArray(
          messages
        )
          ? messages
          : []
    });
  }

  if (
    request.method === "POST"
  ) {
    let body;

    try {
      body =
        await request.json();
    } catch {
      return json(
        {
          ok: false,
          error:
            "INVALID_JSON"
        },
        400
      );
    }

    const messages =
      await kvGet(
        env,
        key
      );

    const list =
      Array.isArray(messages)
        ? messages
        : [];

    const message = {
      id:
        crypto.randomUUID(),

      name:
        clean(
          body.name
        ) ||
        "Аноним",

      text:
        clean(
          body.text ||
          body.message
        ),

      createdAt:
        new Date().toISOString()
    };

    if (!message.text) {
      return json(
        {
          ok: false,
          error:
            "MESSAGE_REQUIRED"
        },
        400
      );
    }

    list.unshift(
      message
    );

    await kvPut(
      env,
      key,
      list.slice(0, 500)
    );

    return json({
      ok: true,
      message
    });
  }

  return json(
    {
      ok: false,
      error:
        "METHOD_NOT_ALLOWED"
    },
    405
  );
}

/* ============================================================
   UTILITIES
============================================================ */

function clean(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)
    .trim()
    .slice(0, 10000);
}

function stringifyMaybe(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  if (
    typeof value === "string"
  ) {
    return value;
  }

  try {
    return JSON.stringify(
      value
    );
  } catch {
    return String(value);
  }
}

function numberOrZero(value) {
  const number =
    Number(value);

  return Number.isFinite(
    number
  )
    ? number
    : 0;
}

function clampNumber(
  value,
  min,
  max,
  fallback
) {
  const number =
    Number(value);

  if (
    !Number.isFinite(
      number
    )
  ) {
    return fallback;
  }

  return Math.min(
    max,
    Math.max(
      min,
      Math.floor(number)
    )
  );
}

function generateTrackingCode() {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let result =
    "TO-";

  for (
    let i = 0;
    i < 8;
    i++
  ) {
    result +=
      chars[
        Math.floor(
          Math.random() *
          chars.length
        )
      ];
  }

  return result;
}

function parsePermissions(
  value
) {
  if (!value) {
    return [];
  }

  if (
    Array.isArray(value)
  ) {
    return value
      .map(
        x => String(x).trim()
      )
      .filter(Boolean);
  }

  try {
    const parsed =
      JSON.parse(value);

    if (
      Array.isArray(parsed)
    ) {
      return parsed
        .map(
          x =>
            String(x).trim()
        )
        .filter(Boolean);
    }

    if (
      typeof parsed ===
      "string"
    ) {
      return parsed
        .split(",")
        .map(
          x =>
            x.trim()
        )
        .filter(Boolean);
    }
  } catch {}

  return String(value)
    .split(",")
    .map(
      x =>
        x.trim()
    )
    .filter(Boolean);
}

function constantTimeEqual(
  a,
  b
) {
  if (
    typeof a !== "string" ||
    typeof b !== "string"
  ) {
    return false;
  }

  if (
    a.length !== b.length
  ) {
    return false;
  }

  let result = 0;

  for (
    let i = 0;
    i < a.length;
    i++
  ) {
    result |=
      a.charCodeAt(i) ^
      b.charCodeAt(i);
  }

  return result === 0;
}

/* ============================================================
   RESPONSE
============================================================ */

function json(
  data,
  status = 200,
  headers = {}
) {
  return new Response(
    JSON.stringify(
      data,
      null,
      2
    ),
    {
      status,

      headers: {
        "Content-Type":
          "application/json; charset=utf-8",

        "Cache-Control":
          "no-store",

        ...headers
      }
    }
  );
}

function corsResponse(
  request
) {
  const origin =
    request.headers.get(
      "Origin"
    );

  const allowed =
    origin ||
    "https://tajik-opportunities.com";

  return new Response(
    null,
    {
      status: 204,

      headers: {
        "Access-Control-Allow-Origin":
          allowed,

        "Access-Control-Allow-Credentials":
          "true",

        "Access-Control-Allow-Headers":
          "Content-Type, Accept, X-Admin-Key, X-Admin-ID, X-Admin-Username",

        "Access-Control-Allow-Methods":
          ALLOWED_METHODS.join(", "),

        "Vary":
          "Origin"
      }
    }
  );
}

function withSecurity(
  response
) {
  const headers =
    new Headers(
      response.headers
    );

  headers.set(
    "X-Content-Type-Options",
    "nosniff"
  );

  headers.set(
    "X-Frame-Options",
    "SAMEORIGIN"
  );

  headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin"
  );

  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  headers.set(
    "X-Powered-By",
    SITE_NAME
  );

  return new Response(
    response.body,
    {
      status:
        response.status,

      statusText:
        response.statusText,

      headers
    }
  );
  }
