/**
 * ============================================================================
 * TAJIK OPPORTUNITIES - PRODUCTION GRADE WORKER
 * ============================================================================
 * @version 2.0.0
 * @description Платформа для публикации возможностей в Таджикистане
 * @author Your Team
 * @license MIT
 * ============================================================================
 */

// ============================================================================
// 1. КОНСТАНТЫ И КОНФИГУРАЦИЯ
// ============================================================================

const CONFIG = {
  JSON_HEADERS: {
    'content-type': 'application/json; charset=UTF-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    'x-xss-protection': '1; mode=block',
  },
  ADMIN_SESSION_DURATION: 12 * 60 * 60 * 1000, // 12 часов
  TRACKING_CODE_LENGTH: 10,
  MAX_TITLE_LENGTH: 180,
  MAX_CONTENT_LENGTH: 10000,
  MAX_CATEGORY_LENGTH: 80,
  MAX_URL_LENGTH: 1000,
  MAX_CONTACT_LENGTH: 300,
  MAX_AUTHOR_LENGTH: 120,
  MAX_REJECTION_REASON_LENGTH: 500,
  MAX_POSTS_LIMIT: 100,
  MAX_SUBMISSIONS_LIMIT: 200,
  ALLOWED_CATEGORIES: ['job', 'education', 'business', 'event', 'other'],
  ALLOWED_STATUSES: ['pending', 'approved', 'rejected'],
};

// ============================================================================
// 2. УТИЛИТЫ (Utility Functions)
// ============================================================================

const Utils = {
  /**
   * Безопасное очищение строки с ограничением длины
   */
  clean: (value, maxLength) => 
    String(value ?? '').trim().slice(0, maxLength),

  /**
   * Текущее время в ISO формате
   */
  now: () => new Date().toISOString(),

  /**
   * Генерация безопасного кода отслеживания
   */
  generateTrackingCode: (length = CONFIG.TRACKING_CODE_LENGTH) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return [...bytes]
      .map(byte => chars[byte % chars.length])
      .join('');
  },

  /**
   * Генерация UUID v4
   */
  generateUUID: () => crypto.randomUUID(),

  /**
   * Проверка валидности URL
   */
  isValidURL: (url) => {
    if (!url) return true;
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch {
      return false;
    }
  },

  /**
   * Безопасное парсинг JSON
   */
  safeJSONParse: (text) => {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  },

  /**
   * Логирование с уровнями
   */
  log: (level, message, data = null) => {
    const entry = {
      timestamp: Utils.now(),
      level,
      message,
      environment: typeof env !== 'undefined' ? env.ENVIRONMENT : 'unknown',
    };
    if (data) entry.data = data;
    console[level === 'error' ? 'error' : 'log'](JSON.stringify(entry));
  },
};

// ============================================================================
// 3. КРИПТОГРАФИЧЕСКИЕ УТИЛИТЫ (Crypto Utilities)
// ============================================================================

const Crypto = {
  /**
   * Base64 URL кодирование
   */
  base64UrlEncode: (bytes) => {
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
  base64UrlDecode: (value) => {
    const padded = 
      value.replace(/-/g, '+').replace(/_/g, '/') +
      '==='.slice((value.length + 3) % 4);
    const binary = atob(padded);
    return Uint8Array.from(binary, char => char.charCodeAt(0));
  },

  /**
   * HMAC-SHA256 подпись
   */
  hmac: async (message, secret) => {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    return new Uint8Array(
      await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
    );
  },

  /**
   * Безопасное сравнение (защита от timing attacks)
   */
  secureCompare: (a, b) => {
    if (a.length !== b.length) return false;
    let difference = 0;
    for (let i = 0; i < a.length; i++) {
      difference |= a[i] ^ b[i];
    }
    return difference === 0;
  },
};

// ============================================================================
// 4. ОТВЕТЫ (Response Builder)
// ============================================================================

class ResponseBuilder {
  /**
   * JSON ответ
   */
  static json(data, status = 200, extraHeaders = {}) {
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        ...CONFIG.JSON_HEADERS,
        ...extraHeaders,
      },
    });
  }

  /**
   * Успешный ответ
   */
  static success(data, message = null, status = 200) {
    return this.json({
      success: true,
      data,
      message,
    }, status);
  }

  /**
   * Ответ с ошибкой
   */
  static error(message, status = 400, details = null) {
    const response = {
      success: false,
      error: message,
    };
    if (details) response.details = details;
    return this.json(response, status);
  }

  /**
   * Ответ с пагинацией
   */
  static paginated(data, total, page, limit) {
    return this.success({
      items: data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  }

  /**
   * Ответ с установкой cookie
   */
  static withCookie(data, cookie, status = 200) {
    return this.json(data, status, {
      'Set-Cookie': cookie,
    });
  }

  /**
   * Ответ с очисткой cookie
   */
  static clearCookie(data, status = 200) {
    return this.json(data, status, {
      'Set-Cookie': [
        'admin_session=',
        'Max-Age=0',
        'Path=/',
        'HttpOnly',
        'Secure',
        'SameSite=Strict',
      ].join('; '),
    });
  }
}

// ============================================================================
// 5. АУТЕНТИФИКАЦИЯ (Authentication)
// ============================================================================

class Auth {
  /**
   * Проверка сессии администратора
   */
  static async validateAdminSession(request, env) {
    if (!env.ADMIN_PASSWORD) {
      return false;
    }

    const cookie = request.headers.get('Cookie') || '';
    const match = cookie.match(/(?:^|;\s*)admin_session=([^;]+)/);
    
    if (!match) {
      return false;
    }

    const parts = match[1].split('.');
    if (parts.length !== 2) {
      return false;
    }

    const timestamp = Number(parts[0]);
    if (!Number.isFinite(timestamp)) {
      return false;
    }

    const age = Date.now() - timestamp;
    if (age < 0 || age > CONFIG.ADMIN_SESSION_DURATION) {
      return false;
    }

    try {
      const expected = await Crypto.hmac(parts[0], env.ADMIN_PASSWORD);
      const actual = Crypto.base64UrlDecode(parts[1]);
      return Crypto.secureCompare(expected, actual);
    } catch {
      return false;
    }
  }

  /**
   * Создание cookie сессии
   */
  static async createSessionCookie(env) {
    const timestamp = String(Date.now());
    const signature = Crypto.base64UrlEncode(
      await Crypto.hmac(timestamp, env.ADMIN_PASSWORD)
    );
    
    return [
      `admin_session=${timestamp}.${signature}`,
      'Max-Age=43200',
      'Path=/',
      'HttpOnly',
      'Secure',
      'SameSite=Strict',
    ].join('; ');
  }

  /**
   * Middleware проверки администратора
   */
  static async requireAdmin(request, env) {
    const isAuthorized = await this.validateAdminSession(request, env);
    if (!isAuthorized) {
      return ResponseBuilder.error('Доступ запрещён. Требуется авторизация.', 401);
    }
    return null;
  }
}

// ============================================================================
// 6. ВАЛИДАЦИЯ (Validation)
// ============================================================================

class Validator {
  /**
   * Валидация создания заявки
   */
  static validateSubmission(data) {
    const errors = [];

    // Обязательные поля
    if (!data.title?.trim()) {
      errors.push('Название обязательно для заполнения');
    } else if (data.title.length > CONFIG.MAX_TITLE_LENGTH) {
      errors.push(`Название не должно превышать ${CONFIG.MAX_TITLE_LENGTH} символов`);
    }

    if (!data.content?.trim()) {
      errors.push('Содержание обязательно для заполнения');
    } else if (data.content.length > CONFIG.MAX_CONTENT_LENGTH) {
      errors.push(`Содержание не должно превышать ${CONFIG.MAX_CONTENT_LENGTH} символов`);
    }

    if (!data.category?.trim()) {
      errors.push('Категория обязательна для заполнения');
    } else if (!CONFIG.ALLOWED_CATEGORIES.includes(data.category)) {
      errors.push(`Недопустимая категория. Доступные: ${CONFIG.ALLOWED_CATEGORIES.join(', ')}`);
    }

    // Опциональные поля
    if (data.image_url && !Utils.isValidURL(data.image_url)) {
      errors.push('Некорректный URL изображения');
    }

    if (data.link_url && !Utils.isValidURL(data.link_url)) {
      errors.push('Некорректный URL ссылки');
    }

    if (data.contact && data.contact.length > CONFIG.MAX_CONTACT_LENGTH) {
      errors.push(`Контактная информация не должна превышать ${CONFIG.MAX_CONTACT_LENGTH} символов`);
    }

    if (data.author_name && data.author_name.length > CONFIG.MAX_AUTHOR_LENGTH) {
      errors.push(`Имя автора не должно превышать ${CONFIG.MAX_AUTHOR_LENGTH} символов`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Валидация статуса
   */
  static validateStatus(status) {
    return CONFIG.ALLOWED_STATUSES.includes(status);
  }

  /**
   * Санитизация данных заявки
   */
  static sanitizeSubmission(data) {
    return {
      title: Utils.clean(data.title, CONFIG.MAX_TITLE_LENGTH),
      content: Utils.clean(data.content, CONFIG.MAX_CONTENT_LENGTH),
      category: Utils.clean(data.category, CONFIG.MAX_CATEGORY_LENGTH),
      image_url: Utils.clean(data.image_url, CONFIG.MAX_URL_LENGTH) || null,
      link_url: Utils.clean(data.link_url, CONFIG.MAX_URL_LENGTH) || null,
      contact: Utils.clean(data.contact, CONFIG.MAX_CONTACT_LENGTH) || null,
      author_name: Utils.clean(data.author_name, CONFIG.MAX_AUTHOR_LENGTH) || null,
    };
  }
}

// ============================================================================
// 7. СЕРВИС БАЗЫ ДАННЫХ (Database Service)
// ============================================================================

class DatabaseService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Создание заявки
   */
  async createSubmission(data) {
    const id = Utils.generateUUID();
    const trackingCode = Utils.generateTrackingCode();
    const createdAt = Utils.now();

    await this.db.prepare(`
      INSERT INTO submissions (
        id, title, content, category, image_url, link_url,
        contact, author_name, tracking_code, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `).bind(
      id,
      data.title,
      data.content,
      data.category,
      data.image_url,
      data.link_url,
      data.contact,
      data.author_name,
      trackingCode,
      createdAt
    ).run();

    return { id, trackingCode, createdAt };
  }

  /**
   * Получение публикаций
   */
  async getPosts(limit = CONFIG.MAX_POSTS_LIMIT) {
    const result = await this.db.prepare(`
      SELECT
        id, title, content, category, image_url,
        link_url, contact, author_name, published_at
      FROM posts
      WHERE deleted_at IS NULL
      ORDER BY published_at DESC
      LIMIT ?
    `).bind(limit).all();

    return result.results || [];
  }

  /**
   * Получение статуса заявки по коду
   */
  async getSubmissionByTrackingCode(code) {
    return await this.db.prepare(`
      SELECT
        title, category, status, rejection_reason,
        created_at, reviewed_at
      FROM submissions
      WHERE tracking_code = ?
      LIMIT 1
    `).bind(code).first();
  }

  /**
   * Получение заявок по статусу
   */
  async getSubmissionsByStatus(status, limit = CONFIG.MAX_SUBMISSIONS_LIMIT) {
    const result = await this.db.prepare(`
      SELECT
        id, title, content, category, image_url,
        link_url, contact, author_name, tracking_code,
        status, rejection_reason, created_at, reviewed_at
      FROM submissions
      WHERE status = ?
      ORDER BY created_at DESC
      LIMIT ?
    `).bind(status, limit).all();

    return result.results || [];
  }

  /**
   * Получение заявки по ID
   */
  async getSubmissionById(id) {
    return await this.db.prepare(`
      SELECT *
      FROM submissions
      WHERE id = ? AND status = 'pending'
      LIMIT 1
    `).bind(id).first();
  }

  /**
   * Одобрение заявки (создание поста)
   */
  async approveSubmission(submission) {
    const postId = Utils.generateUUID();
    const publishedAt = Utils.now();

    const queries = [
      this.db.prepare(`
        INSERT INTO posts (
          id, submission_id, title, content, category,
          image_url, link_url, contact, author_name, published_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      this.db.prepare(`
        UPDATE submissions
        SET status = 'approved', reviewed_at = ?
        WHERE id = ?
      `).bind(publishedAt, submission.id),
    ];

    await this.db.batch(queries);
    return { postId, publishedAt };
  }

  /**
   * Отклонение заявки
   */
  async rejectSubmission(id, reason) {
    const result = await this.db.prepare(`
      UPDATE submissions
      SET status = 'rejected', rejection_reason = ?, reviewed_at = ?
      WHERE id = ? AND status = 'pending'
    `).bind(
      reason || 'Не соответствует требованиям публикации.',
      Utils.now(),
      id
    ).run();

    return result.meta?.changes > 0;
  }
}

// ============================================================================
// 8. ОБРАБОТЧИКИ ЗАПРОСОВ (Handlers)
// ============================================================================

class Handlers {
  /**
   * Создание заявки
   */
  static async handleCreateSubmission(request, db) {
    const body = await request.json().catch(() => null);
    if (!body) {
      return ResponseBuilder.error('Неверный формат запроса.', 400);
    }

    // Валидация
    const validation = Validator.validateSubmission(body);
    if (!validation.valid) {
      return ResponseBuilder.error('Ошибка валидации', 400, validation.errors);
    }

    // Санитизация
    const sanitized = Validator.sanitizeSubmission(body);

    // Создание
    const service = new DatabaseService(db);
    const result = await service.createSubmission(sanitized);

    Utils.log('info', 'Submission created', { trackingCode: result.trackingCode });

    return ResponseBuilder.success(
      { tracking_code: result.trackingCode },
      'Заявка отправлена на модерацию.',
      201
    );
  }

  /**
   * Получение публикаций
   */
  static async handleGetPosts(db) {
    const service = new DatabaseService(db);
    const posts = await service.getPosts();
    return ResponseBuilder.success({ posts });
  }

  /**
   * Получение статуса заявки
   */
  static async handleGetStatus(request, db) {
    const url = new URL(request.url);
    const code = Utils.clean(url.searchParams.get('code'), 50);

    if (!code) {
      return ResponseBuilder.error('Введите код заявки.', 400);
    }

    const service = new DatabaseService(db);
    const submission = await service.getSubmissionByTrackingCode(code);

    if (!submission) {
      return ResponseBuilder.error('Заявка с таким кодом не найдена.', 404);
    }

    return ResponseBuilder.success({ submission });
  }

  /**
   * Администратор - вход
   */
  static async handleAdminLogin(request, env) {
    if (!env.ADMIN_PASSWORD) {
      return ResponseBuilder.error('ADMIN_PASSWORD не настроен.', 500);
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return ResponseBuilder.error('Неверный запрос.', 400);
    }

    if (body.password !== env.ADMIN_PASSWORD) {
      Utils.log('warn', 'Failed admin login attempt');
      return ResponseBuilder.error('Неверный пароль.', 401);
    }

    const cookie = await Auth.createSessionCookie(env);
    Utils.log('info', 'Admin logged in');
    return ResponseBuilder.withCookie({ success: true }, cookie);
  }

  /**
   * Администратор - выход
   */
  static async handleAdminLogout() {
    Utils.log('info', 'Admin logged out');
    return ResponseBuilder.clearCookie({ success: true });
  }

  /**
   * Администратор - список заявок
   */
  static async handleAdminSubmissions(request, db) {
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'pending';

    if (!Validator.validateStatus(status)) {
      return ResponseBuilder.error(
        `Неверный статус. Доступные: ${CONFIG.ALLOWED_STATUSES.join(', ')}`,
        400
      );
    }

    const service = new DatabaseService(db);
    const submissions = await service.getSubmissionsByStatus(status);
    return ResponseBuilder.success({ submissions });
  }

  /**
   * Администратор - одобрение заявки
   */
  static async handleAdminApprove(request, db, id) {
    const service = new DatabaseService(db);
    const submission = await service.getSubmissionById(id);

    if (!submission) {
      return ResponseBuilder.error('Заявка не найдена или уже обработана.', 404);
    }

    const result = await service.approveSubmission(submission);
    Utils.log('info', 'Submission approved', { submissionId: id });

    return ResponseBuilder.success(
      { post_id: result.postId },
      'Публикация одобрена.'
    );
  }

  /**
   * Администратор - отклонение заявки
   */
  static async handleAdminReject(request, db, id) {
    const body = await request.json().catch(() => ({}));
    const reason = Utils.clean(body.reason, CONFIG.MAX_REJECTION_REASON_LENGTH) ||
      'Не соответствует требованиям публикации.';

    const service = new DatabaseService(db);
    const success = await service.rejectSubmission(id, reason);

    if (!success) {
      return ResponseBuilder.error('Заявка не найдена или уже обработана.', 404);
    }

    Utils.log('info', 'Submission rejected', { submissionId: id });
    return ResponseBuilder.success(null, 'Заявка отклонена.');
  }
}

// ============================================================================
// 9. РОУТЕР (Router)
// ============================================================================

class Router {
  constructor() {
    this.routes = [];
  }

  /**
   * Регистрация маршрута
   */
  register(method, path, handler) {
    this.routes.push({
      method: method.toUpperCase(),
      path,
      handler,
      pattern: new RegExp(`^${path.replace(/:[^/]+/g, '([^/]+)')}$`),
    });
  }

  /**
   * Поиск маршрута
   */
  findRoute(method, path) {
    for (const route of this.routes) {
      if (route.method !== method) continue;
      const match = path.match(route.pattern);
      if (match) {
        const params = {};
        const pathParts = route.path.split('/');
        const matchParts = path.split('/');
        pathParts.forEach((part, index) => {
          if (part.startsWith(':')) {
            params[part.slice(1)] = matchParts[index] || match[index + 1];
          }
        });
        return { route, params };
      }
    }
    return null;
  }

  /**
   * Обработка запроса
   */
  async handle(request, env) {
    const url = new URL(request.url);
    const method = request.method;
    const path = url.pathname;

    // API маршруты
    if (path.startsWith('/api/')) {
      // Публичные маршруты
      if (method === 'POST' && path === '/api/submissions') {
        return Handlers.handleCreateSubmission(request, env.DB);
      }

      if (method === 'GET' && path === '/api/posts') {
        return Handlers.handleGetPosts(env.DB);
      }

      if (method === 'GET' && path === '/api/submissions/status') {
        return Handlers.handleGetStatus(request, env.DB);
      }

      if (method === 'POST' && path === '/api/admin/login') {
        return Handlers.handleAdminLogin(request, env);
      }

      if (method === 'POST' && path === '/api/admin/logout') {
        return Handlers.handleAdminLogout();
      }

      // Административные маршруты (с проверкой авторизации)
      if (path.startsWith('/api/admin/')) {
        const authError = await Auth.requireAdmin(request, env);
        if (authError) return authError;

        if (method === 'GET' && path === '/api/admin/submissions') {
          return Handlers.handleAdminSubmissions(request, env.DB);
        }

        const approveMatch = path.match(/^\/api\/admin\/submissions\/([^/]+)\/approve$/);
        if (method === 'POST' && approveMatch) {
          return Handlers.handleAdminApprove(request, env.DB, approveMatch[1]);
        }

        const rejectMatch = path.match(/^\/api\/admin\/submissions\/([^/]+)\/reject$/);
        if (method === 'POST' && rejectMatch) {
          return Handlers.handleAdminReject(request, env.DB, rejectMatch[1]);
        }
      }

      return ResponseBuilder.error('API endpoint not found.', 404);
    }

    // Статические файлы
    return env.ASSETS.fetch(request);
  }
}

// ============================================================================
// 10. MAIN WORKER
// ============================================================================

const router = new Router();

export default {
  /**
   * Обработка запросов
   */
  async fetch(request, env) {
    try {
      // Логирование запроса
      const url = new URL(request.url);
      Utils.log('info', 'Request received', {
        method: request.method,
        path: url.pathname,
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('cf-connecting-ip'),
      });

      // Обработка через роутер
      return await router.handle(request, env);
    } catch (error) {
      // Глобальная обработка ошибок
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

// ============================================================================
// 11. ИНИЦИАЛИЗАЦИЯ МИГРАЦИЙ (опционально)
// ============================================================================

/**
 * Миграции запускаются отдельно через wrangler
 * См. migrations/ папку для SQL файлов
 */

// ============================================================================
// 12. ЭКСПОРТ ДЛЯ ТЕСТИРОВАНИЯ (опционально)
// ============================================================================

export const testExports = {
  Utils,
  Crypto,
  Auth,
  Validator,
  DatabaseService,
  Handlers,
  Router,
  ResponseBuilder,
  CONFIG,
};
