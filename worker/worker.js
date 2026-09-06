/**
 * ============================================================
 * TAJIK OPPORTUNITIES
 * Cloudflare Worker
 * ============================================================
 *
 * Основные задачи:
 * - Static Assets
 * - API
 * - Profiles
 * - Opportunities
 * - Messages
 * - Admin chat
 * - Anonymous messages
 * - Health check
 * - CORS
 * - Error handling
 *
 * ============================================================
 */

const VERSION = "2026.09.07";
const APP_NAME = "Tajik Opportunities";

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=UTF-8",
  "Cache-Control": "no-store"
};

const TEXT_HEADERS = {
  "Content-Type": "text/plain; charset=UTF-8",
  "Cache-Control": "no-store"
};

const ALLOWED_METHODS = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS"
];

/* ============================================================
   MAIN WORKER
============================================================ */

export default {
  async fetch(request, env, ctx) {
    const requestId = crypto.randomUUID();

    try {
      const response = await handleRequest(request, env, ctx);

      return addSecurityHeaders(
        addRequestId(response, requestId)
      );
    } catch (error) {
      console.error("Worker error:", error);

      return addSecurityHeaders(
        addRequestId(
          jsonResponse(
            {
              success: false,
              error: "INTERNAL_ERROR",
              message: "Произошла внутренняя ошибка сервера.",
              requestId
            },
            500
          ),
          requestId
        )
      );
    }
  }
};

/* ============================================================
   REQUEST ROUTER
============================================================ */

async function handleRequest(request, env, ctx) {
  const url = new URL(request.url);
  const method = request.method.toUpperCase();

  if (!ALLOWED_METHODS.includes(method)) {
    return jsonResponse(
      {
        success: false,
        error: "METHOD_NOT_ALLOWED"
      },
      405,
      {
        Allow: ALLOWED_METHODS.join(", ")
      }
    );
  }

  if (method === "OPTIONS") {
    return corsResponse();
  }

  /*
   * Health check
   */
  if (
    url.pathname === "/health" ||
    url.pathname === "/api/health"
  ) {
    return jsonResponse({
      success: true,
      app: APP_NAME,
      version: VERSION,
      status: "ok",
      timestamp: new Date().toISOString()
    });
  }

  /*
   * API
   */
  if (url.pathname.startsWith("/api/")) {
    return handleApi(request, env, ctx);
  }

  /*
   * Static site
   */
  if (env.ASSETS) {
    return env.ASSETS.fetch(request);
  }

  /*
   * Если Assets пока не подключён.
   */
  return htmlResponse(`
<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(APP_NAME)}</title>
<style>
*{box-sizing:border-box}
body{
  margin:0;
  min-height:100vh;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:24px;
  background:
    radial-gradient(circle at 20% 0%,rgba(32,199,122,.18),transparent 35%),
    radial-gradient(circle at 90% 10%,rgba(229,199,107,.10),transparent 30%),
    linear-gradient(135deg,#04100b,#071a12 50%,#06130e);
  color:#f7faf8;
  font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;
}
.card{
  width:min(680px,100%);
  padding:45px 30px;
  border:1px solid rgba(255,255,255,.09);
  border-radius:28px;
  text-align:center;
  background:rgba(15,38,28,.88);
  box-shadow:0 25px 80px rgba(0,0,0,.35);
}
.logo{
  font-size:50px;
  margin-bottom:15px;
}
h1{
  margin:0 0 12px;
}
p{
  color:#9caea5;
  line-height:1.6;
}
</style>
</head>
<body>
<div class="card">
<div class="logo">🇹🇯</div>
<h1>${escapeHtml(APP_NAME)}</h1>
<p>Cloudflare Worker успешно запущен.</p>
</div>
</body>
</html>
`);
}

/* ============================================================
   API ROUTER
============================================================ */

async function handleApi(request, env, ctx) {
  const url = new URL(request.url);
  const path = normalizePath(url.pathname);
  const method = request.method.toUpperCase();

  /*
   * API information
   */
  if (path === "/api") {
    return jsonResponse({
      success: true,
      app: APP_NAME,
      version: VERSION,
      endpoints: {
        health: "/api/health",
        profile: "/api/profile",
        opportunities: "/api/opportunities",
        messages: "/api/messages",
        adminChat: "/api/admin-chat"
      }
    });
  }

  /*
   * Profile
   */
  if (path === "/api/profile") {
    return handleProfile(request, env);
  }

  /*
   * Opportunities
   */
  if (
    path === "/api/opportunities" ||
    path === "/api/opportunities/"
  ) {
    return handleOpportunities(request, env);
  }

  /*
   * Messages
   */
  if (
    path === "/api/messages" ||
    path === "/api/messages/"
  ) {
    return handleMessages(request, env);
  }

  /*
   * Admin chat
   */
  if (
    path === "/api/admin-chat" ||
    path === "/api/admin-chat/"
  ) {
    return handleAdminChat(request, env);
  }

  /*
   * Notifications
   */
  if (
    path === "/api/notifications" ||
    path === "/api/notifications/"
  ) {
    return handleNotifications(request, env);
  }

  return jsonResponse(
    {
      success: false,
      error: "NOT_FOUND",
      message: "API endpoint не найден."
    },
    404
  );
}

/* ============================================================
   PROFILE API
============================================================ */

async function handleProfile(request, env) {
  const method = request.method.toUpperCase();

  if (method === "GET") {
    const userId = getUserId(request);

    if (!userId) {
      return jsonResponse({
        success: true,
        authenticated: false,
        profile: null
      });
    }

    const profile = await readKV(
      env,
      `profile:${userId}`
    );

    return jsonResponse({
      success: true,
      authenticated: true,
      profile: profile || createEmptyProfile(userId)
    });
  }

  if (
    method === "POST" ||
    method === "PUT" ||
    method === "PATCH"
  ) {
    const userId = getUserId(request);

    if (!userId) {
      return jsonResponse(
        {
          success: false,
          error: "AUTH_REQUIRED",
          message: "Необходима авторизация."
        },
        401
      );
    }

    const body = await readJson(request);

    const oldProfile =
      (await readKV(env, `profile:${userId}`)) ||
      createEmptyProfile(userId);

    const profile = {
      ...oldProfile,
      ...sanitizeProfile(body),
      id: userId,
      updatedAt: new Date().toISOString()
    };

    await writeKV(
      env,
      `profile:${userId}`,
      profile
    );

    return jsonResponse({
      success: true,
      profile
    });
  }

  return jsonResponse(
    {
      success: false,
      error: "METHOD_NOT_ALLOWED"
    },
    405
  );
}

/* ============================================================
   OPPORTUNITIES API
============================================================ */

async function handleOpportunities(request, env) {
  const method = request.method.toUpperCase();

  if (method === "GET") {
    const url = new URL(request.url);

    const category =
      url.searchParams.get("category");

    const city =
      url.searchParams.get("city");

    const search =
      url.searchParams.get("search");

    const limit = clampNumber(
      url.searchParams.get("limit"),
      1,
      100,
      30
    );

    let opportunities =
      (await readKV(
        env,
        "opportunities:index"
      )) || [];

    if (category) {
      opportunities = opportunities.filter(
        item =>
          String(item.category || "")
            .toLowerCase() ===
          category.toLowerCase()
      );
    }

    if (city) {
      opportunities = opportunities.filter(
        item =>
          String(item.city || "")
            .toLowerCase() ===
          city.toLowerCase()
      );
    }

    if (search) {
      const q = search.toLowerCase();

      opportunities =
        opportunities.filter(item => {
          const text = [
            item.title,
            item.description,
            item.company,
            item.city,
            item.category
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return text.includes(q);
        });
    }

    opportunities = opportunities
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      )
      .slice(0, limit);

    return jsonResponse({
      success: true,
      total: opportunities.length,
      opportunities
    });
  }

  if (method === "POST") {
    const userId = getUserId(request);

    if (!userId) {
      return jsonResponse(
        {
          success: false,
          error: "AUTH_REQUIRED"
        },
        401
      );
    }

    const body = await readJson(request);

    if (!body.title) {
      return jsonResponse(
        {
          success: false,
          error: "TITLE_REQUIRED"
        },
        400
      );
    }

    const opportunity = {
      id: crypto.randomUUID(),
      ownerId: userId,
      title: cleanText(body.title, 180),
      description: cleanText(
        body.description,
        5000
      ),
      category: cleanText(
        body.category,
        100
      ),
      city: cleanText(
        body.city,
        100
      ),
      company: cleanText(
        body.company,
        180
      ),
      salary: cleanText(
        body.salary,
        150
      ),
      schedule: cleanText(
        body.schedule,
        150
      ),
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const list =
      (await readKV(
        env,
        "opportunities:index"
      )) || [];

    list.unshift(opportunity);

    await writeKV(
      env,
      "opportunities:index",
      list.slice(0, 1000)
    );

    return jsonResponse(
      {
        success: true,
        opportunity
      },
      201
    );
  }

  return jsonResponse(
    {
      success: false,
      error: "METHOD_NOT_ALLOWED"
    },
    405
  );
}

/* ============================================================
   USER MESSAGES
============================================================ */

async function handleMessages(request, env) {
  const method = request.method.toUpperCase();

  const userId =
    getUserId(request);

  if (!userId) {
    return jsonResponse(
      {
        success: false,
        error: "AUTH_REQUIRED"
      },
      401
    );
  }

  if (method === "GET") {
    const messages =
      (await readKV(
        env,
        `messages:${userId}`
      )) || [];

    return jsonResponse({
      success: true,
      messages
    });
  }

  if (method === "POST") {
    const body =
      await readJson(request);

    if (!body.text) {
      return jsonResponse(
        {
          success: false,
          error: "MESSAGE_REQUIRED"
        },
        400
      );
    }

    const message = {
      id: crypto.randomUUID(),
      userId,
      text: cleanText(
        body.text,
        5000
      ),
      createdAt:
        new Date().toISOString(),
      read: false
    };

    const messages =
      (await readKV(
        env,
        `messages:${userId}`
      )) || [];

    messages.push(message);

    await writeKV(
      env,
      `messages:${userId}`,
      messages.slice(-500)
    );

    return jsonResponse(
      {
        success: true,
        message
      },
      201
    );
  }

  return jsonResponse(
    {
      success: false,
      error: "METHOD_NOT_ALLOWED"
    },
    405
  );
}

/* ============================================================
   ADMIN CHAT
============================================================ */

async function handleAdminChat(request, env) {
  const method =
    request.method.toUpperCase();

  const userId =
    getUserId(request);

  /*
   * Пользователь может писать админу.
   * Даже если интерфейс работает в анонимном режиме,
   * идентификатор сохраняется отдельно.
   */

  if (method === "POST") {
    const body =
      await readJson(request);

    if (!body.text) {
      return jsonResponse(
        {
          success: false,
          error: "MESSAGE_REQUIRED"
        },
        400
      );
    }

    const anonymous =
      body.anonymous === true;

    const conversationId =
      body.conversationId ||
      crypto.randomUUID();

    const message = {
      id: crypto.randomUUID(),
      conversationId,
      senderType: "user",
      userId: userId || null,
      anonymous,
      text: cleanText(
        body.text,
        5000
      ),
      createdAt:
        new Date().toISOString(),
      readByAdmin: false
    };

    const key =
      `admin-chat:${conversationId}`;

    const conversation =
      (await readKV(env, key)) || {
        id: conversationId,
        userId: userId || null,
        anonymous,
        createdAt:
          new Date().toISOString(),
        updatedAt:
          new Date().toISOString(),
        messages: []
      };

    conversation.messages.push(
      message
    );

    conversation.updatedAt =
      new Date().toISOString();

    await writeKV(
      env,
      key,
      conversation
    );

    /*
     * Индекс разговоров для админ-панели.
     */
    const conversations =
      (await readKV(
        env,
        "admin-chat:index"
      )) || [];

    const existing =
      conversations.find(
        item =>
          item.id === conversationId
      );

    if (!existing) {
      conversations.unshift({
        id: conversationId,
        userId: userId || null,
        anonymous,
        unread: true,
        createdAt:
          conversation.createdAt,
        updatedAt:
          conversation.updatedAt
      });
    } else {
      existing.unread = true;
      existing.updatedAt =
        conversation.updatedAt;
    }

    await writeKV(
      env,
      "admin-chat:index",
      conversations.slice(0, 1000)
    );

    return jsonResponse(
      {
        success: true,
        conversationId,
        message
      },
      201
    );
  }

  if (method === "GET") {
    const url =
      new URL(request.url);

    const conversationId =
      url.searchParams.get(
        "conversationId"
      );

    if (!conversationId) {
      return jsonResponse({
        success: true,
        conversations:
          (await readKV(
            env,
            "admin-chat:index"
          )) || []
      });
    }

    const conversation =
      await readKV(
        env,
        `admin-chat:${conversationId}`
      );

    return jsonResponse({
      success: true,
      conversation:
        conversation || null
    });
  }

  return jsonResponse(
    {
      success: false,
      error: "METHOD_NOT_ALLOWED"
    },
    405
  );
}

/* ============================================================
   NOTIFICATIONS
============================================================ */

async function handleNotifications(
  request,
  env
) {
  const userId =
    getUserId(request);

  if (!userId) {
    return jsonResponse(
      {
        success: false,
        error: "AUTH_REQUIRED"
      },
      401
    );
  }

  const notifications =
    (await readKV(
      env,
      `notifications:${userId}`
    )) || [];

  return jsonResponse({
    success: true,
    unread:
      notifications.filter(
        item => !item.read
      ).length,
    notifications
  });
}

/* ============================================================
   PROFILE HELPERS
============================================================ */

function createEmptyProfile(userId) {
  return {
    id: userId,
    name: "",
    username: "",
    avatar: "",
    cover: "",
    bio: "",
    city: "",
    phone: "",
    email: "",
    verified: false,
    createdAt:
      new Date().toISOString(),
    updatedAt:
      new Date().toISOString()
  };
}

function sanitizeProfile(data) {
  return {
    name: cleanText(
      data.name,
      120
    ),
    username: cleanText(
      data.username,
      80
    ),
    avatar: cleanText(
      data.avatar,
      1000
    ),
    cover: cleanText(
      data.cover,
      1000
    ),
    bio: cleanText(
      data.bio,
      2000
    ),
    city: cleanText(
      data.city,
      100
    ),
    phone: cleanText(
      data.phone,
      50
    ),
    email: cleanText(
      data.email,
      200
    )
  };
}

/* ============================================================
   KV STORAGE
============================================================ */

async function readKV(env, key) {
  /*
   * Поддержка KV, если namespace называется DATA.
   */
  if (
    env.DATA &&
    typeof env.DATA.get === "function"
  ) {
    return env.DATA.get(
      key,
      "json"
    );
  }

  /*
   * Поддержка namespace с другим
   * распространённым названием.
   */
  if (
    env.KV &&
    typeof env.KV.get === "function"
  ) {
    return env.KV.get(
      key,
      "json"
    );
  }

  return null;
}

async function writeKV(
  env,
  key,
  value
) {
  if (
    env.DATA &&
    typeof env.DATA.put === "function"
  ) {
    await env.DATA.put(
      key,
      JSON.stringify(value)
    );

    return true;
  }

  if (
    env.KV &&
    typeof env.KV.put === "function"
  ) {
    await env.KV.put(
      key,
      JSON.stringify(value)
    );

    return true;
  }

  return false;
}

/* ============================================================
   USER IDENTIFICATION
============================================================ */

function getUserId(request) {
  /*
   * Основной вариант:
   * X-User-ID
   */
  const header =
    request.headers.get(
      "X-User-ID"
    );

  if (header) {
    return sanitizeId(header);
  }

  /*
   * Альтернативный вариант:
   * Authorization Bearer <id>
   *
   * Это не является полноценной
   * JWT-проверкой. Для настоящей
   * авторизации нужно подключить
   * твою систему authentication.
   */
  const authorization =
    request.headers.get(
      "Authorization"
    );

  if (
    authorization &&
    authorization.startsWith(
      "Bearer "
    )
  ) {
    return sanitizeId(
      authorization.slice(7)
    );
  }

  return null;
}

function sanitizeId(value) {
  return String(value)
    .trim()
    .replace(
      /[^a-zA-Z0-9_\-:.@]/g,
      ""
    )
    .slice(0, 200) || null;
}

/* ============================================================
   JSON
============================================================ */

async function readJson(request) {
  const contentType =
    request.headers.get(
      "content-type"
    ) || "";

  if (
    !contentType.includes(
      "application/json"
    )
  ) {
    return {};
  }

  try {
    const text =
      await request.text();

    if (!text) {
      return {};
    }

    return JSON.parse(text);
  } catch {
    throw new Error(
      "Invalid JSON body"
    );
  }
}

function jsonResponse(
  data,
  status = 200,
  extraHeaders = {}
) {
  const headers =
    new Headers(
      JSON_HEADERS
    );

  Object.entries(
    extraHeaders
  ).forEach(
    ([key, value]) =>
      headers.set(
        key,
        String(value)
      )
  );

  return new Response(
    JSON.stringify(
      data,
      null,
      2
    ),
    {
      status,
      headers
    }
  );
}

/* ============================================================
   HTML
============================================================ */

function htmlResponse(
  html,
  status = 200
) {
  return new Response(
    html,
    {
      status,
      headers: {
        "Content-Type":
          "text/html; charset=UTF-8",
        "Cache-Control":
          "no-store"
      }
    }
  );
}

/* ============================================================
   CORS
============================================================ */

function corsResponse() {
  return new Response(
    null,
    {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin":
          "*",
        "Access-Control-Allow-Methods":
          ALLOWED_METHODS.join(", "),
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-User-ID",
        "Access-Control-Max-Age":
          "86400"
      }
    }
  );
}

/* ============================================================
   SECURITY HEADERS
============================================================ */

function addSecurityHeaders(
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
    "Access-Control-Allow-Origin",
    "*"
  );

  headers.set(
    "Access-Control-Allow-Methods",
    ALLOWED_METHODS.join(", ")
  );

  headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-User-ID"
  );

  return new Response(
    response.body,
    {
      status: response.status,
      statusText:
        response.statusText,
      headers
    }
  );
}

function addRequestId(
  response,
  requestId
) {
  const headers =
    new Headers(
      response.headers
    );

  headers.set(
    "X-Request-ID",
    requestId
  );

  return new Response(
    response.body,
    {
      status: response.status,
      statusText:
        response.statusText,
      headers
    }
  );
}

/* ============================================================
   TEXT / VALIDATION HELPERS
============================================================ */

function cleanText(
  value,
  maxLength = 1000
) {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value)
    .replace(/\u0000/g, "")
    .trim()
    .slice(0, maxLength);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll(
      "'",
      "&#039;"
    );
}

function normalizePath(path) {
  if (!path) {
    return "/";
  }

  if (
    path.length > 1 &&
    path.endsWith("/")
  ) {
    return path.slice(0, -1);
  }

  return path;
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
    !Number.isFinite(number)
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
