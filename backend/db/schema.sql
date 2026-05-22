-- Run this once against your PostgreSQL database to set up all tables.
-- Compatible with Supabase, Railway, Render, and local PostgreSQL.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Organisations ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS organisations (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(255) NOT NULL,
  admin_email  VARCHAR(255),
  admin_name   VARCHAR(255),
  approved     BOOLEAN      NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── Users ─────────────────────────────────────────────────────────────────
-- role: 'user' | 'org_admin' | 'org_admin_pending' | 'superadmin' | 'rejected'
CREATE TABLE IF NOT EXISTS users (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(50)  NOT NULL DEFAULT 'user',
  org_id        UUID         REFERENCES organisations(id) ON DELETE SET NULL,
  approved      BOOLEAN      NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email  ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_org_id ON users(org_id);

-- ─── Check-ins ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS checkins (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date        DATE        NOT NULL,
  score       INTEGER,       -- wellness score 0-100
  raw         INTEGER,       -- raw PHQ+GAD score 0-30
  depression  INTEGER,       -- PHQ sub-score
  anxiety     INTEGER,       -- GAD sub-score
  tier        VARCHAR(50),
  answers     JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)      -- one check-in per user per day
);

CREATE INDEX IF NOT EXISTS idx_checkins_user_id ON checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_date    ON checkins(date);

-- ─── Community Posts ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  anonymous     BOOLEAN      NOT NULL DEFAULT false,
  title         VARCHAR(255) NOT NULL,
  body          TEXT         NOT NULL DEFAULT '',
  category      VARCHAR(50)  NOT NULL DEFAULT 'general',
  flair         VARCHAR(100) NOT NULL DEFAULT '',
  upvotes       INTEGER      NOT NULL DEFAULT 0,
  comment_count INTEGER      NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_author_id  ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_category   ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- ─── Post Upvotes ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS post_upvotes (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, post_id)
);

-- ─── Comments ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id  UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  anonymous  BOOLEAN     NOT NULL DEFAULT false,
  body       TEXT        NOT NULL,
  upvotes    INTEGER     NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);

-- ─── Comment Upvotes ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comment_upvotes (
  user_id    UUID NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, comment_id)
);
