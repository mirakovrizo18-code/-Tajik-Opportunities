-- ============================================================
-- 🇹🇯 TAJIK OPPORTUNITIES
-- REVIEW / RATING / REACTION SYSTEM
-- Version: 2026.09
--
-- Полноценная система:
-- • отзывы
-- • рейтинг 1–5
-- • анонимные отзывы
-- • подтверждённые отзывы
-- • ответы
-- • реакции
-- • полезность
-- • жалобы
-- • модерация
-- • история изменений
-- • аудит
-- • статистика
-- • огромные счётчики через TEXT
-- ============================================================


PRAGMA foreign_keys = ON;


-- ============================================================
-- 1. REVIEWS
-- ============================================================

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,

  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,

  publication_id TEXT,
  profile_id TEXT,
  organization_id TEXT,

  author_id TEXT,
  visitor_id TEXT,
  session_id TEXT,

  author_name TEXT,
  author_mode TEXT NOT NULL DEFAULT 'public',

  type TEXT NOT NULL DEFAULT 'standard',
  source TEXT NOT NULL DEFAULT 'web',

  rating INTEGER NOT NULL,

  title TEXT,
  text TEXT NOT NULL,

  status TEXT NOT NULL DEFAULT 'pending',

  verification_type TEXT NOT NULL DEFAULT 'none',
  verified INTEGER NOT NULL DEFAULT 0,

  helpful_count TEXT NOT NULL DEFAULT '0',
  not_helpful_count TEXT NOT NULL DEFAULT '0',

  reactions_count TEXT NOT NULL DEFAULT '0',
  replies_count TEXT NOT NULL DEFAULT '0',
  reports_count TEXT NOT NULL DEFAULT '0',
  views_count TEXT NOT NULL DEFAULT '0',

  pinned INTEGER NOT NULL DEFAULT 0,
  featured INTEGER NOT NULL DEFAULT 0,
  locked INTEGER NOT NULL DEFAULT 0,

  moderation_reason TEXT,
  rejection_reason TEXT,

  moderated_by TEXT,
  moderated_at TEXT,

  published_at TEXT,

  edited_at TEXT,
  deleted_at TEXT,

  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,

  CHECK (rating >= 1 AND rating <= 5),
  CHECK (verified IN (0, 1)),
  CHECK (pinned IN (0, 1)),
  CHECK (featured IN (0, 1)),
  CHECK (locked IN (0, 1))
);


-- ============================================================
-- 2. REVIEW HISTORY
-- ============================================================

CREATE TABLE IF NOT EXISTS review_history (
  id TEXT PRIMARY KEY,

  review_id TEXT NOT NULL,

  action TEXT NOT NULL,

  old_status TEXT,
  new_status TEXT,

  old_rating INTEGER,
  new_rating INTEGER,

  old_title TEXT,
  new_title TEXT,

  old_text TEXT,
  new_text TEXT,

  changed_fields TEXT,

  reason TEXT,

  actor_id TEXT,
  actor_type TEXT NOT NULL DEFAULT 'system',

  metadata TEXT,

  created_at TEXT NOT NULL,

  FOREIGN KEY (review_id)
    REFERENCES reviews(id)
    ON DELETE CASCADE,

  CHECK (
    old_rating IS NULL
    OR (old_rating >= 1 AND old_rating <= 5)
  ),

  CHECK (
    new_rating IS NULL
    OR (new_rating >= 1 AND new_rating <= 5)
  )
);


-- ============================================================
-- 3. REVIEW REACTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS review_reactions (
  id TEXT PRIMARY KEY,

  review_id TEXT NOT NULL,

  reaction_type_id TEXT NOT NULL,

  user_id TEXT,
  visitor_id TEXT,
  session_id TEXT,

  created_at TEXT NOT NULL,
  updated_at TEXT,

  FOREIGN KEY (review_id)
    REFERENCES reviews(id)
    ON DELETE CASCADE,

  FOREIGN KEY (reaction_type_id)
    REFERENCES reaction_types(id)
    ON DELETE RESTRICT
);


-- ============================================================
-- 4. REVIEW REPORTS
-- ============================================================

CREATE TABLE IF NOT EXISTS review_reports (
  id TEXT PRIMARY KEY,

  review_id TEXT NOT NULL,

  reporter_id TEXT,
  visitor_id TEXT,
  session_id TEXT,

  type TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal',

  reason TEXT,
  details TEXT,

  status TEXT NOT NULL DEFAULT 'pending',

  handled_by TEXT,
  handled_at TEXT,

  resolution TEXT,

  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,

  FOREIGN KEY (review_id)
    REFERENCES reviews(id)
    ON DELETE CASCADE
);


-- ============================================================
-- 5. REVIEW REPORT HISTORY
-- ============================================================

CREATE TABLE IF NOT EXISTS review_report_history (
  id TEXT PRIMARY KEY,

  report_id TEXT NOT NULL,

  old_status TEXT,
  new_status TEXT,

  old_priority TEXT,
  new_priority TEXT,

  action TEXT NOT NULL,

  reason TEXT,

  actor_id TEXT,
  actor_type TEXT NOT NULL DEFAULT 'system',

  metadata TEXT,

  created_at TEXT NOT NULL,

  FOREIGN KEY (report_id)
    REFERENCES review_reports(id)
    ON DELETE CASCADE
);


-- ============================================================
-- 6. REVIEW REPLIES
-- ============================================================

CREATE TABLE IF NOT EXISTS review_replies (
  id TEXT PRIMARY KEY,

  review_id TEXT NOT NULL,

  author_id TEXT,
  visitor_id TEXT,

  author_name TEXT,
  author_mode TEXT NOT NULL DEFAULT 'public',

  text TEXT NOT NULL,

  status TEXT NOT NULL DEFAULT 'published',

  reactions_count TEXT NOT NULL DEFAULT '0',
  reports_count TEXT NOT NULL DEFAULT '0',

  pinned INTEGER NOT NULL DEFAULT 0,

  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,

  edited_at TEXT,
  deleted_at TEXT,

  FOREIGN KEY (review_id)
    REFERENCES reviews(id)
    ON DELETE CASCADE,

  CHECK (pinned IN (0, 1))
);


-- ============================================================
-- 7. REVIEW REPLY REACTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS review_reply_reactions (
  id TEXT PRIMARY KEY,

  reply_id TEXT NOT NULL,

  reaction_type_id TEXT NOT NULL,

  user_id TEXT,
  visitor_id TEXT,
  session_id TEXT,

  created_at TEXT NOT NULL,
  updated_at TEXT,

  FOREIGN KEY (reply_id)
    REFERENCES review_replies(id)
    ON DELETE CASCADE,

  FOREIGN KEY (reaction_type_id)
    REFERENCES reaction_types(id)
    ON DELETE RESTRICT
);


-- ============================================================
-- 8. REVIEW REPLY REPORTS
-- ============================================================

CREATE TABLE IF NOT EXISTS review_reply_reports (
  id TEXT PRIMARY KEY,

  reply_id TEXT NOT NULL,

  reporter_id TEXT,
  visitor_id TEXT,
  session_id TEXT,

  type TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal',

  reason TEXT,
  details TEXT,

  status TEXT NOT NULL DEFAULT 'pending',

  handled_by TEXT,
  handled_at TEXT,

  resolution TEXT,

  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,

  FOREIGN KEY (reply_id)
    REFERENCES review_replies(id)
    ON DELETE CASCADE
);


-- ============================================================
-- 9. REVIEW HELPFUL VOTES
-- ============================================================

CREATE TABLE IF NOT EXISTS review_helpful_votes (
  id TEXT PRIMARY KEY,

  review_id TEXT NOT NULL,

  user_id TEXT,
  visitor_id TEXT,
  session_id TEXT,

  value INTEGER NOT NULL,

  created_at TEXT NOT NULL,
  updated_at TEXT,

  FOREIGN KEY (review_id)
    REFERENCES reviews(id)
    ON DELETE CASCADE,

  CHECK (value IN (-1, 1))
);


-- ============================================================
-- 10. REVIEW VIEWS
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


-- ============================================================
-- 11. REVIEW METRICS
--
-- Все значения TEXT.
-- Это позволяет хранить:
--
-- 999999999999999999999
-- 999999999999999999999999999999
-- и другие значения, превышающие INTEGER SQLite.
-- ============================================================

CREATE TABLE IF NOT EXISTS review_metrics (
  id TEXT PRIMARY KEY,

  review_id TEXT,

  target_type TEXT,
  target_id TEXT,

  metric TEXT NOT NULL,

  value TEXT NOT NULL DEFAULT '0',

  period_start TEXT,
  period_end TEXT,

  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,

  FOREIGN KEY (review_id)
    REFERENCES reviews(id)
    ON DELETE CASCADE
);


-- ============================================================
-- 12. TARGET RATING SUMMARIES
--
-- Кэшированная агрегация рейтинга.
-- Все числовые значения хранятся как TEXT.
-- ============================================================

CREATE TABLE IF NOT EXISTS review_rating_summaries (
  id TEXT PRIMARY KEY,

  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,

  reviews_count TEXT NOT NULL DEFAULT '0',
  ratings_count TEXT NOT NULL DEFAULT '0',

  rating_sum TEXT NOT NULL DEFAULT '0',

  rating_average TEXT NOT NULL DEFAULT '0',

  rating_1 TEXT NOT NULL DEFAULT '0',
  rating_2 TEXT NOT NULL DEFAULT '0',
  rating_3 TEXT NOT NULL DEFAULT '0',
  rating_4 TEXT NOT NULL DEFAULT '0',
  rating_5 TEXT NOT NULL DEFAULT '0',

  verified_reviews_count TEXT NOT NULL DEFAULT '0',

  helpful_count TEXT NOT NULL DEFAULT '0',
  reactions_count TEXT NOT NULL DEFAULT '0',
  replies_count TEXT NOT NULL DEFAULT '0',
  reports_count TEXT NOT NULL DEFAULT '0',

  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,

  UNIQUE(target_type, target_id)
);


-- ============================================================
-- 13. REVIEW EVENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS review_events (
  id TEXT PRIMARY KEY,

  review_id TEXT NOT NULL,

  event TEXT NOT NULL,

  actor_id TEXT,
  actor_type TEXT NOT NULL DEFAULT 'system',

  metadata TEXT,

  created_at TEXT NOT NULL,

  FOREIGN KEY (review_id)
    REFERENCES reviews(id)
    ON DELETE CASCADE
);


-- ============================================================
-- 14. REVIEW MODERATION LOCKS
-- ============================================================

CREATE TABLE IF NOT EXISTS review_moderation_locks (
  review_id TEXT PRIMARY KEY,

  admin_id TEXT NOT NULL,

  locked_at TEXT NOT NULL,

  expires_at TEXT,

  FOREIGN KEY (review_id)
    REFERENCES reviews(id)
    ON DELETE CASCADE
);


-- ============================================================
-- 15. REVIEW ADMIN NOTES
-- ============================================================

CREATE TABLE IF NOT EXISTS review_admin_notes (
  id TEXT PRIMARY KEY,

  review_id TEXT NOT NULL,

  admin_id TEXT NOT NULL,

  note TEXT NOT NULL,

  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,

  FOREIGN KEY (review_id)
    REFERENCES reviews(id)
    ON DELETE CASCADE
);


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_reviews_target
ON reviews(target_type, target_id);

CREATE INDEX IF NOT EXISTS idx_reviews_publication
ON reviews(publication_id);

CREATE INDEX IF NOT EXISTS idx_reviews_profile
ON reviews(profile_id);

CREATE INDEX IF NOT EXISTS idx_reviews_organization
ON reviews(organization_id);

CREATE INDEX IF NOT EXISTS idx_reviews_author
ON reviews(author_id);

CREATE INDEX IF NOT EXISTS idx_reviews_visitor
ON reviews(visitor_id);

CREATE INDEX IF NOT EXISTS idx_reviews_session
ON reviews(session_id);

CREATE INDEX IF NOT EXISTS idx_reviews_status
ON reviews(status);

CREATE INDEX IF NOT EXISTS idx_reviews_rating
ON reviews(rating);

CREATE INDEX IF NOT EXISTS idx_reviews_verified
ON reviews(verified);

CREATE INDEX IF NOT EXISTS idx_reviews_created
ON reviews(created_at);

CREATE INDEX IF NOT EXISTS idx_reviews_updated
ON reviews(updated_at);

CREATE INDEX IF NOT EXISTS idx_reviews_published
ON reviews(published_at);

CREATE INDEX IF NOT EXISTS idx_reviews_pinned
ON reviews(pinned);

CREATE INDEX IF NOT EXISTS idx_reviews_featured
ON reviews(featured);

CREATE INDEX IF NOT EXISTS idx_reviews_reports
ON reviews(reports_count);

CREATE INDEX IF NOT EXISTS idx_reviews_reactions
ON reviews(reactions_count);

CREATE INDEX IF NOT EXISTS idx_review_history_review
ON review_history(review_id);

CREATE INDEX IF NOT EXISTS idx_review_history_created
ON review_history(created_at);

CREATE INDEX IF NOT EXISTS idx_review_reactions_review
ON review_reactions(review_id);

CREATE INDEX IF NOT EXISTS idx_review_reactions_type
ON review_reactions(reaction_type_id);

CREATE INDEX IF NOT EXISTS idx_review_reports_review
ON review_reports(review_id);

CREATE INDEX IF NOT EXISTS idx_review_reports_status
ON review_reports(status);

CREATE INDEX IF NOT EXISTS idx_review_reports_priority
ON review_reports(priority);

CREATE INDEX IF NOT EXISTS idx_review_reports_created
ON review_reports(created_at);

CREATE INDEX IF NOT EXISTS idx_review_replies_review
ON review_replies(review_id);

CREATE INDEX IF NOT EXISTS idx_review_replies_status
ON review_replies(status);

CREATE INDEX IF NOT EXISTS idx_review_replies_created
ON review_replies(created_at);

CREATE INDEX IF NOT EXISTS idx_review_reply_reactions_reply
ON review_reply_reactions(reply_id);

CREATE INDEX IF NOT EXISTS idx_review_reply_reports_reply
ON review_reply_reports(reply_id);

CREATE INDEX IF NOT EXISTS idx_review_helpful_review
ON review_helpful_votes(review_id);

CREATE INDEX IF NOT EXISTS idx_review_helpful_user
ON review_helpful_votes(user_id);

CREATE INDEX IF NOT EXISTS idx_review_helpful_visitor
ON review_helpful_votes(visitor_id);

CREATE INDEX IF NOT EXISTS idx_review_views_review
ON review_views(review_id);

CREATE INDEX IF NOT EXISTS idx_review_views_created
ON review_views(created_at);

CREATE INDEX IF NOT EXISTS idx_review_metrics_review
ON review_metrics(review_id);

CREATE INDEX IF NOT EXISTS idx_review_metrics_target
ON review_metrics(target_type, target_id);

CREATE INDEX IF NOT EXISTS idx_review_metrics_metric
ON review_metrics(metric);

CREATE INDEX IF NOT EXISTS idx_review_rating_summary_target
ON review_rating_summaries(target_type, target_id);

CREATE INDEX IF NOT EXISTS idx_review_events_review
ON review_events(review_id);

CREATE INDEX IF NOT EXISTS idx_review_events_created
ON review_events(created_at);

CREATE INDEX IF NOT EXISTS idx_review_locks_admin
ON review_moderation_locks(admin_id);

CREATE INDEX IF NOT EXISTS idx_review_notes_review
ON review_admin_notes(review_id);

CREATE INDEX IF NOT EXISTS idx_review_notes_admin
ON review_admin_notes(admin_id);


-- ============================================================
-- UNIQUE / IDEMPOTENCY INDEXES
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS
idx_review_reactions_unique_user
ON review_reactions(
  review_id,
  reaction_type_id,
  user_id
)
WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS
idx_review_reactions_unique_visitor
ON review_reactions(
  review_id,
  reaction_type_id,
  visitor_id
)
WHERE visitor_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS
idx_review_reactions_unique_session
ON review_reactions(
  review_id,
  reaction_type_id,
  session_id
)
WHERE session_id IS NOT NULL;


CREATE UNIQUE INDEX IF NOT EXISTS
idx_review_helpful_unique_user
ON review_helpful_votes(
  review_id,
  user_id
)
WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS
idx_review_helpful_unique_visitor
ON review_helpful_votes(
  review_id,
  visitor_id
)
WHERE visitor_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS
idx_review_helpful_unique_session
ON review_helpful_votes(
  review_id,
  session_id
)
WHERE session_id IS NOT NULL;


-- ============================================================
-- REVIEW STATUS SAFETY TRIGGERS
-- ============================================================

CREATE TRIGGER IF NOT EXISTS trg_reviews_rating_insert
BEFORE INSERT ON reviews
WHEN NEW.rating < 1 OR NEW.rating > 5
BEGIN
  SELECT RAISE(
    ABORT,
    'Review rating must be between 1 and 5'
  );
END;


CREATE TRIGGER IF NOT EXISTS trg_reviews_rating_update
BEFORE UPDATE OF rating ON reviews
WHEN NEW.rating < 1 OR NEW.rating > 5
BEGIN
  SELECT RAISE(
    ABORT,
    'Review rating must be between 1 and 5'
  );
END;


-- ============================================================
-- AUTOMATIC UPDATED_AT
-- ============================================================

CREATE TRIGGER IF NOT EXISTS trg_reviews_updated_at
AFTER UPDATE ON reviews
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE reviews
  SET updated_at = datetime('now')
  WHERE id = NEW.id;
END;


CREATE TRIGGER IF NOT EXISTS trg_review_replies_updated_at
AFTER UPDATE ON review_replies
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE review_replies
  SET updated_at = datetime('now')
  WHERE id = NEW.id;
END;


CREATE TRIGGER IF NOT EXISTS trg_review_reports_updated_at
AFTER UPDATE ON review_reports
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE review_reports
  SET updated_at = datetime('now')
  WHERE id = NEW.id;
END;


-- ============================================================
-- PUBLICATION REVIEW COUNTER
--
-- Синхронизация выполняется приложением.
-- Здесь НЕ используется INTEGER counter.
-- ============================================================

-- Важно:
-- publication_metrics в старой схеме может содержать INTEGER.
-- Новая review-система не увеличивает его напрямую через SQL,
-- чтобы не потерять значения, превышающие SQLite INTEGER.


-- ============================================================
-- DEFAULT RATING SUMMARY HELPER VIEW
-- ============================================================

CREATE VIEW IF NOT EXISTS review_rating_summary_view AS
SELECT
  target_type,
  target_id,

  reviews_count,
  ratings_count,
  rating_sum,
  rating_average,

  rating_1,
  rating_2,
  rating_3,
  rating_4,
  rating_5,

  verified_reviews_count,

  helpful_count,
  reactions_count,
  replies_count,
  reports_count,

  created_at,
  updated_at

FROM review_rating_summaries;


-- ============================================================
-- MODERATION QUEUE VIEW
-- ============================================================

CREATE VIEW IF NOT EXISTS review_moderation_queue_view AS
SELECT
  r.id,
  r.target_type,
  r.target_id,

  r.author_id,
  r.author_name,
  r.author_mode,

  r.rating,
  r.title,
  r.text,

  r.status,
  r.verified,

  r.reports_count,
  r.reactions_count,
  r.replies_count,

  r.created_at,
  r.updated_at,

  CASE
    WHEN r.status = 'pending'
      THEN 1

    WHEN r.status = 'spam'
      THEN 2

    WHEN r.reports_count != '0'
      THEN 3

    ELSE 4
  END AS moderation_priority

FROM reviews r

WHERE r.status IN (
  'pending',
  'spam',
  'hidden'
);


-- ============================================================
-- END OF REVIEW DATABASE MODULE
-- ============================================================
