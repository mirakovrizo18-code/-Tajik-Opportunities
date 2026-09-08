-- ============================================================
-- 🇹🇯 TAJIK OPPORTUNITIES
-- DATABASE MIGRATION
-- 002_REVIEWS
--
-- Полная система:
-- • отзывы
-- • рейтинг 1–5
-- • анонимные отзывы
-- • ответы на отзывы
-- • реакции
-- • жалобы
-- • модерация
-- • история изменений
-- • избранные/закреплённые отзывы
-- • верификация
-- • статистика и распределение рейтингов
-- • ручное управление счётчиками
-- • большие значения счётчиков через TEXT
-- ============================================================

PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

-- ============================================================
-- REVIEWS
-- ============================================================

CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,

    target_type TEXT NOT NULL DEFAULT 'publication',
    target_id TEXT NOT NULL,

    author_id TEXT,
    visitor_id TEXT,
    session_id TEXT,

    author_mode TEXT NOT NULL DEFAULT 'public',
    author_name TEXT,

    title TEXT,
    text TEXT NOT NULL,

    rating INTEGER NOT NULL DEFAULT 5,

    status TEXT NOT NULL DEFAULT 'pending',
    visibility TEXT NOT NULL DEFAULT 'public',

    verified INTEGER NOT NULL DEFAULT 0,
    admin_verified INTEGER NOT NULL DEFAULT 0,

    featured INTEGER NOT NULL DEFAULT 0,
    pinned INTEGER NOT NULL DEFAULT 0,
    locked INTEGER NOT NULL DEFAULT 0,

    views_count TEXT NOT NULL DEFAULT '0',
    helpful_count TEXT NOT NULL DEFAULT '0',
    not_helpful_count TEXT NOT NULL DEFAULT '0',
    reactions_count TEXT NOT NULL DEFAULT '0',
    reports_count TEXT NOT NULL DEFAULT '0',
    replies_count TEXT NOT NULL DEFAULT '0',
    shares_count TEXT NOT NULL DEFAULT '0',

    moderation_reason TEXT,
    moderation_note TEXT,
    moderated_by TEXT,
    moderated_at TEXT,

    verified_by TEXT,
    verified_at TEXT,

    deleted_by TEXT,
    deleted_at TEXT,

    restored_by TEXT,
    restored_at TEXT,

    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,

    CHECK (rating >= 1 AND rating <= 5),
    CHECK (author_mode IN ('public', 'anonymous', 'hidden')),
    CHECK (status IN (
        'draft',
        'pending',
        'published',
        'hidden',
        'rejected',
        'deleted',
        'archived'
    )),
    CHECK (visibility IN ('public', 'unlisted', 'hidden')),
    CHECK (verified IN (0, 1)),
    CHECK (admin_verified IN (0, 1)),
    CHECK (featured IN (0, 1)),
    CHECK (pinned IN (0, 1)),
    CHECK (locked IN (0, 1))
);

CREATE INDEX IF NOT EXISTS idx_reviews_target
ON reviews(target_type, target_id);

CREATE INDEX IF NOT EXISTS idx_reviews_status
ON reviews(status);

CREATE INDEX IF NOT EXISTS idx_reviews_visibility
ON reviews(visibility);

CREATE INDEX IF NOT EXISTS idx_reviews_rating
ON reviews(rating);

CREATE INDEX IF NOT EXISTS idx_reviews_author
ON reviews(author_id);

CREATE INDEX IF NOT EXISTS idx_reviews_visitor
ON reviews(visitor_id);

CREATE INDEX IF NOT EXISTS idx_reviews_session
ON reviews(session_id);

CREATE INDEX IF NOT EXISTS idx_reviews_created
ON reviews(created_at);

CREATE INDEX IF NOT EXISTS idx_reviews_target_status
ON reviews(target_type, target_id, status);

CREATE INDEX IF NOT EXISTS idx_reviews_target_rating
ON reviews(target_type, target_id, rating);

CREATE INDEX IF NOT EXISTS idx_reviews_featured
ON reviews(featured, status);

CREATE INDEX IF NOT EXISTS idx_reviews_pinned
ON reviews(pinned, status);

CREATE INDEX IF NOT EXISTS idx_reviews_verified
ON reviews(verified, status);

-- ============================================================
-- REVIEW HISTORY
-- ============================================================

CREATE TABLE IF NOT EXISTS review_history (
    id TEXT PRIMARY KEY,

    review_id TEXT NOT NULL,

    action TEXT NOT NULL,

    actor_type TEXT NOT NULL DEFAULT 'system',
    actor_id TEXT,

    field_name TEXT,

    old_value TEXT,
    new_value TEXT,

    reason TEXT,
    note TEXT,

    metadata TEXT,

    created_at TEXT NOT NULL,

    FOREIGN KEY (review_id)
        REFERENCES reviews(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_review_history_review
ON review_history(review_id, created_at);

CREATE INDEX IF NOT EXISTS idx_review_history_actor
ON review_history(actor_id, created_at);

CREATE INDEX IF NOT EXISTS idx_review_history_action
ON review_history(action);

-- ============================================================
-- REVIEW REPLIES
-- ============================================================

CREATE TABLE IF NOT EXISTS review_replies (
    id TEXT PRIMARY KEY,

    review_id TEXT NOT NULL,

    parent_reply_id TEXT,

    author_id TEXT,
    visitor_id TEXT,
    session_id TEXT,

    author_mode TEXT NOT NULL DEFAULT 'public',
    author_name TEXT,

    text TEXT NOT NULL,

    status TEXT NOT NULL DEFAULT 'published',
    visibility TEXT NOT NULL DEFAULT 'public',

    verified INTEGER NOT NULL DEFAULT 0,

    reactions_count TEXT NOT NULL DEFAULT '0',
    reports_count TEXT NOT NULL DEFAULT '0',
    replies_count TEXT NOT NULL DEFAULT '0',
    views_count TEXT NOT NULL DEFAULT '0',

    locked INTEGER NOT NULL DEFAULT 0,

    moderated_by TEXT,
    moderated_at TEXT,
    moderation_reason TEXT,

    deleted_by TEXT,
    deleted_at TEXT,

    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,

    CHECK (author_mode IN ('public', 'anonymous', 'hidden')),
    CHECK (status IN (
        'draft',
        'pending',
        'published',
        'hidden',
        'rejected',
        'deleted'
    )),
    CHECK (visibility IN ('public', 'unlisted', 'hidden')),
    CHECK (verified IN (0, 1)),
    CHECK (locked IN (0, 1)),

    FOREIGN KEY (review_id)
        REFERENCES reviews(id)
        ON DELETE CASCADE,

    FOREIGN KEY (parent_reply_id)
        REFERENCES review_replies(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_review_replies_review
ON review_replies(review_id, created_at);

CREATE INDEX IF NOT EXISTS idx_review_replies_parent
ON review_replies(parent_reply_id);

CREATE INDEX IF NOT EXISTS idx_review_replies_author
ON review_replies(author_id);

CREATE INDEX IF NOT EXISTS idx_review_replies_status
ON review_replies(status);

-- ============================================================
-- REVIEW REACTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS review_reactions (
    id TEXT PRIMARY KEY,

    review_id TEXT,

    reply_id TEXT,

    reaction_type TEXT NOT NULL,

    user_id TEXT,
    visitor_id TEXT,
    session_id TEXT,

    actor_name TEXT,

    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,

    CHECK (
        (review_id IS NOT NULL AND reply_id IS NULL)
        OR
        (review_id IS NULL AND reply_id IS NOT NULL)
    ),

    FOREIGN KEY (review_id)
        REFERENCES reviews(id)
        ON DELETE CASCADE,

    FOREIGN KEY (reply_id)
        REFERENCES review_replies(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_review_reactions_review
ON review_reactions(review_id, reaction_type);

CREATE INDEX IF NOT EXISTS idx_review_reactions_reply
ON review_reactions(reply_id, reaction_type);

CREATE INDEX IF NOT EXISTS idx_review_reactions_user
ON review_reactions(user_id);

CREATE INDEX IF NOT EXISTS idx_review_reactions_visitor
ON review_reactions(visitor_id);

CREATE INDEX IF NOT EXISTS idx_review_reactions_session
ON review_reactions(session_id);

-- ============================================================
-- REVIEW REPORTS
-- ============================================================

CREATE TABLE IF NOT EXISTS review_reports (
    id TEXT PRIMARY KEY,

    review_id TEXT,

    reply_id TEXT,

    reporter_id TEXT,
    reporter_visitor_id TEXT,
    reporter_session_id TEXT,

    report_type TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'normal',

    status TEXT NOT NULL DEFAULT 'open',

    reason TEXT,
    description TEXT,

    assigned_to TEXT,

    resolution TEXT,
    resolution_note TEXT,

    resolved_by TEXT,
    resolved_at TEXT,

    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,

    CHECK (
        (review_id IS NOT NULL AND reply_id IS NULL)
        OR
        (review_id IS NULL AND reply_id IS NOT NULL)
    ),

    CHECK (priority IN (
        'low',
        'normal',
        'high',
        'critical'
    )),

    CHECK (status IN (
        'open',
        'under_review',
        'resolved',
        'rejected',
        'dismissed',
        'escalated'
    )),

    FOREIGN KEY (review_id)
        REFERENCES reviews(id)
        ON DELETE CASCADE,

    FOREIGN KEY (reply_id)
        REFERENCES review_replies(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_review_reports_review
ON review_reports(review_id, status);

CREATE INDEX IF NOT EXISTS idx_review_reports_reply
ON review_reports(reply_id, status);

CREATE INDEX IF NOT EXISTS idx_review_reports_status
ON review_reports(status);

CREATE INDEX IF NOT EXISTS idx_review_reports_priority
ON review_reports(priority);

CREATE INDEX IF NOT EXISTS idx_review_reports_assigned
ON review_reports(assigned_to);

CREATE INDEX IF NOT EXISTS idx_review_reports_created
ON review_reports(created_at);

-- ============================================================
-- REVIEW METRICS
--
-- Все числовые значения, которые могут управляться
-- администратором, хранятся как TEXT.
--
-- Это позволяет хранить значения больше SQLite INTEGER:
-- 999999999999999999999
-- 999999999999999999999999999999
-- и т.д.
-- ============================================================

CREATE TABLE IF NOT EXISTS review_metrics (
    id TEXT PRIMARY KEY,

    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,

    total_reviews TEXT NOT NULL DEFAULT '0',
    published_reviews TEXT NOT NULL DEFAULT '0',
    pending_reviews TEXT NOT NULL DEFAULT '0',
    hidden_reviews TEXT NOT NULL DEFAULT '0',
    rejected_reviews TEXT NOT NULL DEFAULT '0',
    deleted_reviews TEXT NOT NULL DEFAULT '0',

    total_ratings TEXT NOT NULL DEFAULT '0',
    rating_sum TEXT NOT NULL DEFAULT '0',

    rating_average TEXT NOT NULL DEFAULT '0',

    rating_1 TEXT NOT NULL DEFAULT '0',
    rating_2 TEXT NOT NULL DEFAULT '0',
    rating_3 TEXT NOT NULL DEFAULT '0',
    rating_4 TEXT NOT NULL DEFAULT '0',
    rating_5 TEXT NOT NULL DEFAULT '0',

    total_reactions TEXT NOT NULL DEFAULT '0',
    total_helpful TEXT NOT NULL DEFAULT '0',
    total_not_helpful TEXT NOT NULL DEFAULT '0',

    total_reports TEXT NOT NULL DEFAULT '0',
    total_replies TEXT NOT NULL DEFAULT '0',
    total_views TEXT NOT NULL DEFAULT '0',

    verified_reviews TEXT NOT NULL DEFAULT '0',
    anonymous_reviews TEXT NOT NULL DEFAULT '0',
    featured_reviews TEXT NOT NULL DEFAULT '0',
    pinned_reviews TEXT NOT NULL DEFAULT '0',

    shares_count TEXT NOT NULL DEFAULT '0',

    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,

    UNIQUE(target_type, target_id)
);

CREATE INDEX IF NOT EXISTS idx_review_metrics_target
ON review_metrics(target_type, target_id);

-- ============================================================
-- REVIEW METRIC HISTORY
-- ============================================================

CREATE TABLE IF NOT EXISTS review_metric_history (
    id TEXT PRIMARY KEY,

    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,

    metric_name TEXT NOT NULL,

    old_value TEXT,
    new_value TEXT,

    operation TEXT NOT NULL DEFAULT 'set',

    actor_type TEXT NOT NULL DEFAULT 'system',
    actor_id TEXT,

    reason TEXT,
    note TEXT,

    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_review_metric_history_target
ON review_metric_history(target_type, target_id, created_at);

CREATE INDEX IF NOT EXISTS idx_review_metric_history_metric
ON review_metric_history(metric_name, created_at);

CREATE INDEX IF NOT EXISTS idx_review_metric_history_actor
ON review_metric_history(actor_id, created_at);

-- ============================================================
-- REVIEW VIEWS
-- ============================================================

CREATE TABLE IF NOT EXISTS review_views (
    id TEXT PRIMARY KEY,

    review_id TEXT NOT NULL,

    visitor_id TEXT,
    session_id TEXT,
    user_id TEXT,

    ip_hash TEXT,
    user_agent_hash TEXT,

    created_at TEXT NOT NULL,

    FOREIGN KEY (review_id)
        REFERENCES reviews(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_review_views_review
ON review_views(review_id, created_at);

CREATE INDEX IF NOT EXISTS idx_review_views_visitor
ON review_views(visitor_id);

CREATE INDEX IF NOT EXISTS idx_review_views_session
ON review_views(session_id);

-- ============================================================
-- REVIEW SHARES
-- ============================================================

CREATE TABLE IF NOT EXISTS review_shares (
    id TEXT PRIMARY KEY,

    review_id TEXT NOT NULL,

    user_id TEXT,
    visitor_id TEXT,
    session_id TEXT,

    platform TEXT,
    source TEXT,

    created_at TEXT NOT NULL,

    FOREIGN KEY (review_id)
        REFERENCES reviews(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_review_shares_review
ON review_shares(review_id, created_at);

CREATE INDEX IF NOT EXISTS idx_review_shares_platform
ON review_shares(platform);

-- ============================================================
-- REVIEW MENTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS review_mentions (
    id TEXT PRIMARY KEY,

    review_id TEXT,

    reply_id TEXT,

    mentioned_user_id TEXT,

    mentioned_name TEXT,

    created_at TEXT NOT NULL,

    CHECK (
        (review_id IS NOT NULL AND reply_id IS NULL)
        OR
        (review_id IS NULL AND reply_id IS NOT NULL)
    ),

    FOREIGN KEY (review_id)
        REFERENCES reviews(id)
        ON DELETE CASCADE,

    FOREIGN KEY (reply_id)
        REFERENCES review_replies(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_review_mentions_review
ON review_mentions(review_id);

CREATE INDEX IF NOT EXISTS idx_review_mentions_reply
ON review_mentions(reply_id);

CREATE INDEX IF NOT EXISTS idx_review_mentions_user
ON review_mentions(mentioned_user_id);

-- ============================================================
-- REVIEW ADMIN LOCKS
-- ============================================================

CREATE TABLE IF NOT EXISTS review_admin_locks (
    id TEXT PRIMARY KEY,

    review_id TEXT NOT NULL,

    admin_id TEXT NOT NULL,

    lock_type TEXT NOT NULL DEFAULT 'moderation',

    locked_at TEXT NOT NULL,

    expires_at TEXT,

    FOREIGN KEY (review_id)
        REFERENCES reviews(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_review_admin_locks_review
ON review_admin_locks(review_id);

CREATE INDEX IF NOT EXISTS idx_review_admin_locks_admin
ON review_admin_locks(admin_id);

-- ============================================================
-- REVIEW MODERATION QUEUE
-- ============================================================

CREATE TABLE IF NOT EXISTS review_moderation_queue (
    id TEXT PRIMARY KEY,

    review_id TEXT NOT NULL,

    priority TEXT NOT NULL DEFAULT 'normal',

    reason TEXT,

    assigned_to TEXT,

    status TEXT NOT NULL DEFAULT 'pending',

    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,

    CHECK (priority IN (
        'low',
        'normal',
        'high',
        'critical'
    )),

    CHECK (status IN (
        'pending',
        'assigned',
        'processing',
        'approved',
        'rejected',
        'dismissed'
    )),

    FOREIGN KEY (review_id)
        REFERENCES reviews(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_review_moderation_queue_status
ON review_moderation_queue(status, priority);

CREATE INDEX IF NOT EXISTS idx_review_moderation_queue_assigned
ON review_moderation_queue(assigned_to);

CREATE INDEX IF NOT EXISTS idx_review_moderation_queue_review
ON review_moderation_queue(review_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- При удалении отзыва удаляются связанные данные.
-- Основные счётчики изменяются приложением, а не SQLite
-- trigger-ами, чтобы поддерживать TEXT/decimal-string
-- и полноценное админское управление.

-- ============================================================
-- INITIAL METRIC ROWS ARE CREATED BY APPLICATION
-- ============================================================

COMMIT;
