-- TAJIK OPPORTUNITIES - СХЕМА БАЗЫ ДАННЫХ

CREATE TABLE IF NOT EXISTS to_participants (
    id TEXT PRIMARY KEY,
    nickname TEXT,
    is_blocked BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS to_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT,
    type TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    parent_id TEXT,
    FOREIGN KEY (parent_id) REFERENCES to_categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS to_publications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    category_id TEXT NOT NULL,
    participant_id TEXT NOT NULL,
    city TEXT,
    status TEXT DEFAULT 'pending',
    views INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT 0,
    is_pinned BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES to_categories(id),
    FOREIGN KEY (participant_id) REFERENCES to_participants(id)
);

CREATE TABLE IF NOT EXISTS to_publication_meta (
    publication_id TEXT NOT NULL,
    meta_key TEXT NOT NULL,
    meta_value TEXT,
    FOREIGN KEY (publication_id) REFERENCES to_publications(id) ON DELETE CASCADE,
    PRIMARY KEY (publication_id, meta_key)
);

CREATE TABLE IF NOT EXISTS to_media (
    id TEXT PRIMARY KEY,
    publication_id TEXT,
    url TEXT NOT NULL,
    type TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (publication_id) REFERENCES to_publications(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS to_reactions (
    id TEXT PRIMARY KEY,
    publication_id TEXT NOT NULL,
    participant_id TEXT NOT NULL,
    type TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(publication_id, participant_id, type),
    FOREIGN KEY (publication_id) REFERENCES to_publications(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS to_comments (
    id TEXT PRIMARY KEY,
    publication_id TEXT NOT NULL,
    participant_id TEXT NOT NULL,
    content TEXT NOT NULL,
    parent_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (publication_id) REFERENCES to_publications(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES to_comments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS to_saves (
    id TEXT PRIMARY KEY,
    publication_id TEXT NOT NULL,
    participant_id TEXT NOT NULL,
    collection TEXT DEFAULT 'default',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(publication_id, participant_id),
    FOREIGN KEY (publication_id) REFERENCES to_publications(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS to_reports (
    id TEXT PRIMARY KEY,
    publication_id TEXT,
    comment_id TEXT,
    participant_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (publication_id) REFERENCES to_publications(id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES to_comments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS to_chat_messages (
    id TEXT PRIMARY KEY,
    sender_id TEXT NOT NULL,
    receiver_id TEXT,
    content TEXT NOT NULL,
    is_from_admin BOOLEAN DEFAULT 0,
    is_read BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS to_notifications (
    id TEXT PRIMARY KEY,
    participant_id TEXT NOT NULL,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (participant_id) REFERENCES to_participants(id)
);

CREATE TABLE IF NOT EXISTS to_products (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category_id TEXT NOT NULL,
    participant_id TEXT NOT NULL,
    price DECIMAL(15,2),
    currency TEXT DEFAULT 'TJS',
    status TEXT DEFAULT 'published',
    city TEXT,
    condition TEXT,
    views INTEGER DEFAULT 0,
    favorites INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES to_categories(id),
    FOREIGN KEY (participant_id) REFERENCES to_participants(id)
);

CREATE TABLE IF NOT EXISTS to_product_meta (
    product_id TEXT NOT NULL,
    meta_key TEXT NOT NULL,
    meta_value TEXT,
    FOREIGN KEY (product_id) REFERENCES to_products(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, meta_key)
);

CREATE TABLE IF NOT EXISTS to_services (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category_id TEXT NOT NULL,
    participant_id TEXT NOT NULL,
    price DECIMAL(15,2),
    currency TEXT DEFAULT 'TJS',
    unit TEXT,
    format TEXT,
    city TEXT,
    status TEXT DEFAULT 'published',
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES to_categories(id),
    FOREIGN KEY (participant_id) REFERENCES to_participants(id)
);

CREATE TABLE IF NOT EXISTS to_organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    type TEXT NOT NULL,
    city TEXT,
    website TEXT,
    is_verified BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS to_communities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    privacy TEXT DEFAULT 'public',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS to_ad_campaigns (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    content TEXT,
    image_url TEXT,
    link_url TEXT,
    status TEXT DEFAULT 'draft',
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS to_audit_log (
    id TEXT PRIMARY KEY,
    admin_action TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS to_settings (
    id TEXT PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_publications_category ON to_publications(category_id);
CREATE INDEX idx_publications_status ON to_publications(status);
CREATE INDEX idx_publications_created ON to_publications(created_at DESC);
CREATE INDEX idx_reactions_publication ON to_reactions(publication_id);
CREATE INDEX idx_comments_publication ON to_comments(publication_id);
CREATE INDEX idx_products_category ON to_products(category_id);
CREATE INDEX idx_notifications_participant ON to_notifications(participant_id);

INSERT OR IGNORE INTO to_categories (id, name, slug, icon, type, sort_order) VALUES
('cat-news', 'Новости', 'news', '📰', 'publication', 1),
('cat-jobs', 'Работа', 'jobs', '💼', 'publication', 2),
('cat-education', 'Образование', 'education', '🎓', 'publication', 3),
('cat-marketplace', 'Торговля', 'marketplace', '🛍', 'product', 4),
('cat-services', 'Услуги', 'services', '🤝', 'service', 5),
('cat-events', 'Мероприятия', 'events', '📅', 'publication', 6),
('cat-grants', 'Гранты', 'grants', '💰', 'publication', 7),
('cat-startups', 'Стартапы', 'startups', '🚀', 'publication', 8);

INSERT OR IGNORE INTO to_settings (id, setting_key, setting_value) VALUES
('set-site-name', 'site_name', 'Tajik Opportunities'),
('set-theme', 'theme', 'light'),
('set-moderation', 'moderation_enabled', '1');
