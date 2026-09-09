-- ============================================================
-- 🇹🇯 TAJIK OPPORTUNITIES
-- Migration 003 — Production Upgrade
-- Version: 2026.09.09
--
-- Назначение:
-- • огромные счётчики публикаций
-- • настройки уведомлений пользователя
-- • расширенные поля публикаций
-- • безопасные индексы
-- • поддержка админского управления
-- ============================================================


PRAGMA foreign_keys = ON;


-- ============================================================
-- 1. PUBLICATION METRICS
-- ============================================================
-- В основной schema некоторые счётчики INTEGER.
-- Для проекта они должны поддерживать очень большие значения.
--
-- SQLite не позволяет просто изменить тип существующей колонки.
-- Поэтому создаём отдельную таблицу расширенных метрик.
-- Значения хранятся как TEXT и обрабатываются через DecimalString.
-- ============================================================

CREATE TABLE IF NOT EXISTS publication_metric_totals (
    publication_id TEXT PRIMARY KEY,

    views_count TEXT NOT NULL DEFAULT '0',
    unique_views_count TEXT NOT NULL DEFAULT '0',

    likes_count TEXT NOT NULL DEFAULT '0',
    reactions_count TEXT NOT NULL DEFAULT '0',

    comments_count TEXT NOT NULL DEFAULT '0',
    replies_count TEXT NOT NULL DEFAULT '0',

    bookmarks_count TEXT NOT NULL DEFAULT '0',
    shares_count TEXT NOT NULL DEFAULT '0',
    sends_count TEXT NOT NULL DEFAULT '0',

    reports_count TEXT NOT NULL DEFAULT '0',

    contacts_count TEXT NOT NULL DEFAULT '0',
    applications_count TEXT NOT NULL DEFAULT '0',

    downloads_count TEXT NOT NULL DEFAULT '0',
    clicks_count TEXT NOT NULL DEFAULT '0',
    external_clicks_count TEXT NOT NULL DEFAULT '0',

    positive_reactions_count TEXT NOT NULL DEFAULT '0',
    negative_reactions_count TEXT NOT NULL DEFAULT '0',

    rating_count TEXT NOT NULL DEFAULT '0',
    rating_sum TEXT NOT NULL DEFAULT '0',

    review_count TEXT NOT NULL DEFAULT '0',

    last_view_at TEXT,
    last_reaction_at TEXT,
    last_comment_at TEXT,
    last_share_at TEXT,
    last_report_at TEXT,

    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,

    FOREIGN KEY (publication_id)
        REFERENCES publications(id)
        ON DELETE CASCADE
);


CREATE INDEX IF NOT EXISTS idx_publication_metric_totals_updated
ON publication_metric_totals(updated_at);

CREATE INDEX IF NOT EXISTS idx_publication_metric_totals_views
ON publication_metric_totals(views_count);

CREATE INDEX IF NOT EXISTS idx_publication_metric_totals_shares
ON publication_metric_totals(shares_count);

CREATE INDEX IF NOT EXISTS idx_publication_metric_totals_comments
ON publication_metric_totals(comments_count);


-- ============================================================
-- 2. USER NOTIFICATION SETTINGS
-- ============================================================
-- Не храним огромный набор колонок.
-- JSON позволяет администратору добавлять новые категории
-- и события без изменения структуры БД.
-- ============================================================

CREATE TABLE IF NOT EXISTS user_notification_settings (
    user_id TEXT PRIMARY KEY,

    settings_json TEXT NOT NULL DEFAULT '{}',

    global_enabled INTEGER NOT NULL DEFAULT 1,

    in_app_enabled INTEGER NOT NULL DEFAULT 1,
    push_enabled INTEGER NOT NULL DEFAULT 1,
    sound_enabled INTEGER NOT NULL DEFAULT 1,
    vibration_enabled INTEGER NOT NULL DEFAULT 1,
    badge_enabled INTEGER NOT NULL DEFAULT 1,
    email_enabled INTEGER NOT NULL DEFAULT 0,
    system_chat_enabled INTEGER NOT NULL DEFAULT 1,

    quiet_hours_enabled INTEGER NOT NULL DEFAULT 0,
    quiet_hours_start TEXT,
    quiet_hours_end TEXT,

    retention_days INTEGER NOT NULL DEFAULT 365,

    admin_locked INTEGER NOT NULL DEFAULT 0,

    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,

    FOREIGN KEY (user_id)
        REFERENCES users_profiles(id)
        ON DELETE CASCADE
);


CREATE INDEX IF NOT EXISTS idx_user_notification_settings_updated
ON user_notification_settings(updated_at);


-- ============================================================
-- 3. GLOBAL NOTIFICATION SETTINGS
-- ============================================================

CREATE TABLE IF NOT EXISTS notification_global_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),

    enabled INTEGER NOT NULL DEFAULT 1,

    settings_json TEXT NOT NULL DEFAULT '{}',

    in_app_enabled INTEGER NOT NULL DEFAULT 1,
    push_enabled INTEGER NOT NULL DEFAULT 1,
    sound_enabled INTEGER NOT NULL DEFAULT 1,
    vibration_enabled INTEGER NOT NULL DEFAULT 1,
    badge_enabled INTEGER NOT NULL DEFAULT 1,
    email_enabled INTEGER NOT NULL DEFAULT 0,
    system_chat_enabled INTEGER NOT NULL DEFAULT 1,

    updated_by TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);


INSERT OR IGNORE INTO notification_global_settings (
    id,
    enabled,
    settings_json,
    created_at,
    updated_at
)
VALUES (
    1,
    1,
    '{}',
    datetime('now'),
    datetime('now')
);


-- ============================================================
-- 4. FORCED NOTIFICATION SETTINGS
-- ============================================================
-- Некоторые уведомления нельзя отключить пользователю:
-- безопасность, блокировка, важные системные события и т.д.
-- ============================================================

CREATE TABLE IF NOT EXISTS notification_forced_settings (
    id TEXT PRIMARY KEY,

    category TEXT NOT NULL,
    event TEXT NOT NULL,

    enabled INTEGER NOT NULL DEFAULT 1,

    in_app_enabled INTEGER NOT NULL DEFAULT 1,
    push_enabled INTEGER NOT NULL DEFAULT 1,
    sound_enabled INTEGER NOT NULL DEFAULT 0,
    vibration_enabled INTEGER NOT NULL DEFAULT 0,
    badge_enabled INTEGER NOT NULL DEFAULT 1,
    email_enabled INTEGER NOT NULL DEFAULT 0,
    system_chat_enabled INTEGER NOT NULL DEFAULT 1,

    reason TEXT,

    created_by TEXT,
    updated_by TEXT,

    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);


CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_forced_event
ON notification_forced_settings(category, event);


-- ============================================================
-- 5. PUBLICATION ADMIN OVERRIDES
-- ============================================================
-- Администратор должен иметь возможность полностью изменить
-- поведение публикации независимо от первоначального типа.
-- ============================================================

CREATE TABLE IF NOT EXISTS publication_admin_overrides (
    publication_id TEXT PRIMARY KEY,

    forced_type TEXT,

    forced_status TEXT,

    forced_visibility TEXT,

    forced_priority TEXT,

    pinned INTEGER,
    featured INTEGER,

    auto_delete_enabled INTEGER,

    custom_delete_at TEXT,

    custom_publish_at TEXT,

    custom_author_name TEXT,
    custom_author_username TEXT,
    custom_author_avatar_url TEXT,

    custom_background TEXT,
    custom_font TEXT,
    custom_color TEXT,

    custom_tag TEXT,
    custom_tag_icon TEXT,
    custom_tag_color TEXT,

    comments_enabled INTEGER,
    reactions_enabled INTEGER,
    reviews_enabled INTEGER,
    sharing_enabled INTEGER,
    bookmarks_enabled INTEGER,

    admin_note TEXT,

    updated_by TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,

    FOREIGN KEY (publication_id)
        REFERENCES publications(id)
        ON DELETE CASCADE
);


-- ============================================================
-- 6. PUBLICATION MEDIA CONTROL
-- ============================================================
-- Позволяет админу удалять/скрывать отдельные фотографии,
-- видео, документы и другие вложения.
-- ============================================================

CREATE TABLE IF NOT EXISTS publication_media_overrides (
    id TEXT PRIMARY KEY,

    publication_id TEXT NOT NULL,
    media_id TEXT,

    action TEXT NOT NULL DEFAULT 'keep',

    replacement_url TEXT,

    admin_reason TEXT,

    updated_by TEXT,

    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,

    FOREIGN KEY (publication_id)
        REFERENCES publications(id)
        ON DELETE CASCADE
);


CREATE INDEX IF NOT EXISTS idx_publication_media_overrides_publication
ON publication_media_overrides(publication_id);


CREATE INDEX IF NOT EXISTS idx_publication_media_overrides_media
ON publication_media_overrides(media_id);


-- ============================================================
-- 7. PUBLICATION NUMBER CONTROL
-- ============================================================
-- Внутренний ID публикации остаётся неизменным.
-- public_number используется для URL:
--
-- /1
-- /2
-- /3
-- ...
--
-- После удаления публикации публичные номера могут быть
-- перенумерованы отдельным сервисом.
-- ============================================================

CREATE TABLE IF NOT EXISTS publication_number_history (
    id TEXT PRIMARY KEY,

    publication_id TEXT NOT NULL,

    old_public_number TEXT,
    new_public_number TEXT NOT NULL,

    action TEXT NOT NULL,

    changed_by TEXT,

    created_at TEXT NOT NULL,

    FOREIGN KEY (publication_id)
        REFERENCES publications(id)
        ON DELETE CASCADE
);


CREATE INDEX IF NOT EXISTS idx_publication_number_history_publication
ON publication_number_history(publication_id);

CREATE INDEX IF NOT EXISTS idx_publication_number_history_number
ON publication_number_history(new_public_number);


-- ============================================================
-- 8. PUBLICATION SHARES EXTENSION
-- ============================================================

CREATE TABLE IF NOT EXISTS publication_share_events (
    id TEXT PRIMARY KEY,

    publication_id TEXT NOT NULL,

    user_id TEXT,
    visitor_id TEXT,
    session_id TEXT,

    share_type TEXT NOT NULL,

    target_conversation_id TEXT,
    target_user_id TEXT,

    source TEXT,

    created_at TEXT NOT NULL,

    FOREIGN KEY (publication_id)
        REFERENCES publications(id)
        ON DELETE CASCADE
);


CREATE INDEX IF NOT EXISTS idx_publication_share_events_publication
ON publication_share_events(publication_id);

CREATE INDEX IF NOT EXISTS idx_publication_share_events_user
ON publication_share_events(user_id);

CREATE INDEX IF NOT EXISTS idx_publication_share_events_created
ON publication_share_events(created_at);


-- ============================================================
-- 9. ADMIN ACTING MODE HISTORY
-- ============================================================
-- Если администратор действует от имени участника,
-- действие должно иметь прозрачный аудит.
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_acting_sessions (
    id TEXT PRIMARY KEY,

    admin_id TEXT NOT NULL,

    acting_user_id TEXT NOT NULL,

    started_at TEXT NOT NULL,
    ended_at TEXT,

    status TEXT NOT NULL DEFAULT 'active',

    reason TEXT,

    ip_hash TEXT,
    user_agent_hash TEXT,

    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);


CREATE INDEX IF NOT EXISTS idx_admin_acting_admin
ON admin_acting_sessions(admin_id);

CREATE INDEX IF NOT EXISTS idx_admin_acting_user
ON admin_acting_sessions(acting_user_id);

CREATE INDEX IF NOT EXISTS idx_admin_acting_status
ON admin_acting_sessions(status);


-- ============================================================
-- 10. USER ACTIVITY EXTENSION
-- ============================================================

CREATE TABLE IF NOT EXISTS participant_presence (
    user_id TEXT PRIMARY KEY,

    status TEXT NOT NULL DEFAULT 'offline',

    last_seen_at TEXT,
    last_online_at TEXT,

    current_session_id TEXT,

    updated_at TEXT NOT NULL,

    FOREIGN KEY (user_id)
        REFERENCES users_profiles(id)
        ON DELETE CASCADE
);


CREATE INDEX IF NOT EXISTS idx_participant_presence_status
ON participant_presence(status);

CREATE INDEX IF NOT EXISTS idx_participant_presence_last_seen
ON participant_presence(last_seen_at);


-- ============================================================
-- 11. SEARCH INDEX METADATA
-- ============================================================
-- Админский супер-поиск сможет искать по:
-- username
-- name
-- ID
-- technical ID
-- публикациям
-- комментариям
-- чатам
-- отзывам
-- категориям
-- документам
-- ссылкам
-- ============================================================

CREATE TABLE IF NOT EXISTS search_index_entries (
    id TEXT PRIMARY KEY,

    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,

    user_id TEXT,

    title TEXT,
    content TEXT,

    search_text TEXT NOT NULL,

    status TEXT NOT NULL DEFAULT 'active',

    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);


CREATE INDEX IF NOT EXISTS idx_search_index_entity
ON search_index_entries(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_search_index_user
ON search_index_entries(user_id);

CREATE INDEX IF NOT EXISTS idx_search_index_status
ON search_index_entries(status);


-- ============================================================
-- 12. FEATURE FLAG TARGET OVERRIDES
-- ============================================================
-- Глобальный флаг + отдельные разрешения:
-- • конкретному участнику
-- • публикации
-- • категории
-- • проценту пользователей
-- ============================================================

CREATE TABLE IF NOT EXISTS feature_flag_overrides (
    id TEXT PRIMARY KEY,

    feature_key TEXT NOT NULL,

    target_type TEXT NOT NULL,
    target_id TEXT,

    enabled INTEGER NOT NULL DEFAULT 0,

    rollout_percent INTEGER,

    starts_at TEXT,
    ends_at TEXT,

    reason TEXT,

    created_by TEXT,
    updated_by TEXT,

    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);


CREATE INDEX IF NOT EXISTS idx_feature_flag_overrides_feature
ON feature_flag_overrides(feature_key);

CREATE INDEX IF NOT EXISTS idx_feature_flag_overrides_target
ON feature_flag_overrides(target_type, target_id);


-- ============================================================
-- 13. SYSTEM SETTINGS EXTENSION
-- ============================================================

INSERT OR IGNORE INTO system_settings (
    key,
    value,
    description,
    updated_at
)
VALUES
(
    'notifications.global_enabled',
    'true',
    'Глобальное включение системы уведомлений',
    datetime('now')
),
(
    'notifications.push_enabled',
    'true',
    'Разрешить push-уведомления',
    datetime('now')
),
(
    'notifications.email_enabled',
    'false',
    'Разрешить email-уведомления',
    datetime('now')
),
(
    'notifications.system_chat_enabled',
    'true',
    'Использовать официальный системный чат',
    datetime('now')
),
(
    'publications.share_enabled',
    'true',
    'Разрешить публикациям функцию Share',
    datetime('now')
),
(
    'publications.comments_enabled',
    'true',
    'Разрешить комментарии',
    datetime('now')
),
(
    'publications.reactions_enabled',
    'true',
    'Разрешить реакции',
    datetime('now')
),
(
    'publications.reviews_enabled',
    'true',
    'Разрешить отзывы и рейтинги',
    datetime('now')
),
(
    'admin.acting_mode_enabled',
    'true',
    'Разрешить администратору режим Acting Mode',
    datetime('now')
);


-- ============================================================
-- 14. FEATURE FLAGS
-- ============================================================

INSERT OR IGNORE INTO feature_flags (
    key,
    enabled,
    description,
    updated_at
)
VALUES
(
    'publication.share',
    1,
    'Instagram-style Share для публикаций',
    datetime('now')
),
(
    'publication.save',
    1,
    'Сохранение публикаций',
    datetime('now')
),
(
    'publication.reviews',
    1,
    'Отзывы и рейтинг 1–5',
    datetime('now')
),
(
    'publication.reactions',
    1,
    'Расширенные реакции',
    datetime('now')
),
(
    'notification.center',
    1,
    'Центр уведомлений',
    datetime('now')
),
(
    'notification.settings',
    1,
    'Расширенные настройки уведомлений',
    datetime('now')
),
(
    'admin.acting_mode',
    1,
    'Admin Acting Mode',
    datetime('now')
),
(
    'admin.super_search',
    1,
    'Супер-поиск администратора',
    datetime('now')
),
(
    'admin.activity_monitor',
    1,
    'Монитор активности участников',
    datetime('now')
);


-- ============================================================
-- 15. INITIAL METRIC ROWS
-- ============================================================
-- Создаём расширенные метрики для существующих публикаций.
-- Старые INTEGER значения преобразуются в TEXT.
-- ============================================================

INSERT OR IGNORE INTO publication_metric_totals (
    publication_id,

    views_count,
    unique_views_count,
    likes_count,
    comments_count,
    reactions_count,
    bookmarks_count,
    shares_count,
    sends_count,
    reports_count,
    contacts_count,
    applications_count,
    downloads_count,
    clicks_count,
    external_clicks_count,

    created_at,
    updated_at
)
SELECT
    id,

    CAST(COALESCE(views_count, 0) AS TEXT),
    CAST(COALESCE(unique_views_count, 0) AS TEXT),
    CAST(COALESCE(likes_count, 0) AS TEXT),
    CAST(COALESCE(comments_count, 0) AS TEXT),
    CAST(COALESCE(reactions_count, 0) AS TEXT),
    CAST(COALESCE(bookmarks_count, 0) AS TEXT),
    CAST(COALESCE(shares_count, 0) AS TEXT),
    CAST(COALESCE(sends_count, 0) AS TEXT),
    CAST(COALESCE(reports_count, 0) AS TEXT),
    CAST(COALESCE(contacts_count, 0) AS TEXT),
    CAST(COALESCE(applications_count, 0) AS TEXT),
    CAST(COALESCE(downloads_count, 0) AS TEXT),
    CAST(COALESCE(clicks_count, 0) AS TEXT),
    CAST(COALESCE(external_clicks_count, 0) AS TEXT),

    COALESCE(created_at, datetime('now')),
    COALESCE(updated_at, datetime('now'))

FROM publications;


-- ============================================================
-- 16. MIGRATION RECORD
-- ============================================================

CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    description TEXT,
    applied_at TEXT NOT NULL
);


INSERT OR IGNORE INTO schema_migrations (
    version,
    description,
    applied_at
)
VALUES (
    '003',
    'Production upgrade: huge metrics, notification settings, publication controls, acting mode, search and feature overrides',
    datetime('now')
);
