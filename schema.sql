CREATE TABLE IF NOT EXISTS urls (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    views INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS signed_cdn (
    token TEXT PRIMARY KEY,
    target_url TEXT NOT NULL,
    filename TEXT,
    custom_headers TEXT,
    max_bytes INTEGER DEFAULT 524288000,
    hits INTEGER DEFAULT 0,
    download_bytes INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    expired_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS stats (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

INSERT OR IGNORE INTO stats (key, value) VALUES 
('stats:total_files', '0'),
('stats:total_files_size', '0'),
('stats:total_shorts', '0'),
('stats:total_views', '0'),
('stats:total_proxied', '0'),
('stats:total_download_size', '0'),
('stats:total_hits', '0');

CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_private INTEGER DEFAULT 0,
    reads INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);
