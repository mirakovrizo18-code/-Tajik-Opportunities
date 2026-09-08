PRAGMA foreign_keys = ON;

-- ============================================================
-- TAJIK OPPORTUNITIES
-- D1 / SQLite DATABASE SCHEMA
-- Version: 2026.09
-- ============================================================


-- ============================================================
-- VISITORS
-- Технические посетители без обязательной регистрации
-- ============================================================

CREATE TABLE IF NOT EXISTS visitors (
    id TEXT PRIMARY KEY,
    visitor_id TEXT NOT NULL UNIQUE,

    first_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    ip_hash TEXT,
    user_agent TEXT,
    language TEXT,
    country TEXT,
    region TEXT,
    city TEXT,

    is_blocked INTEGER NOT NULL DEFAULT 0,
    blocked_reason TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE INDEX IF NOT EXISTS idx_visitors_visitor_id
ON visitors(visitor_id);

CREATE INDEX IF NOT EXISTS idx_visitors_last_seen
ON visitors(last_seen_at);

CREATE INDEX IF NOT EXISTS idx_visitors_blocked
ON visitors(is_blocked);


-- ============================================================
-- VISITOR SESSIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS visitor_sessions (
    id TEXT PRIMARY KEY,
    visitor_id TEXT NOT NULL,

    session_token_hash TEXT,
    ip_hash TEXT,
    user_agent TEXT,

    started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TEXT,

    is_active INTEGER NOT NULL DEFAULT 1,

    FOREIGN KEY (visitor_id)
        REFERENCES visitors(visitor_id)
        ON DELETE CASCADE
);


CREATE INDEX IF NOT EXISTS idx_sessions_visitor
ON visitor_sessions(visitor_id);


-- ============================================================
-- USER PROFILES
-- ============================================================

CREATE TABLE IF NOT EXISTS users_profiles (
    id TEXT PRIMARY KEY,

    visitor_id TEXT NOT NULL UNIQUE,

    first_name TEXT,
    last_name TEXT,
    username TEXT UNIQUE,

    display_name TEXT,
    bio TEXT,

    photo_url TEXT,

    phone TEXT,
    email TEXT,
    telegram TEXT,

    country TEXT,
    region TEXT,
    city TEXT,
    address TEXT,

    website TEXT,

    is_public INTEGER NOT NULL DEFAULT 1,
    is_verified INTEGER NOT NULL DEFAULT 0,
    is_blocked INTEGER NOT NULL DEFAULT 0,

    blocked_reason TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (visitor_id)
        REFERENCES visitors(visitor_id)
        ON DELETE CASCADE
);


CREATE INDEX IF NOT EXISTS idx_profiles_visitor
ON users_profiles(visitor_id);

CREATE INDEX IF NOT EXISTS idx_profiles_username
ON users_profiles(username);

CREATE INDEX IF NOT EXISTS idx_profiles_name
ON users_profiles(first_name, last_name);

CREATE INDEX IF NOT EXISTS idx_profiles_city
ON users_profiles(city);


-- ============================================================
-- CATEGORIES
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,

    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,

    description TEXT,
    icon TEXT,

    is_active INTEGER NOT NULL DEFAULT 1,

    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE INDEX IF NOT EXISTS idx_categories_active
ON categories(is_active);

CREATE INDEX IF NOT EXISTS idx_categories_order
ON categories(sort_order);


-- ============================================================
-- PUBLICATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS publications (
    id TEXT PRIMARY KEY,

    type TEXT NOT NULL DEFAULT 'opportunity',

    title TEXT NOT NULL,
    description TEXT,

    visitor_id TEXT,
    profile_id TEXT,

    author_name TEXT,
    author_username TEXT,

    category_id TEXT,

    country TEXT,
    region TEXT,
    city TEXT,
    address TEXT,

    company_name TEXT,

    salary TEXT,
    employment_type TEXT,

    contact_phone TEXT,
    contact_email TEXT,
    contact_telegram TEXT,

    source_url TEXT,
    application_url TEXT,

    status TEXT NOT NULL DEFAULT 'pending',

    is_anonymous INTEGER NOT NULL DEFAULT 0,

    is_pinned INTEGER NOT NULL DEFAULT 0,
    is_featured INTEGER NOT NULL DEFAULT 0,

    manual_order INTEGER NOT NULL DEFAULT 0,
    priority INTEGER NOT NULL DEFAULT 0,

    views_count INTEGER NOT NULL DEFAULT 0,
    unique_views_count INTEGER NOT NULL DEFAULT 0,

    likes_count INTEGER NOT NULL DEFAULT 0,
    comments_count INTEGER NOT NULL DEFAULT 0,
    reactions_count INTEGER NOT NULL DEFAULT 0,

    bookmarks_count INTEGER NOT NULL DEFAULT 0,

    shares_count INTEGER NOT NULL DEFAULT 0,
    sends_count INTEGER NOT NULL DEFAULT 0,

    reports_count INTEGER NOT NULL DEFAULT 0,

    contacts_count INTEGER NOT NULL DEFAULT 0,
    applications_count INTEGER NOT NULL DEFAULT 0,
    downloads_count INTEGER NOT NULL DEFAULT 0,

    clicks_count INTEGER NOT NULL DEFAULT 0,
    external_clicks_count INTEGER NOT NULL DEFAULT 0,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    published_at TEXT,

    expires_at TEXT,

    approved_at TEXT,
    approved_by TEXT,

    rejected_at TEXT,
    rejected_by TEXT,
    rejection_reason TEXT,

    hidden_at TEXT,
    hidden_by TEXT,

    deleted_at TEXT,
    deleted_by TEXT,

    FOREIGN KEY (visitor_id)
        REFERENCES visitors(visitor_id)
        ON DELETE SET NULL,

    FOREIGN KEY (profile_id)
        REFERENCES users_profiles(id)
        ON DELETE SET NULL,

    FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE SET NULL
);


CREATE INDEX IF NOT EXISTS idx_publications_status
ON publications(status);

CREATE INDEX IF NOT EXISTS idx_publications_category
ON publications(category_id);

CREATE INDEX IF NOT EXISTS idx_publications_created
ON publications(created_at);

CREATE INDEX IF NOT EXISTS idx_publications_published
ON publications(published_at);

CREATE INDEX IF NOT EXISTS idx_publications_priority
ON publications(priority);

CREATE INDEX IF NOT EXISTS idx_publications_order
ON publications(manual_order);

CREATE INDEX IF NOT EXISTS idx_publications_city
ON publications(city);

CREATE INDEX IF NOT EXISTS idx_publications_country
ON publications(country);

CREATE INDEX IF NOT EXISTS idx_publications_author
ON publications(visitor_id);


-- ============================================================
-- PUBLICATION IMAGES
-- ============================================================

CREATE TABLE IF NOT EXISTS publication_images (
    id TEXT PRIMARY KEY,

    publication_id TEXT NOT NULL,

    image_url TEXT NOT NULL,

    thumbnail_url TEXT,

    alt_text TEXT,

    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (publication_id)
        REFERENCES publications(id)
        ON DELETE CASCADE
);


CREATE INDEX IF NOT EXISTS idx_publication_images_publication
ON publication_images(publication_id);


-- ============================================================
-- PUBLICATION HISTORY
-- Полная история изменений публикаций
-- ============================================================

CREATE TABLE IF NOT EXISTS publication_history (
    id TEXT PRIMARY KEY,

    publication_id TEXT NOT NULL,

    action TEXT NOT NULL,

    actor_type TEXT NOT NULL,
    actor_id TEXT,

    field_name TEXT,

    old_value TEXT,
    new_value TEXT,

    reason TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (publication_id)
        REFERENCES publications(id)
        ON DELETE CASCADE
);


CREATE INDEX IF NOT EXISTS idx_publication_history_publication
ON publication_history(publication_id);

CREATE INDEX IF NOT EXISTS idx_publication_history_created
ON publication_history(created_at);


-- ============================================================
-- GENERIC PUBLICATION METRICS
-- ============================================================

CREATE TABLE IF NOT EXISTS publication_metrics (
    id TEXT PRIMARY KEY,

    publication_id TEXT NOT NULL,

    metric_type TEXT NOT NULL,

    count INTEGER NOT NULL DEFAULT 0,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(publication_id, metric_type),

    FOREIGN KEY (publication_id)
        REFERENCES publications(id)
        ON DELETE CASCADE
);


CREATE INDEX IF NOT EXISTS idx_publication_metrics_publication
ON publication_metrics(publication_id);


-- ============================================================
-- REACTION TYPES
-- ============================================================

CREATE TABLE IF NOT EXISTS reaction_types (
    id TEXT PRIMARY KEY,

    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,

    emoji TEXT,

    is_active INTEGER NOT NULL DEFAULT 1,

    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- REACTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS reactions (
    id TEXT PRIMARY KEY,

    publication_id TEXT NOT NULL,

    visitor_id TEXT NOT NULL,

    reaction_type TEXT NOT NULL,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(publication_id, visitor_id, reaction_type),

    FOREIGN KEY (publication_id)
        REFERENCES publications(id)
        ON DELETE CASCADE,

    FOREIGN KEY (visitor_id)
        REFERENCES visitors(visitor_id)
        ON DELETE CASCADE
);


CREATE INDEX IF NOT EXISTS idx_reactions_publication
ON reactions(publication_id);

CREATE INDEX IF NOT EXISTS idx_reactions_visitor
ON reactions(visitor_id);


-- ============================================================
-- COMMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,

    publication_id TEXT NOT NULL,

    visitor_id TEXT,
    profile_id TEXT,

    parent_comment_id TEXT,

    author_name TEXT,
    author_username TEXT,

    text TEXT NOT NULL,

    status TEXT NOT NULL DEFAULT 'published',

    likes_count INTEGER NOT NULL DEFAULT 0,
    reports_count INTEGER NOT NULL DEFAULT 0,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    deleted_at TEXT,
    deleted_by TEXT,

    FOREIGN KEY (publication_id)
        REFERENCES publications(id)
        ON DELETE CASCADE,

    FOREIGN KEY (visitor_id)
        REFERENCES visitors(visitor_id)
        ON DELETE SET NULL,

    FOREIGN KEY (profile_id)
        REFERENCES users_profiles(id)
        ON DELETE SET NULL,

    FOREIGN KEY (parent_comment_id)
        REFERENCES comments(id)
        ON DELETE CASCADE
);


CREATE INDEX IF NOT EXISTS idx_comments_publication
ON comments(publication_id);

CREATE INDEX IF NOT EXISTS idx_comments_visitor
ON comments(visitor_id);

CREATE INDEX IF NOT EXISTS idx_comments_parent
ON comments(parent_comment_id);

CREATE INDEX IF NOT EXISTS idx_comments_created
ON comments(created_at);


-- ============================================================
-- COMMENT HISTORY
-- ============================================================

CREATE TABLE IF NOT EXISTS comment_history (
    id TEXT PRIMARY KEY,

    comment_id TEXT NOT NULL,

    actor_type TEXT NOT NULL,
    actor_id TEXT,

    action TEXT NOT NULL,

    old_text TEXT,
    new_text TEXT,

    reason TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (comment_id)
        REFERENCES comments(id)
        ON DELETE CASCADE
);


-- ============================================================
-- COMMENT REACTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS comment_reactions (
    id TEXT PRIMARY KEY,

    comment_id TEXT NOT NULL,
    visitor_id TEXT NOT NULL,

    reaction_type TEXT NOT NULL,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(comment_id, visitor_id, reaction_type),

    FOREIGN KEY (comment_id)
        REFERENCES comments(id)
        ON DELETE CASCADE,

    FOREIGN KEY (visitor_id)
        REFERENCES visitors(visitor_id)
        ON DELETE CASCADE
);


-- ============================================================
-- BOOKMARKS / SAVED
-- ============================================================

CREATE TABLE IF NOT EXISTS bookmarks (
    id TEXT PRIMARY KEY,

    publication_id TEXT NOT NULL,
    visitor_id TEXT NOT NULL,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(publication_id, visitor_id),

    FOREIGN KEY (publication_id)
        REFERENCES publications(id)
        ON DELETE CASCADE,

    FOREIGN KEY (visitor_id)
        REFERENCES visitors(visitor_id)
        ON DELETE CASCADE
);


CREATE INDEX IF NOT EXISTS idx_bookmarks_visitor
ON bookmarks(visitor_id);

CREATE INDEX IF NOT EXISTS idx_bookmarks_publication
ON bookmarks(publication_id);


-- ============================================================
-- SHARES
-- ============================================================

CREATE TABLE IF NOT EXISTS shares (
    id TEXT PRIMARY KEY,

    publication_id TEXT NOT NULL,
    visitor_id TEXT,

    share_type TEXT NOT NULL,

    target TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (publication_id)
        REFERENCES publications(id)
        ON DELETE CASCADE,

    FOREIGN KEY (visitor_id)
        REFERENCES visitors(visitor_id)
        ON DELETE SET NULL
);


CREATE INDEX IF NOT EXISTS idx_shares_publication
ON shares(publication_id);

CREATE INDEX IF NOT EXISTS idx_shares_visitor
ON shares(visitor_id);


-- ============================================================
-- VIEWS
-- ============================================================

CREATE TABLE IF NOT EXISTS publication_views (
    id TEXT PRIMARY KEY,

    publication_id TEXT NOT NULL,

    visitor_id TEXT,

    source TEXT,

    user_agent TEXT,

    ip_hash TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (publication_id)
        REFERENCES publications(id)
        ON DELETE CASCADE,

    FOREIGN KEY (visitor_id)
        REFERENCES visitors(visitor_id)
        ON DELETE SET NULL
);


CREATE INDEX IF NOT EXISTS idx_views_publication
ON publication_views(publication_id);

CREATE INDEX IF NOT EXISTS idx_views_visitor
ON publication_views(visitor_id);

CREATE INDEX IF NOT EXISTS idx_views_created
ON publication_views(created_at);


-- ============================================================
-- REPORTS
-- ============================================================

CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,

    reporter_id TEXT,

    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,

    reason TEXT NOT NULL,
    description TEXT,

    status TEXT NOT NULL DEFAULT 'pending',

    assigned_admin_id TEXT,

    admin_note TEXT,
    resolution TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    resolved_at TEXT,

    FOREIGN KEY (reporter_id)
        REFERENCES visitors(visitor_id)
        ON DELETE SET NULL
);


CREATE INDEX IF NOT EXISTS idx_reports_status
ON reports(status);

CREATE INDEX IF NOT EXISTS idx_reports_target
ON reports(target_type, target_id);

CREATE INDEX IF NOT EXISTS idx_reports_reporter
ON reports(reporter_id);


-- ============================================================
-- REPORT HISTORY
-- ============================================================

CREATE TABLE IF NOT EXISTS report_history (
    id TEXT PRIMARY KEY,

    report_id TEXT NOT NULL,

    actor_type TEXT NOT NULL,
    actor_id TEXT,

    action TEXT NOT NULL,

    old_status TEXT,
    new_status TEXT,

    note TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (report_id)
        REFERENCES reports(id)
        ON DELETE CASCADE
);


-- ============================================================
-- CONVERSATIONS
-- Чат пользователя с администрацией
-- ============================================================

CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,

    visitor_id TEXT,
    profile_id TEXT,

    assigned_admin_id TEXT,

    status TEXT NOT NULL DEFAULT 'open',

    subject TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    last_message_at TEXT,

    closed_at TEXT,

    FOREIGN KEY (visitor_id)
        REFERENCES visitors(visitor_id)
        ON DELETE SET NULL,

    FOREIGN KEY (profile_id)
        REFERENCES users_profiles(id)
        ON DELETE SET NULL
);


CREATE INDEX IF NOT EXISTS idx_conversations_visitor
ON conversations(visitor_id);

CREATE INDEX IF NOT EXISTS idx_conversations_admin
ON conversations(assigned_admin_id);

CREATE INDEX IF NOT EXISTS idx_conversations_status
ON conversations(status);

CREATE INDEX IF NOT EXISTS idx_conversations_last_message
ON conversations(last_message_at);


-- ============================================================
-- CONVERSATION PARTICIPANTS
-- ============================================================

CREATE TABLE IF NOT EXISTS conversation_participants (
    id TEXT PRIMARY KEY,

    conversation_id TEXT NOT NULL,

    participant_type TEXT NOT NULL,
    participant_id TEXT NOT NULL,

    joined_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    left_at TEXT,

    UNIQUE(
        conversation_id,
        participant_type,
        participant_id
    ),

    FOREIGN KEY (conversation_id)
        REFERENCES conversations(id)
        ON DELETE CASCADE
);


-- ============================================================
-- MESSAGES
-- ============================================================

CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,

    conversation_id TEXT NOT NULL,

    sender_type TEXT NOT NULL,
    sender_id TEXT,

    message TEXT NOT NULL,

    attachment_url TEXT,
    attachment_type TEXT,
    attachment_name TEXT,

    is_read INTEGER NOT NULL DEFAULT 0,
    is_deleted INTEGER NOT NULL DEFAULT 0,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    deleted_at TEXT,
    deleted_by TEXT,

    FOREIGN KEY (conversation_id)
        REFERENCES conversations(id)
        ON DELETE CASCADE
);


CREATE INDEX IF NOT EXISTS idx_messages_conversation
ON messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_messages_created
ON messages(created_at);

CREATE INDEX IF NOT EXISTS idx_messages_unread
ON messages(is_read);


-- ============================================================
-- MESSAGE READS
-- ============================================================

CREATE TABLE IF NOT EXISTS message_reads (
    id TEXT PRIMARY KEY,

    message_id TEXT NOT NULL,

    reader_type TEXT NOT NULL,
    reader_id TEXT NOT NULL,

    read_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(message_id, reader_type, reader_id),

    FOREIGN KEY (message_id)
        REFERENCES messages(id)
        ON DELETE CASCADE
);


-- ============================================================
-- MESSAGE REACTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS message_reactions (
    id TEXT PRIMARY KEY,

    message_id TEXT NOT NULL,

    visitor_id TEXT,

    reaction_type TEXT NOT NULL,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(message_id, visitor_id, reaction_type),

    FOREIGN KEY (message_id)
        REFERENCES messages(id)
        ON DELETE CASCADE,

    FOREIGN KEY (visitor_id)
        REFERENCES visitors(visitor_id)
        ON DELETE SET NULL
);


-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,

    visitor_id TEXT,

    profile_id TEXT,

    type TEXT NOT NULL,

    title TEXT NOT NULL,
    message TEXT NOT NULL,

    related_type TEXT,
    related_id TEXT,

    is_read INTEGER NOT NULL DEFAULT 0,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    read_at TEXT,

    FOREIGN KEY (visitor_id)
        REFERENCES visitors(visitor_id)
        ON DELETE CASCADE,

    FOREIGN KEY (profile_id)
        REFERENCES users_profiles(id)
        ON DELETE CASCADE
);


CREATE INDEX IF NOT EXISTS idx_notifications_visitor
ON notifications(visitor_id);

CREATE INDEX IF NOT EXISTS idx_notifications_read
ON notifications(is_read);

CREATE INDEX IF NOT EXISTS idx_notifications_created
ON notifications(created_at);


-- ============================================================
-- USER ACTIVITY
-- ============================================================

CREATE TABLE IF NOT EXISTS user_activity (
    id TEXT PRIMARY KEY,

    visitor_id TEXT,

    profile_id TEXT,

    action_type TEXT NOT NULL,

    target_type TEXT,
    target_id TEXT,

    metadata TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (visitor_id)
        REFERENCES visitors(visitor_id)
        ON DELETE SET NULL,

    FOREIGN KEY (profile_id)
        REFERENCES users_profiles(id)
        ON DELETE SET NULL
);


CREATE INDEX IF NOT EXISTS idx_activity_visitor
ON user_activity(visitor_id);

CREATE INDEX IF NOT EXISTS idx_activity_action
ON user_activity(action_type);

CREATE INDEX IF NOT EXISTS idx_activity_created
ON user_activity(created_at);


-- ============================================================
-- ADMIN ACTIVITY LOG
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_activity_logs (
    id TEXT PRIMARY KEY,

    admin_id TEXT,

    action TEXT NOT NULL,

    target_type TEXT,
    target_id TEXT,

    field_name TEXT,

    old_value TEXT,
    new_value TEXT,

    reason TEXT,

    ip_hash TEXT,
    user_agent TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE INDEX IF NOT EXISTS idx_admin_logs_admin
ON admin_activity_logs(admin_id);

CREATE INDEX IF NOT EXISTS idx_admin_logs_target
ON admin_activity_logs(target_type, target_id);

CREATE INDEX IF NOT EXISTS idx_admin_logs_action
ON admin_activity_logs(action);

CREATE INDEX IF NOT EXISTS idx_admin_logs_created
ON admin_activity_logs(created_at);


-- ============================================================
-- SYSTEM SETTINGS
-- ============================================================

CREATE TABLE IF NOT EXISTS system_settings (
    id TEXT PRIMARY KEY,

    setting_key TEXT NOT NULL UNIQUE,

    setting_value TEXT,

    value_type TEXT NOT NULL DEFAULT 'string',

    description TEXT,

    is_public INTEGER NOT NULL DEFAULT 0,

    updated_by TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- FEATURE FLAGS
-- Управление функциями сайта
-- ============================================================

CREATE TABLE IF NOT EXISTS feature_flags (
    id TEXT PRIMARY KEY,

    feature_key TEXT NOT NULL UNIQUE,

    enabled INTEGER NOT NULL DEFAULT 1,

    description TEXT,

    config TEXT,

    updated_by TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- ADMIN USERS
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_users (
    id TEXT PRIMARY KEY,

    username TEXT NOT NULL UNIQUE,

    display_name TEXT,

    password_hash TEXT NOT NULL,

    role TEXT NOT NULL DEFAULT 'admin',

    is_active INTEGER NOT NULL DEFAULT 1,

    last_login_at TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE INDEX IF NOT EXISTS idx_admin_users_active
ON admin_users(is_active);


-- ============================================================
-- ADMIN SESSIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_sessions (
    id TEXT PRIMARY KEY,

    admin_id TEXT NOT NULL,

    token_hash TEXT NOT NULL UNIQUE,

    ip_hash TEXT,
    user_agent TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    expires_at TEXT,

    is_active INTEGER NOT NULL DEFAULT 1,

    FOREIGN KEY (admin_id)
        REFERENCES admin_users(id)
        ON DELETE CASCADE
);


CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin
ON admin_sessions(admin_id);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_active
ON admin_sessions(is_active);


-- ============================================================
-- ADMIN PERMISSIONS
-- Максимально детальная система разрешений
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_permissions (
    id TEXT PRIMARY KEY,

    permission_key TEXT NOT NULL UNIQUE,

    description TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS admin_role_permissions (
    id TEXT PRIMARY KEY,

    role TEXT NOT NULL,

    permission_id TEXT NOT NULL,

    allowed INTEGER NOT NULL DEFAULT 1,

    UNIQUE(role, permission_id),

    FOREIGN KEY (permission_id)
        REFERENCES admin_permissions(id)
        ON DELETE CASCADE
);


-- ============================================================
-- SEARCH HISTORY
-- ============================================================

CREATE TABLE IF NOT EXISTS search_history (
    id TEXT PRIMARY KEY,

    visitor_id TEXT,

    query TEXT,

    category_id TEXT,

    filters TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (visitor_id)
        REFERENCES visitors(visitor_id)
        ON DELETE SET NULL
);


CREATE INDEX IF NOT EXISTS idx_search_history_visitor
ON search_history(visitor_id);

CREATE INDEX IF NOT EXISTS idx_search_history_created
ON search_history(created_at);


-- ============================================================
-- CONTACT / APPLICATION EVENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS publication_events (
    id TEXT PRIMARY KEY,

    publication_id TEXT NOT NULL,

    visitor_id TEXT,

    event_type TEXT NOT NULL,

    metadata TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (publication_id)
        REFERENCES publications(id)
        ON DELETE CASCADE,

    FOREIGN KEY (visitor_id)
        REFERENCES visitors(visitor_id)
        ON DELETE SET NULL
);


CREATE INDEX IF NOT EXISTS idx_publication_events_publication
ON publication_events(publication_id);

CREATE INDEX IF NOT EXISTS idx_publication_events_type
ON publication_events(event_type);


-- ============================================================
-- DEFAULT CATEGORIES
-- ============================================================

INSERT OR IGNORE INTO categories
(id, name, slug, description, icon, sort_order)
VALUES
(
    'cat-work',
    'Работа',
    'work',
    'Вакансии и предложения работы',
    '💼',
    1
),
(
    'cat-education',
    'Образование',
    'education',
    'Образовательные возможности',
    '🎓',
    2
),
(
    'cat-internships',
    'Стажировки',
    'internships',
    'Стажировки и практики',
    '🧑‍💻',
    3
),
(
    'cat-grants',
    'Гранты',
    'grants',
    'Гранты и финансовые возможности',
    '💰',
    4
),
(
    'cat-competitions',
    'Конкурсы',
    'competitions',
    'Конкурсы и соревнования',
    '🏆',
    5
),
(
    'cat-events',
    'Мероприятия',
    'events',
    'Форумы, конференции и мероприятия',
    '📅',
    6
),
(
    'cat-business',
    'Бизнес',
    'business',
    'Бизнес-возможности',
    '🏢',
    7
),
(
    'cat-opportunities',
    'Возможности',
    'opportunities',
    'Другие полезные возможности',
    '🚀',
    8
),
(
    'cat-news',
    'Новости',
    'news',
    'Новости и объявления',
    '📰',
    9
),
(
    'cat-other',
    'Другое',
    'other',
    'Другие публикации',
    '📌',
    10
);


-- ============================================================
-- DEFAULT REACTION TYPES
-- ============================================================

INSERT OR IGNORE INTO reaction_types
(id, name, slug, emoji, sort_order)
VALUES
(
    'reaction-like',
    'Like',
    'like',
    '👍',
    1
),
(
    'reaction-love',
    'Love',
    'love',
    '❤️',
    2
),
(
    'reaction-useful',
    'Полезно',
    'useful',
    '💡',
    3
),
(
    'reaction-interesting',
    'Интересно',
    'interesting',
    '🔥',
    4
),
(
    'reaction-support',
    'Поддержка',
    'support',
    '👏',
    5
);


-- ============================================================
-- DEFAULT FEATURE FLAGS
-- ============================================================

INSERT OR IGNORE INTO feature_flags
(id, feature_key, enabled, description)
VALUES
(
    'feature-comments',
    'comments',
    1,
    'Комментарии к публикациям'
),
(
    'feature-reactions',
    'reactions',
    1,
    'Реакции на публикации'
),
(
    'feature-bookmarks',
    'bookmarks',
    1,
    'Сохранение публикаций'
),
(
    'feature-sharing',
    'sharing',
    1,
    'Поделиться публикацией'
),
(
    'feature-sending',
    'sending',
    1,
    'Отправка публикаций'
),
(
    'feature-chat',
    'chat',
    1,
    'Чат пользователя с администрацией'
),
(
    'feature-reports',
    'reports',
    1,
    'Жалобы'
),
(
    'feature-notifications',
    'notifications',
    1,
    'Уведомления'
),
(
    'feature-profiles',
    'profiles',
    1,
    'Профили участников'
);


-- ============================================================
-- DEFAULT SYSTEM SETTINGS
-- ============================================================

INSERT OR IGNORE INTO system_settings
(id, setting_key, setting_value, value_type, description, is_public)
VALUES
(
    'setting-app-name',
    'app_name',
    'Tajik Opportunities',
    'string',
    'Название платформы',
    1
),
(
    'setting-feed-order',
    'feed_order',
    'newest',
    'string',
    'Порядок публикаций',
    1
),
(
    'setting-publication-moderation',
    'publication_moderation',
    '1',
    'boolean',
    'Модерация публикаций',
    0
),
(
    'setting-comments-enabled',
    'comments_enabled',
    '1',
    'boolean',
    'Комментарии включены',
    1
),
(
    'setting-chat-enabled',
    'chat_enabled',
    '1',
    'boolean',
    'Чат включён',
    1
);


-- ============================================================
-- DEFAULT ADMIN PERMISSIONS
-- ============================================================

INSERT OR IGNORE INTO admin_permissions
(id, permission_key, description)
VALUES
('perm-dashboard-view', 'dashboard.view', 'Просмотр панели управления'),

('perm-publications-view', 'publications.view', 'Просмотр публикаций'),
('perm-publications-create', 'publications.create', 'Создание публикаций'),
('perm-publications-edit', 'publications.edit', 'Редактирование публикаций'),
('perm-publications-delete', 'publications.delete', 'Удаление публикаций'),
('perm-publications-approve', 'publications.approve', 'Одобрение публикаций'),
('perm-publications-reject', 'publications.reject', 'Отклонение публикаций'),
('perm-publications-hide', 'publications.hide', 'Скрытие публикаций'),
('perm-publications-restore', 'publications.restore', 'Восстановление публикаций'),
('perm-publications-publish', 'publications.publish', 'Публикация'),
('perm-publications-pin', 'publications.pin', 'Закрепление'),
('perm-publications-feature', 'publications.feature', 'Выделение'),

('perm-metrics-view', 'metrics.view', 'Просмотр метрик'),
('perm-metrics-edit', 'metrics.edit', 'Изменение метрик'),
('perm-metrics-reset', 'metrics.reset', 'Сброс метрик'),

('perm-participants-view', 'participants.view', 'Просмотр участников'),
('perm-participants-edit', 'participants.edit', 'Изменение участников'),
('perm-participants-block', 'participants.block', 'Блокировка участников'),
('perm-participants-unblock', 'participants.unblock', 'Разблокировка участников'),

('perm-profiles-view', 'profiles.view', 'Просмотр профилей'),
('perm-profiles-edit', 'profiles.edit', 'Редактирование профилей'),
('perm-profiles-delete', 'profiles.delete', 'Удаление профилей'),

('perm-comments-view', 'comments.view', 'Просмотр комментариев'),
('perm-comments-edit', 'comments.edit', 'Редактирование комментариев'),
('perm-comments-delete', 'comments.delete', 'Удаление комментариев'),
('perm-comments-hide', 'comments.hide', 'Скрытие комментариев'),
('perm-comments-restore', 'comments.restore', 'Восстановление комментариев'),

('perm-reactions-view', 'reactions.view', 'Просмотр реакций'),
('perm-reactions-edit', 'reactions.edit', 'Управление реакциями'),
('perm-bookmarks-view', 'bookmarks.view', 'Просмотр сохранений'),
('perm-bookmarks-edit', 'bookmarks.edit', 'Управление сохранениями'),

('perm-shares-view', 'shares.view', 'Просмотр репостов'),
('perm-shares-edit', 'shares.edit', 'Управление репостами'),

('perm-reports-view', 'reports.view', 'Просмотр жалоб'),
('perm-reports-edit', 'reports.edit', 'Управление жалобами'),
('perm-reports-resolve', 'reports.resolve', 'Закрытие жалоб'),

('perm-chat-view', 'chat.view', 'Просмотр чатов'),
('perm-chat-send', 'chat.send', 'Отправка сообщений'),
('perm-chat-delete', 'chat.delete', 'Удаление сообщений'),
('perm-chat-manage', 'chat.manage', 'Управление чатами'),

('perm-notifications-view', 'notifications.view', 'Просмотр уведомлений'),
('perm-notifications-send', 'notifications.send', 'Отправка уведомлений'),
('perm-notifications-delete', 'notifications.delete', 'Удаление уведомлений'),

('perm-categories-view', 'categories.view', 'Просмотр категорий'),
('perm-categories-create', 'categories.create', 'Создание категорий'),
('perm-categories-edit', 'categories.edit', 'Редактирование категорий'),
('perm-categories-delete', 'categories.delete', 'Удаление категорий'),

('perm-statistics-view', 'statistics.view', 'Просмотр статистики'),

('perm-activity-view', 'activity.view', 'Просмотр журнала активности'),

('perm-settings-view', 'settings.view', 'Просмотр настроек'),
('perm-settings-edit', 'settings.edit', 'Изменение настроек'),

('perm-features-view', 'features.view', 'Просмотр функций'),
('perm-features-edit', 'features.edit', 'Включение и отключение функций'),

('perm-admins-view', 'admins.view', 'Просмотр администраторов'),
('perm-admins-create', 'admins.create', 'Создание администраторов'),
('perm-admins-edit', 'admins.edit', 'Изменение администраторов'),
('perm-admins-delete', 'admins.delete', 'Удаление администраторов'),

('perm-system-full-control', 'system.full_control', 'Полный контроль системы');


-- ============================================================
-- FULL ADMIN ROLE
-- ============================================================

INSERT OR IGNORE INTO admin_role_permissions
(id, role, permission_id, allowed)
SELECT
    'superadmin-' || id,
    'superadmin',
    id,
    1
FROM admin_permissions;


-- ============================================================
-- FINAL
-- ============================================================

PRAGMA foreign_keys = ON;
