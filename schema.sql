-- ICP Research Table
CREATE TABLE IF NOT EXISTS icp_research (
  id TEXT PRIMARY KEY,
  product_description TEXT NOT NULL,
  website TEXT,
  personas TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Angles Table
CREATE TABLE IF NOT EXISTS angles (
  id TEXT PRIMARY KEY,
  icp_research_id TEXT NOT NULL,
  angles TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (icp_research_id) REFERENCES icp_research(id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_angles_research_id ON angles(icp_research_id);
CREATE INDEX IF NOT EXISTS idx_research_created ON icp_research(created_at);
