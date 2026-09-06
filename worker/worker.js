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

  if (!valueClean) return null;

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

  return Uint8Array.from(
    binary,
    char => char.charCodeAt(0)
  );
}

async function hmac(
  value,
  secret,
  verifyMode = false,
  signature = null
) {
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
    Math.floor(Date.now() / 1000) +
    SESSION_SECONDS;

  const value =
    `admin.${expiresAt}`;

  const signature =
    await hmac(
      value,
      secret
    );

  return `${value}.${signature}`;
}

async function isAdmin(request, env) {
  if (!env.ADMIN_PASSWORD) {
    return false;
  }

  const cookieHeader =
    request.headers.get("Cookie") || "";

  const match =
    cookieHeader.match(
      new RegExp(
        `${COOKIE}=([^;]+)`
      )
    );

  if (!match) {
    return false;
  }

  const parts =
    match[1].split(".");

  if (parts.length !== 3) {
    return false;
  }

  const [
    type,
    expiresAt,
    signature
  ] = parts;

  if (type !== "admin") {
    return false;
  }

  if (
    !Number.isFinite(
      Number(expiresAt)
    )
  ) {
    return false;
  }

  if (
    Number(expiresAt) <
    Math.floor(Date.now() / 1000)
  ) {
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

/* ============================================================
   DATABASE PREPARATION
============================================================ */

async function prepareDatabase(env) {
  /*
   * Добавляем необходимые поля для корзины.
   * Если они уже существуют, ошибки игнорируются.
   */

  const queries = [
    `
      ALTER TABLE posts
      ADD COLUMN deleted_at TEXT
    `,
    `
      ALTER TABLE posts
      ADD COLUMN deleted_reason TEXT
    `,
    `
      ALTER TABLE submissions
      ADD COLUMN deleted_at TEXT
    `,
    `
      ALTER TABLE submissions
      ADD COLUMN deleted_reason TEXT
    `
  ];

  for (const sql of queries) {
    try {
      await env.DB.prepare(sql).run();
    } catch {
      // Колонка уже существует — ничего делать не нужно.
    }
  }
}

/* ============================================================
   VALIDATION
============================================================ */

function validateSubmission(body) {
  const title =
    clean(body.title, 180);

  const content =
    clean(body.content, 12000);

  const category =
    clean(body.category, 80);

  const authorName =
    clean(body.author_name, 120);

  const contact =
    clean(body.contact, 300);

  const imageUrl =
    safeUrl(body.image_url);

  const linkUrl =
    safeUrl(body.link_url);

  const honeypot =
    clean(body.website, 200);

  if (honeypot) {
    return {
      error:
        "Не удалось отправить заявку."
    };
  }

  if (title.length < 5) {
    return {
      error:
        "Заголовок должен содержать минимум 5 символов."
    };
  }

  if (content.length < 20) {
    return {
      error:
        "Описание должно содержать минимум 20 символов."
    };
  }

  if (!category) {
    return {
      error:
        "Выберите категорию."
    };
  }

  return {
    title,
    content,
    category,
    authorName:
      authorName || null,
    contact:
      contact || null,
    imageUrl,
    linkUrl
  };
}

/* ============================================================
   PUBLIC POSTS
============================================================ */

async function getPosts(env) {
  await prepareDatabase(env);

  const result =
    await env.DB.prepare(
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
        WHERE deleted_at IS NULL
        ORDER BY published_at DESC
        LIMIT 500
      `
    ).all();

  return result.results || [];
}

/* ============================================================
   CREATE SUBMISSION
============================================================ */

async function createSubmission(
  request,
  env
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
          "Некорректные данные."
      },
      400
    );
  }

  const validated =
    validateSubmission(body);

  if (validated.error) {
    return json(
      {
        ok: false,
        error:
          validated.error
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

  const submissionId =
    newId();

  let code =
    trackingCode();

  for (
    let attempt = 0;
    attempt < 5;
    attempt++
  ) {
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
          VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?
          )
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
      if (
        !String(error)
          .toUpperCase()
          .includes("UNIQUE")
      ) {
        console.error(
          "Submission error:",
          error
        );

        return json(
          {
            ok: false,
            error:
              "Не удалось создать заявку."
          },
          500
        );
      }

      code =
        trackingCode();
    }
  }

  return json(
    {
      ok: false,
      error:
        "Не удалось создать заявку. Попробуйте ещё раз."
    },
    500
  );
}

/* ============================================================
   SUBMISSION STATUS
============================================================ */

async function getSubmissionStatus(
  request,
  env
) {
  const url =
    new URL(request.url);

  const code =
    clean(
      url.searchParams.get("code"),
      30
    ).toUpperCase();

  if (!code) {
    return json(
      {
        ok: false,
        error:
          "Введите код отслеживания."
      },
      400
    );
  }

  const submission =
    await env.DB.prepare(
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
        error:
          "Заявка с таким кодом не найдена."
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

/* ============================================================
   ADMIN LOGIN
============================================================ */

async function adminLogin(
  request,
  env
) {
  if (!env.ADMIN_PASSWORD) {
    return json(
      {
        ok: false,
        error:
          "Пароль администратора ещё не настроен."
      },
      500,
      NO_STORE
    );
  }

  let body = {};

  try {
    body =
      await request.json();
  } catch {
    return json(
      {
        ok: false,
        error:
          "Некорректные данные."
      },
      400,
      NO_STORE
    );
  }

  const password =
    String(body.password ?? "");

  if (
    !password ||
    password !==
      env.ADMIN_PASSWORD
  ) {
    return json(
      {
        ok: false,
        error:
          "Неверный пароль."
      },
      401,
      NO_STORE
    );
  }

  const session =
    await createAdminSession(
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
        "Max-Age=0`
    }
  );
}

/* ============================================================
   ADMIN SUBMISSIONS
============================================================ */

async function adminSubmissions(
  request,
  env
) {
  const url =
    new URL(request.url);

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

  const status =
    allowedStatuses.includes(
      requestedStatus
    )
      ? requestedStatus
      : "pending";

  const result =
    await env.DB.prepare(
      `
        SELECT *
        FROM submissions
        WHERE status = ?
          AND deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT 500
      `
    )
      .bind(status)
      .all();

  return json(
    {
      ok: true,
      submissions:
        result.results || []
    },
    200,
    NO_STORE
  );
}

/* ============================================================
   APPROVE SUBMISSION
============================================================ */

async function approveSubmission(
  submissionId,
  env
) {
  await prepareDatabase(env);

  const submission =
    await env.DB.prepare(
      `
        SELECT *
        FROM submissions
        WHERE id = ?
          AND deleted_at IS NULL
      `
    )
      .bind(submissionId)
      .first();

  if (!submission) {
    return json(
      {
        ok: false,
        error:
          "Заявка не найдена."
      },
      404,
      NO_STORE
    );
  }

  if (
    submission.status !==
    "pending"
  ) {
    return json(
      {
        ok: false,
        error:
          "Заявка уже обработана."
      },
      409,
      NO_STORE
    );
  }

  const now =
    new Date().toISOString();

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
            published_at,
            deleted_at,
            deleted_reason
          )
          VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL
          )
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
        message:
          "Заявка одобрена и опубликована."
      },
      200,
      NO_STORE
    );
  } catch (error) {
    console.error(
      "Approve error:",
      error
    );

    return json(
      {
        ok: false,
        error:
          "Не удалось опубликовать заявку."
      },
      500,
      NO_STORE
    );
  }
}

/* ============================================================
   REJECT SUBMISSION
============================================================ */

async function rejectSubmission(
  request,
  submissionId,
  env
) {
  await prepareDatabase(env);

  let body = {};

  try {
    body =
      await request.json();
  } catch {
    body = {};
  }

  const reason =
    clean(
      body.reason,
      1000
    ) ||
    "Материал не соответствует требованиям платформы.";

  const now =
    new Date().toISOString();

  const result =
    await env.DB.prepare(
      `
        UPDATE submissions
        SET
          status = 'rejected',
          rejection_reason = ?,
          reviewed_at = ?
        WHERE id = ?
          AND status = 'pending'
          AND deleted_at IS NULL
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
      message:
        "Заявка отклонена."
    },
    200,
    NO_STORE
  );
}

/* ============================================================
   ADMIN POSTS
============================================================ */

async function adminPosts(
  env
) {
  await prepareDatabase(env);

  const result =
    await env.DB.prepare(
      `
        SELECT
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
        FROM posts
        WHERE deleted_at IS NULL
        ORDER BY published_at DESC
        LIMIT 500
      `
    )
      .all();

  return json(
    {
      ok: true,
      posts:
        result.results || []
    },
    200,
    NO_STORE
  );
}

/* ============================================================
   GET ONE POST
============================================================ */

async function adminGetPost(
  postId,
  env
) {
  await prepareDatabase(env);

  const post =
    await env.DB.prepare(
      `
        SELECT
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
        FROM posts
        WHERE id = ?
          AND deleted_at IS NULL
      `
    )
      .bind(postId)
      .first();

  if (!post) {
    return json(
      {
        ok: false,
        error:
          "Пост не найден."
      },
      404,
      NO_STORE
    );
  }

  return json(
    {
      ok: true,
      post
    },
    200,
    NO_STORE
  );
}

/* ============================================================
   UPDATE POST
============================================================ */

async function adminUpdatePost(
  request,
  postId,
  env
) {
  await prepareDatabase(env);

  let body = {};

  try {
    body =
      await request.json();
  } catch {
    return json(
      {
        ok: false,
        error:
          "Некорректные данные."
      },
      400,
      NO_STORE
    );
  }

  const title =
    clean(body.title, 180);

  const content =
    clean(body.content, 12000);

  const category =
    clean(body.category, 80);

  const authorName =
    clean(
      body.author_name,
      120
    );

  const contact =
    clean(
      body.contact,
      300
    );

  const imageUrl =
    safeUrl(
      body.image_url
    );

  const linkUrl =
    safeUrl(
      body.link_url
    );

  if (title.length < 5) {
    return json(
      {
        ok: false,
        error:
          "Заголовок должен содержать минимум 5 символов."
      },
      400,
      NO_STORE
    );
  }

  if (content.length < 20) {
    return json(
      {
        ok: false,
        error:
          "Описание должно содержать минимум 20 символов."
      },
      400,
      NO_STORE
    );
  }

  if (!category) {
    return json(
      {
        ok: false,
        error:
          "Укажите категорию."
      },
      400,
      NO_STORE
    );
  }

  const result =
    await env.DB.prepare(
      `
        UPDATE posts
        SET
          title = ?,
          content = ?,
          category = ?,
          image_url = ?,
          link_url = ?,
          contact = ?,
          author_name = ?
        WHERE id = ?
          AND deleted_at IS NULL
      `
    )
      .bind(
        title,
        content,
        category,
        imageUrl,
        linkUrl,
        contact || null,
        authorName || null,
        postId
      )
      .run();

  if (!result.meta.changes) {
    return json(
      {
        ok: false,
        error:
          "Пост не найден."
      },
      404,
      NO_STORE
    );
  }

  return json(
    {
      ok: true,
      message:
        "Пост успешно изменён."
    },
    200,
    NO_STORE
  );
}

/* ============================================================
   MOVE POST TO TRASH
============================================================ */

async function adminTrashPost(
  postId,
  env
) {
  await prepareDatabase(env);

  const now =
    new Date().toISOString();

  const result =
    await env.DB.prepare(
      `
        UPDATE posts
        SET
          deleted_at = ?,
          deleted_reason = 'deleted_by_admin'
        WHERE id = ?
          AND deleted_at IS NULL
      `
    )
      .bind(
        now,
        postId
      )
      .run();

  if (!result.meta.changes) {
    return json(
      {
        ok: false,
        error:
          "Пост не найден."
      },
      404,
      NO_STORE
    );
  }

  return json(
    {
      ok: true,
      message:
        "Пост перемещён в корзину."
    },
    200,
    NO_STORE
  );
}

/* ============================================================
   TRASH — ALL DELETED POSTS
============================================================ */

async function adminTrash(
  env
) {
  await prepareDatabase(env);

  const result =
    await env.DB.prepare(
      `
        SELECT
          id,
          submission_id,
          title,
          content,
          category,
          image_url,
          link_url,
          contact,
          author_name,
          published_at,
          deleted_at,
          deleted_reason
        FROM posts
        WHERE deleted_at IS NOT NULL
        ORDER BY deleted_at DESC
        LIMIT 500
      `
    )
      .all();

  const rejected =
    await env.DB.prepare(
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
          tracking_code,
          status,
          rejection_reason,
          created_at,
          reviewed_at
        FROM submissions
        WHERE status = 'rejected'
          AND deleted_at IS NULL
        ORDER BY reviewed_at DESC
        LIMIT 500
      `
    )
      .all();

  return json(
    {
      ok: true,
      posts:
        result.results || [],
      rejected_submissions:
        rejected.results || []
    },
    200,
    NO_STORE
  );
}

/* ============================================================
   RESTORE POST
============================================================ */

async function adminRestorePost(
  postId,
  env
) {
  await prepareDatabase(env);

  const result =
    await env.DB.prepare(
      `
        UPDATE posts
        SET
          deleted_at = NULL,
          deleted_reason = NULL
        WHERE id = ?
          AND deleted_at IS NOT NULL
      `
    )
      .bind(postId)
      .run();

  if (!result.meta.changes) {
    return json(
      {
        ok: false,
        error:
          "Пост в корзине не найден."
      },
      404,
      NO_STORE
    );
  }

  return json(
    {
      ok: true,
      message:
        "Пост восстановлен."
    },
    200,
    NO_STORE
  );
}

/* ============================================================
   PERMANENT DELETE POST
============================================================ */

async function adminPermanentDeletePost(
  postId,
  env
) {
  await prepareDatabase(env);

  const result =
    await env.DB.prepare(
      `
        DELETE FROM posts
        WHERE id = ?
          AND deleted_at IS NOT NULL
      `
    )
      .bind(postId)
      .run();

  if (!result.meta.changes) {
    return json(
      {
        ok: false,
        error:
          "Пост в корзине не найден."
      },
      404,
      NO_STORE
    );
  }

  return json(
    {
      ok: true,
      message:
        "Пост окончательно удалён."
    },
    200,
    NO_STORE
  );
}

/* ============================================================
   EMPTY TRASH
============================================================ */

async function adminEmptyTrash(
  env
) {
  await prepareDatabase(env);

  try {
    await env.DB.batch([
      env.DB.prepare(
        `
          DELETE FROM posts
          WHERE deleted_at IS NOT NULL
        `
      ),

      env.DB.prepare(
        `
          UPDATE submissions
          SET
            deleted_at = ?,
            deleted_reason = 'trash_cleared'
          WHERE status = 'rejected'
            AND deleted_at IS NULL
        `
      ).bind(
        new Date().toISOString()
      )
    ]);

    return json(
      {
        ok: true,
        message:
          "Корзина полностью очищена."
      },
      200,
      NO_STORE
    );
  } catch (error) {
    console.error(
      "Empty trash error:",
      error
    );

    return json(
      {
        ok: false,
        error:
          "Не удалось очистить корзину."
      },
      500,
      NO_STORE
    );
  }
}

/* ============================================================
   RESTORE REJECTED SUBMISSION
============================================================ */

async function adminRestoreRejectedSubmission(
  submissionId,
  env
) {
  await prepareDatabase(env);

  const result =
    await env.DB.prepare(
      `
        UPDATE submissions
        SET
          status = 'pending',
          rejection_reason = NULL,
          reviewed_at = NULL,
          deleted_at = NULL,
          deleted_reason = NULL
        WHERE id = ?
          AND status = 'rejected'
      `
    )
      .bind(
        submissionId
      )
      .run();

  if (!result.meta.changes) {
    return json(
      {
        ok: false,
        error:
          "Отклонённая заявка не найдена."
      },
      404,
      NO_STORE
    );
  }

  return json(
    {
      ok: true,
      message:
        "Заявка восстановлена и снова ожидает проверки."
    },
    200,
    NO_STORE
  );
}

/* ============================================================
   PERMANENT DELETE REJECTED SUBMISSION
============================================================ */

async function adminPermanentDeleteRejectedSubmission(
  submissionId,
  env
) {
  await prepareDatabase(env);

  const result =
    await env.DB.prepare(
      `
        DELETE FROM submissions
        WHERE id = ?
          AND status = 'rejected'
      `
    )
      .bind(
        submissionId
      )
      .run();

  if (!result.meta.changes) {
    return json(
      {
        ok: false,
        error:
          "Отклонённая заявка не найдена."
      },
      404,
      NO_STORE
    );
  }

  return json(
    {
      ok: true,
      message:
        "Отклонённая заявка окончательно удалена."
    },
    200,
    NO_STORE
  );
}

/* ============================================================
   ADMIN STATS
============================================================ */

async function adminStats(env) {
  await prepareDatabase(env);

  const result =
    await env.DB.prepare(
      `
        SELECT
          (
            SELECT COUNT(*)
            FROM posts
            WHERE deleted_at IS NULL
          ) AS total_posts,

          (
            SELECT COUNT(*)
            FROM posts
            WHERE deleted_at IS NOT NULL
          ) AS trash_posts,

          (
            SELECT COUNT(*)
            FROM submissions
            WHERE status = 'pending'
              AND deleted_at IS NULL
          ) AS pending,

          (
            SELECT COUNT(*)
            FROM submissions
            WHERE status = 'approved'
              AND deleted_at IS NULL
          ) AS approved,

          (
            SELECT COUNT(*)
            FROM submissions
            WHERE status = 'rejected'
              AND deleted_at IS NULL
          ) AS rejected,

          (
            SELECT COUNT(*)
            FROM submissions
            WHERE deleted_at IS NULL
          ) AS total_submissions
      `
    )
      .first();

  return json(
    {
      ok: true,
      stats:
        result || {
          total_posts: 0,
          trash_posts: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          total_submissions: 0
        }
    },
    200,
    NO_STORE
  );
}

/* ============================================================
   DELETE ALL POSTS
============================================================ */

async function adminTrashAllPosts(
  env
) {
  await prepareDatabase(env);

  const now =
    new Date().toISOString();

  const result =
    await env.DB.prepare(
      `
        UPDATE posts
        SET
          deleted_at = ?,
          deleted_reason = 'all_posts_deleted_by_admin'
        WHERE deleted_at IS NULL
      `
    )
      .bind(now)
      .run();

  return json(
    {
      ok: true,
      deleted:
        result.meta.changes || 0,
      message:
        "Все публикации перемещены в корзину."
    },
    200,
    NO_STORE
  );
}

/* ============================================================
   API ROUTER
============================================================ */

async function handleApi(
  request,
  env
) {
  const url =
    new URL(request.url);

  const path =
    url.pathname;

  const method =
    request.method;

  /* PUBLIC */

  if (
    path === "/api/posts" &&
    method === "GET"
  ) {
    const posts =
      await getPosts(env);

    return json({
      ok: true,
      posts
    });
  }

  if (
    path === "/api/submissions" &&
    method === "POST"
  ) {
    return createSubmission(
      request,
      env
    );
  }

  if (
    path === "/api/submissions/status" &&
    method === "GET"
  ) {
    return getSubmissionStatus(
      request,
      env
    );
  }

  /* ADMIN LOGIN */

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

  /* ADMIN PROTECTION */

  if (
    path.startsWith(
      "/api/admin/"
    )
  ) {
    const authorized =
      await isAdmin(
        request,
        env
      );

    if (!authorized) {
      return json(
        {
          ok: false,
          error:
            "Требуется авторизация."
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

    /* STATS */

    if (
      path === "/api/admin/stats" &&
      method === "GET"
    ) {
      return adminStats(env);
    }

    /* SUBMISSIONS */

    if (
      path ===
        "/api/admin/submissions" &&
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

    /* POSTS */

    if (
      path ===
        "/api/admin/posts" &&
      method === "GET"
    ) {
      return adminPosts(env);
    }

    if (
      path ===
        "/api/admin/posts/all/trash" &&
      method === "POST"
    ) {
      return adminTrashAllPosts(
        env
      );
    }

    /* TRASH */

    if (
      path ===
        "/api/admin/trash" &&
      method === "GET"
    ) {
      return adminTrash(env);
    }

    if (
      path ===
        "/api/admin/trash/empty" &&
      method === "DELETE"
    ) {
      return adminEmptyTrash(
        env
      );
    }

    const postTrashMatch =
      path.match(
        /^\/api\/admin\/posts\/([^/]+)\/trash$/
      );

    if (
      postTrashMatch &&
      method === "POST"
    ) {
      return adminTrashPost(
        postTrashMatch[1],
        env
      );
    }

    const postRestoreMatch =
      path.match(
        /^\/api\/admin\/posts\/([^/]+)\/restore$/
      );

    if (
      postRestoreMatch &&
      method === "POST"
    ) {
      return adminRestorePost(
        postRestoreMatch[1],
        env
      );
    }

    const postPermanentDeleteMatch =
      path.match(
        /^\/api\/admin\/posts\/([^/]+)\/permanent$/
      );

    if (
      postPermanentDeleteMatch &&
      method === "DELETE"
    ) {
      return adminPermanentDeletePost(
        postPermanentDeleteMatch[1],
        env
      );
    }

    /* REJECTED SUBMISSIONS */

    const rejectedRestoreMatch =
      path.match(
        /^\/api\/admin\/submissions\/([^/]+)\/restore$/
      );

    if (
      rejectedRestoreMatch &&
      method === "POST"
    ) {
      return adminRestoreRejectedSubmission(
        rejectedRestoreMatch[1],
        env
      );
    }

    const rejectedPermanentDeleteMatch =
      path.match(
        /^\/api\/admin\/submissions\/([^/]+)\/permanent$/
      );

    if (
      rejectedPermanentDeleteMatch &&
      method === "DELETE"
    ) {
      return adminPermanentDeleteRejectedSubmission(
        rejectedPermanentDeleteMatch[1],
        env
      );
    }

    /* ONE POST */

    const postMatch =
      path.match(
        /^\/api\/admin\/posts\/([^/]+)$/
      );

    if (
      postMatch &&
      method === "GET"
    ) {
      return adminGetPost(
        postMatch[1],
        env
      );
    }

    if (
      postMatch &&
      method === "PUT"
    ) {
      return adminUpdatePost(
        request,
        postMatch[1],
        env
      );
    }
  }

  return json(
    {
      ok: false,
      error:
        "API route not found."
    },
    404
  );
}

/* ============================================================
   WORKER
============================================================ */

export default {
  async fetch(
    request,
    env
  ) {
    const url =
      new URL(request.url);

    if (
      url.pathname.startsWith(
        "/api/"
      )
    ) {
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

    let response =
      await env.ASSETS.fetch(
        request
      );

    if (
      response.status === 404 &&
      url.pathname === "/"
    ) {
      const indexUrl =
        new URL(
          "/index.html",
          request.url
        );

      const indexRequest =
        new Request(
          indexUrl,
          request
        );

      response =
        await env.ASSETS.fetch(
          indexRequest
        );
    }

    return response;
  }
};
