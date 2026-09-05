/**
 * ============================================================
 * TAJIK OPPORTUNITIES — PRODUCTION GRADE WORKER
 * ============================================================
 * @version 2.0.0
 * @description Платформа для публикации возможностей в Таджикистане
 * @license MIT
 * ============================================================
 */

// ============================================================
// КОНСТАНТЫ
// ============================================================

const CONFIG = {
  SESSION_COOKIE: 'tajik_admin_session',
  SESSION_TTL: 12 * 60 * 60, // 12 часов
  MAX_TITLE: 200,
  MAX_CONTENT: 10000,
  MAX_CATEGORY: 100,
  MAX_URL: 2000,
  MAX_CONTACT: 300,
  MAX_AUTHOR: 200,
  MAX_REASON: 1000,
  MAX_CODE: 50,
  MAX_SUBMISSIONS: 200,
  MAX_POSTS: 100,
  TRACKING_CODE_LENGTH: 8,
  ALLOWED_STATUSES: ['pending', 'approved', 'rejected', 'all'],
};

// ============================================================
// УТИЛИТЫ
// ============================================================

const Utils = {
  /**
   * Очистка и обрезка строки
   */
  clean: (value, max = 5000) => {
    if (typeof value !== 'string') return '';
    return value.trim().slice(0, max);
  },

  /**
   * Валидация и безопасное преобразование URL
   */
  safeUrl: (value) => {
    const url = Utils.clean(value, CONFIG.MAX_URL);
    if (!url) return null;
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) return null;
      return parsed.toString();
    } catch {
      return null;
    }
  },

  /**
   * Генерация случайного кода
   */
  randomCode: (length = CONFIG.TRACKING_CODE_LENGTH) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const bytes = crypto.getRandomValues(new Uint8Array(length));
    let result = '';
    for (const byte of bytes) {
      result += chars[byte % chars.length];
    }
    return result;
  },

  /**
   * Генерация UUID v4
   */
  uuid: () => crypto.randomUUID(),

  /**
   * Текущее время в ISO формате
   */
  now: () => new Date().toISOString(),

  /**
   * Безопасное логирование
   */
  log: (level, message, data = null) => {
    const entry = {
      timestamp: Utils.now(),
      level,
      message,
    };
    if (data) entry.data = data;
    console[level === 'error' ? 'error' : 'log'](JSON.stringify(entry));
  },
};

// ============================================================
// КРИПТОГРАФИЯ
// ============================================================

const Crypto = {
  /**
   * Base64 URL кодирование
   */
  base64urlEncode: (bytes) => {
    let binary = '';
    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
  },

  /**
   * Base64 URL декодирование
   */
  base64urlDecode: (value) => {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  },

  /**
   * Создание HMAC ключа
   */
  hmacKey: async (secret, message) => {
    return await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );
  },

  /**
   * Подпись данных HMAC
   */
  sign: async (secret, message) => {
    const key = await Crypto.hmacKey(secret, message);
    return await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  },

  /**
   * Проверка подписи HMAC
   */
  verify: async (secret, message, signature) => {
    const key = await Crypto.hmacKey(secret, message);
    return await crypto.subtle.verify('HMAC', key, signature, new TextEncoder().encode(message));
  },
};

// ============================================================
// СЕССИИ
// ============================================================

class Session {
  /**
   * Создание сессии
   */
  static async create(env) {
    const expires = Math.floor(Date.now() / 1000) + CONFIG.SESSION_TTL;
    const payload = {
      exp: expires,
      nonce: Utils.randomCode(24),
    };

    const encodedPayload = Crypto.base64urlEncode(
      new TextEncoder().encode(JSON.stringify(payload))
    );

    const signature = await Crypto.sign(
      env.ADMIN_PASSWORD,
      `session:${encodedPayload}`
    );

    const encodedSignature = Crypto.base64urlEncode(
      new Uint8Array(signature)
    );

    return `${encodedPayload}.${encodedSignature}`;
  }

  /**
   * Проверка сессии
   */
  static async verify(request, env) {
    const cookieHeader = request.headers.get('Cookie') || '';
    const cookies = {};

    for (const part of cookieHeader.split(';')) {
      const index = part.indexOf('=');
      if (index === -1) continue;
      const name = part.slice(0, index).trim();
      const value = part.slice(index + 1).trim();
      cookies[name] = value;
    }

    const session = cookies[CONFIG.SESSION_COOKIE];
    if (!session) return false;

    const parts = session.split('.');
    if (parts.length !== 2) return false;

    const [payload, signature] = parts;

    try {
      const decoded = new TextDecoder().decode(
        Crypto.base64urlDecode(payload)
      );
      const data = JSON.parse(decoded);

      if (!data.exp || data.exp < Math.floor(Date.now() / 1000)) {
        return false;
      }

      const signatureBytes = Crypto.base64urlDecode(signature);
      return await Crypto.verify(
        env.ADMIN_PASSWORD,
        `session:${payload}`,
        signatureBytes
      );
    } catch {
      return false;
    }
  }

  /**
   * Создание cookie
   */
  static cookie(value) {
    return [
      `${CONFIG.SESSION_COOKIE}=${value}`,
      'Path=/',
      'HttpOnly',
      'Secure',
      'SameSite=Strict',
      `Max-Age=${CONFIG.SESSION_TTL}`,
    ].join('; ');
  }

  /**
   * Удаление cookie
   */
  static deleteCookie() {
    return [
      `${CONFIG.SESSION_COOKIE}=`,
      'Path=/',
      'HttpOnly',
      'Secure',
      'SameSite=Strict',
      'Max-Age=0',
    ].join('; ');
  }
}

// ============================================================
// ОТВЕТЫ
// ============================================================

class ResponseBuilder {
  static json(data, status = 200, extraHeaders = {}) {
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        ...extraHeaders,
      },
    });
  }

  static success(data, message = null, status = 200) {
    return this.json({ success: true, data, message }, status);
  }

  static error(message, status = 400) {
    return this.json({ success: false, error: message }, status);
  }

  static withCookie(data, cookie, status = 200) {
    return this.json(data, status, { 'Set-Cookie': cookie });
  }
}

// ============================================================
// МИДЛВЭРЫ
// ============================================================

async function requireAdmin(request, env) {
  if (!env.ADMIN_PASSWORD) {
    return ResponseBuilder.error(
      'ADMIN_PASSWORD не настроен в Cloudflare.',
      500
    );
  }

  const authenticated = await Session.verify(request, env);
  if (!authenticated) {
    return ResponseBuilder.error('Не авторизован. Требуется вход.', 401);
  }

  return null;
}

// ============================================================
// ОБРАБОТЧИКИ API
// ============================================================

class Handlers {
  /**
   * Получение опубликованных постов
   */
  static async getPosts(db) {
    try {
      const result = await db.prepare(`
        SELECT
          id,
          title,
          content,
          category,
          image_url,
          link_url,
          contact,
          author_name,
          published_at,
          view_count,
          share_count
        FROM posts
        WHERE deleted_at IS NULL
          AND (expires_at IS NULL OR expires_at > datetime('now'))
        ORDER BY published_at DESC
        LIMIT ?
      `).bind(CONFIG.MAX_POSTS).all();

      return ResponseBuilder.success({
        posts: result.results || [],
        count: result.results?.length || 0,
      });
    } catch (error) {
      Utils.log('error', 'Failed to get posts', { error: error.message });
      return ResponseBuilder.error('Ошибка базы данных.', 500);
    }
  }

  /**
   * Создание заявки
   */
  static async createSubmission(request, db) {
    try {
      const body = await request.json().catch(() => null);
      if (!body) {
        return ResponseBuilder.error('Неверный формат запроса.', 400);
      }

      const title = Utils.clean(body.title, CONFIG.MAX_TITLE);
      const content = Utils.clean(body.content, CONFIG.MAX_CONTENT);
      const category = Utils.clean(body.category, CONFIG.MAX_CATEGORY);
      const imageUrl = Utils.safeUrl(body.image_url);
      const linkUrl = Utils.safeUrl(body.link_url);
      const contact = Utils.clean(body.contact, CONFIG.MAX_CONTACT);
      const authorName = Utils.clean(body.author_name, CONFIG.MAX_AUTHOR);

      if (!title) {
        return ResponseBuilder.error('Введите заголовок.', 400);
      }
      if (!content) {
        return ResponseBuilder.error('Введите текст публикации.', 400);
      }
      if (!category) {
        return ResponseBuilder.error('Выберите категорию.', 400);
      }

      const id = Utils.uuid();
      const trackingCode = Utils.randomCode();
      const createdAt = Utils.now();

      await db.prepare(`
        INSERT INTO submissions (
          id, title, content, category, image_url, link_url,
          contact, author_name, tracking_code, status, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
      `).bind(
        id,
        title,
        content,
        category,
        imageUrl,
        linkUrl,
        contact,
        authorName,
        trackingCode,
        createdAt
      ).run();

      Utils.log('info', 'Submission created', { trackingCode });

      return ResponseBuilder.success(
        { tracking_code: trackingCode },
        'Заявка успешно отправлена на модерацию.',
        201
      );
    } catch (error) {
      Utils.log('error', 'Failed to create submission', { error: error.message });
      return ResponseBuilder.error('Не удалось отправить заявку.', 500);
    }
  }

  /**
   * Проверка статуса заявки
   */
  static async getSubmissionStatus(request, db) {
    const url = new URL(request.url);
    const code = Utils.clean(url.searchParams.get('code'), CONFIG.MAX_CODE).toUpperCase();

    if (!code) {
      return ResponseBuilder.error('Введите код заявки.', 400);
    }

    try {
      const submission = await db.prepare(`
        SELECT
          title,
          category,
          status,
          rejection_reason,
          created_at,
          reviewed_at,
          tracking_code
        FROM submissions
        WHERE tracking_code = ?
        LIMIT 1
      `).bind(code).first();

      if (!submission) {
        return ResponseBuilder.error('Заявка с таким кодом не найдена.', 404);
      }

      return ResponseBuilder.success({ submission });
    } catch (error) {
      Utils.log('error', 'Failed to get submission status', { error: error.message });
      return ResponseBuilder.error('Ошибка базы данных.', 500);
    }
  }
}

// ============================================================
// АДМИН-ОБРАБОТЧИКИ
// ============================================================

class AdminHandlers {
  /**
   * Вход в админку
   */
  static async login(request, env) {
    if (!env.ADMIN_PASSWORD) {
      return ResponseBuilder.error('ADMIN_PASSWORD не настроен в Cloudflare.', 500);
    }

    try {
      const body = await request.json().catch(() => null);
      if (!body) {
        return ResponseBuilder.error('Неверный формат запроса.', 400);
      }

      const password = typeof body.password === 'string' ? body.password : '';
      if (!password) {
        return ResponseBuilder.error('Введите пароль.', 400);
      }

      if (password !== env.ADMIN_PASSWORD) {
        Utils.log('warn', 'Failed admin login attempt');
        return ResponseBuilder.error('Неверный пароль.', 401);
      }

      const session = await Session.create(env);
      Utils.log('info', 'Admin logged in');

      return ResponseBuilder.withCookie(
        { success: true, message: 'Вход выполнен.' },
        Session.cookie(session)
      );
    } catch (error) {
      Utils.log('error', 'Login error', { error: error.message });
      return ResponseBuilder.error('Ошибка авторизации.', 500);
    }
  }

  /**
   * Выход из админки
   */
  static async logout() {
    Utils.log('info', 'Admin logged out');
    return ResponseBuilder.withCookie(
      { success: true },
      Session.deleteCookie()
    );
  }

  /**
   * Проверка сессии
   */
  static async checkSession(request, env) {
    if (!env.ADMIN_PASSWORD) {
      return ResponseBuilder.error('ADMIN_PASSWORD не настроен.', 500);
    }
    const authenticated = await Session.verify(request, env);
    return ResponseBuilder.success({ authenticated });
  }

  /**
   * Получение списка заявок
   */
  static async getSubmissions(request, db) {
    const authError = await requireAdmin(request, env);
    if (authError) return authError;

    const url = new URL(request.url);
    const status = Utils.clean(url.searchParams.get('status'), 30) || 'pending';

    if (!CONFIG.ALLOWED_STATUSES.includes(status)) {
      return ResponseBuilder.error('Неверный статус.', 400);
    }

    try {
      let result;
      if (status === 'all') {
        result = await db.prepare(`
          SELECT
            id, title, content, category, image_url, link_url,
            contact, author_name, tracking_code, status,
            rejection_reason, created_at, reviewed_at
          FROM submissions
          ORDER BY created_at DESC
          LIMIT ?
        `).bind(CONFIG.MAX_SUBMISSIONS).all();
      } else {
        result = await db.prepare(`
          SELECT
            id, title, content, category, image_url, link_url,
            contact, author_name, tracking_code, status,
            rejection_reason, created_at, reviewed_at
          FROM submissions
          WHERE status = ?
          ORDER BY created_at DESC
          LIMIT ?
        `).bind(status, CONFIG.MAX_SUBMISSIONS).all();
      }

      return ResponseBuilder.success({
        submissions: result.results || [],
        count: result.results?.length || 0,
      });
    } catch (error) {
      Utils.log('error', 'Failed to get submissions', { error: error.message });
      return ResponseBuilder.error('Ошибка базы данных.', 500);
    }
  }

  /**
   * Одобрение заявки
   */
  static async approveSubmission(request, db, submissionId) {
    const authError = await requireAdmin(request, env);
    if (authError) return authError;

    try {
      const submission = await db.prepare(`
        SELECT * FROM submissions WHERE id = ? LIMIT 1
      `).bind(submissionId).first();

      if (!submission) {
        return ResponseBuilder.error('Заявка не найдена.', 404);
      }

      if (submission.status !== 'pending') {
        return ResponseBuilder.error('Эта заявка уже была обработана.', 400);
      }

      const postId = Utils.uuid();
      const publishedAt = Utils.now();

      await db.batch([
        db.prepare(`
          INSERT INTO posts (
            id, submission_id, title, content, category,
            image_url, link_url, contact, author_name, published_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          postId,
          submission.id,
          submission.title,
          submission.content,
          submission.category,
          submission.image_url,
          submission.link_url,
          submission.contact,
          submission.author_name,
          publishedAt
        ),
        db.prepare(`
          UPDATE submissions
          SET status = 'approved', reviewed_at = ?
          WHERE id = ?
        `).bind(publishedAt, submission.id),
      ]);

      Utils.log('info', 'Submission approved', { submissionId });

      return ResponseBuilder.success(
        { post_id: postId },
        'Публикация одобрена.'
      );
    } catch (error) {
      Utils.log('error', 'Failed to approve submission', { error: error.message });
      return ResponseBuilder.error('Не удалось одобрить публикацию.', 500);
    }
  }

  /**
   * Отклонение заявки
   */
  static async rejectSubmission(request, db, submissionId) {
    const authError = await requireAdmin(request, env);
    if (authError) return authError;

    try {
      const body = await request.json().catch(() => ({}));
      const reason = Utils.clean(body.reason, CONFIG.MAX_REASON) || null;

      const submission = await db.prepare(`
        SELECT id, status FROM submissions WHERE id = ? LIMIT 1
      `).bind(submissionId).first();

      if (!submission) {
        return ResponseBuilder.error('Заявка не найдена.', 404);
      }

      if (submission.status !== 'pending') {
        return ResponseBuilder.error('Эта заявка уже была обработана.', 400);
      }

      const reviewedAt = Utils.now();

      await db.prepare(`
        UPDATE submissions
        SET status = 'rejected', rejection_reason = ?, reviewed_at = ?
        WHERE id = ?
      `).bind(reason, reviewedAt, submissionId).run();

      Utils.log('info', 'Submission rejected', { submissionId });

      return ResponseBuilder.success(
        null,
        'Заявка отклонена.'
      );
    } catch (error) {
      Utils.log('error', 'Failed to reject submission', { error: error.message });
      return ResponseBuilder.error('Не удалось отклонить заявку.', 500);
    }
  }
}

// ============================================================
// РОУТЕР
// ============================================================

class Router {
  constructor() {
    this.routes = [];
  }

  add(method, path, handler) {
    this.routes.push({ method: method.toUpperCase(), path, handler });
  }

  async handle(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Публичные API
    if (path === '/api/posts' && method === 'GET') {
      return Handlers.getPosts(env.DB);
    }

    if (path === '/api/submissions' && method === 'POST') {
      return Handlers.createSubmission(request, env.DB);
    }

    if (path === '/api/submissions/status' && method === 'GET') {
      return Handlers.getSubmissionStatus(request, env.DB);
    }

    // Админ API
    if (path === '/api/admin/login' && method === 'POST') {
      return AdminHandlers.login(request, env);
    }

    if (path === '/api/admin/logout' && method === 'POST') {
      return AdminHandlers.logout();
    }

    if (path === '/api/admin/me' && method === 'GET') {
      return AdminHandlers.checkSession(request, env);
    }

    if (path === '/api/admin/submissions' && method === 'GET') {
      return AdminHandlers.getSubmissions(request, env.DB);
    }

    // Одобрение / Отклонение
    const approveMatch = path.match(/^\/api\/admin\/submissions\/([^/]+)\/approve$/);
    if (approveMatch && method === 'POST') {
      return AdminHandlers.approveSubmission(request, env.DB, approveMatch[1]);
    }

    const rejectMatch = path.match(/^\/api\/admin\/submissions\/([^/]+)\/reject$/);
    if (rejectMatch && method === 'POST') {
      return AdminHandlers.rejectSubmission(request, env.DB, rejectMatch[1]);
    }

    // Статические файлы
    return env.ASSETS.fetch(request);
  }
}

// ============================================================
// ГЛАВНЫЙ WORKER
// ============================================================

const router = new Router();

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      Utils.log('info', 'Request received', {
        method: request.method,
        path: url.pathname,
        ip: request.headers.get('cf-connecting-ip'),
        userAgent: request.headers.get('user-agent'),
      });

      return await router.handle(request, env);
    } catch (error) {
      Utils.log('error', 'Unhandled error', {
        message: error.message,
        stack: error.stack,
      });

      return ResponseBuilder.error(
        'Внутренняя ошибка сервера. Пожалуйста, попробуйте позже.',
        500
      );
    }
  },
};
