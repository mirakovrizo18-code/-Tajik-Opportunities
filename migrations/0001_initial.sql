-- ============================================================
-- TAJIK OPPORTUNITIES — INITIAL DATABASE
-- ============================================================

-- ============================================================
-- ЗАЯВКИ ОТ УЧАСТНИКОВ
-- ============================================================

CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  link_url TEXT,
  contact TEXT,
  author_name TEXT,
  tracking_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  created_at TEXT NOT NULL,
  reviewed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_submissions_status_created
ON submissions(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_submissions_tracking_code
ON submissions(tracking_code);


-- ============================================================
-- ОПУБЛИКОВАННЫЕ МАТЕРИАЛЫ
-- ============================================================

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  link_url TEXT,
  contact TEXT,
  author_name TEXT,
  published_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_posts_published
ON posts(published_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_category
ON posts(category);


-- ============================================================
-- КОНЕЦ МИГРАЦИИ
-- ============================================================
