/* ============================================================
   TAJIK OPPORTUNITIES
   CLOUDFLARE WORKER
   PUBLIC + ADMIN API
   Без регистрации участников
   Без логина участников
   Без пароля администратора

   Участник:
   title + content -> pending

   Администратор:
   /admin.html -> сразу открывается
   ============================================================ */

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...JSON_HEADERS,
      ...CORS_HEADERS
    }
  });
}

function ok(data = {}) {
  return json({
    ok: true,
    ...data
  });
}

function error(message, status = 400, extra = {}) {
  return json({
    ok: false,
    error: message,
    message,
    ...extra
  }, status);
}

function now() {
  return new Date().toISOString();
}

function id(prefix = "pub") {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`;
}

function clean(value, max = 200000) {
  if (value === null || value === undefined) return "";
  return String(value).trim().slice(0, max);
}

async function readBody(request) {
  const contentType = request.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      return await request.json();
    }

    if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      const form = await request.formData();
      const result = {};

      for (const [key, value] of form.entries()) {
        result[key] = typeof value === "string"
          ? value
          : "";
      }

      return result;
    }

    const text = await request.text();

    if (!text) return {};

    try {
      return JSON.parse(text);
    } catch {
      return {
        content: text
      };
    }
  } catch {
    return {};
  }
}


/* ============================================================
   DATABASE
   Используется НОВАЯ таблица.
   Это специально сделано, чтобы старые кривые схемы D1
   не ломали отправку публикаций.
   ============================================================ */

async function initDB(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS to_publications (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',

      status TEXT NOT NULL DEFAULT 'pending',
      visibility TEXT NOT NULL DEFAULT 'private',

      category TEXT NOT NULL DEFAULT '',
      type TEXT NOT NULL DEFAULT '',

      image_url TEXT NOT NULL DEFAULT '',
      video_url TEXT NOT NULL DEFAULT '',
      audio_url TEXT NOT NULL DEFAULT '',
      music_url TEXT NOT NULL DEFAULT '',
      link_url TEXT NOT NULL DEFAULT '',

      media_json TEXT NOT NULL DEFAULT '[]',

      likes INTEGER NOT NULL DEFAULT 0,
      comments_count INTEGER NOT NULL DEFAULT 0,
      shares INTEGER NOT NULL DEFAULT 0,
      saves INTEGER NOT NULL DEFAULT 0,
      views INTEGER NOT NULL DEFAULT 0,
      reports INTEGER NOT NULL DEFAULT 0,

      pinned INTEGER NOT NULL DEFAULT 0,
      featured INTEGER NOT NULL DEFAULT 0,

      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      published_at TEXT,

      rejection_reason TEXT NOT NULL DEFAULT ''
    )
  `).run();

  await db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_to_publications_status
    ON to_publications(status)
  `).run();

  await db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_to_publications_created
    ON to_publications(created_at)
  `).run();
}


/* ============================================================
   НОРМАЛИЗАЦИЯ ПУБЛИКАЦИИ
   Поддерживаются разные названия полей старого frontend.
   ============================================================ */

function normalizePublication(data) {
  const title = clean(
    data.title ??
    data.heading ??
    data.name ??
    data.post_title ??
    ""
  , 500);

  const content = clean(
    data.content ??
    data.text ??
    data.description ??
    data.body ??
    data.post_content ??
    ""
  );

  let media = data.media;

  if (!Array.isArray(media)) {
    media = [];
  }

  media = media
    .map(item => {
      if (typeof item === "string") {
        return {
          type: "link",
          url: clean(item, 5000)
        };
      }

      if (!item || typeof item !== "object") return null;

      return {
        type: clean(item.type || "other", 50),
        url: clean(item.url || item.src || "", 5000),
        title: clean(item.title || "", 500),
        description: clean(item.description || "", 2000)
      };
    })
    .filter(x => x && x.url);

  return {
    title,
    content,

    category: clean(
      data.category ??
      data.category_name ??
      ""
    , 200),

    type: clean(
      data.type ??
      data.publication_type ??
      ""
    , 100),

    image_url: clean(
      data.image_url ??
      data.image ??
      data.photo ??
      ""
    , 5000),

    video_url: clean(
      data.video_url ??
      data.video ??
      ""
    , 5000),

    audio_url: clean(
      data.audio_url ??
      data.audio ??
      ""
    , 5000),

    music_url: clean(
      data.music_url ??
      data.music ??
      ""
    , 5000),

    link_url: clean(
      data.link_url ??
      data.link ??
      ""
    , 5000),

    media
  };
}


/* ============================================================
   PUBLICATION -> FRONTEND OBJECT
   ============================================================ */

function publicationObject(row) {
  let media = [];

  try {
    media = JSON.parse(row.media_json || "[]");
  } catch {
    media = [];
  }

  return {
    id: row.id,

    title: row.title,
    heading: row.title,

    content: row.content,
    text: row.content,

    category: row.category,
    type: row.type,

    image_url: row.image_url,
    video_url: row.video_url,
    audio_url: row.audio_url,
    music_url: row.music_url,
    link_url: row.link_url,

    media,

    status: row.status,
    visibility: row.visibility,

    likes: Number(row.likes || 0),
    comments_count: Number(row.comments_count || 0),
    shares: Number(row.shares || 0),
    saves: Number(row.saves || 0),
    views: Number(row.views || 0),
    reports: Number(row.reports || 0),

    pinned: Boolean(row.pinned),
    featured: Boolean(row.featured),

    created_at: row.created_at,
    updated_at: row.updated_at,
    published_at: row.published_at,

    rejection_reason: row.rejection_reason || ""
  };
}


/* ============================================================
   PUBLIC API
   ============================================================ */

async function createPublication(request, env) {
  const data = await readBody(request);
  const post = normalizePublication(data);

  /*
     ВАЖНО:

     Участнику нужны ТОЛЬКО:
       title
       content

     Никакого имени.
     Никакого username.
     Никакой регистрации.
     Никакого пароля.
  */

  if (!post.title) {
    return error("Введите заголовок", 400, {
      field: "title"
    });
  }

  if (!post.content) {
    return error("Введите текст", 400, {
      field: "content"
    });
  }

  const publicationId = id("pub");
  const timestamp = now();

  try {
    await initDB(env.DB);

    await env.DB.prepare(`
      INSERT INTO to_publications (
        id,
        title,
        content,
        status,
        visibility,
        category,
        type,
        image_url,
        video_url,
        audio_url,
        music_url,
        link_url,
        media_json,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
      .bind(
        publicationId,
        post.title,
        post.content,
        "pending",
        "private",
        post.category,
        post.type,
        post.image_url,
        post.video_url,
        post.audio_url,
        post.music_url,
        post.link_url,
        JSON.stringify(post.media),
        timestamp,
        timestamp
      )
      .run();

    return ok({
      message: "Публикация отправлена на модерацию.",
      status: "pending",
      publication_id: publicationId,
      publication: {
        id: publicationId,
        title: post.title,
        content: post.content,
        status: "pending",
        visibility: "private",
        created_at: timestamp
      }
    });

  } catch (err) {
    console.error("CREATE PUBLICATION ERROR:", err);

    return error(
      "Не удалось отправить публикацию на модерацию.",
      500,
      {
        code: "PUBLICATION_CREATE_ERROR"
      }
    );
  }
}


/* ============================================================
   PUBLICATIONS FOR WEBSITE
   Только опубликованные.
   ============================================================ */

async function getPublications(request, env) {
  try {
    await initDB(env.DB);

    const url = new URL(request.url);

    const limit = Math.min(
      Math.max(Number(url.searchParams.get("limit") || 50), 1),
      100
    );

    const offset = Math.max(
      Number(url.searchParams.get("offset") || 0),
      0
    );

    const result = await env.DB.prepare(`
      SELECT *
      FROM to_publications
      WHERE status = 'published'
        AND visibility = 'public'
      ORDER BY pinned DESC, featured DESC, created_at DESC
      LIMIT ? OFFSET ?
    `)
      .bind(limit, offset)
      .all();

    return ok({
      publications: (result.results || []).map(publicationObject),
      items: (result.results || []).map(publicationObject),
      count: result.results?.length || 0
    });

  } catch (err) {
    console.error("PUBLICATIONS ERROR:", err);

    return error(
      "Не удалось загрузить публикации.",
      500
    );
  }
}


/* ============================================================
   SINGLE PUBLICATION
   ============================================================ */

async function getPublicPublication(idValue, env) {
  try {
    await initDB(env.DB);

    const row = await env.DB.prepare(`
      SELECT *
      FROM to_publications
      WHERE id = ?
        AND status = 'published'
        AND visibility = 'public'
      LIMIT 1
    `)
      .bind(idValue)
      .first();

    if (!row) {
      return error("Публикация не найдена", 404);
    }

    await env.DB.prepare(`
      UPDATE to_publications
      SET views = views + 1,
          updated_at = ?
      WHERE id = ?
    `)
      .bind(now(), idValue)
      .run();

    row.views = Number(row.views || 0) + 1;

    return ok({
      publication: publicationObject(row),
      item: publicationObject(row)
    });

  } catch (err) {
    console.error("SINGLE PUBLICATION ERROR:", err);

    return error(
      "Не удалось загрузить публикацию.",
      500
    );
  }
}


/* ============================================================
   ADMIN
   ============================================================ */

async function adminStats(env) {
  await initDB(env.DB);

  const total = await env.DB.prepare(`
    SELECT COUNT(*) AS count
    FROM to_publications
  `).first();

  const pending = await env.DB.prepare(`
    SELECT COUNT(*) AS count
    FROM to_publications
    WHERE status = 'pending'
  `).first();

  const published = await env.DB.prepare(`
    SELECT COUNT(*) AS count
    FROM to_publications
    WHERE status = 'published'
  `).first();

  const rejected = await env.DB.prepare(`
    SELECT COUNT(*) AS count
    FROM to_publications
    WHERE status = 'rejected'
  `).first();

  return ok({
    total: Number(total?.count || 0),
    publications: Number(total?.count || 0),

    pending: Number(pending?.count || 0),
    pending_publications: Number(pending?.count || 0),

    published: Number(published?.count || 0),
    rejected: Number(rejected?.count || 0)
  });
}


/* ============================================================
   ADMIN PUBLICATIONS
   ============================================================ */

async function adminPublications(request, env) {
  await initDB(env.DB);

  const url = new URL(request.url);

  const status = url.searchParams.get("status") || "";

  let result;

  if (
    status === "pending" ||
    status === "published" ||
    status === "rejected" ||
    status === "draft" ||
    status === "archived"
  ) {
    result = await env.DB.prepare(`
      SELECT *
      FROM to_publications
      WHERE status = ?
      ORDER BY created_at DESC
    `)
      .bind(status)
      .all();
  } else {
    result = await env.DB.prepare(`
      SELECT *
      FROM to_publications
      ORDER BY
        CASE
          WHEN status = 'pending' THEN 0
          WHEN status = 'published' THEN 1
          WHEN status = 'rejected' THEN 2
          ELSE 3
        END,
        created_at DESC
    `).all();
  }

  const publications = (result.results || []).map(publicationObject);

  return ok({
    publications,
    items: publications,
    count: publications.length
  });
}


/* ============================================================
   ADMIN SINGLE PUBLICATION
   ============================================================ */

async function adminPublication(idValue, env) {
  await initDB(env.DB);

  const row = await env.DB.prepare(`
    SELECT *
    FROM to_publications
    WHERE id = ?
    LIMIT 1
  `)
    .bind(idValue)
    .first();

  if (!row) {
    return error("Публикация не найдена", 404);
  }

  return ok({
    publication: publicationObject(row),
    item: publicationObject(row)
  });
}


/* ============================================================
   APPROVE / REJECT / HIDE / DELETE
   ============================================================ */

async function adminPublicationAction(request, idValue, env) {
  await initDB(env.DB);

  const data = await readBody(request);

  let action = clean(
    data.action ??
    data.status ??
    data.type ??
    ""
  , 100).toLowerCase();

  /*
     Разные frontend-варианты
  */

  if (
    action === "approve" ||
    action === "approved" ||
    action === "publish"
  ) {
    action = "published";
  }

  if (
    action === "reject" ||
    action === "decline"
  ) {
    action = "rejected";
  }

  if (
    action === "hide" ||
    action === "private"
  ) {
    action = "hidden";
  }

  if (
    action === "delete" ||
    action === "remove"
  ) {
    try {
      await env.DB.prepare(`
        DELETE FROM to_publications
        WHERE id = ?
      `)
        .bind(idValue)
        .run();

      return ok({
        message: "Публикация удалена.",
        deleted: true,
        id: idValue
      });

    } catch (err) {
      console.error("DELETE ERROR:", err);
      return error("Не удалось удалить публикацию.", 500);
    }
  }

  let status;
  let visibility;

  switch (action) {
    case "published":
      status = "published";
      visibility = "public";
      break;

    case "rejected":
      status = "rejected";
      visibility = "private";
      break;

    case "hidden":
      status = "published";
      visibility = "private";
      break;

    case "pending":
      status = "pending";
      visibility = "private";
      break;

    case "draft":
      status = "draft";
      visibility = "private";
      break;

    case "archived":
      status = "archived";
      visibility = "private";
      break;

    default:
      return error(
        "Неизвестное действие администратора.",
        400
      );
  }

  const timestamp = now();

  const rejectionReason = clean(
    data.rejection_reason ??
    data.reason ??
    ""
  , 5000);

  await env.DB.prepare(`
    UPDATE to_publications
    SET
      status = ?,
      visibility = ?,
      rejection_reason = ?,
      published_at = ?,
      updated_at = ?
    WHERE id = ?
  `)
    .bind(
      status,
      visibility,
      rejectionReason,
      status === "published" ? timestamp : null,
      timestamp,
      idValue
    )
    .run();

  const row = await env.DB.prepare(`
    SELECT *
    FROM to_publications
    WHERE id = ?
  `)
    .bind(idValue)
    .first();

  if (!row) {
    return error("Публикация не найдена после обновления.", 404);
  }

  return ok({
    message:
      status === "published"
        ? "Публикация одобрена и опубликована."
        : status === "rejected"
          ? "Публикация отклонена."
          : "Статус публикации изменён.",

    publication: publicationObject(row),
    item: publicationObject(row)
  });
}


/* ============================================================
   ADMIN EDIT PUBLICATION
   ============================================================ */

async function adminEditPublication(request, idValue, env) {
  await initDB(env.DB);

  const data = await readBody(request);

  const existing = await env.DB.prepare(`
    SELECT *
    FROM to_publications
    WHERE id = ?
  `)
    .bind(idValue)
    .first();

  if (!existing) {
    return error("Публикация не найдена", 404);
  }

  const post = normalizePublication({
    title: data.title ?? existing.title,
    content: data.content ?? existing.content,

    category: data.category ?? existing.category,
    type: data.type ?? existing.type,

    image_url: data.image_url ?? existing.image_url,
    video_url: data.video_url ?? existing.video_url,
    audio_url: data.audio_url ?? existing.audio_url,
    music_url: data.music_url ?? existing.music_url,
    link_url: data.link_url ?? existing.link_url,

    media: data.media ?? (() => {
      try {
        return JSON.parse(existing.media_json || "[]");
      } catch {
        return [];
      }
    })()
  });

  if (!post.title) {
    return error("Введите заголовок", 400);
  }

  if (!post.content) {
    return error("Введите текст", 400);
  }

  await env.DB.prepare(`
    UPDATE to_publications
    SET
      title = ?,
      content = ?,
      category = ?,
      type = ?,
      image_url = ?,
      video_url = ?,
      audio_url = ?,
      music_url = ?,
      link_url = ?,
      media_json = ?,
      updated_at = ?
    WHERE id = ?
  `)
    .bind(
      post.title,
      post.content,
      post.category,
      post.type,
      post.image_url,
      post.video_url,
      post.audio_url,
      post.music_url,
      post.link_url,
      JSON.stringify(post.media),
      now(),
      idValue
    )
    .run();

  const row = await env.DB.prepare(`
    SELECT *
    FROM to_publications
    WHERE id = ?
  `)
    .bind(idValue)
    .first();

  return ok({
    message: "Публикация изменена.",
    publication: publicationObject(row),
    item: publicationObject(row)
  });
}


/* ============================================================
   ADMIN COUNTERS
   Можно менять количество лайков, просмотров, сохранений,
   комментариев, репостов и жалоб.
   ============================================================ */

async function adminCounters(request, idValue, env) {
  await initDB(env.DB);

  const data = await readBody(request);

  const allowed = [
    "likes",
    "comments_count",
    "shares",
    "saves",
    "views",
    "reports"
  ];

  const updates = [];
  const values = [];

  for (const field of allowed) {
    if (data[field] !== undefined) {
      let value = Number(data[field]);

      if (!Number.isFinite(value)) {
        value = 0;
      }

      value = Math.max(0, Math.floor(value));

      updates.push(`${field} = ?`);
      values.push(value);
    }
  }

  if (!updates.length) {
    return error("Не указаны счётчики для изменения.");
  }

  updates.push("updated_at = ?");
  values.push(now());

  values.push(idValue);

  await env.DB.prepare(`
    UPDATE to_publications
    SET ${updates.join(", ")}
    WHERE id = ?
  `)
    .bind(...values)
    .run();

  const row = await env.DB.prepare(`
    SELECT *
    FROM to_publications
    WHERE id = ?
  `)
    .bind(idValue)
    .first();

  if (!row) {
    return error("Публикация не найдена", 404);
  }

  return ok({
    message: "Счётчики изменены.",
    publication: publicationObject(row),
    item: publicationObject(row)
  });
}


/* ============================================================
   PIN / FEATURE
   ============================================================ */

async function adminFlags(request, idValue, env) {
  await initDB(env.DB);

  const data = await readBody(request);

  const fields = [];
  const values = [];

  if (data.pinned !== undefined) {
    fields.push("pinned = ?");
    values.push(
      data.pinned === true ||
      data.pinned === 1 ||
      data.pinned === "1" ? 1 : 0
    );
  }

  if (data.featured !== undefined) {
    fields.push("featured = ?");
    values.push(
      data.featured === true ||
      data.featured === 1 ||
      data.featured === "1" ? 1 : 0
    );
  }

  if (!fields.length) {
    return error("Нет параметров.");
  }

  fields.push("updated_at = ?");
  values.push(now());

  values.push(idValue);

  await env.DB.prepare(`
    UPDATE to_publications
    SET ${fields.join(", ")}
    WHERE id = ?
  `)
    .bind(...values)
    .run();

  return adminPublication(idValue, env);
}


/* ============================================================
   DELETE
   ============================================================ */

async function deletePublication(idValue, env) {
  await initDB(env.DB);

  const result = await env.DB.prepare(`
    DELETE FROM to_publications
    WHERE id = ?
  `)
    .bind(idValue)
    .run();

  return ok({
    message: "Публикация удалена.",
    deleted: true,
    id: idValue,
    changes: result.meta?.changes || 0
  });
}


/* ============================================================
   HEALTH
   ============================================================ */

async function health(env) {
  try {
    await initDB(env.DB);

    return ok({
      service: "Tajik Opportunities",
      status: "online",
      database: "connected",
      time: now()
    });
  } catch (err) {
    console.error("HEALTH ERROR:", err);

    return error(
      "База данных недоступна.",
      500
    );
  }
}


/* ============================================================
   ROUTER
   ============================================================ */

export default {
  async fetch(request, env) {

    /* OPTIONS */
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {

      /* ======================================================
         ADMIN.HTML
         ====================================================== */

      if (
        path === "/admin.html" &&
        request.method === "GET"
      ) {
        return env.ASSETS.fetch(request);
      }


      /* ======================================================
         ROOT / STATIC
         ====================================================== */

      if (
        !path.startsWith("/api/")
      ) {
        return env.ASSETS.fetch(request);
      }


      /* ======================================================
         HEALTH
         ====================================================== */

      if (
        path === "/api/health" &&
        request.method === "GET"
      ) {
        return health(env);
      }


      /* ======================================================
         PUBLIC CREATE
         ====================================================== */

      if (
        path === "/api/publications" &&
        request.method === "POST"
      ) {
        return createPublication(request, env);
      }


      /* ======================================================
         PUBLIC LIST
         ====================================================== */

      if (
        path === "/api/publications" &&
        request.method === "GET"
      ) {
        return getPublications(request, env);
      }


      /* ======================================================
         PUBLIC SINGLE
         ====================================================== */

      const publicMatch =
        path.match(/^\/api\/publications\/([^/]+)$/);

      if (
        publicMatch &&
        request.method === "GET"
      ) {
        return getPublicPublication(
          decodeURIComponent(publicMatch[1]),
          env
        );
      }


      /* ======================================================
         ADMIN STATS
         ====================================================== */

      if (
        path === "/api/admin/stats" &&
        request.method === "GET"
      ) {
        return adminStats(env);
      }


      /* ======================================================
         ADMIN ME
         ====================================================== */

      if (
        path === "/api/admin/me" &&
        request.method === "GET"
      ) {
        return ok({
          authenticated: true,
          admin: true,
          role: "super_admin",
          username: "admin",
          name: "Tajik Opportunities",
          permissions: [
            "all"
          ]
        });
      }


      /* ======================================================
         ADMIN LOGOUT
         ====================================================== */

      if (
        path === "/api/admin/logout" &&
        request.method === "POST"
      ) {
        return ok({
          message: "Выход не требуется."
        });
      }


      /* ======================================================
         ADMIN PUBLICATIONS LIST
         ====================================================== */

      if (
        path === "/api/admin/publications" &&
        request.method === "GET"
      ) {
        return adminPublications(request, env);
      }


      /* ======================================================
         ADMIN PUBLICATION ACTIONS
         ====================================================== */

      const adminActionMatch =
        path.match(
          /^\/api\/admin\/publications\/([^/]+)\/action$/
        );

      if (
        adminActionMatch &&
        ["POST", "PUT", "PATCH"].includes(request.method)
      ) {
        return adminPublicationAction(
          request,
          decodeURIComponent(adminActionMatch[1]),
          env
        );
      }


      /* ======================================================
         ADMIN COUNTERS
         ====================================================== */

      const counterMatch =
        path.match(
          /^\/api\/admin\/publications\/([^/]+)\/counters$/
        );

      if (
        counterMatch &&
        ["POST", "PUT", "PATCH"].includes(request.method)
      ) {
        return adminCounters(
          request,
          decodeURIComponent(counterMatch[1]),
          env
        );
      }


      /* ======================================================
         ADMIN FLAGS
         ====================================================== */

      const flagsMatch =
        path.match(
          /^\/api\/admin\/publications\/([^/]+)\/flags$/
        );

      if (
        flagsMatch &&
        ["POST", "PUT", "PATCH"].includes(request.method)
      ) {
        return adminFlags(
          request,
          decodeURIComponent(flagsMatch[1]),
          env
        );
      }


      /* ======================================================
         ADMIN EDIT
         ====================================================== */

      const adminEditMatch =
        path.match(
          /^\/api\/admin\/publications\/([^/]+)$/
        );

      if (
        adminEditMatch &&
        ["PUT", "PATCH"].includes(request.method)
      ) {
        return adminEditPublication(
          request,
          decodeURIComponent(adminEditMatch[1]),
          env
        );
      }


      /* ======================================================
         ADMIN DELETE
         ====================================================== */

      if (
        adminEditMatch &&
        request.method === "DELETE"
      ) {
        return deletePublication(
          decodeURIComponent(adminEditMatch[1]),
          env
        );
      }


      /* ======================================================
         ADMIN GET SINGLE
         ====================================================== */

      if (
        adminEditMatch &&
        request.method === "GET"
      ) {
        return adminPublication(
          decodeURIComponent(adminEditMatch[1]),
          env
        );
      }


      /* ======================================================
         OLD / UNUSED ADMIN ROUTES
         Чтобы старая admin.html не получала 404 там,
         где модуль пока не подключён.
         ====================================================== */

      if (
        path.startsWith("/api/admin/")
      ) {
        return ok({
          items: [],
          publications: [],
          participants: [],
          chats: [],
          messages: [],
          comments: [],
          reports: [],
          notifications: [],
          analytics: [],
          audit: [],
          settings: {},
          count: 0
        });
      }


      /* ======================================================
         NOT FOUND
         ====================================================== */

      return error(
        "API маршрут не найден.",
        404
      );

    } catch (err) {

      /*
         НИКАКОЙ необработанной ошибки.
         Всегда возвращаем JSON, чтобы frontend
         больше не показывал странную ошибку Cloudflare.
      */

      console.error("WORKER ERROR:", err);

      return error(
        "Внутренняя ошибка сервиса.",
        500,
        {
          code: "WORKER_ERROR"
        }
      );
    }
  }
};
