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
   - No login
   - No password
   - No admin session
   - Admin API is directly available
   - Full super_admin access
============================================================ */

const VERSION = "2026.09.07";

const SITE_NAME = "Tajik Opportunities";

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
   ENTRY
============================================================ */

export default {
  async fetch(request, env, ctx) {
    try {
      return await handleRequest(request, env, ctx);
    } catch (error) {
      console.error("WORKER_ERROR:", error);

      return json(
        {
          ok: false,
          error: "INTERNAL_SERVER_ERROR",
          message: error?.message || "Internal server error",
          version: VERSION
        },
        500,
        request
      );
    }
  }
};

/* ============================================================
   MAIN REQUEST HANDLER
============================================================ */

async function handleRequest(request, env, ctx) {
  const url = new URL(request.url);
  const path = normalizePath(url.pathname);

  if (!ALLOWED_METHODS.includes(request.method)) {
    return json(
      {
        ok: false,
        error: "METHOD_NOT_ALLOWED"
      },
      405,
      request
    );
  }

  if (request.method === "OPTIONS") {
    return corsResponse(request);
  }

  if (path === "/health" || path === "/api/health") {
    return json(
      {
        ok: true,
        service: SITE_NAME,
        version: VERSION,
        status: "healthy",
        environment: env.ENVIRONMENT || "production",
        time: new Date().toISOString()
      },
      200,
      request
    );
  }

  if (path.startsWith("/api")) {
    return withSecurity(
      await handleApi(request, env, ctx),
      request
    );
  }

  /* Static files */
  if (env.ASSETS) {
    const assetResponse = await env.ASSETS.fetch(request);

    if (assetResponse.status !== 404) {
      return assetResponse;
    }

    /* SPA fallback */
    if (
      request.method === "GET" &&
      !path.includes(".")
    ) {
      const fallback = new Request(
        new URL("/index.html", request.url),
        request
      );

      const fallbackResponse = await env.ASSETS.fetch(fallback);

      if (fallbackResponse.status !== 404) {
        return fallbackResponse;
      }
    }
  }

  return json(
    {
      ok: false,
      error: "NOT_FOUND"
    },
    404,
    request
  );
}

/* ============================================================
   API ROUTER
============================================================ */

async function handleApi(request, env, ctx) {
  const url = new URL(request.url);
  const path = normalizePath(url.pathname);

  /* ----------------------------------------------------------
     API ROOT
  ---------------------------------------------------------- */

  if (path === "/api" || path === "/api/") {
    return json(
      {
        ok: true,
        service: SITE_NAME,
        version: VERSION,
        api: "v1",

        user_mode: "name_only",

        authentication: {
          users: false,
          registration: false,
          login: false,
          password: false,
          profile: false
        },

        admin: {
          enabled: true,
          login_required: false,
          password_required: false,
          session_required: false,
          role: "super_admin"
        }
      },
      200,
      request
    );
  }

  /* ----------------------------------------------------------
     OLD USER AUTH ROUTES
  ---------------------------------------------------------- */

  if (
    path === "/api/auth/login" ||
    path === "/api/auth/register" ||
    path === "/api/auth/logout" ||
    path === "/api/auth/me" ||
    path === "/api/login" ||
    path === "/api/register" ||
    path === "/api/profile"
  ) {
    return json(
      {
        ok: false,
        error: "AUTHENTICATION_DISABLED",
        message:
          "Обычная регистрация, авторизация и профили пользователей отключены."
      },
      410,
      request
    );
  }

  /* ----------------------------------------------------------
     PUBLICATIONS
  ---------------------------------------------------------- */

  if (path === "/api/publications") {
    if (request.method === "GET") {
      return handlePublicationsList(request, env);
    }

    if (request.method === "POST") {
      return handleCreatePublication(request, env);
    }

    return json(
      {
        ok: false,
        error: "METHOD_NOT_ALLOWED"
      },
      405,
      request
    );
  }

  const publicationMatch = path.match(
    /^\/api\/publications\/([^/]+)$/
  );

  if (publicationMatch) {
    const id = decodeURIComponent(publicationMatch[1]);

    if (request.method === "GET") {
      return handlePublicationById(request, env, id);
    }

    return json(
      {
        ok: false,
        error: "METHOD_NOT_ALLOWED"
      },
      405,
      request
    );
  }

  /* ----------------------------------------------------------
     ADMIN
  ---------------------------------------------------------- */

  if (
    path === "/api/admin" ||
    path.startsWith("/api/admin/")
  ) {
    return handleAdminApi(request, env, ctx);
  }

  /* ----------------------------------------------------------
     PUBLIC ADMIN CHAT
  ---------------------------------------------------------- */

  if (
    path === "/api/admin-chat" ||
    path.startsWith("/api/admin-chat/")
  ) {
    return handleAdminChat(request, env, ctx);
  }

  /* ----------------------------------------------------------
     PUBLIC NOTIFICATIONS
  ---------------------------------------------------------- */

  if (path === "/api/notifications") {
    return handleNotifications(request, env);
  }

  /* ----------------------------------------------------------
     LEGACY OPPORTUNITIES API
  ---------------------------------------------------------- */

  if (
    path === "/api/opportunities" ||
    path.startsWith("/api/opportunities/")
  ) {
    return handleLegacyOpportunities(request, env);
  }

  /* ----------------------------------------------------------
     LEGACY MESSAGES API
  ---------------------------------------------------------- */

  if (
    path === "/api/messages" ||
    path.startsWith("/api/messages/")
  ) {
    return handleLegacyMessages(request, env);
  }

  return json(
    {
      ok: false,
      error: "API_ROUTE_NOT_FOUND",
      path
    },
    404,
    request
  );
}

/* ============================================================
   ADMIN AUTH
   NO LOGIN / NO PASSWORD
============================================================ */

async function requireAdmin(request, env) {
  return {
    ok: true,

    admin: {
      id: "key-admin",
      name: "Главный администратор",
      username: "admin",
      role: "super_admin",

      permissions: ["*"],

      is_active: true
    }
  };
}

/* ============================================================
   ADMIN ROOT
============================================================ */

async function handleAdminRoot(request, env) {
  const auth = await requireAdmin(request, env);

  return json(
    {
      ok: true,
      admin: auth.admin,

      access: {
        login_required: false,
        password_required: false,
        session_required: false,
        role: "super_admin"
      },

      endpoints: [
        "/api/admin/me",
        "/api/admin/dashboard",
        "/api/admin/stats",
        "/api/admin/users",
        "/api/admin/publications",
        "/api/admin/chat",
        "/api/admin/notifications",
        "/api/admin/audit"
      ]
    },
    200,
    request
  );
}

/* ============================================================
   ADMIN API ROUTER
============================================================ */

async function handleAdminApi(request, env, ctx) {
  const url = new URL(request.url);
  const path = normalizePath(url.pathname);

  const auth = await requireAdmin(request, env);

  if (!auth.ok) {
    return json(
      {
        ok: false,
        error: "ADMIN_ACCESS_DENIED"
      },
      401,
      request
    );
  }

  /* /api/admin */
  if (path === "/api/admin" || path === "/api/admin/") {
    return handleAdminRoot(request, env);
  }

  /* ----------------------------------------------------------
     ME
  ---------------------------------------------------------- */

  if (path === "/api/admin/me") {
    return json(
      {
        ok: true,
        authenticated: true,
        login_required: false,
        admin: auth.admin
      },
      200,
      request
    );
  }

  /* ----------------------------------------------------------
     DASHBOARD
  ---------------------------------------------------------- */

  if (path === "/api/admin/dashboard") {
    return handleAdminDashboard(request, env);
  }

  /* ----------------------------------------------------------
     STATS
  ---------------------------------------------------------- */

  if (path === "/api/admin/stats") {
    return handleAdminStats(request, env);
  }

  /* ----------------------------------------------------------
     USERS
  ---------------------------------------------------------- */

  if (
    path === "/api/admin/users" ||
    path.startsWith("/api/admin/users/")
  ) {
    return handleAdminUsers(request, env, ctx);
  }

  /* ----------------------------------------------------------
     PUBLICATIONS
  ---------------------------------------------------------- */

  if (
    path === "/api/admin/publications" ||
    path.startsWith("/api/admin/publications/")
  ) {
    return handleAdminPublications(request, env, ctx);
  }

  /* ----------------------------------------------------------
     CHAT
  ---------------------------------------------------------- */

  if (
    path === "/api/admin/chat" ||
    path.startsWith("/api/admin/chat/")
  ) {
    return handleAdminChatManagement(request, env, ctx);
  }

  /* ----------------------------------------------------------
     NOTIFICATIONS
  ---------------------------------------------------------- */

  if (
    path === "/api/admin/notifications" ||
    path.startsWith("/api/admin/notifications/")
  ) {
    return handleAdminNotifications(request, env);
  }

  /* ----------------------------------------------------------
     AUDIT
  ---------------------------------------------------------- */

  if (path === "/api/admin/audit") {
    return handleAdminAudit(request, env);
  }

  return json(
    {
      ok: false,
      error: "ADMIN_ROUTE_NOT_FOUND",
      path
    },
    404,
    request
  );
}

/* ============================================================
   ADMIN DASHBOARD
============================================================ */

async function handleAdminDashboard(request, env) {
  const stats = await getDashboardStats(env);

  return json(
    {
      ok: true,

      admin: {
        id: "key-admin",
        name: "Главный администратор",
        username: "admin",
        role: "super_admin",
        permissions: ["*"],
        is_active: true
      },

      authentication: {
        login_required: false,
        password_required: false,
        session_required: false
      },

      stats
    },
    200,
    request
  );
}

/* ============================================================
   ADMIN STATS
============================================================ */

async function handleAdminStats(request, env) {
  const stats = await getDashboardStats(env);

  return json(
    {
      ok: true,
      stats
    },
    200,
    request
  );
}

async function getDashboardStats(env) {
  const result = {
    publications: {
      total: 0,
      pending: 0,
      published: 0,
      rejected: 0,
      draft: 0,
      archived: 0
    },

    users: {
      total: 0
    },

    chat: {
      total: 0,
      unread: 0
    }
  };

  if (!env.DB) {
    return result;
  }

  try {
    const total = await env.DB
      .prepare(
        "SELECT COUNT(*) AS count FROM publications"
      )
      .first();

    result.publications.total =
      Number(total?.count || 0);
  } catch {}

  for (const status of PUBLICATION_STATUSES) {
    try {
      const row = await env.DB
        .prepare(
          "SELECT COUNT(*) AS count FROM publications WHERE status = ?"
        )
        .bind(status)
        .first();

      result.publications[status] =
        Number(row?.count || 0);
    } catch {}
  }

  try {
    const users = await env.DB
      .prepare(
        `
        SELECT COUNT(DISTINCT user_id) AS count
        FROM publications
        WHERE user_id IS NOT NULL
        `
      )
      .first();

    result.users.total =
      Number(users?.count || 0);
  } catch {}

  try {
    const chat = await env.DB
      .prepare(
        "SELECT COUNT(*) AS count FROM admin_chat"
      )
      .first();

    result.chat.total =
      Number(chat?.count || 0);
  } catch {}

  try {
    const unread = await env.DB
      .prepare(
        `
        SELECT COUNT(*) AS count
        FROM admin_chat
        WHERE sender_type = 'user'
        AND (
          read_at IS NULL
          OR read_at = ''
        )
        `
      )
      .first();

    result.chat.unread =
      Number(unread?.count || 0);
  } catch {}

  return result;
}

/* ============================================================
   PUBLICATIONS LIST
============================================================ */

async function handlePublicationsList(request, env) {
  if (!env.DB) {
    return json(
      {
        ok: false,
        error: "DATABASE_NOT_CONFIGURED"
      },
      500,
      request
    );
  }

  const url = new URL(request.url);

  const status =
    url.searchParams.get("status") ||
    "published";

  const category =
    url.searchParams.get("category");

  const city =
    url.searchParams.get("city");

  const search =
    url.searchParams.get("search") ||
    url.searchParams.get("q");

  const page =
    Math.max(
      1,
      Number(url.searchParams.get("page") || 1)
    );

  const limit =
    Math.min(
      100,
      Math.max(
        1,
        Number(url.searchParams.get("limit") || 20)
      )
    );

  const offset = (page - 1) * limit;

  const conditions = [];
  const bindings = [];

  if (status !== "all") {
    conditions.push("status = ?");
    bindings.push(status);
  }

  if (category) {
    conditions.push("category = ?");
    bindings.push(category);
  }

  if (city) {
    conditions.push("city = ?");
    bindings.push(city);
  }

  if (search) {
    conditions.push(
      `
      (
        title LIKE ?
        OR text LIKE ?
        OR category LIKE ?
        OR city LIKE ?
      )
      `
    );

    const q = `%${search}%`;

    bindings.push(q, q, q, q);
  }

  const where =
    conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

  const sql = `
    SELECT *
    FROM publications
    ${where}
    ORDER BY
      pinned DESC,
      featured DESC,
      COALESCE(published_at, created_at) DESC
    LIMIT ? OFFSET ?
  `;

  bindings.push(limit, offset);

  try {
    const result = await env.DB
      .prepare(sql)
      .bind(...bindings)
      .all();

    const countSql = `
      SELECT COUNT(*) AS count
      FROM publications
      ${where}
    `;

    const countBindings =
      bindings.slice(0, -2);

    const count = await env.DB
      .prepare(countSql)
      .bind(...countBindings)
      .first();

    return json(
      {
        ok: true,

        data: result.results || [],

        pagination: {
          page,
          limit,
          total: Number(count?.count || 0),
          pages: Math.ceil(
            Number(count?.count || 0) / limit
          )
        }
      },
      200,
      request
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error: "PUBLICATIONS_QUERY_FAILED",
        message: error.message
      },
      500,
      request
    );
  }
}

/* ============================================================
   GET PUBLICATION
============================================================ */

async function handlePublicationById(
  request,
  env,
  id
) {
  if (!env.DB) {
    return json(
      {
        ok: false,
        error: "DATABASE_NOT_CONFIGURED"
      },
      500,
      request
    );
  }

  try {
    const publication = await env.DB
      .prepare(
        `
        SELECT *
        FROM publications
        WHERE id = ?
        LIMIT 1
        `
      )
      .bind(id)
      .first();

    if (!publication) {
      return json(
        {
          ok: false,
          error: "PUBLICATION_NOT_FOUND"
        },
        404,
        request
      );
    }

    try {
      await env.DB
        .prepare(
          `
          UPDATE publications
          SET views = COALESCE(views, 0) + 1
          WHERE id = ?
          `
        )
        .bind(id)
        .run();

      publication.views =
        Number(publication.views || 0) + 1;
    } catch {}

    let media = [];

    try {
      const mediaResult = await env.DB
        .prepare(
          `
          SELECT *
          FROM publication_media
          WHERE publication_id = ?
          ORDER BY id ASC
          `
        )
        .bind(id)
        .all();

      media = mediaResult.results || [];
    } catch {}

    return json(
      {
        ok: true,
        publication,
        media
      },
      200,
      request
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error: "PUBLICATION_QUERY_FAILED",
        message: error.message
      },
      500,
      request
    );
  }
}

/* ============================================================
   CREATE PUBLICATION
============================================================ */

async function handleCreatePublication(
  request,
  env
) {
  if (!env.DB) {
    return json(
      {
        ok: false,
        error: "DATABASE_NOT_CONFIGURED"
      },
      500,
      request
    );
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return json(
      {
        ok: false,
        error: "INVALID_JSON"
      },
      400,
      request
    );
  }

  const now = new Date().toISOString();

  const id =
    body.id ||
    crypto.randomUUID();

  const trackingCode =
    body.tracking_code ||
    createTrackingCode();

  const status =
    body.status &&
    PUBLICATION_STATUSES.includes(body.status)
      ? body.status
      : "pending";

  const fields = {
    id,
    user_id: body.user_id || null,

    title: cleanString(body.title),
    text: cleanString(body.text),

    category: cleanString(body.category),
    city: cleanString(body.city),
    country: cleanString(body.country),

    hashtags: cleanString(body.hashtags),
    media: cleanString(body.media),

    status,

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

    price: cleanString(body.price),

    pinned: body.pinned ? 1 : 0,
    featured: body.featured ? 1 : 0,

    created_at: body.created_at || now,
    updated_at: now,

    tracking_code: trackingCode,

    subcategory: cleanString(body.subcategory),
    location: cleanString(body.location),
    scope: cleanString(body.scope),

    event_start: cleanString(body.event_start),
    event_end: cleanString(body.event_end),
    deadline: cleanString(body.deadline),

    currency: cleanString(body.currency),
    employment_type: cleanString(body.employment_type),
    experience: cleanString(body.experience),

    published_at:
      status === "published"
        ? now
        : null,

    rejection_reason:
      cleanString(body.rejection_reason),

    translate_all:
      body.translate_all ? 1 : 0,

    language:
      cleanString(body.language) || "ru",

    contact_telegram:
      cleanString(body.contact_telegram),

    contact_email:
      cleanString(body.contact_email),

    contact_phone:
      cleanString(body.contact_phone),

    contact_name:
      cleanString(body.contact_name),

    education:
      cleanString(body.education),

    work_format:
      cleanString(body.work_format),

    external_url:
      cleanString(body.external_url),

    languages:
      cleanString(body.languages)
  };

  try {
    const columns = Object.keys(fields);

    const placeholders =
      columns.map(() => "?").join(", ");

    const values =
      columns.map((column) => fields[column]);

    const sql = `
      INSERT INTO publications
      (${columns.join(", ")})
      VALUES
      (${placeholders})
    `;

    await env.DB
      .prepare(sql)
      .bind(...values)
      .run();

    await writeAuditLog(
      env,
      "publication_created",
      id,
      {
        title: fields.title,
        status
      }
    );

    return json(
      {
        ok: true,
        message: "Publication created",
        publication: fields,
        tracking_code: trackingCode
      },
      201,
      request
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error: "PUBLICATION_CREATE_FAILED",
        message: error.message
      },
      500,
      request
    );
  }
}

/* ============================================================
   ADMIN PUBLICATIONS
============================================================ */

async function handleAdminPublications(
  request,
  env,
  ctx
) {
  const url = new URL(request.url);
  const path = normalizePath(url.pathname);

  if (path === "/api/admin/publications") {
    if (request.method === "GET") {
      return handleAdminPublicationList(
        request,
        env
      );
    }

    if (request.method === "POST") {
      return handleCreatePublication(
        request,
        env
      );
    }

    return json(
      {
        ok: false,
        error: "METHOD_NOT_ALLOWED"
      },
      405,
      request
    );
  }

  const match = path.match(
    /^\/api\/admin\/publications\/([^/]+)(?:\/([^/]+))?$/
  );

  if (!match) {
    return json(
      {
        ok: false,
        error: "INVALID_PUBLICATION_ROUTE"
      },
      400,
      request
    );
  }

  const id =
    decodeURIComponent(match[1]);

  const action =
    match[2]
      ? decodeURIComponent(match[2])
      : null;

  if (action) {
    return handlePublicationAction(
      request,
      env,
      id,
      action
    );
  }

  if (
    request.method === "GET"
  ) {
    return handlePublicationById(
      request,
      env,
      id
    );
  }

  if (
    request.method === "PUT" ||
    request.method === "PATCH"
  ) {
    return handleAdminPublicationUpdate(
      request,
      env,
      id
    );
  }

  if (
    request.method === "DELETE"
  ) {
    return handleAdminPublicationDelete(
      request,
      env,
      id
    );
  }

  return json(
    {
      ok: false,
      error: "METHOD_NOT_ALLOWED"
    },
    405,
    request
  );
}

/* ============================================================
   ADMIN PUBLICATION LIST
============================================================ */

async function handleAdminPublicationList(
  request,
  env
) {
  const url = new URL(request.url);

  const status =
    url.searchParams.get("status") ||
    "all";

  const page =
    Math.max(
      1,
      Number(url.searchParams.get("page") || 1)
    );

  const limit =
    Math.min(
      100,
      Math.max(
        1,
        Number(url.searchParams.get("limit") || 50)
      )
    );

  const offset = (page - 1) * limit;

  const conditions = [];
  const bindings = [];

  if (
    status !== "all" &&
    PUBLICATION_STATUSES.includes(status)
  ) {
    conditions.push("status = ?");
    bindings.push(status);
  }

  const where =
    conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

  try {
    const result = await env.DB
      .prepare(
        `
        SELECT *
        FROM publications
        ${where}
        ORDER BY
          pinned DESC,
          featured DESC,
          created_at DESC
        LIMIT ? OFFSET ?
        `
      )
      .bind(
        ...bindings,
        limit,
        offset
      )
      .all();

    const count = await env.DB
      .prepare(
        `
        SELECT COUNT(*) AS count
        FROM publications
        ${where}
        `
      )
      .bind(...bindings)
      .first();

    return json(
      {
        ok: true,
        data: result.results || [],
        pagination: {
          page,
          limit,
          total: Number(count?.count || 0),
          pages: Math.ceil(
            Number(count?.count || 0) /
              limit
          )
        }
      },
      200,
      request
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error: "ADMIN_PUBLICATIONS_FAILED",
        message: error.message
      },
      500,
      request
    );
  }
}

/* ============================================================
   PUBLICATION ACTIONS
============================================================ */

async function handlePublicationAction(
  request,
  env,
  id,
  action
) {
  const actions = {
    approve: "published",
    publish: "published",
    reject: "rejected",
    archive: "archived",
    draft: "draft"
  };

  if (action === "pin") {
    return updatePublicationFlag(
      request,
      env,
      id,
      "pinned",
      1
    );
  }

  if (action === "unpin") {
    return updatePublicationFlag(
      request,
      env,
      id,
      "pinned",
      0
    );
  }

  if (action === "feature") {
    return updatePublicationFlag(
      request,
      env,
      id,
      "featured",
      1
    );
  }

  if (action === "unfeature") {
    return updatePublicationFlag(
      request,
      env,
      id,
      "featured",
      0
    );
  }

  if (actions[action]) {
    const status = actions[action];

    const now =
      new Date().toISOString();

    try {
      await env.DB
        .prepare(
          `
          UPDATE publications
          SET
            status = ?,
            updated_at = ?,
            published_at =
              CASE
                WHEN ? = 'published'
                THEN COALESCE(published_at, ?)
                ELSE published_at
              END
          WHERE id = ?
          `
        )
        .bind(
          status,
          now,
          status,
          now,
          id
        )
        .run();

      await writeAuditLog(
        env,
        `publication_${action}`,
        id,
        { status }
      );

      return json(
        {
          ok: true,
          id,
          status
        },
        200,
        request
      );
    } catch (error) {
      return json(
        {
          ok: false,
          error: "PUBLICATION_ACTION_FAILED",
          message: error.message
        },
        500,
        request
      );
    }
  }

  return json(
    {
      ok: false,
      error: "UNKNOWN_PUBLICATION_ACTION"
    },
    400,
    request
  );
}

/* ============================================================
   PUBLICATION FLAG
============================================================ */

async function updatePublicationFlag(
  request,
  env,
  id,
  field,
  value
) {
  if (
    field !== "pinned" &&
    field !== "featured"
  ) {
    return json(
      {
        ok: false,
        error: "INVALID_FLAG"
      },
      400,
      request
    );
  }

  try {
    await env.DB
      .prepare(
        `
        UPDATE publications
        SET
          ${field} = ?,
          updated_at = ?
        WHERE id = ?
        `
      )
      .bind(
        value,
        new Date().toISOString(),
        id
      )
      .run();

    await writeAuditLog(
      env,
      `publication_${field}`,
      id,
      { value }
    );

    return json(
      {
        ok: true,
        id,
        [field]: value
      },
      200,
      request
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error: "PUBLICATION_FLAG_FAILED",
        message: error.message
      },
      500,
      request
    );
  }
}

/* ============================================================
   UPDATE PUBLICATION
============================================================ */

async function handleAdminPublicationUpdate(
  request,
  env,
  id
) {
  let body;

  try {
    body = await request.json();
  } catch {
    return json(
      {
        ok: false,
        error: "INVALID_JSON"
      },
      400,
      request
    );
  }

  const allowed = [
    "title",
    "text",
    "category",
    "city",
    "country",
    "hashtags",
    "media",
    "status",
    "price",
    "pinned",
    "featured",
    "subcategory",
    "location",
    "scope",
    "event_start",
    "event_end",
    "deadline",
    "currency",
    "employment_type",
    "experience",
    "rejection_reason",
    "translate_all",
    "language",
    "contact_telegram",
    "contact_email",
    "contact_phone",
    "contact_name",
    "education",
    "work_format",
    "external_url",
    "languages"
  ];

  const updates = [];
  const values = [];

  for (const field of allowed) {
    if (
      Object.prototype.hasOwnProperty.call(
        body,
        field
      )
    ) {
      updates.push(`${field} = ?`);

      if (
        field === "pinned" ||
        field === "featured" ||
        field === "translate_all"
      ) {
        values.push(
          body[field] ? 1 : 0
        );
      } else {
        values.push(
          cleanString(body[field])
        );
      }
    }
  }

  if (!updates.length) {
    return json(
      {
        ok: false,
        error: "NOTHING_TO_UPDATE"
      },
      400,
      request
    );
  }

  updates.push(
    "updated_at = ?"
  );

  values.push(
    new Date().toISOString()
  );

  values.push(id);

  try {
    await env.DB
      .prepare(
        `
        UPDATE publications
        SET ${updates.join(", ")}
        WHERE id = ?
        `
      )
      .bind(...values)
      .run();

    await writeAuditLog(
      env,
      "publication_updated",
      id,
      body
    );

    return json(
      {
        ok: true,
        message: "Publication updated"
      },
      200,
      request
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error: "PUBLICATION_UPDATE_FAILED",
        message: error.message
      },
      500,
      request
    );
  }
}

/* ============================================================
   DELETE PUBLICATION
============================================================ */

async function handleAdminPublicationDelete(
  request,
  env,
  id
) {
  try {
    await env.DB
      .prepare(
        `
        DELETE FROM publications
        WHERE id = ?
        `
      )
      .bind(id)
      .run();

    try {
      await env.DB
        .prepare(
          `
          DELETE FROM publication_media
          WHERE publication_id = ?
          `
        )
        .bind(id)
        .run();
    } catch {}

    await writeAuditLog(
      env,
      "publication_deleted",
      id,
      {}
    );

    return json(
      {
        ok: true,
        message: "Publication deleted"
      },
      200,
      request
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error: "PUBLICATION_DELETE_FAILED",
        message: error.message
      },
      500,
      request
    );
  }
}

/* ============================================================
   ADMIN USERS
============================================================ */

async function handleAdminUsers(
  request,
  env,
  ctx
) {
  const url = new URL(request.url);
  const path = normalizePath(url.pathname);

  if (path === "/api/admin/users") {
    if (request.method === "GET") {
      return handleAdminUsersList(
        request,
        env
      );
    }

    return json(
      {
        ok: false,
        error: "METHOD_NOT_ALLOWED"
      },
      405,
      request
    );
  }

  const match = path.match(
    /^\/api\/admin\/users\/([^/]+)(?:\/([^/]+))?$/
  );

  if (!match) {
    return json(
      {
        ok: false,
        error: "INVALID_USER_ROUTE"
      },
      400,
      request
    );
  }

  const userId =
    decodeURIComponent(match[1]);

  const action =
    match[2]
      ? decodeURIComponent(match[2])
      : null;

  if (
    action === "ban" ||
    action === "unban"
  ) {
    return handleUserBanAction(
      request,
      env,
      userId,
      action
    );
  }

  if (
    action === "delete"
  ) {
    return handleUserDelete(
      request,
      env,
      userId
    );
  }

  if (
    request.method === "PUT" ||
    request.method === "PATCH"
  ) {
    return handleUserUpdate(
      request,
      env,
      userId
    );
  }

  return json(
    {
      ok: false,
      error: "USER_ROUTE_NOT_FOUND"
    },
    404,
    request
  );
}

/* ============================================================
   USERS LIST
============================================================ */

async function handleAdminUsersList(
  request,
  env
) {
  if (!env.DB) {
    return json(
      {
        ok: false,
        error: "DATABASE_NOT_CONFIGURED"
      },
      500,
      request
    );
  }

  try {
    const result = await env.DB
      .prepare(
        `
        SELECT
          user_id,
          COUNT(*) AS publications_count,
          MAX(created_at) AS last_activity
        FROM publications
        WHERE user_id IS NOT NULL
        GROUP BY user_id
        ORDER BY last_activity DESC
        LIMIT 500
        `
      )
      .all();

    return json(
      {
        ok: true,
        users: result.results || []
      },
      200,
      request
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error: "USERS_QUERY_FAILED",
        message: error.message
      },
      500,
      request
    );
  }
}

/* ============================================================
   USER ACTIONS
============================================================ */

async function handleUserBanAction(
  request,
  env,
  userId,
  action
) {
  /*
    The project currently stores user information mainly
    through publications.user_id.

    If a dedicated users table exists, this block will try
    to update it.
  */

  const active =
    action === "unban";

  try {
    await env.DB
      .prepare(
        `
        UPDATE users
        SET is_banned = ?
        WHERE id = ?
        `
      )
      .bind(
        active ? 0 : 1,
        userId
      )
      .run();
  } catch {}

  await writeAuditLog(
    env,
    `user_${action}`,
    userId,
    {}
  );

  return json(
    {
      ok: true,
      user_id: userId,
      action
    },
    200,
    request
  );
}

async function handleUserDelete(
  request,
  env,
  userId
) {
  try {
    await env.DB
      .prepare(
        `
        DELETE FROM users
        WHERE id = ?
        `
      )
      .bind(userId)
      .run();
  } catch {}

  await writeAuditLog(
    env,
    "user_deleted",
    userId,
    {}
  );

  return json(
    {
      ok: true,
      user_id: userId
    },
    200,
    request
  );
}

async function handleUserUpdate(
  request,
  env,
  userId
) {
  let body;

  try {
    body = await request.json();
  } catch {
    return json(
      {
        ok: false,
        error: "INVALID_JSON"
      },
      400,
      request
    );
  }

  const allowed = [
    "name",
    "username",
    "email",
    "phone",
    "is_banned",
    "is_active"
  ];

  const updates = [];
  const values = [];

  for (const field of allowed) {
    if (
      Object.prototype.hasOwnProperty.call(
        body,
        field
      )
    ) {
      updates.push(
        `${field} = ?`
      );

      if (
        field === "is_banned" ||
        field === "is_active"
      ) {
        values.push(
          body[field] ? 1 : 0
        );
      } else {
        values.push(
          cleanString(body[field])
        );
      }
    }
  }

  if (!updates.length) {
    return json(
      {
        ok: false,
        error: "NOTHING_TO_UPDATE"
      },
      400,
      request
    );
  }

  values.push(userId);

  try {
    await env.DB
      .prepare(
        `
        UPDATE users
        SET ${updates.join(", ")}
        WHERE id = ?
        `
      )
      .bind(...values)
      .run();

    return json(
      {
        ok: true,
        user_id: userId
      },
      200,
      request
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error: "USER_UPDATE_FAILED",
        message: error.message
      },
      500,
      request
    );
  }
}

/* ============================================================
   ADMIN CHAT MANAGEMENT
============================================================ */

async function handleAdminChatManagement(
  request,
  env,
  ctx
) {
  const url = new URL(request.url);
  const path = normalizePath(url.pathname);

  if (path === "/api/admin/chat") {
    if (request.method === "GET") {
      return handleAdminChatList(
        request,
        env
      );
    }

    if (request.method === "POST") {
      return handleAdminChatSend(
        request,
        env
      );
    }
  }

  const match = path.match(
    /^\/api\/admin\/chat\/([^/]+)$/
  );

  if (match) {
    const id =
      decodeURIComponent(match[1]);

    if (request.method === "GET") {
      return handleAdminChatConversation(
        request,
        env,
        id
      );
    }

    if (
      request.method === "PATCH" ||
      request.method === "PUT"
    ) {
      return handleAdminChatUpdate(
        request,
        env,
        id
      );
    }
  }

  return json(
    {
      ok: false,
      error: "CHAT_ROUTE_NOT_FOUND"
    },
    404,
    request
  );
}

/* ============================================================
   PUBLIC CHAT
============================================================ */

async function handleAdminChat(
  request,
  env,
  ctx
) {
  if (!env.DB) {
    return json(
      {
        ok: false,
        error: "DATABASE_NOT_CONFIGURED"
      },
      500,
      request
    );
  }

  const url = new URL(request.url);
  const path = normalizePath(url.pathname);

  if (path === "/api/admin-chat") {
    if (request.method === "GET") {
      return handlePublicChatList(
        request,
        env
      );
    }

    if (request.method === "POST") {
      return handlePublicChatSend(
        request,
        env
      );
    }
  }

  const match = path.match(
    /^\/api\/admin-chat\/([^/]+)$/
  );

  if (match) {
    const id =
      decodeURIComponent(match[1]);

    if (request.method === "GET") {
      return handlePublicChatConversation(
        request,
        env,
        id
      );
    }

    if (
      request.method === "PATCH" ||
      request.method === "PUT"
    ) {
      return handlePublicChatUpdate(
        request,
        env,
        id
      );
    }
  }

  return json(
    {
      ok: false,
      error: "CHAT_ROUTE_NOT_FOUND"
    },
    404,
    request
  );
}

/* ============================================================
   PUBLIC CHAT LIST
============================================================ */

async function handlePublicChatList(
  request,
  env
) {
  try {
    const result = await env.DB
      .prepare(
        `
        SELECT *
        FROM admin_chat
        ORDER BY created_at DESC
        LIMIT 200
        `
      )
      .all();

    return json(
      {
        ok: true,
        messages: result.results || []
      },
      200,
      request
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error: "CHAT_LIST_FAILED",
        message: error.message
      },
      500,
      request
    );
  }
}

/* ============================================================
   PUBLIC CHAT SEND
============================================================ */

async function handlePublicChatSend(
  request,
  env
) {
  let body;

  try {
    body = await request.json();
  } catch {
    return json(
      {
        ok: false,
        error: "INVALID_JSON"
      },
      400,
      request
    );
  }

  const message =
    cleanString(
      body.message ||
      body.text ||
      body.content
    );

  if (!message) {
    return json(
      {
        ok: false,
        error: "MESSAGE_REQUIRED"
      },
      400,
      request
    );
  }

  const id =
    crypto.randomUUID();

  const now =
    new Date().toISOString();

  const conversationId =
    cleanString(
      body.conversation_id
    ) ||
    cleanString(
      body.user_id
    ) ||
    crypto.randomUUID();

  const senderName =
    cleanString(
      body.name ||
      body.sender_name ||
      "Пользователь"
    );

  try {
    await ensureAdminChatTable(env);

    await env.DB
      .prepare(
        `
        INSERT INTO admin_chat
        (
          id,
          conversation_id,
          sender_type,
          sender_name,
          user_id,
          message,
          created_at,
          read_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `
      )
      .bind(
        id,
        conversationId,
        "user",
        senderName,
        cleanString(body.user_id),
        message,
        now,
        null
      )
      .run();

    return json(
      {
        ok: true,
        id,
        conversation_id: conversationId,
        message: "Message sent"
      },
      201,
      request
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error: "CHAT_SEND_FAILED",
        message: error.message
      },
      500,
      request
    );
  }
}

/* ============================================================
   PUBLIC CHAT CONVERSATION
============================================================ */

async function handlePublicChatConversation(
  request,
  env,
  conversationId
) {
  try {
    const result = await env.DB
      .prepare(
        `
        SELECT *
        FROM admin_chat
        WHERE conversation_id = ?
        ORDER BY created_at ASC
        `
      )
      .bind(conversationId)
      .all();

    return json(
      {
        ok: true,
        conversation_id: conversationId,
        messages: result.results || []
      },
      200,
      request
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error: "CHAT_CONVERSATION_FAILED",
        message: error.message
      },
      500,
      request
    );
  }
}

/* ============================================================
   PUBLIC CHAT UPDATE
============================================================ */

async function handlePublicChatUpdate(
  request,
  env,
  id
) {
  return handleChatUpdate(
    request,
    env,
    id
  );
}

/* ============================================================
   ADMIN CHAT LIST
============================================================ */

async function handleAdminChatList(
  request,
  env
) {
  try {
    await ensureAdminChatTable(env);

    const result = await env.DB
      .prepare(
        `
        SELECT *
        FROM admin_chat
        ORDER BY created_at DESC
        LIMIT 500
        `
      )
      .all();

    return json(
      {
        ok: true,
        messages: result.results || []
      },
      200,
      request
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error: "ADMIN_CHAT_LIST_FAILED",
        message: error.message
      },
      500,
      request
    );
  }
}

/* ============================================================
   ADMIN CHAT SEND
============================================================ */

async function handleAdminChatSend(
  request,
  env
) {
  let body;

  try {
    body = await request.json();
  } catch {
    return json(
      {
        ok: false,
        error: "INVALID_JSON"
      },
      400,
      request
    );
  }

  const message =
    cleanString(
      body.message ||
      body.text ||
      body.content
    );

  if (!message) {
    return json(
      {
        ok: false,
        error: "MESSAGE_REQUIRED"
      },
      400,
      request
    );
  }

  const id =
    crypto.randomUUID();

  const now =
    new Date().toISOString();

  const conversationId =
    cleanString(
      body.conversation_id
    ) ||
    cleanString(
      body.user_id
    ) ||
    crypto.randomUUID();

  try {
    await ensureAdminChatTable(env);

    await env.DB
      .prepare(
        `
        INSERT INTO admin_chat
        (
          id,
          conversation_id,
          sender_type,
          sender_name,
          user_id,
          message,
          created_at,
          read_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `
      )
      .bind(
        id,
        conversationId,
        "admin",
        "Главный администратор",
        null,
        message,
        now,
        now
      )
      .run();

    return json(
      {
        ok: true,
        id,
        conversation_id: conversationId
      },
      201,
      request
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error: "ADMIN_CHAT_SEND_FAILED",
        message: error.message
      },
      500,
      request
    );
  }
}

/* ============================================================
   ADMIN CHAT CONVERSATION
============================================================ */

async function handleAdminChatConversation(
  request,
  env,
  conversationId
) {
  return handlePublicChatConversation(
    request,
    env,
    conversationId
  );
}

/* ============================================================
   ADMIN CHAT UPDATE
============================================================ */

async function handleAdminChatUpdate(
  request,
  env,
  id
) {
  return handleChatUpdate(
    request,
    env,
    id
  );
}

/* ============================================================
   CHAT UPDATE
============================================================ */

async function handleChatUpdate(
  request,
  env,
  id
) {
  let body;

  try {
    body = await request.json();
  } catch {
    body = {};
  }

  try {
    if (
      body.read === true ||
      body.read_at
    ) {
      await env.DB
        .prepare(
          `
          UPDATE admin_chat
          SET read_at = ?
          WHERE id = ?
          `
        )
        .bind(
          body.read_at ||
            new Date().toISOString(),
          id
        )
        .run();
    }

    return json(
      {
        ok: true,
        id
      },
      200,
      request
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error: "CHAT_UPDATE_FAILED",
        message: error.message
      },
      500,
      request
    );
  }
}

/* ============================================================
   CHAT TABLE
============================================================ */

async function ensureAdminChatTable(env) {
  if (!env.DB) {
    throw new Error(
      "Database is not configured"
    );
  }

  try {
    await env.DB
      .prepare(
        `
        CREATE TABLE IF NOT EXISTS admin_chat (
          id TEXT PRIMARY KEY,
          conversation_id TEXT,
          sender_type TEXT,
          sender_name TEXT,
          user_id TEXT,
          message TEXT,
          created_at TEXT,
          read_at TEXT
        )
        `
      )
      .run();
  } catch (error) {
    console.error(
      "CHAT_TABLE_ERROR:",
      error
    );
  }
}

/* ============================================================
   ADMIN NOTIFICATIONS
============================================================ */

async function handleAdminNotifications(
  request,
  env
) {
  if (request.method === "GET") {
    return handleNotifications(
      request,
      env
    );
  }

  if (
    request.method === "POST"
  ) {
    let body;

    try {
      body = await request.json();
    } catch {
      return json(
        {
          ok: false,
          error: "INVALID_JSON"
        },
        400,
        request
      );
    }

    try {
      await ensureNotificationsTable(
        env
      );

      const id =
        crypto.randomUUID();

      const now =
        new Date().toISOString();

      await env.DB
        .prepare(
          `
          INSERT INTO notifications
          (
            id,
            user_id,
            title,
            message,
            type,
            is_read,
            created_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
          `
        )
        .bind(
          id,
          cleanString(body.user_id),
          cleanString(body.title),
          cleanString(body.message),
          cleanString(body.type) ||
            "system",
          0,
          now
        )
        .run();

      return json(
        {
          ok: true,
          id
        },
        201,
        request
      );
    } catch (error) {
      return json(
        {
          ok: false,
          error: "NOTIFICATION_CREATE_FAILED",
          message: error.message
        },
        500,
        request
      );
    }
  }

  return json(
    {
      ok: false,
      error: "METHOD_NOT_ALLOWED"
    },
    405,
    request
  );
}

/* ============================================================
   PUBLIC NOTIFICATIONS
============================================================ */

async function handleNotifications(
  request,
  env
) {
  if (request.method !== "GET") {
    return json(
      {
        ok: false,
        error: "METHOD_NOT_ALLOWED"
      },
      405,
      request
    );
  }

  try {
    await ensureNotificationsTable(
      env
    );

    const url = new URL(request.url);

    const userId =
      url.searchParams.get(
        "user_id"
      );

    let result;

    if (userId) {
      result = await env.DB
        .prepare(
          `
          SELECT *
          FROM notifications
          WHERE user_id = ?
             OR user_id IS NULL
          ORDER BY created_at DESC
          LIMIT 100
          `
        )
        .bind(userId)
        .all();
    } else {
      result = await env.DB
        .prepare(
          `
          SELECT *
          FROM notifications
          ORDER BY created_at DESC
          LIMIT 100
          `
        )
        .all();
    }

    return json(
      {
        ok: true,
        notifications:
          result.results || []
      },
      200,
      request
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error: "NOTIFICATIONS_FAILED",
        message: error.message
      },
      500,
      request
    );
  }
}

/* ============================================================
   NOTIFICATIONS TABLE
============================================================ */

async function ensureNotificationsTable(
  env
) {
  await env.DB
    .prepare(
      `
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        title TEXT,
        message TEXT,
        type TEXT,
        is_read INTEGER DEFAULT 0,
        created_at TEXT
      )
      `
    )
    .run();
}

/* ============================================================
   ADMIN AUDIT
============================================================ */

async function handleAdminAudit(
  request,
  env
) {
  try {
    await ensureAuditTable(env);

    const url = new URL(request.url);

    const limit =
      Math.min(
        500,
        Math.max(
          1,
          Number(
            url.searchParams.get(
              "limit"
            ) || 100
          )
        )
      );

    const result = await env.DB
      .prepare(
        `
        SELECT *
        FROM audit_log
        ORDER BY created_at DESC
        LIMIT ?
        `
      )
      .bind(limit)
      .all();

    return json(
      {
        ok: true,
        logs: result.results || []
      },
      200,
      request
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error: "AUDIT_FAILED",
        message: error.message
      },
      500,
      request
    );
  }
}

/* ============================================================
   AUDIT TABLE
============================================================ */

async function ensureAuditTable(env) {
  await env.DB
    .prepare(
      `
      CREATE TABLE IF NOT EXISTS audit_log (
        id TEXT PRIMARY KEY,
        action TEXT,
        target_id TEXT,
        data TEXT,
        created_at TEXT
      )
      `
    )
    .run();
}

async function writeAuditLog(
  env,
  action,
  targetId,
  data
) {
  if (!env.DB) {
    return;
  }

  try {
    await ensureAuditTable(env);

    await env.DB
      .prepare(
        `
        INSERT INTO audit_log
        (
          id,
          action,
          target_id,
          data,
          created_at
        )
        VALUES (?, ?, ?, ?, ?)
        `
      )
      .bind(
        crypto.randomUUID(),
        action,
        targetId || null,
        JSON.stringify(
          data || {}
        ),
        new Date().toISOString()
      )
      .run();
  } catch (error) {
    console.error(
      "AUDIT_WRITE_ERROR:",
      error
    );
  }
}

/* ============================================================
   LEGACY OPPORTUNITIES
============================================================ */

async function handleLegacyOpportunities(
  request,
  env
) {
  if (request.method === "GET") {
    return handlePublicationsList(
      request,
      env
    );
  }

  if (request.method === "POST") {
    return handleCreatePublication(
      request,
      env
    );
  }

  return json(
    {
      ok: false,
      error: "METHOD_NOT_ALLOWED"
    },
    405,
    request
  );
}

/* ============================================================
   LEGACY MESSAGES
============================================================ */

async function handleLegacyMessages(
  request,
  env
) {
  if (request.method === "GET") {
    return handlePublicChatList(
      request,
      env
    );
  }

  if (request.method === "POST") {
    return handlePublicChatSend(
      request,
      env
    );
  }

  return json(
    {
      ok: false,
      error: "METHOD_NOT_ALLOWED"
    },
    405,
    request
  );
}

/* ============================================================
   HELPERS
============================================================ */

function normalizePath(path) {
  if (!path) {
    return "/";
  }

  let result =
    path.replace(
      /\/+/g,
      "/"
    );

  if (
    result.length > 1 &&
    result.endsWith("/")
  ) {
    result =
      result.slice(
        0,
        -1
      );
  }

  return result;
}

function cleanString(value) {
  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }

  if (
    typeof value === "object"
  ) {
    try {
      return JSON.stringify(
        value
      );
    } catch {
      return null;
    }
  }

  return String(value)
    .trim();
}

function createTrackingCode() {
  const timestamp =
    Date.now()
      .toString(36)
      .toUpperCase();

  const random =
    crypto.randomUUID()
      .replace(/-/g, "")
      .slice(0, 8)
      .toUpperCase();

  return `TO-${timestamp}-${random}`;
}

/* ============================================================
   JSON RESPONSE
============================================================ */

function json(
  data,
  status = 200,
  request = null
) {
  const headers =
    new Headers();

  headers.set(
    "Content-Type",
    "application/json; charset=utf-8"
  );

  headers.set(
    "Cache-Control",
    "no-store"
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

  if (request) {
    applyCors(
      headers,
      request
    );
  }

  return new Response(
    JSON.stringify(data),
    {
      status,
      headers
    }
  );
}

/* ============================================================
   CORS
============================================================ */

function corsResponse(request) {
  const headers =
    new Headers();

  applyCors(
    headers,
    request
  );

  headers.set(
    "Access-Control-Allow-Headers",
    [
      "Content-Type",
      "Accept",
      "X-Admin-Key",
      "X-Admin-ID",
      "X-Admin-Username"
    ].join(", ")
  );

  headers.set(
    "Access-Control-Allow-Methods",
    ALLOWED_METHODS.join(", ")
  );

  return new Response(
    null,
    {
      status: 204,
      headers
    }
  );
}

function applyCors(
  headers,
  request
) {
  const origin =
    request.headers.get(
      "Origin"
    );

  /*
    Since authentication and cookies are no longer used,
    credentials are not required.
  */

  if (origin) {
    headers.set(
      "Access-Control-Allow-Origin",
      origin
    );

    headers.set(
      "Vary",
      "Origin"
    );
  } else {
    headers.set(
      "Access-Control-Allow-Origin",
      "https://tajik-opportunities.com"
    );
  }
}

/* ============================================================
   SECURITY HEADERS
============================================================ */

function withSecurity(
  response,
  request
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
    "Cross-Origin-Resource-Policy",
    "same-origin"
  );

  headers.set(
    "Access-Control-Allow-Origin",
    request.headers.get("Origin") ||
      "https://tajik-opportunities.com"
  );

  headers.set(
    "Vary",
    "Origin"
  );

  return new Response(
    response.body,
    {
      status: response.status,
      statusText: response.statusText,
      headers
    }
  );
           }
