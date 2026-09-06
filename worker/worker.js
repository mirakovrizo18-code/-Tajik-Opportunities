/**
 * 🇹🇯 TAJIK OPPORTUNITIES
 * worker/worker.js
 *
 * Серверный Cloudflare Worker
 *
 * API:
 * /api/auth/*
 * /api/profile/*
 * /api/categories
 * /api/publications/*
 * /api/comments
 * /api/chat/*
 * /api/notifications/*
 * /api/admin/*
 *
 * Требуется Cloudflare D1:
 * binding name: DB
 */

const SITE_NAME = "🇹🇯 Tajik Opportunities";
const OFFICIAL_NAME = "🇹🇯 Tajik Opportunities✅";
const OFFICIAL_USERNAME = "@tajikopportunities";

const COOKIE_USER = "to_session";
const COOKIE_ADMIN = "to_admin_session";

const SESSION_DAYS = 30;
const ADMIN_SESSION_HOURS = 12;

const SECURITY_HEADERS = {
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
  "cross-origin-opener-policy": "same-origin"
};

const CATEGORIES = [
  ["jobs", "💼 Работа"],
  ["job_seekers", "🔎 Ищу работу"],
  ["employees", "👔 Ищу сотрудника"],
  ["profiles", "👤 Профили"],
  ["news", "📰 Новости"],
  ["education", "🎓 Образование"],
  ["courses", "📚 Курсы"],
  ["opportunities", "🎁 Возможности"],
  ["announcements", "📢 Объявления"],
  ["services", "🤝 Услуги"],
  ["ideas", "💡 Идеи"],
  ["projects", "🚀 Проекты"],
  ["startups", "🌱 Стартапы"],
  ["events", "📅 Мероприятия"],
  ["competitions", "🏆 Конкурсы"],
  ["grants", "💰 Гранты"],
  ["volunteering", "🤝 Волонтёрство"],
  ["products", "🛍️ Товары"],
  ["business", "🏢 Бизнес"],
  ["it", "💻 IT"],
  ["sport", "⚽ Спорт"],
  ["music", "🎵 Музыка"],
  ["culture", "🎭 Культура"],
  ["travel", "✈️ Путешествия"],
  ["help", "🆘 Помощь"],
  ["other", "➕ Другое"]
];

const REACTIONS = [
  "like",
  "love",
  "support",
  "funny",
  "wow",
  "sad",
  "angry"
];

const STATUSES = [
  "pending",
  "waiting_payment",
  "paid",
  "published",
  "rejected",
  "hidden",
  "deleted"
];

/* =========================================================
   BASIC HELPERS
========================================================= */

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...SECURITY_HEADERS,
      ...extra
    }
  });
}

function text(data, status = 200, extra = {}) {
  return new Response(data, {
    status,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      ...SECURITY_HEADERS,
      ...extra
    }
  });
}

function error(message, status = 400, extra = {}) {
  return json(
    {
      ok: false,
      error: message
    },
    status,
    extra
  );
}

function ok(data = {}) {
  return json({
    ok: true,
    ...data
  });
}

function now() {
  return new Date().toISOString();
}

function randomId(prefix = "") {
  return (
    prefix +
    crypto.randomUUID().replaceAll("-", "")
  );
}

function normalizeUsername(value) {
  return String(value || "")
    .trim()
    .replace(/^@/, "")
    .toLowerCase();
}

function cleanString(value, max = 10000) {
  if (value === undefined || value === null) return "";
  return String(value).trim().slice(0, max);
}

function int(value, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.floor(n));
}

function bool(value) {
  return value === true ||
    value === 1 ||
    value === "1" ||
    value === "true";
}

function safeJsonParse(value, fallback = null) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

async function bodyJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function cookieValue(request, name) {
  const header = request.headers.get("Cookie") || "";

  const parts = header.split(";");

  for (const part of parts) {
    const [key, ...rest] = part.trim().split("=");

    if (key === name) {
      return decodeURIComponent(rest.join("="));
    }
  }

  return null;
}

function cookie(name, value, maxAge, options = {}) {
  const secure = options.secure !== false;

  return [
    `${name}=${encodeURIComponent(value)}`,
    `Max-Age=${maxAge}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    secure ? "Secure" : ""
  ]
    .filter(Boolean)
    .join("; ");
}

function deleteCookie(name) {
  return `${name}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax; Secure`;
}

function headersWithCookies(headers, cookies) {
  const result = new Headers(headers);

  for (const c of cookies) {
    result.append("Set-Cookie", c);
  }

  return result;
}

async function sha256(value) {
  const data = new TextEncoder().encode(String(value));

  const hash = await crypto.subtle.digest(
    "SHA-256",
    data
  );

  return [...new Uint8Array(hash)]
    .map(x => x.toString(16).padStart(2, "0"))
    .join("");
}

async function hashPassword(password) {
  return sha256(password);
}

function getDB(env) {
  if (!env.DB) {
    throw new Error(
      "D1 binding DB is not configured. Create a D1 binding named DB."
    );
  }

  return env.DB;
}

/* =========================================================
   DATABASE INITIALIZATION
========================================================= */

let dbInitialized = false;

async function initDB(env) {
  const db = getDB(env);

  if (dbInitialized) return;

  await db.batch([
    db.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        password_hash TEXT,
        avatar TEXT,
        bio TEXT,
        city TEXT,
        country TEXT,
        language TEXT DEFAULT 'ru',
        verified INTEGER DEFAULT 0,
        blocked INTEGER DEFAULT 0,
        role TEXT DEFAULT 'user',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `),

    db.prepare(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT DEFAULT 'user',
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `),

    db.prepare(`
      CREATE TABLE IF NOT EXISTS publications (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        title TEXT NOT NULL,
        text TEXT,
        category TEXT,
        city TEXT,
        country TEXT,
        hashtags TEXT,
        media TEXT,
        status TEXT DEFAULT 'pending',
        views INTEGER DEFAULT 0,
        likes INTEGER DEFAULT 0,
        comments INTEGER DEFAULT 0,
        saves INTEGER DEFAULT 0,
        shares INTEGER DEFAULT 0,
        love INTEGER DEFAULT 0,
        support INTEGER DEFAULT 0,
        funny INTEGER DEFAULT 0,
        wow INTEGER DEFAULT 0,
        sad INTEGER DEFAULT 0,
        angry INTEGER DEFAULT 0,
        price INTEGER DEFAULT 0,
        pinned INTEGER DEFAULT 0,
        featured INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `),

    db.prepare(`
      CREATE TABLE IF NOT EXISTS reactions (
        id TEXT PRIMARY KEY,
        publication_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        reaction TEXT NOT NULL,
        created_at TEXT NOT NULL,
        UNIQUE(publication_id, user_id)
      )
    `),

    db.prepare(`
      CREATE TABLE IF NOT EXISTS saves (
        id TEXT PRIMARY KEY,
        publication_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        UNIQUE(publication_id, user_id)
      )
    `),

    db.prepare(`
      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        publication_id TEXT NOT NULL,
        user_id TEXT,
        parent_id TEXT,
        text TEXT NOT NULL,
        likes INTEGER DEFAULT 0,
        hidden INTEGER DEFAULT 0,
        deleted INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `),

    db.prepare(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        sender_id TEXT,
        receiver_id TEXT,
        conversation_id TEXT,
        text TEXT,
        media TEXT,
        reply_to TEXT,
        forwarded_from TEXT,
        edited INTEGER DEFAULT 0,
        deleted INTEGER DEFAULT 0,
        read INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `),

    db.prepare(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT,
        title TEXT,
        text TEXT,
        data TEXT,
        read INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      )
    `),

    db.prepare(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        admin_id TEXT,
        action TEXT,
        entity_type TEXT,
        entity_id TEXT,
        details TEXT,
        created_at TEXT NOT NULL
      )
    `),

    db.prepare(`
      CREATE TABLE IF NOT EXISTS admins (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT,
        role TEXT DEFAULT 'admin',
        active INTEGER DEFAULT 1,
        created_at TEXT NOT NULL
      )
    `),

    db.prepare(`
      CREATE TABLE IF NOT EXISTS publication_orders (
        id TEXT PRIMARY KEY,
        publication_id TEXT NOT NULL,
        user_id TEXT,
        amount INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `)
  ]);

  dbInitialized = true;
}

/* =========================================================
   AUTH
========================================================= */

async function getUserFromSession(request, env) {
  const token = cookieValue(request, COOKIE_USER);

  if (!token) return null;

  const db = getDB(env);

  const row = await db.prepare(`
    SELECT
      u.*
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.id = ?
      AND s.type = 'user'
      AND s.expires_at > ?
      AND u.blocked = 0
    LIMIT 1
  `)
    .bind(token, now())
    .first();

  return row || null;
}

async function getAdminFromSession(request, env) {
  const token = cookieValue(request, COOKIE_ADMIN);

  if (!token) return null;

  const db = getDB(env);

  const row = await db.prepare(`
    SELECT
      a.*
    FROM sessions s
    JOIN admins a ON a.id = s.user_id
    WHERE s.id = ?
      AND s.type = 'admin'
      AND s.expires_at > ?
      AND a.active = 1
    LIMIT 1
  `)
    .bind(token, now())
    .first();

  return row || null;
}

async function requireUser(request, env) {
  const user = await getUserFromSession(request, env);

  if (!user) {
    throw new Response(
      JSON.stringify({
        ok: false,
        error: "Требуется авторизация"
      }),
      {
        status: 401,
        headers: {
          "content-type": "application/json; charset=utf-8",
          ...SECURITY_HEADERS
        }
      }
    );
  }

  return user;
}

async function requireAdmin(request, env) {
  const admin = await getAdminFromSession(request, env);

  if (!admin) {
    throw new Response(
      JSON.stringify({
        ok: false,
        error: "Требуются права администратора"
      }),
      {
        status: 403,
        headers: {
          "content-type": "application/json; charset=utf-8",
          ...SECURITY_HEADERS
        }
      }
    );
  }

  return admin;
}

/* =========================================================
   AUDIT
========================================================= */

async function audit(
  env,
  adminId,
  action,
  entityType = "",
  entityId = "",
  details = {}
) {
  const db = getDB(env);

  await db.prepare(`
    INSERT INTO audit_logs
    (id, admin_id, action, entity_type, entity_id, details, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
    .bind(
      randomId("audit_"),
      adminId || null,
      action,
      entityType,
      entityId,
      JSON.stringify(details),
      now()
    )
    .run();
}

/* =========================================================
   PUBLICATIONS NORMALIZATION
========================================================= */

function normalizePublication(row) {
  if (!row) return null;

  return {
    id: row.id,
    publication_id: row.id,
    user_id: row.user_id,
    title: row.title,
    text: row.text || "",
    category: row.category || "other",
    city: row.city || "",
    country: row.country || "",
    hashtags: safeJsonParse(row.hashtags, []),
    media: safeJsonParse(row.media, []),
    status: row.status,

    views: int(row.views),
    likes: int(row.likes),
    comments: int(row.comments),
    saves: int(row.saves),
    shares: int(row.shares),

    love: int(row.love),
    support: int(row.support),
    funny: int(row.funny),
    wow: int(row.wow),
    sad: int(row.sad),
    angry: int(row.angry),

    price: int(row.price),
    pinned: bool(row.pinned),
    featured: bool(row.featured),

    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

function normalizeUser(row) {
  if (!row) return null;

  return {
    id: row.id,
    user_id: row.id,
    username: "@" + row.username,
    name: row.name,
    email: row.email || "",
    avatar: row.avatar || "",
    bio: row.bio || "",
    city: row.city || "",
    country: row.country || "",
    language: row.language || "ru",
    verified: bool(row.verified),
    blocked: bool(row.blocked),
    role: row.role || "user",
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

/* =========================================================
   AUTH ROUTES
========================================================= */

async function register(request, env) {
  const data = await bodyJson(request);

  const name = cleanString(data.name, 120);
  const username = normalizeUsername(data.username);
  const email = cleanString(data.email, 200);
  const password = String(data.password || "");

  if (!name) {
    return error("Введите имя");
  }

  if (!username || !/^[a-zA-Z0-9_.-]{3,40}$/.test(username)) {
    return error("Некорректный username");
  }

  if (password.length < 6) {
    return error("Пароль должен содержать минимум 6 символов");
  }

  const db = getDB(env);

  const exists = await db.prepare(`
    SELECT id FROM users WHERE username = ? LIMIT 1
  `)
    .bind(username)
    .first();

  if (exists) {
    return error("Этот username уже занят", 409);
  }

  const id = randomId("usr_");
  const timestamp = now();
  const passwordHash = await hashPassword(password);

  await db.prepare(`
    INSERT INTO users
    (
      id,
      username,
      name,
      email,
      password_hash,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
    .bind(
      id,
      username,
      name,
      email || null,
      passwordHash,
      timestamp,
      timestamp
    )
    .run();

  const sessionId = randomId("sess_");

  const expires = new Date(
    Date.now() + SESSION_DAYS * 86400000
  ).toISOString();

  await db.prepare(`
    INSERT INTO sessions
    (id, user_id, type, expires_at, created_at)
    VALUES (?, ?, 'user', ?, ?)
  `)
    .bind(
      sessionId,
      id,
      expires,
      timestamp
    )
    .run();

  const user = await db.prepare(`
    SELECT * FROM users WHERE id = ?
  `)
    .bind(id)
    .first();

  return new Response(
    JSON.stringify({
      ok: true,
      user: normalizeUser(user)
    }),
    {
      status: 201,
      headers: headersWithCookies(
        {
          "content-type": "application/json; charset=utf-8",
          ...SECURITY_HEADERS
        },
        [
          cookie(
            COOKIE_USER,
            sessionId,
            SESSION_DAYS * 86400
          )
        ]
      )
    }
  );
}

async function login(request, env) {
  const data = await bodyJson(request);

  const loginValue = cleanString(
    data.username || data.email || data.login,
    200
  );

  const password = String(data.password || "");

  if (!loginValue || !password) {
    return error("Введите логин и пароль");
  }

  const username = normalizeUsername(loginValue);

  const db = getDB(env);

  const user = await db.prepare(`
    SELECT * FROM users
    WHERE username = ?
       OR lower(email) = lower(?)
    LIMIT 1
  `)
    .bind(username, loginValue)
    .first();

  if (!user) {
    return error("Неверный логин или пароль", 401);
  }

  if (user.blocked) {
    return error("Аккаунт заблокирован", 403);
  }

  const hash = await hashPassword(password);

  if (hash !== user.password_hash) {
    return error("Неверный логин или пароль", 401);
  }

  const sessionId = randomId("sess_");
  const timestamp = now();

  const expires = new Date(
    Date.now() + SESSION_DAYS * 86400000
  ).toISOString();

  await db.prepare(`
    INSERT INTO sessions
    (id, user_id, type, expires_at, created_at)
    VALUES (?, ?, 'user', ?, ?)
  `)
    .bind(
      sessionId,
      user.id,
      expires,
      timestamp
    )
    .run();

  return new Response(
    JSON.stringify({
      ok: true,
      user: normalizeUser(user)
    }),
    {
      headers: headersWithCookies(
        {
          "content-type": "application/json; charset=utf-8",
          ...SECURITY_HEADERS
        },
        [
          cookie(
            COOKIE_USER,
            sessionId,
            SESSION_DAYS * 86400
          )
        ]
      )
    }
  );
}

async function logoutUser(request, env) {
  const token = cookieValue(request, COOKIE_USER);

  if (token) {
    await getDB(env)
      .prepare(`DELETE FROM sessions WHERE id = ?`)
      .bind(token)
      .run();
  }

  return new Response(
    JSON.stringify({ ok: true }),
    {
      headers: headersWithCookies(
        {
          "content-type": "application/json; charset=utf-8",
          ...SECURITY_HEADERS
        },
        [deleteCookie(COOKIE_USER)]
      )
    }
  );
}

async function authMe(request, env) {
  const user = await getUserFromSession(request, env);

  return ok({
    authenticated: !!user,
    user: normalizeUser(user)
  });
}

/* =========================================================
   USERNAME
========================================================= */

async function usernameCheck(request, env) {
  const url = new URL(request.url);
  const username = normalizeUsername(
    url.searchParams.get("username")
  );

  if (!username) {
    return error("Username не указан");
  }

  const exists = await getDB(env)
    .prepare(`
      SELECT id FROM users WHERE username = ? LIMIT 1
    `)
    .bind(username)
    .first();

  return ok({
    username: "@" + username,
    available: !exists
  });
}

/* =========================================================
   PROFILE
========================================================= */

async function getProfile(request, env) {
  const user = await requireUser(request, env);

  return ok({
    user: normalizeUser(user),
    profile: normalizeUser(user)
  });
}

async function updateProfile(request, env) {
  const user = await requireUser(request, env);
  const data = await bodyJson(request);
  const db = getDB(env);

  const fields = [];
  const values = [];

  if (data.name !== undefined) {
    fields.push("name = ?");
    values.push(cleanString(data.name, 120));
  }

  if (data.bio !== undefined) {
    fields.push("bio = ?");
    values.push(cleanString(data.bio, 5000));
  }

  if (data.avatar !== undefined) {
    fields.push("avatar = ?");
    values.push(cleanString(data.avatar, 2000));
  }

  if (data.city !== undefined) {
    fields.push("city = ?");
    values.push(cleanString(data.city, 120));
  }

  if (data.country !== undefined) {
    fields.push("country = ?");
    values.push(cleanString(data.country, 120));
  }

  if (data.language !== undefined) {
    fields.push("language = ?");
    values.push(cleanString(data.language, 20));
  }

  if (!fields.length) {
    return ok({
      user: normalizeUser(user)
    });
  }

  fields.push("updated_at = ?");
  values.push(now());
  values.push(user.id);

  await db.prepare(`
    UPDATE users
    SET ${fields.join(", ")}
    WHERE id = ?
  `)
    .bind(...values)
    .run();

  const updated = await db.prepare(`
    SELECT * FROM users WHERE id = ?
  `)
    .bind(user.id)
    .first();

  return ok({
    user: normalizeUser(updated),
    profile: normalizeUser(updated)
  });
}

async function publicProfile(request, env) {
  const url = new URL(request.url);

  const username = normalizeUsername(
    url.searchParams.get("username")
  );

  if (!username) {
    return error("Username не указан");
  }

  const user = await getDB(env)
    .prepare(`
      SELECT * FROM users WHERE username = ? LIMIT 1
    `)
    .bind(username)
    .first();

  if (!user || user.blocked) {
    return error("Пользователь не найден", 404);
  }

  return ok({
    user: normalizeUser(user),
    profile: normalizeUser(user)
  });
}

/* =========================================================
   CATEGORIES
========================================================= */

async function categories() {
  return ok({
    categories: CATEGORIES.map(([id, name]) => ({
      id,
      name
    }))
  });
}

/* =========================================================
   PUBLICATIONS
========================================================= */

async function createPublication(request, env) {
  const user = await requireUser(request, env);
  const data = await bodyJson(request);

  const title = cleanString(
    data.title || data.name,
    300
  );

  const body = cleanString(
    data.text || data.description || "",
    50000
  );

  if (!title && !body) {
    return error("Добавьте заголовок или текст");
  }

  let media = data.media;

  if (!Array.isArray(media)) {
    media = [];
  }

  media = media
    .slice(0, 30)
    .map(item => ({
      type: cleanString(item?.type, 40),
      url: cleanString(item?.url, 5000),
      title: cleanString(item?.title, 300)
    }))
    .filter(item => item.url);

  let hashtags = data.hashtags;

  if (!Array.isArray(hashtags)) {
    hashtags = [];
  }

  hashtags = hashtags
    .map(x => cleanString(x, 100))
    .filter(Boolean)
    .slice(0, 50);

  const id = randomId("pub_");
  const timestamp = now();

  await getDB(env).prepare(`
    INSERT INTO publications
    (
      id,
      user_id,
      title,
      text,
      category,
      city,
      country,
      hashtags,
      media,
      status,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
  `)
    .bind(
      id,
      user.id,
      title || "",
      body,
      cleanString(data.category, 80),
      cleanString(data.city, 120),
      cleanString(data.country, 120),
      JSON.stringify(hashtags),
      JSON.stringify(media),
      timestamp,
      timestamp
    )
    .run();

  const publication = await getDB(env)
    .prepare(`SELECT * FROM publications WHERE id = ?`)
    .bind(id)
    .first();

  return json({
    ok: true,
    publication: normalizePublication(publication)
  }, 201);
}

async function listPublications(request, env) {
  const url = new URL(request.url);

  const category = cleanString(
    url.searchParams.get("category"),
    80
  );

  const search = cleanString(
    url.searchParams.get("search") ||
    url.searchParams.get("q"),
    200
  );

  const limit = Math.min(
    100,
    Math.max(
      1,
      int(url.searchParams.get("limit"), 30)
    )
  );

  const offset = Math.max(
    0,
    int(url.searchParams.get("offset"), 0)
  );

  const db = getDB(env);

  let sql = `
    SELECT *
    FROM publications
    WHERE status = 'published'
  `;

  const binds = [];

  if (category) {
    sql += ` AND category = ?`;
    binds.push(category);
  }

  if (search) {
    sql += `
      AND (
        title LIKE ?
        OR text LIKE ?
        OR hashtags LIKE ?
        OR city LIKE ?
      )
    `;

    const q = `%${search}%`;

    binds.push(q, q, q, q);
  }

  sql += `
    ORDER BY pinned DESC, featured DESC, created_at DESC
    LIMIT ? OFFSET ?
  `;

  binds.push(limit, offset);

  const result = await db
    .prepare(sql)
    .bind(...binds)
    .all();

  const publications = (result.results || [])
    .map(normalizePublication);

  return ok({
    publications,
    items: publications,
    total: publications.length,
    limit,
    offset
  });
}

async function getPublication(request, env, id) {
  const publication = await getDB(env)
    .prepare(`
      SELECT *
      FROM publications
      WHERE id = ?
      LIMIT 1
    `)
    .bind(id)
    .first();

  if (!publication) {
    return error("Публикация не найдена", 404);
  }

  return ok({
    publication: normalizePublication(publication)
  });
}

/* =========================================================
   VIEWS
========================================================= */

async function publicationView(request, env) {
  const data = await bodyJson(request);

  const id = cleanString(
    data.publication_id ||
    data.id,
    100
  );

  if (!id) {
    return error("publication_id обязателен");
  }

  const result = await getDB(env)
    .prepare(`
      UPDATE publications
      SET views = views + 1,
          updated_at = ?
      WHERE id = ?
    `)
    .bind(now(), id)
    .run();

  if (!result.meta.changes) {
    return error("Публикация не найдена", 404);
  }

  const row = await getDB(env)
    .prepare(`
      SELECT views FROM publications WHERE id = ?
    `)
    .bind(id)
    .first();

  return ok({
    views: int(row?.views)
  });
}

/* =========================================================
   REACTIONS
========================================================= */

async function publicationReact(request, env) {
  const user = await requireUser(request, env);
  const data = await bodyJson(request);

  const publicationId = cleanString(
    data.publication_id || data.id,
    100
  );

  const reaction = cleanString(
    data.reaction || "like",
    30
  ).toLowerCase();

  if (!publicationId) {
    return error("publication_id обязателен");
  }

  if (!REACTIONS.includes(reaction)) {
    return error("Неизвестная реакция");
  }

  const db = getDB(env);

  const publication = await db.prepare(`
    SELECT * FROM publications WHERE id = ?
  `)
    .bind(publicationId)
    .first();

  if (!publication) {
    return error("Публикация не найдена", 404);
  }

  const existing = await db.prepare(`
    SELECT * FROM reactions
    WHERE publication_id = ?
      AND user_id = ?
    LIMIT 1
  `)
    .bind(publicationId, user.id)
    .first();

  if (existing) {
    if (existing.reaction === reaction) {
      await db.prepare(`
        DELETE FROM reactions
        WHERE id = ?
      `)
        .bind(existing.id)
        .run();

      await db.prepare(`
        UPDATE publications
        SET ${reaction} = MAX(0, ${reaction} - 1),
            likes = MAX(0, likes - ?),
            updated_at = ?
        WHERE id = ?
      `)
        .bind(
          reaction === "like" ? 1 : 0,
          now(),
          publicationId
        )
        .run();

      return ok({
        reaction: null
      });
    }

    const oldReaction = existing.reaction;

    await db.prepare(`
      UPDATE reactions
      SET reaction = ?
      WHERE id = ?
    `)
      .bind(reaction, existing.id)
      .run();

    await db.prepare(`
      UPDATE publications
      SET
        ${oldReaction} = MAX(0, ${oldReaction} - 1),
        ${reaction} = ${reaction} + 1,
        likes = likes + ?,
        updated_at = ?
      WHERE id = ?
    `)
      .bind(
        reaction === "like" ? 1 : oldReaction === "like" ? -1 : 0,
        now(),
        publicationId
      )
      .run();

    return ok({
      reaction
    });
  }

  await db.prepare(`
    INSERT INTO reactions
    (id, publication_id, user_id, reaction, created_at)
    VALUES (?, ?, ?, ?, ?)
  `)
    .bind(
      randomId("react_"),
      publicationId,
      user.id,
      reaction,
      now()
    )
    .run();

  await db.prepare(`
    UPDATE publications
    SET
      ${reaction} = ${reaction} + 1,
      likes = likes + ?,
      updated_at = ?
    WHERE id = ?
  `)
    .bind(
      reaction === "like" ? 1 : 0,
      now(),
      publicationId
    )
    .run();

  return ok({
    reaction
  });
}

/* =========================================================
   SAVE
========================================================= */

async function publicationSave(request, env) {
  const user = await requireUser(request, env);
  const data = await bodyJson(request);

  const publicationId = cleanString(
    data.publication_id || data.id,
    100
  );

  const db = getDB(env);

  const existing = await db.prepare(`
    SELECT * FROM saves
    WHERE publication_id = ?
      AND user_id = ?
    LIMIT 1
  `)
    .bind(publicationId, user.id)
    .first();

  if (existing) {
    await db.prepare(`
      DELETE FROM saves WHERE id = ?
    `)
      .bind(existing.id)
      .run();

    await db.prepare(`
      UPDATE publications
      SET saves = MAX(0, saves - 1)
      WHERE id = ?
    `)
      .bind(publicationId)
      .run();

    return ok({
      saved: false
    });
  }

  await db.prepare(`
    INSERT INTO saves
    (id, publication_id, user_id, created_at)
    VALUES (?, ?, ?, ?)
  `)
    .bind(
      randomId("save_"),
      publicationId,
      user.id,
      now()
    )
    .run();

  await db.prepare(`
    UPDATE publications
    SET saves = saves + 1
    WHERE id = ?
  `)
    .bind(publicationId)
    .run();

  return ok({
    saved: true
  });
}

/* =========================================================
   SHARE
========================================================= */

async function publicationShare(request, env) {
  const data = await bodyJson(request);

  const publicationId = cleanString(
    data.publication_id || data.id,
    100
  );

  if (!publicationId) {
    return error("publication_id обязателен");
  }

  await getDB(env).prepare(`
    UPDATE publications
    SET shares = shares + 1
    WHERE id = ?
  `)
    .bind(publicationId)
    .run();

  const row = await getDB(env).prepare(`
    SELECT shares FROM publications WHERE id = ?
  `)
    .bind(publicationId)
    .first();

  return ok({
    shares: int(row?.shares)
  });
}

/* =========================================================
   COMMENTS
========================================================= */

async function listComments(request, env) {
  const url = new URL(request.url);

  const publicationId =
    url.searchParams.get("publication_id");

  if (!publicationId) {
    return error("publication_id обязателен");
  }

  const result = await getDB(env).prepare(`
    SELECT
      c.*,
      u.username,
      u.name,
      u.avatar,
      u.verified
    FROM comments c
    LEFT JOIN users u ON u.id = c.user_id
    WHERE c.publication_id = ?
      AND c.deleted = 0
      AND c.hidden = 0
    ORDER BY c.created_at ASC
  `)
    .bind(publicationId)
    .all();

  return ok({
    comments: result.results || []
  });
}

async function createComment(request, env) {
  const user = await requireUser(request, env);
  const data = await bodyJson(request);

  const publicationId = cleanString(
    data.publication_id,
    100
  );

  const commentText = cleanString(
    data.text || data.comment,
    10000
  );

  if (!publicationId || !commentText) {
    return error("Публикация и текст обязательны");
  }

  const publication = await getDB(env)
    .prepare(`
      SELECT id FROM publications WHERE id = ?
    `)
    .bind(publicationId)
    .first();

  if (!publication) {
    return error("Публикация не найдена", 404);
  }

  const id = randomId("com_");
  const timestamp = now();

  await getDB(env).prepare(`
    INSERT INTO comments
    (
      id,
      publication_id,
      user_id,
      parent_id,
      text,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
    .bind(
      id,
      publicationId,
      user.id,
      cleanString(data.parent_id, 100) || null,
      commentText,
      timestamp,
      timestamp
    )
    .run();

  await getDB(env).prepare(`
    UPDATE publications
    SET comments = comments + 1
    WHERE id = ?
  `)
    .bind(publicationId)
    .run();

  return json({
    ok: true,
    comment: {
      id,
      publication_id: publicationId,
      user_id: user.id,
      text: commentText,
      created_at: timestamp
    }
  }, 201);
}

/* =========================================================
   CHAT
========================================================= */

function conversationId(a, b) {
  return [a, b].sort().join(":");
}

async function chatList(request, env) {
  const user = await requireUser(request, env);
  const db = getDB(env);

  const result = await db.prepare(`
    SELECT
      m.*,
      u.username AS other_username,
      u.name AS other_name,
      u.avatar AS other_avatar
    FROM messages m
    LEFT JOIN users u
      ON u.id =
        CASE
          WHEN m.sender_id = ? THEN m.receiver_id
          ELSE m.sender_id
        END
    WHERE m.sender_id = ?
       OR m.receiver_id = ?
    ORDER BY m.created_at DESC
  `)
    .bind(user.id, user.id, user.id)
    .all();

  const seen = new Set();
  const chats = [];

  for (const row of result.results || []) {
    const otherId =
      row.sender_id === user.id
        ? row.receiver_id
        : row.sender_id;

    if (!otherId || seen.has(otherId)) continue;

    seen.add(otherId);

    chats.push({
      user_id: otherId,
      username: row.other_username
        ? "@" + row.other_username
        : "",
      name: row.other_name || "",
      avatar: row.other_avatar || "",
      last_message: row.text || "",
      last_message_at: row.created_at
    });
  }

  return ok({
    chats
  });
}

async function chatMessages(request, env) {
  const user = await requireUser(request, env);
  const url = new URL(request.url);

  const otherUserId =
    url.searchParams.get("user_id") ||
    url.searchParams.get("with");

  if (!otherUserId) {
    return error("user_id обязателен");
  }

  const cid = conversationId(
    user.id,
    otherUserId
  );

  const result = await getDB(env).prepare(`
    SELECT *
    FROM messages
    WHERE conversation_id = ?
    ORDER BY created_at ASC
    LIMIT 500
  `)
    .bind(cid)
    .all();

  return ok({
    messages: result.results || []
  });
}

async function sendChatMessage(request, env) {
  const user = await requireUser(request, env);
  const data = await bodyJson(request);

  const receiverId = cleanString(
    data.receiver_id ||
    data.user_id ||
    data.to,
    100
  );

  const messageText = cleanString(
    data.text || data.message,
    20000
  );

  if (!receiverId) {
    return error("Получатель не указан");
  }

  if (!messageText && !data.media) {
    return error("Сообщение пустое");
  }

  const receiver = await getDB(env)
    .prepare(`
      SELECT id FROM users
      WHERE id = ?
        AND blocked = 0
    `)
    .bind(receiverId)
    .first();

  if (!receiver) {
    return error("Получатель не найден", 404);
  }

  const id = randomId("msg_");
  const cid = conversationId(
    user.id,
    receiverId
  );

  await getDB(env).prepare(`
    INSERT INTO messages
    (
      id,
      sender_id,
      receiver_id,
      conversation_id,
      text,
      media,
      reply_to,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
    .bind(
      id,
      user.id,
      receiverId,
      cid,
      messageText,
      JSON.stringify(data.media || []),
      cleanString(data.reply_to, 100) || null,
      now(),
      now()
    )
    .run();

  await getDB(env).prepare(`
    INSERT INTO notifications
    (
      id,
      user_id,
      type,
      title,
      text,
      data,
      created_at
    )
    VALUES (?, ?, 'message', ?, ?, ?, ?)
  `)
    .bind(
      randomId("not_"),
      receiverId,
      "Новое сообщение",
      messageText.slice(0, 200),
      JSON.stringify({
        message_id: id,
        sender_id: user.id
      }),
      now()
    )
    .run();

  return json({
    ok: true,
    message: {
      id,
      sender_id: user.id,
      receiver_id: receiverId,
      conversation_id: cid,
      text: messageText,
      created_at: now()
    }
  }, 201);
}

async function markChatRead(request, env) {
  const user = await requireUser(request, env);
  const data = await bodyJson(request);

  const otherUserId =
    cleanString(
      data.user_id ||
      data.sender_id,
      100
    );

  if (!otherUserId) {
    return error("user_id обязателен");
  }

  await getDB(env).prepare(`
    UPDATE messages
    SET read = 1
    WHERE sender_id = ?
      AND receiver_id = ?
  `)
    .bind(otherUserId, user.id)
    .run();

  return ok();
}

/* =========================================================
   NOTIFICATIONS
========================================================= */

async function notifications(request, env) {
  const user = await requireUser(request, env);

  const result = await getDB(env).prepare(`
    SELECT *
    FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 200
  `)
    .bind(user.id)
    .all();

  return ok({
    notifications: result.results || []
  });
}

async function notificationRead(request, env) {
  const user = await requireUser(request, env);
  const data = await bodyJson(request);

  const id = cleanString(
    data.id ||
    data.notification_id,
    100
  );

  await getDB(env).prepare(`
    UPDATE notifications
    SET read = 1
    WHERE id = ?
      AND user_id = ?
  `)
    .bind(id, user.id)
    .run();

  return ok();
}

/* =========================================================
   ADMIN LOGIN
========================================================= */

async function adminLogin(request, env) {
  const data = await bodyJson(request);

  const username = normalizeUsername(
    data.username ||
    data.login
  );

  const password = String(data.password || "");

  if (!username || !password) {
    return error("Введите логин и пароль");
  }

  const db = getDB(env);

  let admin = await db.prepare(`
    SELECT *
    FROM admins
    WHERE username = ?
    LIMIT 1
  `)
    .bind(username)
    .first();

  /*
   * Первоначальный администратор создаётся автоматически,
   * если таблица admins пустая.
   *
   * Логин:
   * admin
   *
   * Пароль:
   * admin123
   *
   * После первого входа пароль обязательно поменять
   * через настройки/БД.
   */

  if (!admin) {
    const count = await db.prepare(`
      SELECT COUNT(*) AS count FROM admins
    `).first();

    if (int(count?.count) === 0 &&
        username === "admin" &&
        password === "admin123") {

      const id = randomId("adm_");
      const timestamp = now();
      const passwordHash =
        await hashPassword("admin123");

      await db.prepare(`
        INSERT INTO admins
        (
          id,
          username,
          password_hash,
          name,
          role,
          active,
          created_at
        )
        VALUES (?, ?, ?, ?, 'owner', 1, ?)
      `)
        .bind(
          id,
          "admin",
          passwordHash,
          "Administrator",
          timestamp
        )
        .run();

      admin = await db.prepare(`
        SELECT * FROM admins WHERE id = ?
      `)
        .bind(id)
        .first();
    }
  }

  if (!admin || !admin.active) {
    return error(
      "Неверные данные администратора",
      401
    );
  }

  const passwordHash =
    await hashPassword(password);

  if (passwordHash !== admin.password_hash) {
    return error(
      "Неверные данные администратора",
      401
    );
  }

  const sessionId = randomId("admin_");

  const expires = new Date(
    Date.now() +
    ADMIN_SESSION_HOURS * 3600000
  ).toISOString();

  await db.prepare(`
    INSERT INTO sessions
    (
      id,
      user_id,
      type,
      expires_at,
      created_at
    )
    VALUES (?, ?, 'admin', ?, ?)
  `)
    .bind(
      sessionId,
      admin.id,
      expires,
      now()
    )
    .run();

  return new Response(
    JSON.stringify({
      ok: true,
      admin: {
        id: admin.id,
        username: "@" + admin.username,
        name: admin.name,
        role: admin.role
      }
    }),
    {
      headers: headersWithCookies(
        {
          "content-type":
            "application/json; charset=utf-8",
          ...SECURITY_HEADERS
        },
        [
          cookie(
            COOKIE_ADMIN,
            sessionId,
            ADMIN_SESSION_HOURS * 3600
          )
        ]
      )
    }
  );
}

async function adminLogout(request, env) {
  const token = cookieValue(
    request,
    COOKIE_ADMIN
  );

  if (token) {
    await getDB(env)
      .prepare(`
        DELETE FROM sessions WHERE id = ?
      `)
      .bind(token)
      .run();
  }

  return new Response(
    JSON.stringify({
      ok: true
    }),
    {
      headers: headersWithCookies(
        {
          "content-type":
            "application/json; charset=utf-8",
          ...SECURITY_HEADERS
        },
        [
          deleteCookie(COOKIE_ADMIN)
        ]
      )
    }
  );
}

async function adminMe(request, env) {
  const admin =
    await getAdminFromSession(
      request,
      env
    );

  return ok({
    authenticated: !!admin,
    admin: admin
      ? {
          id: admin.id,
          username: "@" + admin.username,
          name: admin.name,
          role: admin.role
        }
      : null
  });
}

/* =========================================================
   ADMIN DASHBOARD
========================================================= */

async function adminDashboard(request, env) {
  const admin =
    await requireAdmin(request, env);

  const db = getDB(env);

  const [
    users,
    publications,
    pending,
    published,
    rejected,
    hidden,
    views,
    likes,
    comments
  ] = await Promise.all([
    db.prepare(`
      SELECT COUNT(*) AS count FROM users
    `).first(),

    db.prepare(`
      SELECT COUNT(*) AS count FROM publications
    `).first(),

    db.prepare(`
      SELECT COUNT(*) AS count
      FROM publications
      WHERE status = 'pending'
    `).first(),

    db.prepare(`
      SELECT COUNT(*) AS count
      FROM publications
      WHERE status = 'published'
    `).first(),

    db.prepare(`
      SELECT COUNT(*) AS count
      FROM publications
      WHERE status = 'rejected'
    `).first(),

    db.prepare(`
      SELECT COUNT(*) AS count
      FROM publications
      WHERE status = 'hidden'
         OR status = 'deleted'
    `).first(),

    db.prepare(`
      SELECT COALESCE(SUM(views), 0) AS total
      FROM publications
    `).first(),

    db.prepare(`
      SELECT COALESCE(SUM(likes), 0) AS total
      FROM publications
    `).first(),

    db.prepare(`
      SELECT COALESCE(SUM(comments), 0) AS total
      FROM publications
    `).first()
  ]);

  await audit(
    env,
    admin.id,
    "dashboard_view"
  );

  return ok({
    stats: {
      users: int(users?.count),
      usersCount: int(users?.count),

      publications: int(publications?.count),
      total: int(publications?.count),

      pending: int(pending?.count),
      pendingCount: int(pending?.count),

      published: int(published?.count),
      approved: int(published?.count),
      approvedCount: int(published?.count),

      rejected: int(rejected?.count),
      rejectedCount: int(rejected?.count),

      hidden: int(hidden?.count),
      trash: int(hidden?.count),
      trashCount: int(hidden?.count),

      views: int(views?.total),
      viewsCount: int(views?.total),

      likes: int(likes?.total),
      likesCount: int(likes?.total),

      comments: int(comments?.total),
      commentsCount: int(comments?.total)
    }
  });
}

/* =========================================================
   ADMIN NOTIFICATIONS
========================================================= */

async function adminNotifications(request, env) {
  await requireAdmin(request, env);

  const result = await getDB(env).prepare(`
    SELECT *
    FROM notifications
    ORDER BY created_at DESC
    LIMIT 300
  `).all();

  return ok({
    notifications: result.results || []
  });
}

/* =========================================================
   ADMIN USERS
========================================================= */

async function adminUsers(request, env) {
  await requireAdmin(request, env);

  const url = new URL(request.url);

  const search = cleanString(
    url.searchParams.get("search") ||
    url.searchParams.get("q"),
    200
  );

  const limit = Math.min(
    200,
    Math.max(
      1,
      int(url.searchParams.get("limit"), 100)
    )
  );

  let sql = `
    SELECT *
    FROM users
  `;

  const binds = [];

  if (search) {
    sql += `
      WHERE
        username LIKE ?
        OR name LIKE ?
        OR id LIKE ?
        OR email LIKE ?
    `;

    const q = `%${search}%`;

    binds.push(q, q, q, q);
  }

  sql += `
    ORDER BY created_at DESC
    LIMIT ?
  `;

  binds.push(limit);

  const result = await getDB(env)
    .prepare(sql)
    .bind(...binds)
    .all();

  return ok({
    users: (result.results || [])
      .map(normalizeUser)
  });
}

async function adminUser(request, env) {
  await requireAdmin(request, env);

  const url = new URL(request.url);

  const id =
    url.searchParams.get("id") ||
    url.searchParams.get("user_id");

  if (!id) {
    return error("id обязателен");
  }

  const db = getDB(env);

  const user = await db.prepare(`
    SELECT * FROM users
    WHERE id = ?
  `)
    .bind(id)
    .first();

  if (!user) {
    return error("Пользователь не найден", 404);
  }

  const publications = await db.prepare(`
    SELECT COUNT(*) AS count
    FROM publications
    WHERE user_id = ?
  `)
    .bind(id)
    .first();

  const comments = await db.prepare(`
    SELECT COUNT(*) AS count
    FROM comments
    WHERE user_id = ?
  `)
    .bind(id)
    .first();

  return ok({
    user: normalizeUser(user),
    stats: {
      publications: int(publications?.count),
      comments: int(comments?.count)
    }
  });
}

/* =========================================================
   ADMIN EDIT USER
========================================================= */

async function adminEditUser(request, env) {
  const admin =
    await requireAdmin(request, env);

  const data = await bodyJson(request);

  const id = cleanString(
    data.id ||
    data.user_id,
    100
  );

  if (!id) {
    return error("id обязателен");
  }

  const fields = [];
  const values = [];

  const allowed = [
    ["name", 120],
    ["email", 200],
    ["avatar", 2000],
    ["bio", 5000],
    ["city", 120],
    ["country", 120],
    ["language", 20],
    ["role", 50]
  ];

  for (const [field, max] of allowed) {
    if (data[field] !== undefined) {
      fields.push(`${field} = ?`);
      values.push(cleanString(data[field], max));
    }
  }

  if (data.verified !== undefined) {
    fields.push("verified = ?");
    values.push(bool(data.verified) ? 1 : 0);
  }

  if (data.blocked !== undefined) {
    fields.push("blocked = ?");
    values.push(bool(data.blocked) ? 1 : 0);
  }

  if (!fields.length) {
    return error("Нет изменений");
  }

  fields.push("updated_at = ?");
  values.push(now());
  values.push(id);

  await getDB(env).prepare(`
    UPDATE users
    SET ${fields.join(", ")}
    WHERE id = ?
  `)
    .bind(...values)
    .run();

  await audit(
    env,
    admin.id,
    "user_edit",
    "user",
    id,
    data
  );

  const user = await getDB(env)
    .prepare(`
      SELECT * FROM users WHERE id = ?
    `)
    .bind(id)
    .first();

  return ok({
    user: normalizeUser(user)
  });
}

/* =========================================================
   ADMIN USER ACTION
========================================================= */

async function adminUserAction(request, env) {
  const admin =
    await requireAdmin(request, env);

  const data = await bodyJson(request);

  const id = cleanString(
    data.id ||
    data.user_id,
    100
  );

  const action = cleanString(
    data.action,
    100
  ).toLowerCase();

  if (!id || !action) {
    return error("id и action обязательны");
  }

  const db = getDB(env);

  const actions = {
    block: `
      UPDATE users
      SET blocked = 1, updated_at = ?
      WHERE id = ?
    `,

    unblock: `
      UPDATE users
      SET blocked = 0, updated_at = ?
      WHERE id = ?
    `,

    verify: `
      UPDATE users
      SET verified = 1, updated_at = ?
      WHERE id = ?
    `,

    unverify: `
      UPDATE users
      SET verified = 0, updated_at = ?
      WHERE id = ?
    `,

    moderator: `
      UPDATE users
      SET role = 'moderator', updated_at = ?
      WHERE id = ?
    `,

    removeModerator: `
      UPDATE users
      SET role = 'user', updated_at = ?
      WHERE id = ?
    `,

    delete: `
      UPDATE users
      SET blocked = 1, updated_at = ?
      WHERE id = ?
    `
  };

  if (!actions[action]) {
    return error("Неизвестное действие");
  }

  await db.prepare(actions[action])
    .bind(now(), id)
    .run();

  await audit(
    env,
    admin.id,
    "user_action",
    "user",
    id,
    { action }
  );

  return ok({
    action,
    user_id: id
  });
}

/* =========================================================
   ADMIN PUBLICATIONS
========================================================= */

async function adminPublications(request, env) {
  await requireAdmin(request, env);

  const url = new URL(request.url);

  const status = cleanString(
    url.searchParams.get("status"),
    50
  );

  const search = cleanString(
    url.searchParams.get("search") ||
    url.searchParams.get("q"),
    200
  );

  const limit = Math.min(
    300,
    Math.max(
      1,
      int(url.searchParams.get("limit"), 100)
    )
  );

  let sql = `
    SELECT
      p.*,
      u.username AS author_username,
      u.name AS author_name,
      u.avatar AS author_avatar
    FROM publications p
    LEFT JOIN users u
      ON u.id = p.user_id
    WHERE 1 = 1
  `;

  const binds = [];

  if (status && status !== "all") {
    sql += ` AND p.status = ?`;
    binds.push(status);
  }

  if (search) {
    sql += `
      AND (
        p.title LIKE ?
        OR p.text LIKE ?
        OR p.id LIKE ?
        OR u.username LIKE ?
        OR u.name LIKE ?
      )
    `;

    const q = `%${search}%`;

    binds.push(
      q,
      q,
      q,
      q,
      q
    );
  }

  sql += `
    ORDER BY p.pinned DESC,
             p.featured DESC,
             p.created_at DESC
    LIMIT ?
  `;

  binds.push(limit);

  const result = await getDB(env)
    .prepare(sql)
    .bind(...binds)
    .all();

  const publications =
    (result.results || [])
      .map(row => ({
        ...normalizePublication(row),
        author: {
          id: row.user_id,
          username: row.author_username
            ? "@" + row.author_username
            : "",
          name: row.author_name || "",
          avatar: row.author_avatar || ""
        }
      }));

  return ok({
    publications,
    posts: publications,
    items: publications
  });
}

/* =========================================================
   ADMIN EDIT PUBLICATION
========================================================= */

async function adminEditPublication(request, env) {
  const admin =
    await requireAdmin(request, env);

  const data = await bodyJson(request);

  const id = cleanString(
    data.id ||
    data.publication_id,
    100
  );

  if (!id) {
    return error("publication_id обязателен");
  }

  const fields = [];
  const values = [];

  if (data.title !== undefined) {
    fields.push("title = ?");
    values.push(cleanString(data.title, 300));
  }

  if (
    data.text !== undefined ||
    data.description !== undefined
  ) {
    fields.push("text = ?");
    values.push(
      cleanString(
        data.text ?? data.description,
        50000
      )
    );
  }

  if (data.category !== undefined) {
    fields.push("category = ?");
    values.push(cleanString(data.category, 80));
  }

  if (data.city !== undefined) {
    fields.push("city = ?");
    values.push(cleanString(data.city, 120));
  }

  if (data.country !== undefined) {
    fields.push("country = ?");
    values.push(cleanString(data.country, 120));
  }

  if (data.status !== undefined &&
      STATUSES.includes(data.status)) {
    fields.push("status = ?");
    values.push(data.status);
  }

  if (data.media !== undefined) {
    fields.push("media = ?");
    values.push(
      JSON.stringify(
        Array.isArray(data.media)
          ? data.media
          : []
      )
    );
  }

  if (data.hashtags !== undefined) {
    fields.push("hashtags = ?");
    values.push(
      JSON.stringify(
        Array.isArray(data.hashtags)
          ? data.hashtags
          : []
      )
    );
  }

  if (!fields.length) {
    return error("Нет изменений");
  }

  fields.push("updated_at = ?");
  values.push(now());
  values.push(id);

  const result = await getDB(env)
    .prepare(`
      UPDATE publications
      SET ${fields.join(", ")}
      WHERE id = ?
    `)
    .bind(...values)
    .run();

  if (!result.meta.changes) {
    return error("Публикация не найдена", 404);
  }

  await audit(
    env,
    admin.id,
    "publication_edit",
    "publication",
    id,
    data
  );

  const publication =
    await getDB(env)
      .prepare(`
        SELECT * FROM publications WHERE id = ?
      `)
      .bind(id)
      .first();

  return ok({
    publication:
      normalizePublication(publication)
  });
}

/* =========================================================
   ADMIN PUBLICATION ACTION
========================================================= */

async function adminPublicationAction(request, env) {
  const admin =
    await requireAdmin(request, env);

  const data = await bodyJson(request);

  const id = cleanString(
    data.id ||
    data.publication_id,
    100
  );

  const action = cleanString(
    data.action,
    100
  ).toLowerCase();

  if (!id || !action) {
    return error("id и action обязательны");
  }

  const db = getDB(env);

  const actions = {
    approve: {
      status: "published"
    },

    publish: {
      status: "published"
    },

    reject: {
      status: "rejected"
    },

    hide: {
      status: "hidden"
    },

    delete: {
      status: "deleted"
    },

    trash: {
      status: "deleted"
    },

    restore: {
      status: "published"
    },

    pin: {
      pinned: 1
    },

    unpin: {
      pinned: 0
    },

    feature: {
      featured: 1
    },

    unfeature: {
      featured: 0
    },

    waiting_payment: {
      status: "waiting_payment"
    },

    paid: {
      status: "paid"
    }
  };

  const operation = actions[action];

  if (!operation) {
    return error("Неизвестное действие");
  }

  const fields = [];
  const values = [];

  if (
    operation.status !== undefined
  ) {
    fields.push("status = ?");
    values.push(operation.status);
  }

  if (
    operation.pinned !== undefined
  ) {
    fields.push("pinned = ?");
    values.push(operation.pinned);
  }

  if (
    operation.featured !== undefined
  ) {
    fields.push("featured = ?");
    values.push(operation.featured);
  }

  fields.push("updated_at = ?");
  values.push(now());
  values.push(id);

  await db.prepare(`
    UPDATE publications
    SET ${fields.join(", ")}
    WHERE id = ?
  `)
    .bind(...values)
    .run();

  await audit(
    env,
    admin.id,
    "publication_action",
    "publication",
    id,
    { action }
  );

  return ok({
    publication_id: id,
    action
  });
}

/* =========================================================
   ⭐ ADMIN COUNTERS
========================================================= */

async function adminPublicationCounters(
  request,
  env
) {
  const admin =
    await requireAdmin(request, env);

  const data = await bodyJson(request);

  const id = cleanString(
    data.publication_id ||
    data.id,
    100
  );

  if (!id) {
    return error(
      "publication_id обязателен"
    );
  }

  /*
   * ВАЖНО:
   * Здесь значения сохраняются непосредственно
   * в D1.
   *
   * Поэтому если администратор установит:
   *
   * likes = 9999999999999
   *
   * это число будет сохранено на сервере.
   *
   * После этого все пользователи,
   * получающие публикацию через API,
   * увидят это значение.
   */

  const fields = [];
  const values = [];

  const counters = [
    "views",
    "likes",
    "comments",
    "saves",
    "shares",
    "love",
    "support",
    "funny",
    "wow",
    "sad",
    "angry"
  ];

  for (const field of counters) {
    if (data[field] !== undefined) {
      const value =
        Number.isFinite(Number(data[field]))
          ? Math.max(
              0,
              Math.floor(
                Number(data[field])
              )
            )
          : 0;

      fields.push(`${field} = ?`);
      values.push(value);
    }
  }

  if (!fields.length) {
    return error(
      "Не передан ни один счётчик"
    );
  }

  fields.push("updated_at = ?");
  values.push(now());
  values.push(id);

  const db = getDB(env);

  const result = await db.prepare(`
    UPDATE publications
    SET ${fields.join(", ")}
    WHERE id = ?
  `)
    .bind(...values)
    .run();

  if (!result.meta.changes) {
    return error(
      "Публикация не найдена",
      404
    );
  }

  const updated = await db.prepare(`
    SELECT *
    FROM publications
    WHERE id = ?
  `)
    .bind(id)
    .first();

  await audit(
    env,
    admin.id,
    "publication_counters_edit",
    "publication",
    id,
    data
  );

  return ok({
    publication:
      normalizePublication(updated),

    counters: {
      views: int(updated.views),
      likes: int(updated.likes),
      comments: int(updated.comments),
      saves: int(updated.saves),
      shares: int(updated.shares),
      love: int(updated.love),
      support: int(updated.support),
      funny: int(updated.funny),
      wow: int(updated.wow),
      sad: int(updated.sad),
      angry: int(updated.angry)
    }
  });
}

/* =========================================================
   ADMIN COMMENTS
========================================================= */

async function adminComments(request, env) {
  await requireAdmin(request, env);

  const url = new URL(request.url);

  const limit = Math.min(
    500,
    Math.max(
      1,
      int(url.searchParams.get("limit"), 100)
    )
  );

  const result = await getDB(env).prepare(`
    SELECT
      c.*,
      u.username,
      u.name,
      u.avatar,
      p.title AS publication_title
    FROM comments c
    LEFT JOIN users u
      ON u.id = c.user_id
    LEFT JOIN publications p
      ON p.id = c.publication_id
    ORDER BY c.created_at DESC
    LIMIT ?
  `)
    .bind(limit)
    .all();

  return ok({
    comments: result.results || []
  });
}

async function adminEditComment(request, env) {
  const admin =
    await requireAdmin(request, env);

  const data = await bodyJson(request);

  const id = cleanString(
    data.id ||
    data.comment_id,
    100
  );

  const commentText = cleanString(
    data.text,
    10000
  );

  if (!id || !commentText) {
    return error("id и text обязательны");
  }

  await getDB(env).prepare(`
    UPDATE comments
    SET text = ?,
        updated_at = ?
    WHERE id = ?
  `)
    .bind(
      commentText,
      now(),
      id
    )
    .run();

  await audit(
    env,
    admin.id,
    "comment_edit",
    "comment",
    id
  );

  return ok({
    comment_id: id
  });
}

async function adminCommentAction(request, env) {
  const admin =
    await requireAdmin(request, env);

  const data = await bodyJson(request);

  const id = cleanString(
    data.id ||
    data.comment_id,
    100
  );

  const action = cleanString(
    data.action,
    100
  ).toLowerCase();

  if (!id || !action) {
    return error("id и action обязательны");
  }

  const db = getDB(env);

  if (action === "hide") {
    await db.prepare(`
      UPDATE comments
      SET hidden = 1,
          updated_at = ?
      WHERE id = ?
    `)
      .bind(now(), id)
      .run();
  }

  else if (
    action === "show" ||
    action === "unhide"
  ) {
    await db.prepare(`
      UPDATE comments
      SET hidden = 0,
          deleted = 0,
          updated_at = ?
      WHERE id = ?
    `)
      .bind(now(), id)
      .run();
  }

  else if (
    action === "delete" ||
    action === "trash"
  ) {
    await db.prepare(`
      UPDATE comments
      SET deleted = 1,
          updated_at = ?
      WHERE id = ?
    `)
      .bind(now(), id)
      .run();
  }

  else if (action === "restore") {
    await db.prepare(`
      UPDATE comments
      SET deleted = 0,
          hidden = 0,
          updated_at = ?
      WHERE id = ?
    `)
      .bind(now(), id)
      .run();
  }

  else {
    return error("Неизвестное действие");
  }

  await audit(
    env,
    admin.id,
    "comment_action",
    "comment",
    id,
    { action }
  );

  return ok({
    comment_id: id,
    action
  });
}

/* =========================================================
   ADMIN CHATS
========================================================= */

async function adminChats(request, env) {
  await requireAdmin(request, env);

  const result = await getDB(env).prepare(`
    SELECT
      m.*,
      u.username,
      u.name,
      u.avatar
    FROM messages m
    LEFT JOIN users u
      ON u.id = m.sender_id
    ORDER BY m.created_at DESC
    LIMIT 500
  `).all();

  const map = new Map();

  for (const row of result.results || []) {
    const userId =
      row.sender_id ||
      row.receiver_id;

    if (!userId) continue;

    if (!map.has(userId)) {
      map.set(userId, {
        user_id: userId,
        username: row.username
          ? "@" + row.username
          : "",
        name: row.name || "",
        avatar: row.avatar || "",
        last_message: row.text || "",
        last_message_at: row.created_at
      });
    }
  }

  return ok({
    chats: [...map.values()]
  });
}

async function adminChatMessages(
  request,
  env
) {
  await requireAdmin(request, env);

  const url = new URL(request.url);

  const userId =
    url.searchParams.get("user_id");

  if (!userId) {
    return error("user_id обязателен");
  }

  const official =
    await getOfficialUser(env);

  const officialId = official?.id;

  const result = await getDB(env).prepare(`
    SELECT *
    FROM messages
    WHERE
      (sender_id = ? AND receiver_id = ?)
      OR
      (sender_id = ? AND receiver_id = ?)
    ORDER BY created_at ASC
    LIMIT 500
  `)
    .bind(
      userId,
      officialId || "OFFICIAL",
      officialId || "OFFICIAL",
      userId
    )
    .all();

  return ok({
    messages: result.results || [],
    official: {
      name: OFFICIAL_NAME,
      username: OFFICIAL_USERNAME
    }
  });
}

async function getOfficialUser(env) {
  return getDB(env)
    .prepare(`
      SELECT *
      FROM users
      WHERE username = ?
      LIMIT 1
    `)
    .bind(
      normalizeUsername(
        OFFICIAL_USERNAME
      )
    )
    .first();
}

async function ensureOfficialUser(env) {
  const db = getDB(env);

  let official =
    await getOfficialUser(env);

  if (official) {
    return official;
  }

  const id = randomId("official_");
  const timestamp = now();

  await db.prepare(`
    INSERT INTO users
    (
      id,
      username,
      name,
      verified,
      role,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, 1, 'official', ?, ?)
  `)
    .bind(
      id,
      normalizeUsername(
        OFFICIAL_USERNAME
      ),
      OFFICIAL_NAME,
      timestamp,
      timestamp
    )
    .run();

  return db.prepare(`
    SELECT *
    FROM users
    WHERE id = ?
  `)
    .bind(id)
    .first();
}

async function adminChatSend(
  request,
  env
) {
  const admin =
    await requireAdmin(request, env);

  const data = await bodyJson(request);

  const userId = cleanString(
    data.user_id ||
    data.receiver_id,
    100
  );

  const messageText = cleanString(
    data.text ||
    data.message,
    20000
  );

  if (!userId || !messageText) {
    return error(
      "user_id и text обязательны"
    );
  }

  const official =
    await ensureOfficialUser(env);

  const cid = conversationId(
    official.id,
    userId
  );

  const id = randomId("msg_");
  const timestamp = now();

  await getDB(env).prepare(`
    INSERT INTO messages
    (
      id,
      sender_id,
      receiver_id,
      conversation_id,
      text,
      media,
      reply_to,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
    .bind(
      id,
      official.id,
      userId,
      cid,
      messageText,
      JSON.stringify(data.media || []),
      cleanString(
        data.reply_to,
        100
      ) || null,
      timestamp,
      timestamp
    )
    .run();

  await getDB(env).prepare(`
    INSERT INTO notifications
    (
      id,
      user_id,
      type,
      title,
      text,
      data,
      created_at
    )
    VALUES (?, ?, 'admin_message', ?, ?, ?, ?)
  `)
    .bind(
      randomId("not_"),
      userId,
      OFFICIAL_NAME,
      messageText.slice(0, 200),
      JSON.stringify({
        message_id: id,
        admin_id: admin.id,
        official: true
      }),
      timestamp
    )
    .run();

  await audit(
    env,
    admin.id,
    "admin_chat_send",
    "user",
    userId
  );

  return json({
    ok: true,
    message: {
      id,
      sender_id: official.id,
      receiver_id: userId,
      conversation_id: cid,
      text: messageText,
      created_at: timestamp,
      official: true,
      sender_name: OFFICIAL_NAME,
      sender_username: OFFICIAL_USERNAME
    }
  }, 201);
}

/* =========================================================
   ADMIN PAYMENT
========================================================= */

async function adminPayment(request, env) {
  const admin =
    await requireAdmin(request, env);

  const data = await bodyJson(request);

  const publicationId =
    cleanString(
      data.publication_id,
      100
    );

  const amount = int(
    data.amount ||
    data.price
  );

  if (!publicationId) {
    return error(
      "publication_id обязателен"
    );
  }

  const publication =
    await getDB(env)
      .prepare(`
        SELECT *
        FROM publications
        WHERE id = ?
      `)
      .bind(publicationId)
      .first();

  if (!publication) {
    return error(
      "Публикация не найдена",
      404
    );
  }

  const orderId =
    randomId("order_");

  await getDB(env).prepare(`
    INSERT INTO publication_orders
    (
      id,
      publication_id,
      user_id,
      amount,
      status,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, 'paid', ?, ?)
  `)
    .bind(
      orderId,
      publicationId,
      publication.user_id,
      amount,
      now(),
      now()
    )
    .run();

  await getDB(env).prepare(`
    UPDATE publications
    SET status = 'paid',
        updated_at = ?
    WHERE id = ?
  `)
    .bind(
      now(),
      publicationId
    )
    .run();

  await audit(
    env,
    admin.id,
    "payment_confirm",
    "publication",
    publicationId,
    {
      amount,
      order_id: orderId
    }
  );

  return ok({
    order_id: orderId,
    publication_id: publicationId,
    amount,
    status: "paid"
  });
}

/* =========================================================
   ADMIN DELETE / RESTORE
========================================================= */

async function adminTrashAllPosts(
  request,
  env
) {
  const admin =
    await requireAdmin(request, env);

  await getDB(env).prepare(`
    UPDATE publications
    SET status = 'deleted',
        updated_at = ?
    WHERE status != 'deleted'
  `)
    .bind(now())
    .run();

  await audit(
    env,
    admin.id,
    "trash_all_publications"
  );

  return ok();
}

/* =========================================================
   ROUTER
========================================================= */

async function router(request, env) {
  await initDB(env);

  const url = new URL(request.url);

  const pathname =
    url.pathname.replace(/\/+$/, "") ||
    "/";

  const method = request.method.toUpperCase();

  /* ---------- AUTH ---------- */

  if (
    pathname === "/api/auth/register" &&
    method === "POST"
  ) {
    return register(request, env);
  }

  if (
    pathname === "/api/auth/login" &&
    method === "POST"
  ) {
    return login(request, env);
  }

  if (
    pathname === "/api/auth/logout" &&
    method === "POST"
  ) {
    return logoutUser(request, env);
  }

  if (
    pathname === "/api/auth/me" &&
    method === "GET"
  ) {
    return authMe(request, env);
  }

  if (
    pathname === "/api/username/check" &&
    method === "GET"
  ) {
    return usernameCheck(
      request,
      env
    );
  }

  /* ---------- PROFILE ---------- */

  if (
    pathname === "/api/profile" &&
    method === "GET"
  ) {
    return getProfile(
      request,
      env
    );
  }

  if (
    pathname === "/api/profile" &&
    method === "PUT"
  ) {
    return updateProfile(
      request,
      env
    );
  }

  if (
    pathname === "/api/profile/public" &&
    method === "GET"
  ) {
    return publicProfile(
      request,
      env
    );
  }

  /* ---------- CATEGORIES ---------- */

  if (
    pathname === "/api/categories" &&
    method === "GET"
  ) {
    return categories();
  }

  /* ---------- PUBLICATIONS ---------- */

  if (
    pathname === "/api/publications" &&
    method === "POST"
  ) {
    return createPublication(
      request,
      env
    );
  }

  if (
    pathname === "/api/publications" &&
    method === "GET"
  ) {
    return listPublications(
      request,
      env
    );
  }

  if (
    pathname === "/api/publications/view" &&
    method === "POST"
  ) {
    return publicationView(
      request,
      env
    );
  }

  if (
    pathname === "/api/publications/react" &&
    method === "POST"
  ) {
    return publicationReact(
      request,
      env
    );
  }

  if (
    pathname === "/api/publications/save" &&
    method === "POST"
  ) {
    return publicationSave(
      request,
      env
    );
  }

  if (
    pathname === "/api/publications/share" &&
    method === "POST"
  ) {
    return publicationShare(
      request,
      env
    );
  }

  const publicationMatch =
    pathname.match(
      /^\/api\/publications\/([^/]+)$/
    );

  if (
    publicationMatch &&
    method === "GET"
  ) {
    return getPublication(
      request,
      env,
      decodeURIComponent(
        publicationMatch[1]
      )
    );
  }

  /* ---------- COMMENTS ---------- */

  if (
    pathname === "/api/comments" &&
    method === "GET"
  ) {
    return listComments(
      request,
      env
    );
  }

  if (
    pathname === "/api/comments" &&
    method === "POST"
  ) {
    return createComment(
      request,
      env
    );
  }

  /* ---------- CHAT ---------- */

  if (
    pathname === "/api/chat" &&
    method === "GET"
  ) {
    return chatList(
      request,
      env
    );
  }

  if (
    pathname === "/api/chat/messages" &&
    method === "GET"
  ) {
    return chatMessages(
      request,
      env
    );
  }

  if (
    pathname === "/api/chat/messages" &&
    method === "POST"
  ) {
    return sendChatMessage(
      request,
      env
    );
  }

  if (
    pathname === "/api/chat/read" &&
    method === "POST"
  ) {
    return markChatRead(
      request,
      env
    );
  }

  /* ---------- NOTIFICATIONS ---------- */

  if (
    pathname === "/api/notifications" &&
    method === "GET"
  ) {
    return notifications(
      request,
      env
    );
  }

  if (
    pathname === "/api/notifications/read" &&
    method === "POST"
  ) {
    return notificationRead(
      request,
      env
    );
  }

  /* ---------- ADMIN AUTH ---------- */

  if (
    pathname === "/api/admin/login" &&
    method === "POST"
  ) {
    return adminLogin(
      request,
      env
    );
  }

  if (
    pathname === "/api/admin/logout" &&
    method === "POST"
  ) {
    return adminLogout(
      request,
      env
    );
  }

  if (
    pathname === "/api/admin/me" &&
    method === "GET"
  ) {
    return adminMe(
      request,
      env
    );
  }

  /* ---------- ADMIN DASHBOARD ---------- */

  if (
    pathname === "/api/admin/dashboard" &&
    method === "GET"
  ) {
    return adminDashboard(
      request,
      env
    );
  }

  if (
    pathname === "/api/admin/notifications" &&
    method === "GET"
  ) {
    return adminNotifications(
      request,
      env
    );
  }

  /* ---------- ADMIN USERS ---------- */

  if (
    pathname === "/api/admin/users" &&
    method === "GET"
  ) {
    return adminUsers(
      request,
      env
    );
  }

  if (
    pathname === "/api/admin/user" &&
    method === "GET"
  ) {
    return adminUser(
      request,
      env
    );
  }

  if (
    pathname === "/api/admin/user/edit" &&
    method === "POST"
  ) {
    return adminEditUser(
      request,
      env
    );
  }

  if (
    pathname === "/api/admin/user/action" &&
    method === "POST"
  ) {
    return adminUserAction(
      request,
      env
    );
  }

  /* ---------- ADMIN PUBLICATIONS ---------- */

  if (
    pathname === "/api/admin/publications" &&
    method === "GET"
  ) {
    return adminPublications(
      request,
      env
    );
  }

  if (
    pathname === "/api/admin/publication/edit" &&
    method === "POST"
  ) {
    return adminEditPublication(
      request,
      env
    );
  }

  if (
    pathname === "/api/admin/publication/action" &&
    method === "POST"
  ) {
    return adminPublicationAction(
      request,
      env
    );
  }

  if (
    pathname === "/api/admin/publication/counters" &&
    method === "POST"
  ) {
    return adminPublicationCounters(
      request,
      env
    );
  }

  /* ---------- ADMIN COMMENTS ---------- */

  if (
    pathname === "/api/admin/comments" &&
    method === "GET"
  ) {
    return adminComments(
      request,
      env
    );
  }

  if (
    pathname === "/api/admin/comment/edit" &&
    method === "POST"
  ) {
    return adminEditComment(
      request,
      env
    );
  }

  if (
    pathname === "/api/admin/comment/action" &&
    method === "POST"
  ) {
    return adminCommentAction(
      request,
      env
    );
  }

  /* ---------- ADMIN CHAT ---------- */

  if (
    pathname === "/api/admin/chats" &&
    method === "GET"
  ) {
    return adminChats(
      request,
      env
    );
  }

  if (
    pathname === "/api/admin/chat/messages" &&
    method === "GET"
  ) {
    return adminChatMessages(
      request,
      env
    );
  }

  if (
    pathname === "/api/admin/chat/send" &&
    method === "POST"
  ) {
    return adminChatSend(
      request,
      env
    );
  }

  /* ---------- ADMIN PAYMENT ---------- */

  if (
    pathname === "/api/admin/payment" &&
    method === "POST"
  ) {
    return adminPayment(
      request,
      env
    );
  }

  /* ---------- ADMIN TRASH ---------- */

  if (
    pathname === "/api/admin/publications/trash-all" &&
    method === "POST"
  ) {
    return adminTrashAllPosts(
      request,
      env
    );
  }

  /* ---------- HEALTH ---------- */

  if (
    pathname === "/api/health" &&
    method === "GET"
  ) {
    return ok({
      service: "Tajik Opportunities API",
      status: "online",
      version: "5.0.0",
      time: now()
    });
  }

  if (pathname === "/") {
    return text(
      "🇹🇯 Tajik Opportunities API is running."
    );
  }

  return error(
    "API endpoint not found",
    404
  );
}

/* =========================================================
   MAIN WORKER
========================================================= */

export default {
  async fetch(request, env, ctx) {
    try {
      const response =
        await router(request, env);

      /*
       * CORS для собственного сайта.
       * Cookie используются только через same-origin.
       */

      const headers =
        new Headers(response.headers);

      headers.set(
        "access-control-allow-origin",
        request.headers.get("Origin") || "*"
      );

      headers.set(
        "access-control-allow-credentials",
        "true"
      );

      headers.set(
        "access-control-allow-methods",
        "GET,POST,PUT,DELETE,OPTIONS"
      );

      headers.set(
        "access-control-allow-headers",
        "Content-Type, Authorization"
      );

      return new Response(
        response.body,
        {
          status: response.status,
          statusText: response.statusText,
          headers
        }
      );

    } catch (err) {
      console.error(
        "Tajik Opportunities Worker error:",
        err
      );

      if (err instanceof Response) {
        return err;
      }

      return error(
        "Внутренняя ошибка сервера",
        500
      );
    }
  }
};
