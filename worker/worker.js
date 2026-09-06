// ============================================================
// TAJIK OPPORTUNITIES
// CLOUDFLARE WORKER
// VERSION: 2026.09.07 SUPER PROJECT
//
// Includes:
// - Authentication
// - Registration / Login / Logout
// - Cookie sessions
// - Profiles
// - Public profiles
// - Username checking
// - Publications
// - Publication moderation
// - Admin panel API
// - Super Admin
// - Admin / Moderator permissions
// - User management
// - Admin chat
// - Notifications
// - Audit logs
// - Dashboard statistics
// - D1 + KV compatibility
// - Dynamic database schema detection
// - Security headers
// ============================================================

const VERSION = "2026.09.07";
const SESSION_COOKIE = "to_session";
const SESSION_DAYS = 30;
const MAX_BODY = 2 * 1024 * 1024;

const ALLOWED_ORIGINS = [
  "https://tajik-opportunities.com",
  "https://www.tajik-opportunities.com"
];

// ============================================================
// MAIN
// ============================================================

export default {
  async fetch(request, env, ctx) {
    try {
      return await handleRequest(request, env, ctx);
    } catch (error) {
      console.error("WORKER ERROR:", error);

      return json({
        ok: false,
        error: "INTERNAL_ERROR",
        message: "Внутренняя ошибка сервера.",
        version: VERSION
      }, 500, request, env);
    }
  }
};

// ============================================================
// REQUEST ROUTER
// ============================================================

async function handleRequest(request, env, ctx) {
  const url = new URL(request.url);
  const path = normalizePath(url.pathname);

  if (request.method === "OPTIONS") {
    return corsResponse(request, env);
  }

  if (request.method === "HEAD") {
    return new Response(null, {
      status: 200,
      headers: securityHeaders(request, env)
    });
  }

  if (
    request.method !== "GET" &&
    request.method !== "POST" &&
    request.method !== "PUT" &&
    request.method !== "PATCH" &&
    request.method !== "DELETE"
  ) {
    return json({
      ok: false,
      error: "METHOD_NOT_ALLOWED"
    }, 405, request, env);
  }

  // Health
  if (path === "/health" || path === "/api/health") {
    return json({
      ok: true,
      service: "Tajik Opportunities",
      version: VERSION,
      environment: env.ENVIRONMENT || "production",
      database: !!env.DB,
      kv: !!getKV(env),
      time: new Date().toISOString()
    }, 200, request, env);
  }

  // API
  if (path === "/api" || path.startsWith("/api/")) {
    return handleApi(request, env, ctx);
  }

  // Static assets
  if (env.ASSETS) {
    const asset = await env.ASSETS.fetch(request);

    if (asset.status !== 404) {
      return withSecurityHeaders(asset, request, env);
    }
  }

  // SPA / HTML fallback
  if (env.ASSETS && request.method === "GET") {
    const fallback = await env.ASSETS.fetch(
      new Request(new URL("/index.html", request.url), request)
    );

    if (fallback.status !== 404) {
      return withSecurityHeaders(fallback, request, env);
    }
  }

  return json({
    ok: false,
    error: "NOT_FOUND"
  }, 404, request, env);
}

// ============================================================
// API ROUTER
// ============================================================

async function handleApi(request, env, ctx) {
  const url = new URL(request.url);
  const path = normalizePath(url.pathname);

  if (path === "/api") {
    return json({
      ok: true,
      name: "Tajik Opportunities API",
      version: VERSION,
      endpoints: {
        auth: [
          "/api/auth/me",
          "/api/auth/login",
          "/api/auth/register",
          "/api/auth/logout"
        ],
        profile: [
          "/api/profile",
          "/api/profile/public",
          "/api/username/check"
        ],
        publications: [
          "/api/publications"
        ],
        admin: [
          "/api/admin/me",
          "/api/admin/dashboard",
          "/api/admin/users",
          "/api/admin/publications",
          "/api/admin/chat",
          "/api/admin/notifications",
          "/api/admin/audit"
        ],
        chat: [
          "/api/admin-chat"
        ],
        notifications: [
          "/api/notifications"
        ]
      }
    }, 200, request, env);
  }

  // ---------------- AUTH ----------------

  if (path === "/api/auth/me") {
    return authMe(request, env);
  }

  if (path === "/api/auth/login") {
    return authLogin(request, env);
  }

  if (path === "/api/auth/register") {
    return authRegister(request, env);
  }

  if (path === "/api/auth/logout") {
    return authLogout(request, env);
  }

  // ---------------- PROFILE ----------------

  if (path === "/api/profile") {
    return handleProfile(request, env);
  }

  if (path === "/api/profile/public") {
    return handlePublicProfile(request, env);
  }

  if (path === "/api/username/check") {
    return handleUsernameCheck(request, env);
  }

  // ---------------- PUBLICATIONS ----------------

  if (path === "/api/publications" || path === "/api/publications/") {
    return handlePublications(request, env);
  }

  // ---------------- ADMIN API ----------------

  if (path === "/api/admin" || path === "/api/admin/") {
    return handleAdminRoot(request, env);
  }

  if (path.startsWith("/api/admin/")) {
    return handleAdminApi(request, env);
  }

  // ---------------- ADMIN CHAT ----------------

  if (path === "/api/admin-chat") {
    return handleAdminChat(request, env);
  }

  // ---------------- NOTIFICATIONS ----------------

  if (path === "/api/notifications") {
    return handleNotifications(request, env);
  }

  // ---------------- EXISTING KV FEATURES ----------------

  if (path === "/api/opportunities") {
    return handleOpportunities(request, env);
  }

  if (path === "/api/messages") {
    return handleMessages(request, env);
  }

  return json({
    ok: false,
    error: "NOT_FOUND",
    path
  }, 404, request, env);
}

// ============================================================
// AUTHENTICATION
// ============================================================

async function authMe(request, env) {
  const user = await getAuthenticatedUser(request, env);

  if (!user) {
    return json({
      ok: false,
      authenticated: false,
      user: null
    }, 401, request, env);
  }

  const admin = await getAdminContext(user, env);

  return json({
    ok: true,
    authenticated: true,
    user: publicUser(user),
    admin: admin
      ? {
          isAdmin: true,
          role: admin.role,
          permissions: admin.permissions
        }
      : {
          isAdmin: false
        }
  }, 200, request, env);
}

async function authRegister(request, env) {
  if (!env.DB) {
    return json({
      ok: false,
      error: "DATABASE_UNAVAILABLE"
    }, 503, request, env);
  }

  const body = await readJSON(request);

  const name = cleanText(body.name, 100);
  const username = normalizeUsername(body.username);
  const password = String(body.password || "");

  if (name.length < 2) {
    return json({
      ok: false,
      error: "INVALID_NAME",
      message: "Введите корректное имя."
    }, 400, request, env);
  }

  if (!isValidUsername(username)) {
    return json({
      ok: false,
      error: "INVALID_USERNAME",
      message: "Имя пользователя должно содержать 3–32 символа."
    }, 400, request, env);
  }

  if (password.length < 6) {
    return json({
      ok: false,
      error: "WEAK_PASSWORD",
      message: "Пароль должен содержать минимум 6 символов."
    }, 400, request, env);
  }

  const existing = await findUserByUsername(env.DB, username);

  if (existing) {
    return json({
      ok: false,
      error: "USERNAME_EXISTS",
      message: "Это имя пользователя уже занято."
    }, 409, request, env);
  }

  const schema = await getTableSchema(env.DB, "users");

  if (!schema.length) {
    return json({
      ok: false,
      error: "USERS_TABLE_NOT_FOUND"
    }, 500, request, env);
  }

  const userId = crypto.randomUUID();
  const now = new Date().toISOString();
  const passwordHash = await hashPassword(password);

  const values = {};

  putIfColumn(values, schema, "id", userId);
  putIfColumn(values, schema, "user_id", userId);
  putIfColumn(values, schema, "uid", userId);

  putIfColumn(values, schema, "name", name);
  putIfColumn(values, schema, "display_name", name);
  putIfColumn(values, schema, "full_name", name);

  putIfColumn(values, schema, "username", username);
  putIfColumn(values, schema, "user_name", username);

  putIfColumn(values, schema, "password_hash", passwordHash);
  putIfColumn(values, schema, "password", passwordHash);
  putIfColumn(values, schema, "hash", passwordHash);

  putIfColumn(values, schema, "created_at", now);
  putIfColumn(values, schema, "updated_at", now);

  putIfColumn(values, schema, "role", "user");
  putIfColumn(values, schema, "is_admin", 0);
  putIfColumn(values, schema, "is_super_admin", 0);
  putIfColumn(values, schema, "is_active", 1);
  putIfColumn(values, schema, "status", "active");

  putIfColumn(values, schema, "allow_messages", 1);
  putIfColumn(values, schema, "show_followers", 1);
  putIfColumn(values, schema, "is_public", 1);

  try {
    await dynamicInsert(env.DB, "users", values);
  } catch (error) {
    console.error("REGISTER DB ERROR:", error);

    return json({
      ok: false,
      error: "REGISTRATION_FAILED",
      message: "Не удалось создать аккаунт."
    }, 500, request, env);
  }

  const user = await findUserById(env.DB, userId);

  if (!user) {
    return json({
      ok: false,
      error: "USER_CREATE_FAILED"
    }, 500, request, env);
  }

  const token = await createSession(env, user);

  await audit(env, {
    action: "register",
    userId: user.id,
    username: user.username,
    ip: request.headers.get("CF-Connecting-IP")
  });

  return jsonWithCookie({
    ok: true,
    authenticated: true,
    user: publicUser(user)
  }, 200, request, env, token);
}

async function authLogin(request, env) {
  if (!env.DB) {
    return json({
      ok: false,
      error: "DATABASE_UNAVAILABLE"
    }, 503, request, env);
  }

  const body = await readJSON(request);

  const username = normalizeUsername(body.username);
  const password = String(body.password || "");

  if (!username || !password) {
    return json({
      ok: false,
      error: "MISSING_CREDENTIALS",
      message: "Введите логин и пароль."
    }, 400, request, env);
  }

  const user = await findUserByUsername(env.DB, username);

  if (!user) {
    return json({
      ok: false,
      error: "INVALID_CREDENTIALS",
      message: "Неверное имя пользователя или пароль."
    }, 401, request, env);
  }

  if (isUserBlocked(user)) {
    return json({
      ok: false,
      error: "ACCOUNT_BLOCKED",
      message: "Этот аккаунт заблокирован."
    }, 403, request, env);
  }

  const storedHash = getPasswordHash(user);

  if (!storedHash) {
    return json({
      ok: false,
      error: "PASSWORD_NOT_CONFIGURED"
    }, 500, request, env);
  }

  const valid = await verifyPassword(password, storedHash);

  if (!valid) {
    return json({
      ok: false,
      error: "INVALID_CREDENTIALS",
      message: "Неверное имя пользователя или пароль."
    }, 401, request, env);
  }

  const token = await createSession(env, user);

  await audit(env, {
    action: "login",
    userId: user.id,
    username: user.username,
    ip: request.headers.get("CF-Connecting-IP")
  });

  return jsonWithCookie({
    ok: true,
    authenticated: true,
    user: publicUser(user)
  }, 200, request, env, token);
}

async function authLogout(request, env) {
  const token = getCookie(request, SESSION_COOKIE);

  if (token) {
    await deleteSession(env, token);
  }

  const headers = new Headers(securityHeaders(request, env));

  headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
  );

  return new Response(JSON.stringify({
    ok: true,
    authenticated: false
  }), {
    status: 200,
    headers: withJSONHeaders(headers)
  });
}

// ============================================================
// PROFILE
// ============================================================

async function handleProfile(request, env) {
  const user = await getAuthenticatedUser(request, env);

  if (!user) {
    return json({
      ok: false,
      error: "UNAUTHORIZED"
    }, 401, request, env);
  }

  if (request.method === "GET") {
    const profile = await getProfileData(user, env);

    return json({
      ok: true,
      profile: {
        ...publicUser(user),
        ...profile
      }
    }, 200, request, env);
  }

  if (
    request.method !== "PUT" &&
    request.method !== "PATCH" &&
    request.method !== "POST"
  ) {
    return json({
      ok: false,
      error: "METHOD_NOT_ALLOWED"
    }, 405, request, env);
  }

  const body = await readJSON(request);

  const update = {
    name: cleanText(body.name, 100),
    username: normalizeUsername(body.username),
    bio: cleanText(body.bio, 2000),
    country: cleanText(body.country, 100),
    city: cleanText(body.city, 100),
    avatar: cleanText(body.avatar, 1000),
    allow_messages: toBooleanNumber(body.allow_messages, 1),
    show_followers: toBooleanNumber(body.show_followers, 1),
    is_public: toBooleanNumber(body.is_public, 1)
  };

  if (!isValidUsername(update.username)) {
    return json({
      ok: false,
      error: "INVALID_USERNAME"
    }, 400, request, env);
  }

  if (update.username !== normalizeUsername(user.username)) {
    const exists = await findUserByUsername(env.DB, update.username);

    if (exists && exists.id !== user.id) {
      return json({
        ok: false,
        error: "USERNAME_EXISTS",
        message: "Это имя пользователя уже занято."
      }, 409, request, env);
    }
  }

  if (env.DB) {
    await updateUserProfile(env.DB, user, update);
  }

  // KV profile remains as compatibility layer.
  await saveProfileKV(env, user.id, update);

  const updated = env.DB
    ? await findUserById(env.DB, user.id)
    : {
        ...user,
        ...update
      };

  return json({
    ok: true,
    profile: publicUser(updated || {
      ...user,
      ...update
    })
  }, 200, request, env);
}

async function handlePublicProfile(request, env) {
  const url = new URL(request.url);
  const username = normalizeUsername(url.searchParams.get("username"));

  if (!username) {
    return json({
      ok: false,
      error: "USERNAME_REQUIRED"
    }, 400, request, env);
  }

  const user = env.DB
    ? await findUserByUsername(env.DB, username)
    : null;

  if (!user) {
    return json({
      ok: false,
      error: "USER_NOT_FOUND"
    }, 404, request, env);
  }

  if (isUserBlocked(user)) {
    return json({
      ok: false,
      error: "USER_NOT_FOUND"
    }, 404, request, env);
  }

  const profile = await getProfileData(user, env);

  return json({
    ok: true,
    profile: {
      ...publicUser(user),
      ...profile
    }
  }, 200, request, env);
}

async function handleUsernameCheck(request, env) {
  const url = new URL(request.url);
  const username = normalizeUsername(url.searchParams.get("username"));

  if (!isValidUsername(username)) {
    return json({
      ok: true,
      available: false,
      valid: false
    }, 200, request, env);
  }

  if (!env.DB) {
    return json({
      ok: true,
      available: true,
      valid: true
    }, 200, request, env);
  }

  const existing = await findUserByUsername(env.DB, username);

  return json({
    ok: true,
    available: !existing,
    valid: true,
    username
  }, 200, request, env);
}

// ============================================================
// PUBLICATIONS
// ============================================================

async function handlePublications(request, env) {
  if (!env.DB) {
    return json({
      ok: false,
      error: "DATABASE_UNAVAILABLE"
    }, 503, request, env);
  }

  if (request.method === "GET") {
    return listPublications(request, env);
  }

  if (request.method === "POST") {
    return createPublication(request, env);
  }

  return json({
    ok: false,
    error: "METHOD_NOT_ALLOWED"
  }, 405, request, env);
}

async function listPublications(request, env) {
  const url = new URL(request.url);

  const category = cleanText(
    url.searchParams.get("category"),
    100
  );

  const city = cleanText(
    url.searchParams.get("city"),
    100
  );

  const status = cleanText(
    url.searchParams.get("status") || "published",
    50
  );

  const search = cleanText(
    url.searchParams.get("search") || "",
    200
  );

  const author = normalizeUsername(
    url.searchParams.get("author") || ""
  );

  const limit = clampNumber(
    Number(url.searchParams.get("limit") || 20),
    1,
    100
  );

  const offset = clampNumber(
    Number(url.searchParams.get("offset") || 0),
    0,
    1000000
  );

  const schema = await getTableSchema(env.DB, "publications");

  const conditions = [];
  const binds = [];

  if (hasColumn(schema, "status")) {
    conditions.push(`status = ?`);
    binds.push(status);
  }

  if (category && hasColumn(schema, "category")) {
    conditions.push(`category = ?`);
    binds.push(category);
  }

  if (city && hasColumn(schema, "city")) {
    conditions.push(`city = ?`);
    binds.push(city);
  }

  if (search && hasColumn(schema, "title") && hasColumn(schema, "text")) {
    conditions.push(`(title LIKE ? OR text LIKE ?)`);
    binds.push(`%${search}%`, `%${search}%`);
  }

  if (author) {
    const users = await findUserByUsername(env.DB, author);

    if (!users) {
      return json({
        ok: true,
        publications: [],
        items: [],
        total: 0,
        limit,
        offset
      }, 200, request, env);
    }

    const userColumn =
      firstExistingColumn(schema, [
        "user_id",
        "author_id",
        "owner_id"
      ]);

    if (userColumn) {
      conditions.push(`${quoteIdent(userColumn)} = ?`);
      binds.push(users.id);
    }
  }

  const where = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const orderColumn =
    firstExistingColumn(schema, [
      "created_at",
      "published_at",
      "updated_at",
      "id"
    ]) || "id";

  const sql = `
    SELECT *
    FROM publications
    ${where}
    ORDER BY ${quoteIdent(orderColumn)} DESC
    LIMIT ? OFFSET ?
  `;

  binds.push(limit, offset);

  const result = await env.DB
    .prepare(sql)
    .bind(...binds)
    .all();

  const rows = result.results || [];

  return json({
    ok: true,
    publications: rows.map(normalizePublication),
    items: rows.map(normalizePublication),
    total: rows.length,
    limit,
    offset
  }, 200, request, env);
}

async function createPublication(request, env) {
  const user = await getAuthenticatedUser(request, env);

  if (!user) {
    return json({
      ok: false,
      error: "UNAUTHORIZED",
      message: "Сначала войдите в аккаунт."
    }, 401, request, env);
  }

  const body = await readJSON(request);

  const title = cleanText(body.title, 300);
  const content = cleanText(
    body.content ?? body.text,
    20000
  );

  const category = cleanText(body.category, 100);

  if (!title || title.length < 3) {
    return json({
      ok: false,
      error: "TITLE_REQUIRED"
    }, 400, request, env);
  }

  if (!content || content.length < 3) {
    return json({
      ok: false,
      error: "CONTENT_REQUIRED"
    }, 400, request, env);
  }

  if (!category) {
    return json({
      ok: false,
      error: "CATEGORY_REQUIRED"
    }, 400, request, env);
  }

  const schema = await getTableSchema(env.DB, "publications");

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const trackingCode = generateTrackingCode();

  const media = normalizeMedia(body.media);

  const values = {};

  putIfColumn(values, schema, "id", id);
  putIfColumn(values, schema, "user_id", user.id);

  putIfColumn(values, schema, "title", title);
  putIfColumn(values, schema, "text", content);
  putIfColumn(values, schema, "category", category);

  putIfColumn(
    values,
    schema,
    "subcategory",
    cleanText(body.subcategory, 100)
  );

  putIfColumn(values, schema, "country", cleanText(body.country, 100));
  putIfColumn(values, schema, "city", cleanText(body.city, 100));
  putIfColumn(values, schema, "location", cleanText(body.location, 300));
  putIfColumn(values, schema, "scope", cleanText(body.scope, 50));

  putIfColumn(values, schema, "event_start", cleanText(body.event_start, 100));
  putIfColumn(values, schema, "event_end", cleanText(body.event_end, 100));
  putIfColumn(values, schema, "deadline", cleanText(body.deadline, 100));

  putIfColumn(
    values,
    schema,
    "price",
    safeInteger(body.price, 0)
  );

  putIfColumn(values, schema, "currency", cleanText(body.currency, 20));
  putIfColumn(
    values,
    schema,
    "employment_type",
    cleanText(body.employment_type, 100)
  );

  putIfColumn(
    values,
    schema,
    "work_format",
    cleanText(body.work_format, 100)
  );

  putIfColumn(
    values,
    schema,
    "experience",
    cleanText(body.experience, 500)
  );

  putIfColumn(
    values,
    schema,
    "education",
    cleanText(body.education, 500)
  );

  putIfColumn(
    values,
    schema,
    "languages",
    normalizeLanguages(body.languages)
  );

  putIfColumn(
    values,
    schema,
    "hashtags",
    normalizeTags(body.tags ?? body.hashtags)
  );

  putIfColumn(
    values,
    schema,
    "media",
    JSON.stringify(media)
  );

  putIfColumn(
    values,
    schema,
    "contact_name",
    cleanText(body.contact_name || body.author_name || user.name, 200)
  );

  putIfColumn(
    values,
    schema,
    "contact_phone",
    cleanText(body.contact_phone, 100)
  );

  putIfColumn(
    values,
    schema,
    "contact_email",
    cleanText(body.contact_email, 200)
  );

  putIfColumn(
    values,
    schema,
    "contact_telegram",
    cleanText(body.contact_telegram, 200)
  );

  putIfColumn(
    values,
    schema,
    "external_url",
    cleanText(body.external_url, 1000)
  );

  putIfColumn(values, schema, "language", cleanText(body.language || "ru", 20));

  putIfColumn(
    values,
    schema,
    "translate_all",
    toBooleanNumber(body.translate_all, 0)
  );

  putIfColumn(values, schema, "status", "pending");
  putIfColumn(values, schema, "views", 0);
  putIfColumn(values, schema, "likes", 0);
  putIfColumn(values, schema, "comments", 0);
  putIfColumn(values, schema, "saves", 0);
  putIfColumn(values, schema, "shares", 0);

  putIfColumn(values, schema, "love", 0);
  putIfColumn(values, schema, "support", 0);
  putIfColumn(values, schema, "funny", 0);
  putIfColumn(values, schema, "wow", 0);
  putIfColumn(values, schema, "sad", 0);
  putIfColumn(values, schema, "angry", 0);

  putIfColumn(values, schema, "pinned", 0);
  putIfColumn(values, schema, "featured", 0);

  putIfColumn(values, schema, "tracking_code", trackingCode);
  putIfColumn(values, schema, "created_at", now);
  putIfColumn(values, schema, "updated_at", now);

  putIfColumn(values, schema, "published_at", null);

  try {
    await dynamicInsert(env.DB, "publications", values);

    await savePublicationMedia(
      env.DB,
      id,
      media
    );
  } catch (error) {
    console.error("CREATE PUBLICATION ERROR:", error);

    return json({
      ok: false,
      error: "PUBLICATION_CREATE_FAILED",
      message: "Не удалось создать публикацию."
    }, 500, request, env);
  }

  return json({
    ok: true,
    success: true,
    id,
    publication_id: id,
    tracking_code: trackingCode,
    code: trackingCode,
    status: "pending",
    message: "Публикация отправлена на модерацию."
  }, 201, request, env);
}

// ============================================================
// ADMIN ROOT
// ============================================================

async function handleAdminRoot(request, env) {
  const admin = await requireAdmin(request, env);

  if (!admin.ok) return admin.response;

  return json({
    ok: true,
    admin: {
      user: publicUser(admin.user),
      role: admin.role,
      permissions: admin.permissions,
      isSuperAdmin: admin.role === "super_admin"
    },
    endpoints: {
      dashboard: "/api/admin/dashboard",
      users: "/api/admin/users",
      publications: "/api/admin/publications",
      chat: "/api/admin/chat",
      notifications: "/api/admin/notifications",
      audit: "/api/admin/audit"
    }
  }, 200, request, env);
}

// ============================================================
// ADMIN API
// ============================================================

async function handleAdminApi(request, env) {
  const admin = await requireAdmin(request, env);

  if (!admin.ok) return admin.response;

  const url = new URL(request.url);
  const path = normalizePath(url.pathname);

  // ---------------- ADMIN ME ----------------

  if (path === "/api/admin/me") {
    return json({
      ok: true,
      user: publicUser(admin.user),
      role: admin.role,
      permissions: admin.permissions,
      isSuperAdmin: admin.role === "super_admin"
    }, 200, request, env);
  }

  // ---------------- DASHBOARD ----------------

  if (
    path === "/api/admin/dashboard" ||
    path === "/api/admin/stats"
  ) {
    return requirePermissionResponse(
      admin,
      "dashboard",
      request,
      env,
      () => adminDashboard(request, env)
    );
  }

  // ---------------- USERS ----------------

  if (path === "/api/admin/users") {
    return requirePermissionResponse(
      admin,
      "users",
      request,
      env,
      () => adminUsers(request, env)
    );
  }

  if (path.startsWith("/api/admin/users/")) {
    return requirePermissionResponse(
      admin,
      "users",
      request,
      env,
      () => adminUserRoute(request, env, path)
    );
  }

  // ---------------- PUBLICATIONS ----------------

  if (path === "/api/admin/publications") {
    return requirePermissionResponse(
      admin,
      "publications",
      request,
      env,
      () => adminPublications(request, env)
    );
  }

  if (path.startsWith("/api/admin/publications/")) {
    return requirePermissionResponse(
      admin,
      "publications",
      request,
      env,
      () => adminPublicationRoute(request, env, path)
    );
  }

  // ---------------- CHAT ----------------

  if (
    path === "/api/admin/chat" ||
    path.startsWith("/api/admin/chat/")
  ) {
    return requirePermissionResponse(
      admin,
      "chat",
      request,
      env,
      () => adminChatRoute(request, env, path)
    );
  }

  // ---------------- NOTIFICATIONS ----------------

  if (path === "/api/admin/notifications") {
    return requirePermissionResponse(
      admin,
      "notifications",
      request,
      env,
      () => adminNotifications(request, env)
    );
  }

  // ---------------- AUDIT ----------------

  if (path === "/api/admin/audit") {
    return requirePermissionResponse(
      admin,
      "audit",
      request,
      env,
      () => adminAudit(request, env)
    );
  }

  return json({
    ok: false,
    error: "ADMIN_ROUTE_NOT_FOUND"
  }, 404, request, env);
}

// ============================================================
// ADMIN DASHBOARD
// ============================================================

async function adminDashboard(request, env) {
  const stats = {
    users: 0,
    publications: 0,
    pendingPublications: 0,
    publishedPublications: 0,
    rejectedPublications: 0,
    messages: 0,
    notifications: 0
  };

  if (env.DB) {
    stats.users = await countTable(env.DB, "users");

    stats.publications = await countTable(
      env.DB,
      "publications"
    );

    stats.pendingPublications = await countWhere(
      env.DB,
      "publications",
      "status",
      "pending"
    );

    stats.publishedPublications = await countWhere(
      env.DB,
      "publications",
      "status",
      "published"
    );

    stats.rejectedPublications = await countWhere(
      env.DB,
      "publications",
      "status",
      "rejected"
    );

    stats.messages = await countTable(
      env.DB,
      "messages"
    );

    stats.notifications = await countTable(
      env.DB,
      "notifications"
    );
  }

  const conversations = await getAdminChatIndex(env);

  return json({
    ok: true,
    stats: {
      ...stats,
      adminChatConversations: conversations.length
    },
    generatedAt: new Date().toISOString()
  }, 200, request, env);
}

// ============================================================
// ADMIN USERS
// ============================================================

async function adminUsers(request, env) {
  if (!env.DB) {
    return json({
      ok: false,
      error: "DATABASE_UNAVAILABLE"
    }, 503, request, env);
  }

  if (request.method === "GET") {
    const url = new URL(request.url);

    const search = cleanText(
      url.searchParams.get("search") || "",
      200
    );

    const limit = clampNumber(
      Number(url.searchParams.get("limit") || 50),
      1,
      200
    );

    const offset = clampNumber(
      Number(url.searchParams.get("offset") || 0),
      0,
      1000000
    );

    const schema = await getTableSchema(env.DB, "users");

    const conditions = [];
    const binds = [];

    const searchColumns = [
      "username",
      "name",
      "display_name",
      "email",
      "city"
    ].filter(x => hasColumn(schema, x));

    if (search && searchColumns.length) {
      conditions.push(
        "(" +
        searchColumns
          .map(column => `${quoteIdent(column)} LIKE ?`)
          .join(" OR ") +
        ")"
      );

      for (let i = 0; i < searchColumns.length; i++) {
        binds.push(`%${search}%`);
      }
    }

    const where = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const orderColumn =
      firstExistingColumn(schema, [
        "created_at",
        "updated_at",
        "id"
      ]) || "id";

    binds.push(limit, offset);

    const result = await env.DB
      .prepare(`
        SELECT *
        FROM users
        ${where}
        ORDER BY ${quoteIdent(orderColumn)} DESC
        LIMIT ? OFFSET ?
      `)
      .bind(...binds)
      .all();

    return json({
      ok: true,
      users: (result.results || []).map(publicUser),
      total: (result.results || []).length,
      limit,
      offset
    }, 200, request, env);
  }

  return json({
    ok: false,
    error: "METHOD_NOT_ALLOWED"
  }, 405, request, env);
}

async function adminUserRoute(request, env, path) {
  const segments = path.split("/").filter(Boolean);

  // /api/admin/users/:id
  const userId = segments[3];

  if (!userId) {
    return json({
      ok: false,
      error: "USER_ID_REQUIRED"
    }, 400, request, env);
  }

  const user = await findUserById(env.DB, userId);

  if (!user) {
    return json({
      ok: false,
      error: "USER_NOT_FOUND"
    }, 404, request, env);
  }

  // GET detail
  if (request.method === "GET" && segments.length === 4) {
    const publications = await getUserPublications(
      env.DB,
      user.id
    );

    return json({
      ok: true,
      user: publicUser(user),
      publications
    }, 200, request, env);
  }

  // PATCH
  if (
    request.method === "PATCH" &&
    segments.length === 4
  ) {
    const body = await readJSON(request);

    const targetIsAdmin = await getAdminContext(
      user,
      env
    );

    const requestedRole =
      body.role !== undefined
        ? normalizeRole(body.role)
        : null;

    // Only super_admin can change admin roles.
    if (
      (requestedRole ||
        body.is_admin !== undefined ||
        body.is_super_admin !== undefined) &&
      adminRoleLevel(targetIsAdmin?.role) >= 0 &&
      targetIsAdmin?.role !== "super_admin"
    ) {
      return json({
        ok: false,
        error: "SUPER_ADMIN_REQUIRED",
        message: "Только super_admin может изменять права администраторов."
      }, 403, request, env);
    }

    const schema = await getTableSchema(env.DB, "users");
    const values = {};

    const editable = [
      "name",
      "display_name",
      "username",
      "bio",
      "country",
      "city",
      "avatar",
      "email",
      "phone",
      "allow_messages",
      "show_followers",
      "is_public",
      "status",
      "is_active",
      "is_verified",
      "role",
      "is_admin",
      "is_super_admin"
    ];

    for (const field of editable) {
      if (body[field] === undefined) continue;

      let value = body[field];

      if (
        [
          "allow_messages",
          "show_followers",
          "is_public",
          "is_active",
          "is_verified",
          "is_admin",
          "is_super_admin"
        ].includes(field)
      ) {
        value = toBooleanNumber(value, 0);
      }

      if (field === "username") {
        value = normalizeUsername(value);

        if (!isValidUsername(value)) {
          return json({
            ok: false,
            error: "INVALID_USERNAME"
          }, 400, request, env);
        }

        const existing = await findUserByUsername(
          env.DB,
          value
        );

        if (existing && existing.id !== user.id) {
          return json({
            ok: false,
            error: "USERNAME_EXISTS"
          }, 409, request, env);
        }
      }

      if (field === "role") {
        value = normalizeRole(value);
      }

      if (
        typeof value === "string" &&
        ![
          "username",
          "email",
          "phone",
          "avatar",
          "bio"
        ].includes(field)
      ) {
        value = cleanText(value, 2000);
      }

      if (hasColumn(schema, field)) {
        values[field] = value;
      }
    }

    if (hasColumn(schema, "updated_at")) {
      values.updated_at = new Date().toISOString();
    }

    await dynamicUpdate(
      env.DB,
      "users",
      values,
      getUserIdColumn(schema),
      user.id
    );

    await audit(env, {
      action: "admin_update_user",
      actorId: requestUserId(request, env),
      targetUserId: user.id,
      targetUsername: user.username,
      changes: values
    });

    const updated = await findUserById(
      env.DB,
      user.id
    );

    return json({
      ok: true,
      user: publicUser(updated)
    }, 200, request, env);
  }

  // DELETE / block
  if (
    request.method === "DELETE" &&
    segments.length === 4
  ) {
    const schema = await getTableSchema(
      env.DB,
      "users"
    );

    if (hasColumn(schema, "is_active")) {
      await dynamicUpdate(
        env.DB,
        "users",
        {
          is_active: 0,
          updated_at: new Date().toISOString()
        },
        getUserIdColumn(schema),
        user.id
      );
    } else if (hasColumn(schema, "status")) {
      await dynamicUpdate(
        env.DB,
        "users",
        {
          status: "deleted",
          updated_at: new Date().toISOString()
        },
        getUserIdColumn(schema),
        user.id
      );
    } else {
      await env.DB
        .prepare(
          `DELETE FROM users WHERE ${quoteIdent(getUserIdColumn(schema))} = ?`
        )
        .bind(user.id)
        .run();
    }

    await audit(env, {
      action: "admin_delete_user",
      targetUserId: user.id,
      targetUsername: user.username
    });

    return json({
      ok: true,
      deleted: true
    }, 200, request, env);
  }

  // Ban
  if (
    request.method === "POST" &&
    segments[4] === "ban"
  ) {
    const schema = await getTableSchema(env.DB, "users");

    const values = {};

    if (hasColumn(schema, "is_active")) {
      values.is_active = 0;
    }

    if (hasColumn(schema, "status")) {
      values.status = "banned";
    }

    if (hasColumn(schema, "updated_at")) {
      values.updated_at = new Date().toISOString();
    }

    await dynamicUpdate(
      env.DB,
      "users",
      values,
      getUserIdColumn(schema),
      user.id
    );

    await audit(env, {
      action: "admin_ban_user",
      targetUserId: user.id
    });

    return json({
      ok: true,
      banned: true
    }, 200, request, env);
  }

  // Unban
  if (
    request.method === "POST" &&
    segments[4] === "unban"
  ) {
    const schema = await getTableSchema(env.DB, "users");

    const values = {};

    if (hasColumn(schema, "is_active")) {
      values.is_active = 1;
    }

    if (hasColumn(schema, "status")) {
      values.status = "active";
    }

    if (hasColumn(schema, "updated_at")) {
      values.updated_at = new Date().toISOString();
    }

    await dynamicUpdate(
      env.DB,
      "users",
      values,
      getUserIdColumn(schema),
      user.id
    );

    await audit(env, {
      action: "admin_unban_user",
      targetUserId: user.id
    });

    return json({
      ok: true,
      banned: false
    }, 200, request, env);
  }

  return json({
    ok: false,
    error: "ADMIN_USER_ROUTE_NOT_FOUND"
  }, 404, request, env);
}

// ============================================================
// ADMIN PUBLICATIONS
// ============================================================

async function adminPublications(request, env) {
  if (!env.DB) {
    return json({
      ok: false,
      error: "DATABASE_UNAVAILABLE"
    }, 503, request, env);
  }

  if (request.method !== "GET") {
    return json({
      ok: false,
      error: "METHOD_NOT_ALLOWED"
    }, 405, request, env);
  }

  const url = new URL(request.url);

  const status = cleanText(
    url.searchParams.get("status") || "",
    50
  );

  const search = cleanText(
    url.searchParams.get("search") || "",
    200
  );

  const limit = clampNumber(
    Number(url.searchParams.get("limit") || 50),
    1,
    200
  );

  const offset = clampNumber(
    Number(url.searchParams.get("offset") || 0),
    0,
    1000000
  );

  const schema = await getTableSchema(
    env.DB,
    "publications"
  );

  const conditions = [];
  const binds = [];

  if (status && hasColumn(schema, "status")) {
    conditions.push("status = ?");
    binds.push(status);
  }

  if (
    search &&
    hasColumn(schema, "title") &&
    hasColumn(schema, "text")
  ) {
    conditions.push(
      "(title LIKE ? OR text LIKE ?)"
    );

    binds.push(`%${search}%`);
    binds.push(`%${search}%`);
  }

  const where = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const orderColumn =
    firstExistingColumn(schema, [
      "created_at",
      "updated_at",
      "id"
    ]) || "id";

  binds.push(limit, offset);

  const result = await env.DB
    .prepare(`
      SELECT *
      FROM publications
      ${where}
      ORDER BY ${quoteIdent(orderColumn)} DESC
      LIMIT ? OFFSET ?
    `)
    .bind(...binds)
    .all();

  return json({
    ok: true,
    publications: (result.results || []).map(
      normalizePublication
    ),
    total: (result.results || []).length,
    limit,
    offset
  }, 200, request, env);
}

async function adminPublicationRoute(
  request,
  env,
  path
) {
  const segments = path.split("/").filter(Boolean);

  // /api/admin/publications/:id
  const publicationId = segments[3];

  if (!publicationId) {
    return json({
      ok: false,
      error: "PUBLICATION_ID_REQUIRED"
    }, 400, request, env);
  }

  const publication =
    await findPublication(
      env.DB,
      publicationId
    );

  if (!publication) {
    return json({
      ok: false,
      error: "PUBLICATION_NOT_FOUND"
    }, 404, request, env);
  }

  // GET
  if (
    request.method === "GET" &&
    segments.length === 4
  ) {
    return json({
      ok: true,
      publication: normalizePublication(publication)
    }, 200, request, env);
  }

  // APPROVE
  if (
    request.method === "POST" &&
    segments[4] === "approve"
  ) {
    return moderatePublication(
      request,
      env,
      publication,
      "published"
    );
  }

  // REJECT
  if (
    request.method === "POST" &&
    segments[4] === "reject"
  ) {
    const body = await readJSON(request);

    return moderatePublication(
      request,
      env,
      publication,
      "rejected",
      cleanText(body.reason, 2000)
    );
  }

  // PIN
  if (
    request.method === "POST" &&
    segments[4] === "pin"
  ) {
    return togglePublicationFlag(
      request,
      env,
      publication,
      "pinned"
    );
  }

  // FEATURE
  if (
    request.method === "POST" &&
    segments[4] === "feature"
  ) {
    return togglePublicationFlag(
      request,
      env,
      publication,
      "featured"
    );
  }

  // PATCH
  if (
    request.method === "PATCH" &&
    segments.length === 4
  ) {
    const body = await readJSON(request);

    const schema = await getTableSchema(
      env.DB,
      "publications"
    );

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
      "work_format",
      "experience",
      "education",
      "languages",
      "hashtags",
      "contact_name",
      "contact_phone",
      "contact_email",
      "contact_telegram",
      "external_url",
      "status",
      "pinned",
      "featured",
      "rejection_reason",
      "published_at"
    ];

    const values = {};

    for (const field of allowed) {
      if (body[field] === undefined) continue;
      if (!hasColumn(schema, field)) continue;

      let value = body[field];

      if (field === "price") {
        value = safeInteger(value, 0);
      }

      if (
        field === "pinned" ||
        field === "featured"
      ) {
        value = toBooleanNumber(value, 0);
      }

      if (
        field === "hashtags" &&
        Array.isArray(value)
      ) {
        value = normalizeTags(value);
      }

      if (
        field === "languages" &&
        Array.isArray(value)
      ) {
        value = normalizeLanguages(value);
      }

      if (typeof value === "string") {
        value = cleanText(value, 20000);
      }

      values[field] = value;
    }

    if (hasColumn(schema, "updated_at")) {
      values.updated_at = new Date().toISOString();
    }

    await dynamicUpdate(
      env.DB,
      "publications",
      values,
      "id",
      publicationId
    );

    await audit(env, {
      action: "admin_update_publication",
      targetPublicationId: publicationId,
      changes: values
    });

    const updated = await findPublication(
      env.DB,
      publicationId
    );

    return json({
      ok: true,
      publication: normalizePublication(updated)
    }, 200, request, env);
  }

  // DELETE
  if (
    request.method === "DELETE" &&
    segments.length === 4
  ) {
    await deletePublication(
      env.DB,
      publicationId
    );

    await audit(env, {
      action: "admin_delete_publication",
      targetPublicationId: publicationId
    });

    return json({
      ok: true,
      deleted: true
    }, 200, request, env);
  }

  return json({
    ok: false,
    error: "ADMIN_PUBLICATION_ROUTE_NOT_FOUND"
  }, 404, request, env);
}

async function moderatePublication(
  request,
  env,
  publication,
  status,
  rejectionReason = ""
) {
  const schema = await getTableSchema(
    env.DB,
    "publications"
  );

  const values = {};

  if (hasColumn(schema, "status")) {
    values.status = status;
  }

  if (hasColumn(schema, "updated_at")) {
    values.updated_at = new Date().toISOString();
  }

  if (
    status === "published" &&
    hasColumn(schema, "published_at")
  ) {
    values.published_at = new Date().toISOString();
  }

  if (
    status === "published" &&
    hasColumn(schema, "rejection_reason")
  ) {
    values.rejection_reason = null;
  }

  if (
    status === "rejected" &&
    hasColumn(schema, "rejection_reason")
  ) {
    values.rejection_reason =
      rejectionReason || "Отклонено администратором.";
  }

  await dynamicUpdate(
    env.DB,
    "publications",
    values,
    "id",
    publication.id
  );

  await audit(env, {
    action: `publication_${status}`,
    targetPublicationId: publication.id,
    reason: rejectionReason
  });

  const updated = await findPublication(
    env.DB,
    publication.id
  );

  return json({
    ok: true,
    status,
    publication: normalizePublication(updated)
  }, 200, request, env);
}

async function togglePublicationFlag(
  request,
  env,
  publication,
  field
) {
  const schema = await getTableSchema(
    env.DB,
    "publications"
  );

  if (!hasColumn(schema, field)) {
    return json({
      ok: false,
      error: "FIELD_NOT_SUPPORTED",
      field
    }, 400, request, env);
  }

  const current = Number(
    publication[field] || 0
  );

  const value = current ? 0 : 1;

  await dynamicUpdate(
    env.DB,
    "publications",
    {
      [field]: value,
      updated_at: new Date().toISOString()
    },
    "id",
    publication.id
  );

  await audit(env, {
    action: `publication_${field}`,
    targetPublicationId: publication.id,
    value
  });

  return json({
    ok: true,
    [field]: !!value
  }, 200, request, env);
}

// ============================================================
// ADMIN CHAT
// ============================================================

async function adminChatRoute(
  request,
  env,
  path
) {
  const segments = path.split("/").filter(Boolean);
  const conversationId = segments[3] || null;

  if (request.method === "GET") {
    if (conversationId) {
      const conversation =
        await getAdminConversation(
          env,
          conversationId
        );

      if (!conversation) {
        return json({
          ok: false,
          error: "CONVERSATION_NOT_FOUND"
        }, 404, request, env);
      }

      return json({
        ok: true,
        conversation
      }, 200, request, env);
    }

    const conversations =
      await getAdminChatIndex(env);

    const detailed = [];

    for (const id of conversations) {
      const conversation =
        await getAdminConversation(env, id);

      if (conversation) {
        detailed.push(
          await enrichConversation(
            conversation,
            env
          )
        );
      }
    }

    return json({
      ok: true,
      conversations: detailed
    }, 200, request, env);
  }

  if (
    request.method === "POST" ||
    request.method === "PATCH"
  ) {
    const body = await readJSON(request);

    if (
      body.action === "close" &&
      conversationId
    ) {
      const conversation =
        await getAdminConversation(
          env,
          conversationId
        );

      if (!conversation) {
        return json({
          ok: false,
          error: "CONVERSATION_NOT_FOUND"
        }, 404, request, env);
      }

      conversation.status = "closed";
      conversation.updatedAt =
        new Date().toISOString();

      await saveAdminConversation(
        env,
        conversation
      );

      return json({
        ok: true,
        conversation
      }, 200, request, env);
    }

    if (
      conversationId &&
      (body.message || body.text)
    ) {
      const conversation =
        await getAdminConversation(
          env,
          conversationId
        );

      if (!conversation) {
        return json({
          ok: false,
          error: "CONVERSATION_NOT_FOUND"
        }, 404, request, env);
      }

      const text = cleanText(
        body.message || body.text,
        10000
      );

      if (!text) {
        return json({
          ok: false,
          error: "MESSAGE_REQUIRED"
        }, 400, request, env);
      }

      const message = {
        id: crypto.randomUUID(),
        senderType: "admin",
        senderId: requestUserId(
          request,
          env
        ),
        text,
        createdAt: new Date().toISOString(),
        read: false
      };

      conversation.messages =
        Array.isArray(conversation.messages)
          ? conversation.messages
          : [];

      conversation.messages.push(message);

      conversation.updatedAt =
        new Date().toISOString();

      conversation.unreadForUser =
        Number(conversation.unreadForUser || 0) + 1;

      conversation.status = "open";

      await saveAdminConversation(
        env,
        conversation
      );

      return json({
        ok: true,
        message,
        conversationId
      }, 200, request, env);
    }
  }

  return json({
    ok: false,
    error: "ADMIN_CHAT_ROUTE_NOT_FOUND"
  }, 404, request, env);
}

// ============================================================
// USER + ADMIN CHAT
// ============================================================

async function handleAdminChat(request, env) {
  if (request.method === "GET") {
    return getUserAdminChat(request, env);
  }

  if (request.method === "POST") {
    return postUserAdminChat(request, env);
  }

  return json({
    ok: false,
    error: "METHOD_NOT_ALLOWED"
  }, 405, request, env);
}

async function getUserAdminChat(request, env) {
  const user = await getAuthenticatedUser(
    request,
    env
  );

  const admin = user
    ? await getAdminContext(user, env)
    : null;

  const url = new URL(request.url);
  const conversationId =
    cleanText(
      url.searchParams.get("conversationId") ||
      url.searchParams.get("conversation_id") ||
      "",
      200
    );

  // ADMIN CAN SEE EVERYTHING
  if (admin) {
    const ids = await getAdminChatIndex(env);
    const conversations = [];

    for (const id of ids) {
      const conversation =
        await getAdminConversation(env, id);

      if (conversation) {
        conversations.push(
          await enrichConversation(
            conversation,
            env
          )
        );
      }
    }

    if (conversationId) {
      const conversation =
        await getAdminConversation(
          env,
          conversationId
        );

      if (!conversation) {
        return json({
          ok: false,
          error: "CONVERSATION_NOT_FOUND"
        }, 404, request, env);
      }

      return json({
        ok: true,
        conversation:
          await enrichConversation(
            conversation,
            env
          )
      }, 200, request, env);
    }

    return json({
      ok: true,
      conversations
    }, 200, request, env);
  }

  // USER
  if (conversationId) {
    const conversation =
      await getAdminConversation(
        env,
        conversationId
      );

    if (!conversation) {
      return json({
        ok: false,
        error: "CONVERSATION_NOT_FOUND"
      }, 404, request, env);
    }

    // Authenticated users can access their own conversation.
    if (
      user &&
      conversation.userId &&
      conversation.userId !== user.id
    ) {
      return json({
        ok: false,
        error: "FORBIDDEN"
      }, 403, request, env);
    }

    // Mark admin messages as read.
    conversation.unreadForUser = 0;

    await saveAdminConversation(
      env,
      conversation
    );

    return json({
      ok: true,
      conversation
    }, 200, request, env);
  }

  const ids = await getAdminChatIndex(env);
  const conversations = [];

  for (const id of ids) {
    const conversation =
      await getAdminConversation(env, id);

    if (!conversation) continue;

    if (
      user &&
      conversation.userId === user.id
    ) {
      conversations.push(conversation);
    }
  }

  return json({
    ok: true,
    conversations
  }, 200, request, env);
}

async function postUserAdminChat(
  request,
  env
) {
  const body = await readJSON(request);

  const user = await getAuthenticatedUser(
    request,
    env
  );

  const text = cleanText(
    body.message || body.text,
    10000
  );

  if (!text) {
    return json({
      ok: false,
      error: "MESSAGE_REQUIRED"
    }, 400, request, env);
  }

  let conversationId = cleanText(
    body.conversationId ||
    body.conversation_id ||
    "",
    200
  );

  let conversation = conversationId
    ? await getAdminConversation(
        env,
        conversationId
      )
    : null;

  // Anonymous/new user
  if (!conversation) {
    conversationId =
      crypto.randomUUID();

    conversation = {
      id: conversationId,
      userId: user?.id || null,
      username: user?.username || null,
      displayName:
        user?.name ||
        cleanText(body.name, 200) ||
        "Анонимный пользователь",
      anonymous: !user,
      status: "open",
      createdAt:
        new Date().toISOString(),
      updatedAt:
        new Date().toISOString(),
      unreadForAdmin: 0,
      unreadForUser: 0,
      messages: []
    };

    await addAdminChatIndex(
      env,
      conversationId
    );
  }

  // Security: authenticated user cannot write
  // into another user's conversation.
  if (
    user &&
    conversation.userId &&
    conversation.userId !== user.id
  ) {
    return json({
      ok: false,
      error: "FORBIDDEN"
    }, 403, request, env);
  }

  // Existing anonymous conversation can be claimed
  // by same browser/user only when it had no user ID.
  if (
    user &&
    !conversation.userId
  ) {
    conversation.userId = user.id;
    conversation.username = user.username;
    conversation.displayName = user.name;
    conversation.anonymous = false;
  }

  const message = {
    id: crypto.randomUUID(),
    senderType: "user",
    senderId: user?.id || null,
    senderUsername:
      user?.username || null,
    text,
    createdAt:
      new Date().toISOString(),
    read: false
  };

  conversation.messages =
    Array.isArray(conversation.messages)
      ? conversation.messages
      : [];

  conversation.messages.push(message);

  conversation.updatedAt =
    new Date().toISOString();

  conversation.unreadForAdmin =
    Number(conversation.unreadForAdmin || 0) + 1;

  conversation.status = "open";

  await saveAdminConversation(
    env,
    conversation
  );

  return json({
    ok: true,
    success: true,
    conversationId,
    message,
    conversation
  }, 201, request, env);
}

// ============================================================
// ADMIN NOTIFICATIONS
// ============================================================

async function adminNotifications(request, env) {
  const body = await readJSON(request);

  if (request.method === "GET") {
    const url = new URL(request.url);

    const limit = clampNumber(
      Number(url.searchParams.get("limit") || 100),
      1,
      500
    );

    if (env.DB) {
      const schema =
        await getTableSchema(
          env.DB,
          "notifications"
        );

      if (schema.length) {
        const rows =
          await env.DB.prepare(`
            SELECT *
            FROM notifications
            ORDER BY rowid DESC
            LIMIT ?
          `)
            .bind(limit)
            .all();

        return json({
          ok: true,
          notifications:
            rows.results || []
        }, 200, request, env);
      }
    }

    return json({
      ok: true,
      notifications:
        await getKVJSON(
          env,
          "notifications:admin",
          []
        )
    }, 200, request, env);
  }

  if (request.method === "POST") {
    const title = cleanText(
      body.title,
      300
    );

    const message = cleanText(
      body.message || body.text,
      5000
    );

    const targetUserId =
      cleanText(
        body.user_id ||
        body.userId ||
        "",
        200
      );

    if (!message) {
      return json({
        ok: false,
        error: "MESSAGE_REQUIRED"
      }, 400, request, env);
    }

    const notification = {
      id: crypto.randomUUID(),
      title: title || "Tajik Opportunities",
      message,
      userId: targetUserId || null,
      createdAt: new Date().toISOString(),
      read: false,
      type: cleanText(
        body.type || "system",
        50
      )
    };

    let savedToD1 = false;

    if (env.DB) {
      try {
        const schema =
          await getTableSchema(
            env.DB,
            "notifications"
          );

        const values = {};

        putIfColumn(
          values,
          schema,
          "id",
          notification.id
        );

        putIfColumn(
          values,
          schema,
          "user_id",
          notification.userId
        );

        putIfColumn(
          values,
          schema,
          "title",
          notification.title
        );

        putIfColumn(
          values,
          schema,
          "message",
          notification.message
        );

        putIfColumn(
          values,
          schema,
          "text",
          notification.message
        );

        putIfColumn(
          values,
          schema,
          "type",
          notification.type
        );

        putIfColumn(
          values,
          schema,
          "read",
          0
        );

        putIfColumn(
          values,
          schema,
          "is_read",
          0
        );

        putIfColumn(
          values,
          schema,
          "created_at",
          notification.createdAt
        );

        putIfColumn(
          values,
          schema,
          "updated_at",
          notification.createdAt
        );

        await dynamicInsert(
          env.DB,
          "notifications",
          values
        );

        savedToD1 = true;
      } catch (error) {
        console.error(
          "ADMIN NOTIFICATION D1:",
          error
        );
      }
    }

    if (!savedToD1) {
      const current =
        await getKVJSON(
          env,
          "notifications:admin",
          []
        );

      current.unshift(
        notification
      );

      await putKVJSON(
        env,
        "notifications:admin",
        current.slice(0, 1000)
      );
    }

    return json({
      ok: true,
      notification
    }, 201, request, env);
  }

  return json({
    ok: false,
    error: "METHOD_NOT_ALLOWED"
  }, 405, request, env);
}

// ============================================================
// USER NOTIFICATIONS
// ============================================================

async function handleNotifications(
  request,
  env
) {
  const user =
    await getAuthenticatedUser(
      request,
      env
    );

  if (!user) {
    return json({
      ok: false,
      error: "UNAUTHORIZED"
    }, 401, request, env);
  }

  if (request.method === "GET") {
    if (env.DB) {
      try {
        const schema =
          await getTableSchema(
            env.DB,
            "notifications"
          );

        const userColumn =
          firstExistingColumn(
            schema,
            ["user_id", "userId", "recipient_id"]
          );

        if (userColumn) {
          const result =
            await env.DB.prepare(`
              SELECT *
              FROM notifications
              WHERE ${quoteIdent(userColumn)} = ?
              ORDER BY rowid DESC
              LIMIT 100
            `)
              .bind(user.id)
              .all();

          return json({
            ok: true,
            notifications:
              result.results || []
          }, 200, request, env);
        }
      } catch (error) {
        console.error(
          "USER NOTIFICATIONS:",
          error
        );
      }
    }

    const list =
      await getKVJSON(
        env,
        `notifications:${user.id}`,
        []
      );

    return json({
      ok: true,
      notifications: list
    }, 200, request, env);
  }

  if (
    request.method === "POST" ||
    request.method === "PATCH"
  ) {
    const body =
      await readJSON(request);

    if (body.action === "read") {
      const id =
        cleanText(
          body.id,
          200
        );

      if (
        env.DB &&
        id
      ) {
        try {
          const schema =
            await getTableSchema(
              env.DB,
              "notifications"
            );

          const idColumn =
            firstExistingColumn(
              schema,
              ["id"]
            );

          const readColumn =
            firstExistingColumn(
              schema,
              ["read", "is_read"]
            );

          if (
            idColumn &&
            readColumn
          ) {
            await env.DB.prepare(`
              UPDATE notifications
              SET ${quoteIdent(readColumn)} = 1
              WHERE ${quoteIdent(idColumn)} = ?
            `)
              .bind(id)
              .run();
          }
        } catch (error) {
          console.error(
            "READ NOTIFICATION:",
            error
          );
        }
      }

      return json({
        ok: true,
        read: true
      }, 200, request, env);
    }
  }

  return json({
    ok: false,
    error: "METHOD_NOT_ALLOWED"
  }, 405, request, env);
}

// ============================================================
// ADMIN AUDIT
// ============================================================

async function adminAudit(request, env) {
  if (!env.DB) {
    return json({
      ok: false,
      error: "DATABASE_UNAVAILABLE"
    }, 503, request, env);
  }

  const url = new URL(request.url);

  const limit = clampNumber(
    Number(url.searchParams.get("limit") || 100),
    1,
    500
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
    }, 200, request, env);
  }

  const result =
    await env.DB.prepare(`
      SELECT *
      FROM audit_logs
      ORDER BY rowid DESC
      LIMIT ?
    `)
      .bind(limit)
      .all();

  return json({
    ok: true,
    logs:
      result.results || []
  }, 200, request, env);
}

// ============================================================
// ADMIN AUTHORIZATION
// ============================================================

async function requireAdmin(request, env) {
  const user =
    await getAuthenticatedUser(
      request,
      env
    );

  if (!user) {
    return {
      ok: false,
      response: json({
        ok: false,
        error: "UNAUTHORIZED",
        message: "Требуется авторизация."
      }, 401, request, env)
    };
  }

  const admin =
    await getAdminContext(
      user,
      env
    );

  if (!admin) {
    return {
      ok: false,
      response: json({
        ok: false,
        error: "ADMIN_ACCESS_REQUIRED",
        message: "Недостаточно прав."
      }, 403, request, env)
    };
  }

  return {
    ok: true,
    ...admin
  };
}

function requirePermissionResponse(
  admin,
  permission,
  request,
  env,
  handler
) {
  if (!hasPermission(admin, permission)) {
    return json({
      ok: false,
      error: "PERMISSION_DENIED",
      permission
    }, 403, request, env);
  }

  return handler();
}

async function getAdminContext(user, env) {
  if (!user) return null;

  let adminRow = null;

  if (env.DB) {
    try {
      const schema =
        await getTableSchema(
          env.DB,
          "admins"
        );

      if (schema.length) {
        const userIdColumn =
          firstExistingColumn(
            schema,
            ["user_id", "userid", "uid"]
          );

        const usernameColumn =
          firstExistingColumn(
            schema,
            ["username", "user_name"]
          );

        const idColumn =
          firstExistingColumn(
            schema,
            ["id"]
          );

        if (userIdColumn) {
          adminRow =
            await env.DB.prepare(`
              SELECT *
              FROM admins
              WHERE ${quoteIdent(userIdColumn)} = ?
              LIMIT 1
            `)
              .bind(user.id)
              .first();
        }

        if (!adminRow && usernameColumn) {
          adminRow =
            await env.DB.prepare(`
              SELECT *
              FROM admins
              WHERE LOWER(${quoteIdent(usernameColumn)}) = LOWER(?)
              LIMIT 1
            `)
              .bind(user.username)
              .first();
        }

        if (!adminRow && idColumn) {
          adminRow =
            await env.DB.prepare(`
              SELECT *
              FROM admins
              WHERE ${quoteIdent(idColumn)} = ?
              LIMIT 1
            `)
              .bind(user.id)
              .first();
        }
      }
    } catch (error) {
      console.error(
        "ADMIN LOOKUP:",
        error
      );
    }
  }

  // Admin can also be represented directly
  // in users table.
  const userRole =
    normalizeRole(
      user.role
    );

  const userIsAdmin =
    truthy(
      user.is_admin
    );

  const userIsSuper =
    truthy(
      user.is_super_admin
    ) ||
    userRole === "super_admin";

  if (
    !adminRow &&
    !userIsAdmin &&
    !userIsSuper &&
    !["admin", "moderator"].includes(userRole)
  ) {
    return null;
  }

  const rowRole =
    adminRow
      ? normalizeRole(
          adminRow.role ||
          adminRow.admin_role
        )
      : null;

  const role =
    userIsSuper
      ? "super_admin"
      : rowRole ||
        userRole ||
        (adminRow ? "admin" : "admin");

  // If an admin record exists without a role,
  // grant full admin rights for compatibility.
  const permissions =
    parsePermissions(
      adminRow?.permissions ??
      adminRow?.permission ??
      user.permissions
    );

  if (
    adminRow &&
    (
      adminRow.is_active !== undefined &&
      !truthy(adminRow.is_active)
    )
  ) {
    return null;
  }

  if (
    adminRow &&
    adminRow.status !== undefined &&
    ["disabled", "inactive", "blocked", "banned"]
      .includes(
        String(adminRow.status).toLowerCase()
      )
  ) {
    return null;
  }

  return {
    user,
    adminRow,
    role,
    permissions
  };
}

function hasPermission(admin, permission) {
  if (!admin) return false;

  if (admin.role === "super_admin") {
    return true;
  }

  // Existing admin record without explicit
  // permissions = full admin for compatibility.
  if (
    !admin.permissions ||
    admin.permissions.length === 0
  ) {
    return true;
  }

  if (
    admin.permissions.includes("*") ||
    admin.permissions.includes("all")
  ) {
    return true;
  }

  return admin.permissions.includes(
    permission
  );
}

// ============================================================
// SESSION MANAGEMENT
// ============================================================

async function createSession(env, user) {
  const token =
    await randomToken(48);

  const expiresAt =
    new Date(
      Date.now() +
      SESSION_DAYS *
      24 *
      60 *
      60 *
      1000
    ).toISOString();

  let saved = false;

  if (env.DB) {
    try {
      const schema =
        await getTableSchema(
          env.DB,
          "sessions"
        );

      if (schema.length) {
        const values = {};

        putIfColumn(
          values,
          schema,
          "id",
          crypto.randomUUID()
        );

        putIfColumn(
          values,
          schema,
          "token",
          token
        );

        putIfColumn(
          values,
          schema,
          "session_token",
          token
        );

        putIfColumn(
          values,
          schema,
          "user_id",
          user.id
        );

        putIfColumn(
          values,
          schema,
          "userid",
          user.id
        );

        putIfColumn(
          values,
          schema,
          "expires_at",
          expiresAt
        );

        putIfColumn(
          values,
          schema,
          "expires",
          expiresAt
        );

        putIfColumn(
          values,
          schema,
          "created_at",
          new Date().toISOString()
        );

        putIfColumn(
          values,
          schema,
          "updated_at",
          new Date().toISOString()
        );

        await dynamicInsert(
          env.DB,
          "sessions",
          values
        );

        saved = true;
      }
    } catch (error) {
      console.error(
        "D1 SESSION:",
        error
      );
    }
  }

  if (!saved) {
    const kv = getKV(env);

    if (kv) {
      await kv.put(
        `session:${token}`,
        JSON.stringify({
          userId: user.id,
          expiresAt
        }),
        {
          expirationTtl:
            SESSION_DAYS *
            24 *
            60 *
            60
        }
      );

      saved = true;
    }
  }

  if (!saved) {
    throw new Error(
      "No session storage available"
    );
  }

  return token;
}

async function loadSession(env, token) {
  if (!token) return null;

  if (env.DB) {
    try {
      const schema =
        await getTableSchema(
          env.DB,
          "sessions"
        );

      if (schema.length) {
        const tokenColumn =
          firstExistingColumn(
            schema,
            [
              "token",
              "session_token"
            ]
          );

        if (tokenColumn) {
          const row =
            await env.DB.prepare(`
              SELECT *
              FROM sessions
              WHERE ${quoteIdent(tokenColumn)} = ?
              LIMIT 1
            `)
              .bind(token)
              .first();

          if (row) {
            const expiresColumn =
              firstExistingColumn(
                schema,
                [
                  "expires_at",
                  "expires"
                ]
              );

            if (
              expiresColumn &&
              row[expiresColumn]
            ) {
              const expires =
                Date.parse(
                  row[expiresColumn]
                );

              if (
                Number.isFinite(expires) &&
                expires <= Date.now()
              ) {
                await deleteSession(
                  env,
                  token
                );

                return null;
              }
            }

            const userIdColumn =
              firstExistingColumn(
                schema,
                [
                  "user_id",
                  "userid",
                  "uid"
                ]
              );

            if (
              userIdColumn &&
              row[userIdColumn]
            ) {
              return {
                userId:
                  String(
                    row[userIdColumn]
                  )
              };
            }
          }
        }
      }
    } catch (error) {
      console.error(
        "LOAD SESSION D1:",
        error
      );
    }
  }

  const kv = getKV(env);

  if (kv) {
    const value =
      await kv.get(
        `session:${token}`,
        "json"
      );

    if (!value) return null;

    if (
      value.expiresAt &&
      Date.parse(value.expiresAt) <= Date.now()
    ) {
      await kv.delete(
        `session:${token}`
      );

      return null;
    }

    return value;
  }

  return null;
}

async function deleteSession(env, token) {
  if (!token) return;

  if (env.DB) {
    try {
      const schema =
        await getTableSchema(
          env.DB,
          "sessions"
        );

      const tokenColumn =
        firstExistingColumn(
          schema,
          [
            "token",
            "session_token"
          ]
        );

      if (tokenColumn) {
        await env.DB.prepare(`
          DELETE FROM sessions
          WHERE ${quoteIdent(tokenColumn)} = ?
        `)
          .bind(token)
          .run();
      }
    } catch (error) {
      console.error(
        "DELETE SESSION D1:",
        error
      );
    }
  }

  const kv = getKV(env);

  if (kv) {
    await kv.delete(
      `session:${token}`
    );
  }
}

// ============================================================
// CURRENT USER
// ============================================================

async function getAuthenticatedUser(
  request,
  env
) {
  if (!env.DB) return null;

  const cookieToken =
    getCookie(
      request,
      SESSION_COOKIE
    );

  if (cookieToken) {
    const session =
      await loadSession(
        env,
        cookieToken
      );

    if (session?.userId) {
      const user =
        await findUserById(
          env.DB,
          session.userId
        );

      if (user && !isUserBlocked(user)) {
        return user;
      }
    }
  }

  // Legacy compatibility:
  // X-User-ID / Bearer only works when the
  // user actually exists in D1.
  const legacyId =
    request.headers.get(
      "X-User-ID"
    );

  if (legacyId) {
    const user =
      await findUserById(
        env.DB,
        legacyId
      );

    if (user && !isUserBlocked(user)) {
      return user;
    }
  }

  const auth =
    request.headers.get(
      "Authorization"
    );

  if (
    auth &&
    auth.startsWith("Bearer ")
  ) {
    const token =
      auth.slice(7).trim();

    const session =
      await loadSession(
        env,
        token
      );

    if (session?.userId) {
      const user =
        await findUserById(
          env.DB,
          session.userId
        );

      if (user && !isUserBlocked(user)) {
        return user;
      }
    }
  }

  return null;
}

function requestUserId(
  request,
  env
) {
  const id =
    request.headers.get(
      "X-User-ID"
    );

  return id || null;
}

// ============================================================
// USERS / D1
// ============================================================

async function findUserById(db, id) {
  if (!db || !id) return null;

  const schema =
    await getTableSchema(
      db,
      "users"
    );

  const idColumn =
    getUserIdColumn(schema);

  if (!idColumn) return null;

  return db.prepare(`
    SELECT *
    FROM users
    WHERE ${quoteIdent(idColumn)} = ?
    LIMIT 1
  `)
    .bind(id)
    .first();
}

async function findUserByUsername(
  db,
  username
) {
  if (!db || !username) return null;

  const schema =
    await getTableSchema(
      db,
      "users"
    );

  const usernameColumn =
    firstExistingColumn(
      schema,
      [
        "username",
        "user_name",
        "login"
      ]
    );

  if (!usernameColumn) return null;

  return db.prepare(`
    SELECT *
    FROM users
    WHERE LOWER(${quoteIdent(usernameColumn)}) = LOWER(?)
    LIMIT 1
  `)
    .bind(
      normalizeUsername(username)
    )
    .first();
}

function getUserIdColumn(schema) {
  return (
    firstExistingColumn(
      schema,
      [
        "id",
        "user_id",
        "uid"
      ]
    ) || "id"
  );
}

async function updateUserProfile(
  db,
  user,
  update
) {
  const schema =
    await getTableSchema(
      db,
      "users"
    );

  const values = {};

  for (const [
    key,
    value
  ] of Object.entries(update)) {
    if (hasColumn(schema, key)) {
      values[key] = value;
    }
  }

  if (hasColumn(schema, "updated_at")) {
    values.updated_at =
      new Date().toISOString();
  }

  if (!Object.keys(values).length) {
    return;
  }

  await dynamicUpdate(
    db,
    "users",
    values,
    getUserIdColumn(schema),
    user.id
  );
}

async function getProfileData(
  user,
  env
) {
  const kvProfile =
    await getKVJSON(
      env,
      `profile:${user.id}`,
      {}
    );

  return {
    bio:
      user.bio ??
      kvProfile.bio ??
      "",
    country:
      user.country ??
      kvProfile.country ??
      "",
    city:
      user.city ??
      kvProfile.city ??
      "",
    avatar:
      user.avatar ??
      kvProfile.avatar ??
      "",
    allow_messages:
      user.allow_messages ??
      kvProfile.allow_messages ??
      1,
    show_followers:
      user.show_followers ??
      kvProfile.show_followers ??
      1,
    is_public:
      user.is_public ??
      kvProfile.is_public ??
      1
  };
}

async function saveProfileKV(
  env,
  userId,
  data
) {
  const kv = getKV(env);

  if (!kv) return;

  const existing =
    await getKVJSON(
      env,
      `profile:${userId}`,
      {}
    );

  await kv.put(
    `profile:${userId}`,
    JSON.stringify({
      ...existing,
      ...data,
      updatedAt:
        new Date().toISOString()
    })
  );
}

function publicUser(user) {
  if (!user) return null;

  const id =
    user.id ??
    user.user_id ??
    user.uid ??
    null;

  const username =
    user.username ??
    user.user_name ??
    user.login ??
    "";

  const name =
    user.name ??
    user.display_name ??
    user.full_name ??
    "";

  return {
    id,
    username,
    name,

    bio:
      user.bio ??
      "",

    country:
      user.country ??
      "",

    city:
      user.city ??
      "",

    avatar:
      user.avatar ??
      "",

    email:
      user.email ??
      "",

    phone:
      user.phone ??
      "",

    role:
      normalizeRole(
        user.role || "user"
      ),

    is_admin:
      truthy(
        user.is_admin
      ),

    is_super_admin:
      truthy(
        user.is_super_admin
      ),

    allow_messages:
      truthy(
        user.allow_messages ??
        1
      ),

    show_followers:
      truthy(
        user.show_followers ??
        1
      ),

    is_public:
      truthy(
        user.is_public ??
        1
      ),

    status:
      user.status ??
      "active",

    is_active:
      user.is_active === undefined
        ? true
        : truthy(user.is_active),

    is_verified:
      truthy(
        user.is_verified
      ),

    created_at:
      user.created_at ??
      null
  };
}

function isUserBlocked(user) {
  if (!user) return true;

  if (
    user.is_active !== undefined &&
    !truthy(user.is_active)
  ) {
    return true;
  }

  const status =
    String(
      user.status || ""
    ).toLowerCase();

  return [
    "banned",
    "blocked",
    "deleted",
    "disabled"
  ].includes(status);
}

// ============================================================
// PUBLICATION HELPERS
// ============================================================

async function findPublication(
  db,
  id
) {
  if (!db || !id) return null;

  return db.prepare(`
    SELECT *
    FROM publications
    WHERE id = ?
    LIMIT 1
  `)
    .bind(id)
    .first();
}

async function deletePublication(
  db,
  id
) {
  try {
    await db.prepare(`
      DELETE FROM publication_media
      WHERE publication_id = ?
    `)
      .bind(id)
      .run();
  } catch (_) {
    // Media table may be unavailable.
  }

  await db.prepare(`
    DELETE FROM publications
    WHERE id = ?
  `)
    .bind(id)
    .run();
}

async function getUserPublications(
  db,
  userId
) {
  const schema =
    await getTableSchema(
      db,
      "publications"
    );

  const userColumn =
    firstExistingColumn(
      schema,
      [
        "user_id",
        "author_id",
        "owner_id"
      ]
    );

  if (!userColumn) return [];

  const result =
    await db.prepare(`
      SELECT *
      FROM publications
      WHERE ${quoteIdent(userColumn)} = ?
      ORDER BY rowid DESC
      LIMIT 100
    `)
      .bind(userId)
      .all();

  return (
    result.results || []
  ).map(
    normalizePublication
  );
}

async function savePublicationMedia(
  db,
  publicationId,
  media
) {
  if (!Array.isArray(media)) return;

  try {
    const schema =
      await getTableSchema(
        db,
        "publication_media"
      );

    if (!schema.length) return;

    for (const item of media) {
      const values = {};

      putIfColumn(
        values,
        schema,
        "id",
        crypto.randomUUID()
      );

      putIfColumn(
        values,
        schema,
        "publication_id",
        publicationId
      );

      putIfColumn(
        values,
        schema,
        "media_type",
        cleanText(
          item.type ||
          item.media_type ||
          "image",
          50
        )
      );

      putIfColumn(
        values,
        schema,
        "media_url",
        cleanText(
          item.url ||
          item.media_url ||
          "",
          2000
        )
      );

      putIfColumn(
        values,
        schema,
        "media_caption",
        cleanText(
          item.caption,
          1000
        )
      );

      putIfColumn(
        values,
        schema,
        "created_at",
        new Date().toISOString()
      );

      if (
        values.media_url
      ) {
        await dynamicInsert(
          db,
          "publication_media",
          values
        );
      }
    }
  } catch (error) {
    console.error(
      "MEDIA SAVE:",
      error
    );
  }
}

function normalizePublication(row) {
  if (!row) return null;

  let media = [];

  if (row.media) {
    try {
      const parsed =
        typeof row.media === "string"
          ? JSON.parse(row.media)
          : row.media;

      if (Array.isArray(parsed)) {
        media = parsed;
      }
    } catch (_) {
      media = [];
    }
  }

  let hashtags = [];

  if (row.hashtags) {
    if (Array.isArray(row.hashtags)) {
      hashtags = row.hashtags;
    } else {
      hashtags =
        String(row.hashtags)
          .split(/[,\s]+/)
          .map(x => x.trim())
          .filter(Boolean);
    }
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
      hashtags,

    hashtags,

    media,

    author_id:
      row.user_id ??
      row.author_id ??
      null,

    trackingCode:
      row.tracking_code ??
      null
  };
}

// ============================================================
// EXISTING KV OPPORTUNITIES
// ============================================================

async function handleOpportunities(
  request,
  env
) {
  const key = "opportunities";

  if (request.method === "GET") {
    return json({
      ok: true,
      opportunities:
        await getKVJSON(
          env,
          key,
          []
        )
    }, 200, request, env);
  }

  if (
    request.method === "POST"
  ) {
    const user =
      await getAuthenticatedUser(
        request,
        env
      );

    if (!user) {
      return json({
        ok: false,
        error: "UNAUTHORIZED"
      }, 401, request, env);
    }

    const body =
      await readJSON(request);

    const list =
      await getKVJSON(
        env,
        key,
        []
      );

    const item = {
      id: crypto.randomUUID(),
      ...body,
      userId: user.id,
      createdAt:
        new Date().toISOString()
    };

    list.unshift(item);

    await putKVJSON(
      env,
      key,
      list.slice(0, 1000)
    );

    return json({
      ok: true,
      opportunity: item
    }, 201, request, env);
  }

  return json({
    ok: false,
    error: "METHOD_NOT_ALLOWED"
  }, 405, request, env);
}

// ============================================================
// EXISTING MESSAGES
// ============================================================

async function handleMessages(
  request,
  env
) {
  const user =
    await getAuthenticatedUser(
      request,
      env
    );

  if (!user) {
    return json({
      ok: false,
      error: "UNAUTHORIZED"
    }, 401, request, env);
  }

  const key =
    `messages:${user.id}`;

  if (request.method === "GET") {
    return json({
      ok: true,
      messages:
        await getKVJSON(
          env,
          key,
          []
        )
    }, 200, request, env);
  }

  if (
    request.method === "POST"
  ) {
    const body =
      await readJSON(request);

    const list =
      await getKVJSON(
        env,
        key,
        []
      );

    const message = {
      id: crypto.randomUUID(),
      ...body,
      userId: user.id,
      createdAt:
        new Date().toISOString()
    };

    list.push(message);

    await putKVJSON(
      env,
      key,
      list.slice(-1000)
    );

    return json({
      ok: true,
      message
    }, 201, request, env);
  }

  return json({
    ok: false,
    error: "METHOD_NOT_ALLOWED"
  }, 405, request, env);
}

// ============================================================
// ADMIN CHAT STORAGE
// ============================================================

async function getAdminChatIndex(env) {
  return getKVJSON(
    env,
    "admin-chat:index",
    []
  );
}

async function addAdminChatIndex(
  env,
  conversationId
) {
  const index =
    await getAdminChatIndex(env);

  if (!index.includes(conversationId)) {
    index.unshift(conversationId);
  }

  await putKVJSON(
    env,
    "admin-chat:index",
    index.slice(0, 5000)
  );
}

async function getAdminConversation(
  env,
  id
) {
  if (!id) return null;

  return getKVJSON(
    env,
    `admin-chat:${id}`,
    null
  );
}

async function saveAdminConversation(
  env,
  conversation
) {
  const kv = getKV(env);

  if (!kv) {
    throw new Error(
      "KV binding is required for admin chat"
    );
  }

  await kv.put(
    `admin-chat:${conversation.id}`,
    JSON.stringify(conversation)
  );

  await addAdminChatIndex(
    env,
    conversation.id
  );
}

async function enrichConversation(
  conversation,
  env
) {
  const result = {
    ...conversation
  };

  if (
    conversation.userId &&
    env.DB
  ) {
    const user =
      await findUserById(
        env.DB,
        conversation.userId
      );

    if (user) {
      result.user = publicUser(user);
    }
  }

  return result;
}

// ============================================================
// KV HELPERS
// ============================================================

function getKV(env) {
  return (
    env.DATA ||
    env.KV ||
    env.STORAGE ||
    null
  );
}

async function getKVJSON(
  env,
  key,
  fallback
) {
  const kv = getKV(env);

  if (!kv) return fallback;

  try {
    const value =
      await kv.get(
        key,
        "json"
      );

    return value ?? fallback;
  } catch (error) {
    console.error(
      "KV GET:",
      error
    );

    return fallback;
  }
}

async function putKVJSON(
  env,
  key,
  value
) {
  const kv = getKV(env);

  if (!kv) return;

  await kv.put(
    key,
    JSON.stringify(value)
  );
}

// ============================================================
// AUDIT LOGS
// ============================================================

async function audit(env, data) {
  if (!env.DB) return;

  try {
    const schema =
      await getTableSchema(
        env.DB,
        "audit_logs"
      );

    if (!schema.length) return;

    const now =
      new Date().toISOString();

    const values = {};

    putIfColumn(
      values,
      schema,
      "id",
      crypto.randomUUID()
    );

    putIfColumn(
      values,
      schema,
      "user_id",
      data.actorId ||
      data.userId ||
      null
    );

    putIfColumn(
      values,
      schema,
      "admin_id",
      data.actorId ||
      null
    );

    putIfColumn(
      values,
      schema,
      "action",
      cleanText(
        data.action,
        200
      )
    );

    putIfColumn(
      values,
      schema,
      "target_user_id",
      data.targetUserId ||
      null
    );

    putIfColumn(
      values,
      schema,
      "target_publication_id",
      data.targetPublicationId ||
      null
    );

    putIfColumn(
      values,
      schema,
      "details",
      JSON.stringify(data)
    );

    putIfColumn(
      values,
      schema,
      "metadata",
      JSON.stringify(data)
    );

    putIfColumn(
      values,
      schema,
      "created_at",
      now
    );

    putIfColumn(
      values,
      schema,
      "timestamp",
      now
    );

    await dynamicInsert(
      env.DB,
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

// ============================================================
// D1 SCHEMA / SQL HELPERS
// ============================================================

const schemaCache = new Map();

async function getTableSchema(
  db,
  table
) {
  if (!db) return [];

  if (schemaCache.has(table)) {
    return schemaCache.get(table);
  }

  const safe =
    quoteIdent(table);

  try {
    const result =
      await db.prepare(
        `PRAGMA table_info(${safe})`
      ).all();

    const schema =
      result.results || [];

    schemaCache.set(
      table,
      schema
    );

    return schema;
  } catch (error) {
    console.error(
      `SCHEMA ${table}:`,
      error
    );

    return [];
  }
}

function hasColumn(
  schema,
  name
) {
  return schema.some(
    column =>
      String(column.name).toLowerCase() ===
      String(name).toLowerCase()
  );
}

function firstExistingColumn(
  schema,
  candidates
) {
  for (const candidate of candidates) {
    const found =
      schema.find(
        column =>
          String(column.name).toLowerCase() ===
          String(candidate).toLowerCase()
      );

    if (found) {
      return found.name;
    }
  }

  return null;
}

function putIfColumn(
  object,
  schema,
  column,
  value
) {
  if (
    value === undefined ||
    !hasColumn(schema, column)
  ) {
    return;
  }

  object[column] = value;
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

  const allowed =
    new Set(
      schema.map(
        column => column.name
      )
    );

  const entries =
    Object.entries(values)
      .filter(
        ([key, value]) =>
          allowed.has(key) &&
          value !== undefined
      );

  if (!entries.length) {
    throw new Error(
      `No valid columns for INSERT into ${table}`
    );
  }

  const columns =
    entries
      .map(
        ([key]) =>
          quoteIdent(key)
      )
      .join(", ");

  const placeholders =
    entries
      .map(() => "?")
      .join(", ");

  const params =
    entries.map(
      ([, value]) => value
    );

  await db.prepare(`
    INSERT INTO ${quoteIdent(table)}
    (${columns})
    VALUES (${placeholders})
  `)
    .bind(...params)
    .run();
}

async function dynamicUpdate(
  db,
  table,
  values,
  whereColumn,
  whereValue
) {
  const schema =
    await getTableSchema(
      db,
      table
    );

  const allowed =
    new Set(
      schema.map(
        column => column.name
      )
    );

  const entries =
    Object.entries(values)
      .filter(
        ([key, value]) =>
          allowed.has(key) &&
          value !== undefined
      );

  if (!entries.length) {
    return;
  }

  const setClause =
    entries
      .map(
        ([key]) =>
          `${quoteIdent(key)} = ?`
      )
      .join(", ");

  const params =
    entries.map(
      ([, value]) => value
    );

  params.push(whereValue);

  await db.prepare(`
    UPDATE ${quoteIdent(table)}
    SET ${setClause}
    WHERE ${quoteIdent(whereColumn)} = ?
  `)
    .bind(...params)
    .run();
}

function quoteIdent(value) {
  if (
    !/^[A-Za-z_][A-Za-z0-9_]*$/.test(
      String(value)
    )
  ) {
    throw new Error(
      "Unsafe SQL identifier"
    );
  }

  return `"${value}"`;
}

// ============================================================
// COUNTERS
// ============================================================

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

    if (!schema.length) return 0;

    const result =
      await db.prepare(`
        SELECT COUNT(*) AS count
        FROM ${quoteIdent(table)}
      `)
        .first();

    return Number(
      result?.count || 0
    );
  } catch (_) {
    return 0;
  }
}

async function countWhere(
  db,
  table,
  column,
  value
) {
  try {
    const schema =
      await getTableSchema(
        db,
        table
      );

    if (!hasColumn(schema, column)) {
      return 0;
    }

    const result =
      await db.prepare(`
        SELECT COUNT(*) AS count
        FROM ${quoteIdent(table)}
        WHERE ${quoteIdent(column)} = ?
      `)
        .bind(value)
        .first();

    return Number(
      result?.count || 0
    );
  } catch (_) {
    return 0;
  }
}

// ============================================================
// PASSWORD SECURITY
// ============================================================

async function hashPassword(
  password
) {
  const iterations = 120000;

  const salt =
    crypto.getRandomValues(
      new Uint8Array(16)
    );

  const key =
    await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(
        password
      ),
      {
        name: "PBKDF2"
      },
      false,
      [
        "deriveBits"
      ]
    );

  const bits =
    await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations,
        hash: "SHA-256"
      },
      key,
      256
    );

  return [
    "pbkdf2",
    iterations,
    bytesToHex(salt),
    bytesToHex(
      new Uint8Array(bits)
    )
  ].join("$");
}

async function verifyPassword(
  password,
  stored
) {
  const value =
    String(stored || "");

  // New secure format
  if (
    value.startsWith(
      "pbkdf2$"
    )
  ) {
    const parts =
      value.split("$");

    if (parts.length !== 4) {
      return false;
    }

    const iterations =
      Number(parts[1]);

    const salt =
      hexToBytes(parts[2]);

    const expected =
      hexToBytes(parts[3]);

    if (
      !iterations ||
      !salt.length ||
      !expected.length
    ) {
      return false;
    }

    const key =
      await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(
          password
        ),
        {
          name: "PBKDF2"
        },
        false,
        [
          "deriveBits"
        ]
      );

    const bits =
      await crypto.subtle.deriveBits(
        {
          name: "PBKDF2",
          salt,
          iterations,
          hash: "SHA-256"
        },
        key,
        expected.length * 8
      );

    return timingSafeEqual(
      new Uint8Array(bits),
      expected
    );
  }

  // Legacy SHA-256 compatibility
  if (
    /^[a-f0-9]{64}$/i.test(value)
  ) {
    const digest =
      await sha256(password);

    return timingSafeEqual(
      hexToBytes(digest),
      hexToBytes(value)
    );
  }

  return false;
}

function getPasswordHash(user) {
  return (
    user.password_hash ??
    user.password ??
    user.hash ??
    null
  );
}

async function sha256(text) {
  const buffer =
    await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(text)
    );

  return bytesToHex(
    new Uint8Array(buffer)
  );
}

function timingSafeEqual(a, b) {
  if (
    !a ||
    !b ||
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
      a[i] ^ b[i];
  }

  return result === 0;
}

// ============================================================
// TOKEN
// ============================================================

async function randomToken(bytes = 32) {
  const array =
    crypto.getRandomValues(
      new Uint8Array(bytes)
    );

  return bytesToHex(array);
}

function bytesToHex(bytes) {
  return Array
    .from(bytes)
    .map(
      b =>
        b
          .toString(16)
          .padStart(2, "0")
    )
    .join("");
}

function hexToBytes(hex) {
  if (
    !hex ||
    hex.length % 2 !== 0
  ) {
    return new Uint8Array();
  }

  const result =
    new Uint8Array(
      hex.length / 2
    );

  for (
    let i = 0;
    i < result.length;
    i++
  ) {
    result[i] =
      parseInt(
        hex.substr(i * 2, 2),
        16
      );
  }

  return result;
}

// ============================================================
// COOKIE
// ============================================================

function getCookie(
  request,
  name
) {
  const cookie =
    request.headers.get(
      "Cookie"
    );

  if (!cookie) return null;

  const parts =
    cookie.split(";");

  for (const part of parts) {
    const index =
      part.indexOf("=");

    if (index === -1) continue;

    const key =
      part
        .slice(0, index)
        .trim();

    if (key !== name) continue;

    return decodeURIComponent(
      part
        .slice(index + 1)
        .trim()
    );
  }

  return null;
}

// ============================================================
// RESPONSE / CORS / SECURITY
// ============================================================

function json(
  data,
  status = 200,
  request,
  env
) {
  const headers =
    new Headers(
      securityHeaders(
        request,
        env
      )
    );

  headers.set(
    "Content-Type",
    "application/json; charset=utf-8"
  );

  return new Response(
    JSON.stringify(data),
    {
      status,
      headers
    }
  );
}

function jsonWithCookie(
  data,
  status,
  request,
  env,
  token
) {
  const headers =
    new Headers(
      securityHeaders(
        request,
        env
      )
    );

  headers.set(
    "Content-Type",
    "application/json; charset=utf-8"
  );

  headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_DAYS * 24 * 60 * 60}`
  );

  return new Response(
    JSON.stringify(data),
    {
      status,
      headers
    }
  );
}

function corsResponse(
  request,
  env
) {
  const headers =
    new Headers(
      securityHeaders(
        request,
        env
      )
    );

  headers.set(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );

  headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-User-ID, Accept"
  );

  headers.set(
    "Access-Control-Allow-Credentials",
    "true"
  );

  return new Response(
    null,
    {
      status: 204,
      headers
    }
  );
}

function securityHeaders(
  request,
  env
) {
  const headers =
    new Headers();

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
    "X-XSS-Protection",
    "0"
  );

  const origin =
    request?.headers.get(
      "Origin"
    );

  if (
    origin &&
    (
      ALLOWED_ORIGINS.includes(origin) ||
      origin === new URL(
        request.url
      ).origin
    )
  ) {
    headers.set(
      "Access-Control-Allow-Origin",
      origin
    );

    headers.set(
      "Access-Control-Allow-Credentials",
      "true"
    );

    headers.set(
      "Vary",
      "Origin"
    );
  }

  return headers;
}

function withSecurityHeaders(
  response,
  request,
  env
) {
  const headers =
    new Headers(
      response.headers
    );

  const security =
    securityHeaders(
      request,
      env
    );

  for (
    const [
      key,
      value
    ] of security.entries()
  ) {
    if (!headers.has(key)) {
      headers.set(
        key,
        value
      );
    }
  }

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

function withJSONHeaders(
  headers
) {
  headers.set(
    "Content-Type",
    "application/json; charset=utf-8"
  );

  return headers;
}

// ============================================================
// REQUEST BODY
// ============================================================

async function readJSON(request) {
  const contentLength =
    Number(
      request.headers.get(
        "Content-Length"
      ) || 0
    );

  if (
    contentLength &&
    contentLength > MAX_BODY
  ) {
    throw new Error(
      "Request body too large"
    );
  }

  const text =
    await request.text();

  if (!text) return {};

  if (
    text.length >
    MAX_BODY
  ) {
    throw new Error(
      "Request body too large"
    );
  }

  try {
    return JSON.parse(text);
  } catch (_) {
    throw new Error(
      "Invalid JSON"
    );
  }
}

// ============================================================
// NORMALIZATION
// ============================================================

function normalizePath(path) {
  if (!path) return "/";

  const clean =
    path.replace(
      /\/+/g,
      "/"
    );

  if (
    clean.length > 1 &&
    clean.endsWith("/")
  ) {
    return clean.slice(
      0,
      -1
    );
  }

  return clean;
}

function cleanText(
  value,
  max = 1000
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)
    .replace(
      /\u0000/g,
      ""
    )
    .trim()
    .slice(0, max);
}

function normalizeUsername(
  value
) {
  return cleanText(
    value,
    32
  )
    .toLowerCase()
    .replace(
      /^@/,
      ""
    );
}

function isValidUsername(
  username
) {
  return /^[a-z0-9_.-]{3,32}$/i.test(
    username
  );
}

function normalizeRole(
  role
) {
  const value =
    String(
      role || ""
    )
      .toLowerCase()
      .trim();

  if (
    [
      "superadmin",
      "super-admin",
      "super_admin",
      "owner"
    ].includes(value)
  ) {
    return "super_admin";
  }

  if (
    [
      "moderator",
      "mod"
    ].includes(value)
  ) {
    return "moderator";
  }

  if (
    [
      "admin",
      "administrator"
    ].includes(value)
  ) {
    return "admin";
  }

  return value || "user";
}

function adminRoleLevel(role) {
  switch (
    normalizeRole(role)
  ) {
    case "super_admin":
      return 3;

    case "admin":
      return 2;

    case "moderator":
      return 1;

    default:
      return 0;
  }
}

function parsePermissions(
  value
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map(
        x =>
          String(x)
            .trim()
            .toLowerCase()
      )
      .filter(Boolean);
  }

  if (
    typeof value === "object"
  ) {
    return Object.entries(value)
      .filter(
        ([, enabled]) =>
          !!enabled
      )
      .map(
        ([key]) =>
          String(key)
            .trim()
            .toLowerCase()
      );
  }

  const text =
    String(value).trim();

  try {
    const parsed =
      JSON.parse(text);

    return parsePermissions(
      parsed
    );
  } catch (_) {
    return text
      .split(/[,\s]+/)
      .map(
        x =>
          x
            .trim()
            .toLowerCase()
      )
      .filter(Boolean);
  }
}

function truthy(value) {
  if (
    value === true ||
    value === 1
  ) {
    return true;
  }

  const text =
    String(
      value ?? ""
    ).toLowerCase();

  return [
    "1",
    "true",
    "yes",
    "on"
  ].includes(text);
}

function toBooleanNumber(
  value,
  fallback = 0
) {
  if (
    value === undefined ||
    value === null
  ) {
    return fallback;
  }

  return truthy(value)
    ? 1
    : 0;
}

function safeInteger(
  value,
  fallback = 0
) {
  const number =
    Number(value);

  if (
    !Number.isFinite(number)
  ) {
    return fallback;
  }

  return Math.round(number);
}

function clampNumber(
  value,
  min,
  max
) {
  if (
    !Number.isFinite(value)
  ) {
    return min;
  }

  return Math.min(
    max,
    Math.max(
      min,
      value
    )
  );
}

function normalizeTags(
  tags
) {
  if (
    tags === null ||
    tags === undefined
  ) {
    return "";
  }

  if (
    !Array.isArray(tags)
  ) {
    return cleanText(
      tags,
      2000
    );
  }

  return tags
    .map(
      tag =>
        cleanText(
          tag,
          100
        )
    )
    .filter(Boolean)
    .join(" ");
}

function normalizeLanguages(
  languages
) {
  if (
    languages === null ||
    languages === undefined
  ) {
    return "";
  }

  if (
    Array.isArray(languages)
  ) {
    return languages
      .map(
        x =>
          cleanText(
            x,
            50
          )
      )
      .filter(Boolean)
      .join(", ");
  }

  return cleanText(
    languages,
    500
  );
}

function normalizeMedia(
  media
) {
  if (
    !Array.isArray(media)
  ) {
    return [];
  }

  return media
    .slice(0, 50)
    .map(
      item => ({
        type:
          cleanText(
            item?.type ||
            item?.media_type ||
            "image",
            50
          ),
        url:
          cleanText(
            item?.url ||
            item?.media_url ||
            "",
            2000
          ),
        caption:
          cleanText(
            item?.caption,
            1000
          )
      })
    )
    .filter(
      item =>
        !!item.url
    );
}

// ============================================================
// IDs
// ============================================================

function generateTrackingCode() {
  const timestamp =
    Date.now()
      .toString(36)
      .toUpperCase();

  const random =
    Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase();

  return `TO-${timestamp}-${random}`;
}
