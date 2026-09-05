const COOKIE = "to_admin_session";
const SESSION_SECONDS = 12 * 60 * 60;

const SECURITY_HEADERS = {
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=()"
};

const NO_STORE = {
  "cache-control": "no-store"
};

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

function clean(value, max = 5000) {
  return String(value ?? "")
    .trim()
    .slice(0, max);
}

function safeUrl(value) {
  const valueClean = clean(value, 1000);

  if (!valueClean) {
    return null;
  }

  try {
    const url = new URL(valueClean);

    if (!["http:", "https:"].includes(url.protocol)) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

function newId() {
  return crypto.randomUUID();
}

function trackingCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(8);

  crypto.getRandomValues(bytes);

  return [...bytes]
    .map((byte) => chars[byte % chars.length])
    .join("");
}

function base64UrlEncode(bytes) {
  let binary = "";

  for (const byte of new Uint8Array(bytes)) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(value) {
  let normalized = value
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  while (normalized.length % 4) {
    normalized += "=";
  }

  const binary = atob(normalized);

  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function hmac(value, secret, verifyMode = false, signature = null) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256"
    },
    false,
    ["sign", "verify"]
  );

  if (verifyMode) {
    return crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlDecode(signature),
      new TextEncoder().encode(value)
    );
  }

  return base64UrlEncode(
    await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(value)
    )
  );
}

async function createAdminSession(secret) {
  const expiresAt =
    Math.floor(Date.now() / 1000) + SESSION_SECONDS;

  const value = `admin.${expiresAt}`;
  const signature = await hmac(value, secret);

  return `${value}.${signature}`;
}

async function isAdmin(request, env) {
  if (!env.ADMIN_PASSWORD) {
    return false;
  }

  const cookieHeader = request.headers.get("Cookie") || "";

  const match = cookieHeader.match(
    new RegExp(`${COOKIE}=([^;]+)`)
  );

  if (!match) {
    return false;
  }

  const parts = match[1].split(".");

  if (parts.length !== 3) {
    return false;
  }

  const [type, expiresAt, signature] = parts;

  if (type !== "admin") {
    return false;
  }

  if (!Number.isFinite(Number(expiresAt))) {
    return false;
  }

  if (Number(expiresAt) < Math.floor(Date.now() / 1000)) {
    return false;
  }

  try {
    return await hmac(
      `${type}.${expiresAt}`,
      env.ADMIN_PASSWORD,
      true,
      signature
    );
  } catch {
    return false;
  }
}

function getClientIp(request) {
  return (
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For") ||
    "unknown"
  );
}

function validateSubmission(body) {
  const title = clean(body.title, 180);
  const content = clean(body.content, 12000);
  const category = clean(body.category, 80);

  const authorName = clean(body.author_name, 120);
  const contact = clean(body.contact, 300);

  const imageUrl = safeUrl(body.image_url);
  const linkUrl = safeUrl(body.link_url);

  const honeypot = clean(body.website, 200);

  if (honeypot) {
    return {
      error: "Не удалось отправить заявку."
    };
  }

  if (title.length < 5) {
    return {
      error: "Заголовок должен содержать минимум 5 символов."
    };
  }

  if (content.length < 20) {
    return {
      error: "Описание должно содержать минимум 20 символов."
    };
  }

  if (!category) {
    return {
      error: "Выберите категорию."
    };
  }

  return {
    title,
    content,
    category,
    authorName: authorName || null,
    contact: contact || null,
    imageUrl,
    linkUrl
  };
}

async function getPosts(env) {
  const result = await env.DB.prepare(
    `
      SELECT
        id,
        title,
        content,
        category,
        image_url,
        link_url,
        contact,
        author_name,
        published_at
      FROM posts
      ORDER BY published_at DESC
      LIMIT 100
    `
  ).all();

  return result.results || [];
}

async function createSubmission(request, env) {
  let body;

  try {
    body = await request.json();
  } catch {
    return json(
      {
        ok: false,
        error: "Некорректные данные."
      },
      400
    );
  }

  const validated = validateSubmission(body);

  if (validated.error) {
    return json(
      {
        ok: false,
        error: validated.error
      },
      400
    );
  }

  const {
    title,
    content,
    category,
    authorName,
    contact,
    imageUrl,
    linkUrl
  } = validated;

  const submissionId = newId();

  let code = trackingCode();

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await env.DB.prepare(
        `
          INSERT INTO submissions (
            id,
            title,
            content,
            category,
            image_url,
            link_url,
            contact,
            author_name,
            tracking_code,
            status,
            created_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
        `
      )
        .bind(
          submissionId,
          title,
          content,
          category,
          imageUrl,
          linkUrl,
          contact,
          authorName,
          code,
          new Date().toISOString()
        )
        .run();

      return json(
        {
          ok: true,
          tracking_code: code
        },
        201
      );
    } catch (error) {
      if (!String(error).includes("UNIQUE")) {
        console.error("Submission error:", error);

        return json(
          {
            ok: false,
            error: "Не удалось создать заявку."
          },
          500
        );
      }

      code = trackingCode();
    }
  }

  return json(
    {
      ok: false,
      error: "Не удалось создать заявку. Попробуйте ещё раз."
    },
    500
  );
}

async function getSubmissionStatus(request, env) {
  const url = new URL(request.url);

  const code = clean(
    url.searchParams.get("code"),
    30
  ).toUpperCase();

  if (!code) {
    return json(
      {
        ok: false,
        error: "Введите код отслеживания."
      },
      400
    );
  }

  const submission = await env.DB.prepare(
    `
      SELECT
        tracking_code,
        title,
        category,
        status,
        rejection_reason,
        created_at,
        reviewed_at
      FROM submissions
      WHERE tracking_code = ?
    `
  )
    .bind(code)
    .first();

  if (!submission) {
    return json(
      {
        ok: false,
        error: "Заявка с таким кодом не найдена."
      },
      404
    );
  }

  return json(
    {
      ok: true,
      submission
    },
    200,
    NO_STORE
  );
}

async function adminLogin(request, env) {
  if (!env.ADMIN_PASSWORD) {
    return json(
      {
        ok: false,
        error: "Пароль администратора ещё не настроен."
      },
      500,
      NO_STORE
    );
  }

  let body = {};

  try {
    body = await request.json();
  } catch {
    return json(
      {
        ok: false,
        error: "Некорректные данные."
      },
      400,
      NO_STORE
    );
  }

  const password = String(body.password ?? "");

  if (!password || password !== env.ADMIN_PASSWORD) {
    return json(
      {
        ok: false,
        error: "Неверный пароль."
      },
      401,
      NO_STORE
    );
  }

  const session = await createAdminSession(
    env.ADMIN_PASSWORD
  );

  return json(
    {
      ok: true
    },
    200,
    {
      ...NO_STORE,
      "set-cookie":
        `${COOKIE}=${session}; ` +
        "Path=/; " +
        "HttpOnly; " +
        "Secure; " +
        "SameSite=Strict; " +
        `Max-Age=${SESSION_SECONDS}`
    }
  );
}

async function adminLogout() {
  return json(
    {
      ok: true
    },
    200,
    {
      ...NO_STORE,
      "set-cookie":
        `${COOKIE}=; ` +
        "Path=/; " +
        "HttpOnly; " +
        "Secure; " +
        "SameSite=Strict; " +
        "Max-Age=0"
    }
  );
}

async function adminSubmissions(request, env) {
  const url = new URL(request.url);

  const requestedStatus =
    clean(
      url.searchParams.get("status"),
      20
    ) || "pending";

  const allowedStatuses = [
    "pending",
    "approved",
    "rejected"
  ];

  const status = allowedStatuses.includes(
    requestedStatus
  )
    ? requestedStatus
    : "pending";

  const result = await env.DB.prepare(
    `
      SELECT *
      FROM submissions
      WHERE status = ?
      ORDER BY created_at DESC
      LIMIT 100
    `
  )
    .bind(status)
    .all();

  return json(
    {
      ok: true,
      submissions: result.results || []
    },
    200,
    NO_STORE
  );
}

async function approveSubmission(
  submissionId,
  env
) {
  const submission = await env.DB.prepare(
    `
      SELECT *
      FROM submissions
      WHERE id = ?
    `
  )
    .bind(submissionId)
    .first();

  if (!submission) {
    return json(
      {
        ok: false,
        error: "Заявка не найдена."
      },
      404,
      NO_STORE
    );
  }

  if (submission.status !== "pending") {
    return json(
      {
        ok: false,
        error: "Заявка уже обработана."
      },
      409,
      NO_STORE
    );
  }

  const now = new Date().toISOString();

  try {
    await env.DB.batch([
      env.DB.prepare(
        `
          INSERT INTO posts (
            id,
            submission_id,
            title,
            content,
            category,
            image_url,
            link_url,
            contact,
            author_name,
            published_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
      ).bind(
        newId(),
        submissionId,
        submission.title,
        submission.content,
        submission.category,
        submission.image_url,
        submission.link_url,
        submission.contact,
        submission.author_name,
        now
      ),

      env.DB.prepare(
        `
          UPDATE submissions
          SET
            status = 'approved',
            reviewed_at = ?
          WHERE id = ?
            AND status = 'pending'
        `
      ).bind(
        now,
        submissionId
      )
    ]);

    return json(
      {
        ok: true,
        message: "Заявка одобрена и опубликована."
      },
      200,
      NO_STORE
    );
  } catch (error) {
    console.error("Approve error:", error);

    return json(
      {
        ok: false,
        error: "Не удалось одобрить заявку."
      },
      500,
      NO_STORE
    );
  }
}

async function rejectSubmission(
  request,
  submissionId,
  env
) {
  let body = {};

  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const reason =
    clean(body.reason, 1000) ||
    "Материал не соответствует требованиям платформы.";

  const now = new Date().toISOString();

  const result = await env.DB.prepare(
    `
      UPDATE submissions
      SET
        status = 'rejected',
        rejection_reason = ?,
        reviewed_at = ?
      WHERE id = ?
        AND status = 'pending'
    `
  )
    .bind(
      reason,
      now,
      submissionId
    )
    .run();

  if (!result.meta.changes) {
    return json(
      {
        ok: false,
        error:
          "Заявка не найдена или уже обработана."
      },
      409,
      NO_STORE
    );
  }

  return json(
    {
      ok: true,
      message: "Заявка отклонена."
    },
    200,
    NO_STORE
  );
}

async function handleApi(
  request,
  env
) {
  const url = new URL(request.url);

  const path = url.pathname;
  const method = request.method;

  /*
   * Публичные публикации
   */

  if (
    path === "/api/posts" &&
    method === "GET"
  ) {
    const posts = await getPosts(env);

    return json({
      ok: true,
      posts
    });
  }

  /*
   * Отправка новой заявки участником
   */

  if (
    path === "/api/submissions" &&
    method === "POST"
  ) {
    return createSubmission(
      request,
      env
    );
  }

  /*
   * Проверка статуса заявки
   */

  if (
    path === "/api/submissions/status" &&
    method === "GET"
  ) {
    return getSubmissionStatus(
      request,
      env
    );
  }

  /*
   * Административная часть
   */

  if (path.startsWith("/api/admin/")) {
    if (
      path === "/api/admin/login" &&
      method === "POST"
    ) {
      return adminLogin(
        request,
        env
      );
    }

    if (
      path === "/api/admin/logout" &&
      method === "POST"
    ) {
      return adminLogout();
    }

    const authorized =
      await isAdmin(
        request,
        env
      );

    if (!authorized) {
      return json(
        {
          ok: false,
          error: "Требуется авторизация."
        },
        401,
        NO_STORE
      );
    }

    if (
      path === "/api/admin/me" &&
      method === "GET"
    ) {
      return json(
        {
          ok: true,
          admin: true
        },
        200,
        NO_STORE
      );
    }

    if (
      path === "/api/admin/submissions" &&
      method === "GET"
    ) {
      return adminSubmissions(
        request,
        env
      );
    }

    const approveMatch =
      path.match(
        /^\/api\/admin\/submissions\/([^/]+)\/approve$/
      );

    if (
      approveMatch &&
      method === "POST"
    ) {
      return approveSubmission(
        approveMatch[1],
        env
      );
    }

    const rejectMatch =
      path.match(
        /^\/api\/admin\/submissions\/([^/]+)\/reject$/
      );

    if (
      rejectMatch &&
      method === "POST"
    ) {
      return rejectSubmission(
        request,
        rejectMatch[1],
        env
      );
    }
  }

  return json(
    {
      ok: false,
      error: "API route not found."
    },
    404
  );
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      try {
        return await handleApi(
          request,
          env
        );
      } catch (error) {
        console.error(
          "Unhandled API error:",
          error
        );

        return json(
          {
            ok: false,
            error:
              "Внутренняя ошибка сервера."
          },
          500,
          NO_STORE
        );
      }
    }

    return env.ASSETS.fetch(request);
  }
};
