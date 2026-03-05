-- Creator Profiles Table
CREATE TABLE IF NOT EXISTS creator_profiles (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  name TEXT,
  about TEXT,
  avatar TEXT,
  header TEXT,
  website TEXT,
  platform TEXT DEFAULT 'onlyfans',
  subscribers_count INTEGER DEFAULT 0,
  medias_count INTEGER DEFAULT 0,
  videos_count INTEGER DEFAULT 0,
  photos_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  subscribe_price TEXT,
  join_date TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  raw_data JSONB,
  personas JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ICP Research Table
CREATE TABLE IF NOT EXISTS icp_research (
  id TEXT PRIMARY KEY,
  product_description TEXT NOT NULL,
  website TEXT,
  personas JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Angles Table
CREATE TABLE IF NOT EXISTS angles (
  id TEXT PRIMARY KEY,
  icp_research_id TEXT REFERENCES icp_research(id),
  creator_profile_id TEXT REFERENCES creator_profiles(id),
  angles JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Creator Domain Configs Table
CREATE TABLE IF NOT EXISTS creator_domain_configs (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL UNIQUE REFERENCES creator_profiles(id),
  primary_domain TEXT,
  edge_domain TEXT,
  auto_address_provider TEXT DEFAULT 'ipostal1',
  business_email TEXT,
  business_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Landing Pages Table
CREATE TABLE IF NOT EXISTS landing_pages (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL REFERENCES creator_profiles(id),
  persona_id TEXT,
  persona_name TEXT,
  slug TEXT NOT NULL,
  full_path TEXT,
  type TEXT NOT NULL,
  spec JSONB NOT NULL,
  meta_safe BOOLEAN DEFAULT TRUE,
  html_content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_creator_username ON creator_profiles(username);
CREATE INDEX IF NOT EXISTS idx_angles_research_id ON angles(icp_research_id);
CREATE INDEX IF NOT EXISTS idx_angles_creator_id ON angles(creator_profile_id);
CREATE INDEX IF NOT EXISTS idx_research_created ON icp_research(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_created ON creator_profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_domain_creator ON creator_domain_configs(creator_id);
CREATE INDEX IF NOT EXISTS idx_landing_creator ON landing_pages(creator_id);
CREATE INDEX IF NOT EXISTS idx_landing_slug ON landing_pages(slug);
