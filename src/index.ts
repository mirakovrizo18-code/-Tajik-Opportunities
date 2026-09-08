import { Router } from 'itty-router';
import { v4 as uuidv4 } from 'uuid';

interface Env {
    DB: D1Database;
    ENVIRONMENT: string;
    SITE_URL: string;
    DEFAULT_LANGUAGE: string;
}

const router = Router();

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

function jsonResponse(data: any, status: number = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
}

function errorResponse(message: string, status: number = 400) {
    return jsonResponse({ error: message }, status);
}

router.options('*', () => {
    return new Response(null, { headers: corsHeaders });
});

// ===== КАТЕГОРИИ =====
router.get('/api/categories', async (request, env: Env) => {
    try {
        const { results } = await env.DB.prepare(
            'SELECT * FROM to_categories WHERE is_active = 1 ORDER BY sort_order'
        ).all();
        return jsonResponse(results);
    } catch (error) {
        return errorResponse('Ошибка получения категорий', 500);
    }
});

// ===== ПУБЛИКАЦИИ (СПИСОК) =====
router.get('/api/publications', async (request, env: Env) => {
    try {
        const url = new URL(request.url);
        const sort = url.searchParams.get('sort') || 'new';
        const categoryId = url.searchParams.get('category');
        const limit = parseInt(url.searchParams.get('limit') || '20');

        let query = `
            SELECT 
                p.*,
                c.name as category_name,
                c.icon as category_icon,
                (SELECT COUNT(*) FROM to_reactions WHERE publication_id = p.id) as likes,
                (SELECT COUNT(*) FROM to_comments WHERE publication_id = p.id) as comments
            FROM to_publications p
            LEFT JOIN to_categories c ON p.category_id = c.id
            WHERE p.status = 'published'
        `;
        const params: any[] = [];

        if (categoryId) {
            query += ' AND p.category_id = ?';
            params.push(categoryId);
        }

        if (sort === 'popular') {
            query += ' ORDER BY likes DESC, p.created_at DESC';
        } else {
            query += ' ORDER BY p.created_at DESC';
        }

        query += ' LIMIT ?';
        params.push(limit);

        const { results } = await env.DB.prepare(query).bind(...params).all();
        return jsonResponse(results);
    } catch (error) {
        return errorResponse('Ошибка получения публикаций', 500);
    }
});

// ===== СОЗДАТЬ ПУБЛИКАЦИЮ =====
router.post('/api/publications', async (request, env: Env) => {
    try {
        const body = await request.json();
        const { title, content, category_id, city } = body;

        if (!title || !category_id) {
            return errorResponse('Заголовок и категория обязательны');
        }

        const id = 'pub-' + uuidv4();
        const participantId = 'user-' + uuidv4();

        await env.DB.prepare(
            `INSERT INTO to_publications (id, title, content, category_id, participant_id, city, status)
             VALUES (?, ?, ?, ?, ?, ?, 'pending')`
        ).bind(id, title, content, category_id, participantId, city).run();

        return jsonResponse({ success: true, id, status: 'pending' });
    } catch (error) {
        return errorResponse('Ошибка создания публикации', 500);
    }
});

// ===== ДОБАВИТЬ РЕАКЦИЮ =====
router.post('/api/reactions', async (request, env: Env) => {
    try {
        const body = await request.json();
        const { publication_id, type } = body;
        const participantId = 'user-' + uuidv4();

        await env.DB.prepare(
            `INSERT OR IGNORE INTO to_reactions (id, publication_id, participant_id, type)
             VALUES (?, ?, ?, ?)`
        ).bind('reaction-' + uuidv4(), publication_id, participantId, type).run();

        return jsonResponse({ success: true });
    } catch (error) {
        return errorResponse('Ошибка добавления реакции', 500);
    }
});

// ===== ДОБАВИТЬ КОММЕНТАРИЙ =====
router.post('/api/comments', async (request, env: Env) => {
    try {
        const body = await request.json();
        const { publication_id, content, parent_id } = body;

        if (!publication_id || !content) {
            return errorResponse('ID публикации и текст комментария обязательны');
        }

        const id = 'comment-' + uuidv4();
        const participantId = 'user-' + uuidv4();

        await env.DB.prepare(
            `INSERT INTO to_comments (id, publication_id, participant_id, content, parent_id)
             VALUES (?, ?, ?, ?, ?)`
        ).bind(id, publication_id, participantId, content, parent_id || null).run();

        return jsonResponse({ success: true, id });
    } catch (error) {
        return errorResponse('Ошибка добавления комментария', 500);
    }
});

// ===== ПОЛУЧИТЬ КОММЕНТАРИИ =====
router.get('/api/comments', async (request, env: Env) => {
    try {
        const url = new URL(request.url);
        const publicationId = url.searchParams.get('publication_id');

        if (!publicationId) {
            return errorResponse('ID публикации обязателен');
        }

        const { results } = await env.DB.prepare(
            `SELECT * FROM to_comments 
             WHERE publication_id = ? AND parent_id IS NULL
             ORDER BY created_at ASC`
        ).bind(publicationId).all();

        return jsonResponse(results);
    } catch (error) {
        return errorResponse('Ошибка получения комментариев', 500);
    }
});

// ===== ПОИСК =====
router.get('/api/search', async (request, env: Env) => {
    try {
        const url = new URL(request.url);
        const q = url.searchParams.get('q') || '';

        if (!q.trim()) {
            return jsonResponse([]);
        }

        const { results } = await env.DB.prepare(
            `SELECT 
                id, title, content, category_id, city, 
                'publication' as type,
                created_at
             FROM to_publications 
             WHERE status = 'published' 
             AND (title LIKE ? OR content LIKE ?)
             ORDER BY created_at DESC
             LIMIT 20`
        ).bind(`%${q}%`, `%${q}%`).all();

        return jsonResponse(results);
    } catch (error) {
        return errorResponse('Ошибка поиска', 500);
    }
});

// ===== ТОВАРЫ (СПИСОК) =====
router.get('/api/products', async (request, env: Env) => {
    try {
        const url = new URL(request.url);
        const categoryId = url.searchParams.get('category');
        const limit = parseInt(url.searchParams.get('limit') || '20');

        let query = `
            SELECT 
                p.*,
                c.name as category_name,
                c.icon as category_icon
            FROM to_products p
            LEFT JOIN to_categories c ON p.category_id = c.id
            WHERE p.status = 'published'
        `;
        const params: any[] = [];

        if (categoryId) {
            query += ' AND p.category_id = ?';
            params.push(categoryId);
        }

        query += ' ORDER BY p.created_at DESC LIMIT ?';
        params.push(limit);

        const { results } = await env.DB.prepare(query).bind(...params).all();
        return jsonResponse(results);
    } catch (error) {
        return errorResponse('Ошибка получения товаров', 500);
    }
});

// ===== СОЗДАТЬ ТОВАР =====
router.post('/api/products', async (request, env: Env) => {
    try {
        const body = await request.json();
        const { title, description, category_id, price, currency, city, condition } = body;

        if (!title || !category_id) {
            return errorResponse('Название и категория обязательны');
        }

        const id = 'prod-' + uuidv4();
        const participantId = 'user-' + uuidv4();

        await env.DB.prepare(
            `INSERT INTO to_products (id, title, description, category_id, participant_id, price, currency, city, condition)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(id, title, description, category_id, participantId, price || 0, currency || 'TJS', city, condition || 'new').run();

        return jsonResponse({ success: true, id });
    } catch (error) {
        return errorResponse('Ошибка создания товара', 500);
    }
});

// ===== ПОЛУЧИТЬ ОДНУ ПУБЛИКАЦИЮ =====
router.get('/api/publications/:id', async (request, env: Env) => {
    try {
        const id = request.params?.id;

        if (!id) {
            return errorResponse('ID публикации обязателен');
        }

        const { results } = await env.DB.prepare(
            `SELECT 
                p.*,
                c.name as category_name,
                c.icon as category_icon,
                (SELECT COUNT(*) FROM to_reactions WHERE publication_id = p.id) as likes,
                (SELECT COUNT(*) FROM to_comments WHERE publication_id = p.id) as comments
             FROM to_publications p
             LEFT JOIN to_categories c ON p.category_id = c.id
             WHERE p.id = ? AND p.status = 'published'`
        ).bind(id).all();

        if (results.length === 0) {
            return errorResponse('Публикация не найдена', 404);
        }

        return jsonResponse(results[0]);
    } catch (error) {
        return errorResponse('Ошибка получения публикации', 500);
    }
});

// ===== УВЕДОМЛЕНИЯ =====
router.get('/api/notifications', async (request, env: Env) => {
    try {
        const url = new URL(request.url);
        const participantId = url.searchParams.get('participant_id') || 'user-default';

        const { results } = await env.DB.prepare(
            `SELECT * FROM to_notifications 
             WHERE participant_id = ? 
             ORDER BY created_at DESC 
             LIMIT 20`
        ).bind(participantId).all();

        return jsonResponse(results);
    } catch (error) {
        return errorResponse('Ошибка получения уведомлений', 500);
    }
});

// ===== СТАТИСТИКА АДМИНА =====
router.get('/api/admin/stats', async (request, env: Env) => {
    try {
        const publications = await env.DB.prepare('SELECT COUNT(*) as count FROM to_publications').first();
        const products = await env.DB.prepare('SELECT COUNT(*) as count FROM to_products').first();
        const comments = await env.DB.prepare('SELECT COUNT(*) as count FROM to_comments').first();
        const reports = await env.DB.prepare('SELECT COUNT(*) as count FROM to_reports WHERE status = "new"').first();

        return jsonResponse({
            publications: publications?.count || 0,
            products: products?.count || 0,
            comments: comments?.count || 0,
            pending_reports: reports?.count || 0,
        });
    } catch (error) {
        return errorResponse('Ошибка получения статистики', 500);
    }
});

// ===== АДМИН: ПОЛУЧИТЬ ВСЕ ПУБЛИКАЦИИ (ДЛЯ МОДЕРАЦИИ) =====
router.get('/api/admin/publications', async (request, env: Env) => {
    try {
        const url = new URL(request.url);
        const status = url.searchParams.get('status') || 'pending';

        const { results } = await env.DB.prepare(
            `SELECT 
                p.*,
                c.name as category_name
             FROM to_publications p
             LEFT JOIN to_categories c ON p.category_id = c.id
             WHERE p.status = ?
             ORDER BY p.created_at ASC`
        ).bind(status).all();

        return jsonResponse(results);
    } catch (error) {
        return errorResponse('Ошибка получения публикаций', 500);
    }
});

// ===== АДМИН: ОБНОВИТЬ СТАТУС ПУБЛИКАЦИИ =====
router.put('/api/admin/publications/:id', async (request, env: Env) => {
    try {
        const id = request.params?.id;
        const body = await request.json();
        const { status } = body;

        if (!id || !status) {
            return errorResponse('ID и статус обязательны');
        }

        await env.DB.prepare(
            `UPDATE to_publications SET status = ?, published_at = CURRENT_TIMESTAMP WHERE id = ?`
        ).bind(status, id).run();

        return jsonResponse({ success: true });
    } catch (error) {
        return errorResponse('Ошибка обновления статуса', 500);
    }
});

// ===== ГЛАВНАЯ СТРАНИЦА =====
router.get('/', () => {
    return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>🇹🇯 Tajik Opportunities</title>
            <meta http-equiv="refresh" content="0;url=/public/index.html">
        </head>
        <body>
            <p>Redirecting to Tajik Opportunities...</p>
        </body>
        </html>
    `, { headers: { 'Content-Type': 'text/html' } });
});

// ===== 404 =====
router.all('*', () => {
    return new Response('404 - Страница не найдена', { status: 404 });
});

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext) {
        return router.handle(request, env, ctx);
    }
};
