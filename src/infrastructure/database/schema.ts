export const databaseSchema = `
CREATE TABLE IF NOT EXISTS app_metadata (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS markets (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  address TEXT NULL,
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS market_sections (
  id TEXT PRIMARY KEY NOT NULL,
  market_id TEXT NOT NULL,
  name TEXT NOT NULL,
  route_order INTEGER NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (market_id) REFERENCES markets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_categories (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  default_section_name TEXT NOT NULL,
  keywords_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS shopping_lists (
  id TEXT PRIMARY KEY NOT NULL,
  market_id TEXT NOT NULL,
  name TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (market_id) REFERENCES markets(id)
);

CREATE TABLE IF NOT EXISTS shopping_list_items (
  id TEXT PRIMARY KEY NOT NULL,
  list_id TEXT NOT NULL,
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  quantity TEXT NULL,
  section_name TEXT NOT NULL,
  category_id TEXT NULL,
  is_purchased INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (list_id) REFERENCES shopping_lists(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_product_preferences (
  id TEXT PRIMARY KEY NOT NULL,
  product_normalized_name TEXT NOT NULL,
  preferred_section_name TEXT NOT NULL,
  market_id TEXT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_product_preferences_lookup
ON user_product_preferences (product_normalized_name, market_id);
`;
