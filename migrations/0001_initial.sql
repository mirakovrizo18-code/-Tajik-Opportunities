-- ============================================================
-- 1. ТАБЛИЦА ПОДАЧ (submissions) - С АУДИТОМ И ВЕРСИОНИРОВАНИЕМ
-- ============================================================
CREATE TABLE IF NOT EXISTS submissions (
  -- Уникальный идентификатор (UUID v7 для хронологической сортировки)
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  
  -- Основные поля
  title TEXT NOT NULL CHECK (length(title) >= 3 AND length(title) <= 255),
  content TEXT NOT NULL CHECK (length(content) >= 10),
  category TEXT NOT NULL CHECK (category IN ('job', 'education', 'business', 'event', 'other')),
  
  -- Медиа и ссылки
  image_url TEXT CHECK (image_url IS NULL OR image_url LIKE 'https://%'),
  link_url TEXT CHECK (link_url IS NULL OR link_url LIKE 'https://%'),
  
  -- Контактная информация
  contact TEXT CHECK (contact IS NULL OR length(contact) >= 3),
  author_name TEXT CHECK (author_name IS NULL OR length(author_name) >= 2),
  
  -- Системные поля
  tracking_code TEXT NOT NULL UNIQUE 
    DEFAULT ('SUB-' || upper(hex(randomblob(4))) || '-' || strftime('%Y%m%d', 'now')),
  
  -- Статус с ограничениями
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'approved', 'rejected', 'archived')),
  
  -- Причина отклонения (только если статус = 'rejected')
  rejection_reason TEXT CHECK (
    (status = 'rejected' AND rejection_reason IS NOT NULL AND length(rejection_reason) >= 5) OR
    (status != 'rejected' AND rejection_reason IS NULL)
  ),
  
  -- Метаданные модерации
  reviewed_by TEXT REFERENCES admins(id) ON DELETE SET NULL,
  reviewed_at TEXT,
  
  -- Версионирование (для отслеживания изменений)
  version INTEGER DEFAULT 1,
  previous_version_id TEXT REFERENCES submissions(id) ON DELETE SET NULL,
  
  -- Аудит
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT, -- Soft delete
  
  -- Констрейнты
  CONSTRAINT valid_review CHECK (
    (status = 'pending' AND reviewed_at IS NULL) OR
    (status != 'pending' AND reviewed_at IS NOT NULL)
  )
);

-- ============================================================
-- 2. ТАБЛИЦА ПУБЛИКАЦИЙ (posts) - С ДЕНАРМАЛИЗАЦИЕЙ ДЛЯ ПРОИЗВОДИТЕЛЬНОСТИ
-- ============================================================
CREATE TABLE IF NOT EXISTS posts (
  -- Уникальный идентификатор
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  
  -- Связь с submission
  submission_id TEXT NOT NULL UNIQUE 
    REFERENCES submissions(id) ON DELETE CASCADE,
  
  -- Денормализованные данные (из submissions для быстрых чтений)
  title TEXT NOT NULL CHECK (length(title) >= 3 AND length(title) <= 255),
  content TEXT NOT NULL CHECK (length(content) >= 10),
  category TEXT NOT NULL CHECK (category IN ('job', 'education', 'business', 'event', 'other')),
  image_url TEXT CHECK (image_url IS NULL OR image_url LIKE 'https://%'),
  link_url TEXT CHECK (link_url IS NULL OR link_url LIKE 'https://%'),
  contact TEXT CHECK (contact IS NULL OR length(contact) >= 3),
  author_name TEXT CHECK (author_name IS NULL OR length(author_name) >= 2),
  
  -- Статистика публикации
  view_count INTEGER DEFAULT 0 CHECK (view_count >= 0),
  share_count INTEGER DEFAULT 0 CHECK (share_count >= 0),
  
  -- Метаданные SEO
  seo_title TEXT,
  seo_description TEXT CHECK (seo_description IS NULL OR length(seo_description) <= 160),
  seo_keywords TEXT,
  
  -- Системные поля
  published_by TEXT REFERENCES admins(id) ON DELETE SET NULL,
  published_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT CHECK (expires_at IS NULL OR expires_at > published_at),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT, -- Soft delete
  
  -- Полнотекстовый поиск (для FTS5)
  -- Будет создан отдельно
  -- CONSTRAINT fk_submission FOREIGN KEY (submission_id) REFERENCES submissions(id)
);

-- ============================================================
-- 3. ТАБЛИЦА АДМИНИСТРАТОРОВ (admins)
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT NOT NULL UNIQUE CHECK (email LIKE '%@%'),
  username TEXT NOT NULL UNIQUE CHECK (length(username) >= 3),
  password_hash TEXT NOT NULL CHECK (length(password_hash) >= 60),
  role TEXT NOT NULL DEFAULT 'moderator' 
    CHECK (role IN ('moderator', 'editor', 'admin', 'super_admin')),
  permissions TEXT, -- JSON массив прав
  last_login_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT
);

-- ============================================================
-- 4. ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ (users) - ДЛЯ АУТЕНТИФИКАЦИИ
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT NOT NULL UNIQUE CHECK (email LIKE '%@%'),
  username TEXT NOT NULL UNIQUE CHECK (length(username) >= 3),
  password_hash TEXT CHECK (length(password_hash) >= 60), -- NULL для OAuth
  full_name TEXT CHECK (length(full_name) >= 2),
  avatar_url TEXT CHECK (avatar_url IS NULL OR avatar_url LIKE 'https://%'),
  bio TEXT,
  
  -- OAuth провайдеры
  oauth_provider TEXT CHECK (oauth_provider IN (NULL, 'google', 'github', 'facebook')),
  oauth_id TEXT,
  
  -- Настройки
  email_verified BOOLEAN DEFAULT 0,
  notification_preferences TEXT DEFAULT '{}', -- JSON
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'ru', 'tg')),
  
  -- Активность
  last_active_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT,
  
  UNIQUE(oauth_provider, oauth_id)
);

-- ============================================================
-- 5. ТАБЛИЦА АУДИТА (audit_log) - ДЛЯ ЛЮБЫХ ИЗМЕНЕНИЙ
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('submission', 'post', 'user', 'admin')),
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'restore', 'status_change', 'review')),
  old_values TEXT, -- JSON
  new_values TEXT, -- JSON
  performed_by TEXT NOT NULL, -- admin_id или user_id
  performed_at TEXT NOT NULL DEFAULT (datetime('now')),
  ip_address TEXT,
  user_agent TEXT
);

-- ============================================================
-- 6. ТАБЛИЦА ТЕГОВ (tags) - ДЛЯ КАТЕГОРИЗАЦИИ
-- ============================================================
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL UNIQUE CHECK (length(name) >= 2 AND length(name) <= 50),
  slug TEXT NOT NULL UNIQUE CHECK (slug GLOB '[a-z0-9-]*'),
  description TEXT,
  usage_count INTEGER DEFAULT 0 CHECK (usage_count >= 0),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- 7. СВЯЗЬ ПОСТОВ И ТЕГОВ (MANY-TO-MANY)
-- ============================================================
CREATE TABLE IF NOT EXISTS post_tags (
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (post_id, tag_id)
);

-- ============================================================
-- 8. ИНДЕКСЫ ДЛЯ МАКСИМАЛЬНОЙ ПРОИЗВОДИТЕЛЬНОСТИ
-- ============================================================

-- Индексы для submissions
CREATE INDEX IF NOT EXISTS idx_submissions_status_created 
  ON submissions(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_submissions_category_status 
  ON submissions(category, status);

CREATE INDEX IF NOT EXISTS idx_submissions_author 
  ON submissions(author_name) WHERE author_name IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_submissions_tracking 
  ON submissions(tracking_code);

CREATE INDEX IF NOT EXISTS idx_submissions_created_by 
  ON submissions(created_by) WHERE created_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_submissions_deleted 
  ON submissions(deleted_at) WHERE deleted_at IS NULL;

-- Индексы для posts
CREATE INDEX IF NOT EXISTS idx_posts_published 
  ON posts(published_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_category_published 
  ON posts(category, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_author_name 
  ON posts(author_name) WHERE author_name IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_posts_expires 
  ON posts(expires_at) WHERE expires_at IS NOT NULL AND expires_at > datetime('now');

CREATE INDEX IF NOT EXISTS idx_posts_deleted 
  ON posts(deleted_at) WHERE deleted_at IS NULL;

-- Индексы для поиска
CREATE INDEX IF NOT EXISTS idx_posts_title_gin 
  ON posts(title); -- Для LIKE запросов с префиксом

-- Индексы для пользователей
CREATE INDEX IF NOT EXISTS idx_users_email 
  ON users(email) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_users_username 
  ON users(username) WHERE deleted_at IS NULL;

-- Индексы для аудита
CREATE INDEX IF NOT EXISTS idx_audit_entity 
  ON audit_log(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_audit_performed_at 
  ON audit_log(performed_at DESC);

-- Индексы для тегов
CREATE INDEX IF NOT EXISTS idx_tags_slug 
  ON tags(slug);

CREATE INDEX IF NOT EXISTS idx_tags_usage 
  ON tags(usage_count DESC);

-- ============================================================
-- 9. ТРИГГЕРЫ ДЛЯ АВТОМАТИЧЕСКОГО ОБНОВЛЕНИЯ
-- ============================================================

-- Триггер для обновления updated_at в submissions
CREATE TRIGGER IF NOT EXISTS update_submissions_timestamp 
  AFTER UPDATE ON submissions
  BEGIN
    UPDATE submissions 
    SET updated_at = datetime('now')
    WHERE id = NEW.id;
  END;

-- Триггер для обновления updated_at в posts
CREATE TRIGGER IF NOT EXISTS update_posts_timestamp 
  AFTER UPDATE ON posts
  BEGIN
    UPDATE posts 
    SET updated_at = datetime('now')
    WHERE id = NEW.id;
  END;

-- Триггер для обновления updated_at в users
CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
  AFTER UPDATE ON users
  BEGIN
    UPDATE users 
    SET updated_at = datetime('now')
    WHERE id = NEW.id;
  END;

-- Триггер для автоматического логирования аудита submissions
CREATE TRIGGER IF NOT EXISTS audit_submissions_insert
  AFTER INSERT ON submissions
  BEGIN
    INSERT INTO audit_log (entity_type, entity_id, action, old_values, new_values, performed_by)
    VALUES ('submission', NEW.id, 'create', NULL, 
      json_object('title', NEW.title, 'category', NEW.category, 'status', NEW.status),
      COALESCE(NEW.created_by, 'system')
    );
  END;

-- Триггер для аудита изменений статуса
CREATE TRIGGER IF NOT EXISTS audit_submissions_status_change
  AFTER UPDATE OF status ON submissions
  WHEN OLD.status != NEW.status
  BEGIN
    INSERT INTO audit_log (entity_type, entity_id, action, old_values, new_values, performed_by)
    VALUES ('submission', NEW.id, 'status_change',
      json_object('status', OLD.status),
      json_object('status', NEW.status, 'reviewed_by', NEW.reviewed_by),
      COALESCE(NEW.reviewed_by, 'system')
    );
  END;

-- Триггер автоматического создания поста при одобрении
CREATE TRIGGER IF NOT EXISTS create_post_on_approval
  AFTER UPDATE OF status ON submissions
  WHEN NEW.status = 'approved' AND OLD.status != 'approved'
  BEGIN
    INSERT INTO posts (
      submission_id, title, content, category, image_url, 
      link_url, contact, author_name, published_by, published_at
    )
    VALUES (
      NEW.id, NEW.title, NEW.content, NEW.category, NEW.image_url,
      NEW.link_url, NEW.contact, NEW.author_name, NEW.reviewed_by, datetime('now')
    );
  END;

-- ============================================================
-- 10. FULL-TEXT SEARCH (FTS5) ДЛЯ МОЩНОГО ПОИСКА
-- ============================================================
CREATE VIRTUAL TABLE IF NOT EXISTS posts_fts 
USING fts5(
  title, 
  content, 
  author_name,
  category,
  content=posts,
  content_rowid=rowid
);

-- Триггеры для синхронизации FTS
CREATE TRIGGER IF NOT EXISTS posts_fts_insert 
  AFTER INSERT ON posts
  BEGIN
    INSERT INTO posts_fts(rowid, title, content, author_name, category)
    VALUES (NEW.rowid, NEW.title, NEW.content, NEW.author_name, NEW.category);
  END;

CREATE TRIGGER IF NOT EXISTS posts_fts_update 
  AFTER UPDATE ON posts
  WHEN NEW.title != OLD.title OR NEW.content != OLD.content OR 
       NEW.author_name != OLD.author_name OR NEW.category != OLD.category
  BEGIN
    UPDATE posts_fts 
    SET title = NEW.title, 
        content = NEW.content,
        author_name = NEW.author_name,
        category = NEW.category
    WHERE rowid = NEW.rowid;
  END;

CREATE TRIGGER IF NOT EXISTS posts_fts_delete 
  AFTER DELETE ON posts
  BEGIN
    DELETE FROM posts_fts WHERE rowid = OLD.rowid;
  END;

-- ============================================================
-- 11. ПРЕДСТАВЛЕНИЯ (VIEWS) ДЛЯ УПРОЩЕНИЯ ЗАПРОСОВ
-- ============================================================

-- Активные посты с тегами (денаминализация)
CREATE VIEW IF NOT EXISTS v_active_posts AS
SELECT 
  p.id,
  p.title,
  p.content,
  p.category,
  p.image_url,
  p.link_url,
  p.contact,
  p.author_name,
  p.view_count,
  p.share_count,
  p.published_at,
  p.seo_title,
  p.seo_description,
  s.tracking_code,
  s.created_at as submitted_at,
  GROUP_CONCAT(t.name, ', ') as tags,
  u.full_name as publisher_name
FROM posts p
JOIN submissions s ON p.submission_id = s.id
LEFT JOIN post_tags pt ON p.id = pt.post_id
LEFT JOIN tags t ON pt.tag_id = t.id
LEFT JOIN admins a ON p.published_by = a.id
LEFT JOIN users u ON s.created_by = u.id
WHERE p.deleted_at IS NULL
  AND (p.expires_at IS NULL OR p.expires_at > datetime('now'))
GROUP BY p.id;

-- Статистика по категориям
CREATE VIEW IF NOT EXISTS v_category_stats AS
SELECT 
  category,
  COUNT(*) as total_posts,
  SUM(view_count) as total_views,
  AVG(view_count) as avg_views,
  datetime('now') as calculated_at
FROM posts
WHERE deleted_at IS NULL
GROUP BY category;

-- ============================================================
-- 12. ФУНКЦИИ (для сложных операций)
-- ============================================================

-- Функция для получения похожих постов
CREATE FUNCTION IF NOT EXISTS get_related_posts(post_id TEXT, limit_count INTEGER)
RETURNS TABLE(
  id TEXT,
  title TEXT,
  category TEXT,
  score REAL
)
BEGIN
  WITH target_category AS (
    SELECT category FROM posts WHERE id = post_id
  )
  SELECT 
    p.id,
    p.title,
    p.category,
    (1.0 / (julianday('now') - julianday(p.published_at) + 1)) * 
    CASE WHEN p.category = (SELECT category FROM target_category) THEN 2.0 ELSE 1.0 END as score
  FROM posts p
  WHERE p.id != post_id
    AND p.deleted_at IS NULL
    AND (p.expires_at IS NULL OR p.expires_at > datetime('now'))
  ORDER BY score DESC, p.published_at DESC
  LIMIT limit_count;
END;

-- ============================================================
-- 13. ПЕРВОНАЧАЛЬНЫЕ ДАННЫЕ (системные теги)
-- ============================================================
INSERT OR IGNORE INTO tags (id, name, slug, description) VALUES
  (lower(hex(randomblob(16))), 'Работа', 'work', 'Вакансии и работа'),
  (lower(hex(randomblob(16))), 'Образование', 'education', 'Образовательные программы'),
  (lower(hex(randomblob(16))), 'Бизнес', 'business', 'Бизнес-возможности'),
  (lower(hex(randomblob(16))), 'Мероприятия', 'events', 'События и мероприятия'),
  (lower(hex(randomblob(16))), 'Стипендии', 'scholarships', 'Стипендиальные программы'),
  (lower(hex(randomblob(16))), 'Стажировки', 'internships', 'Стажировки и практика'),
  (lower(hex(randomblob(16))), 'Конкурсы', 'contests', 'Конкурсы и гранты');

-- ============================================================
-- 14. АДМИН ПО УМОЛЧАНИЮ (для первого входа)
-- ============================================================
INSERT OR IGNORE INTO admins (id, email, username, password_hash, role)
VALUES (
  lower(hex(randomblob(16))),
  'admin@tajik-opportunities.com',
  'admin',
  '$2b$10$YOUR_HASH_HERE', -- Замените на реальный хеш пароля
  'super_admin'
);
