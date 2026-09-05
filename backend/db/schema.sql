-- Run this once against your PostgreSQL database to set up all tables.
-- Compatible with Supabase, Railway, Render, and local PostgreSQL.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE TABLE IF NOT EXISTS organisations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(),name VARCHAR(255) NOT NULL,admin_email VARCHAR(255),admin_name VARCHAR(255),approved BOOLEAN NOT NULL DEFAULT false,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(),name VARCHAR(255) NOT NULL,email VARCHAR(255) UNIQUE NOT NULL,password_hash VARCHAR(255) NOT NULL,role VARCHAR(50) NOT NULL DEFAULT 'user',org_id UUID REFERENCES organisations(id) ON DELETE SET NULL,approved BOOLEAN NOT NULL DEFAULT true,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);CREATE INDEX IF NOT EXISTS idx_users_org_id ON users(org_id);
CREATE TABLE IF NOT EXISTS checkins (id UUID PRIMARY KEY DEFAULT gen_random_uuid(),user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,date DATE NOT NULL,score INTEGER,raw INTEGER,depression INTEGER,anxiety INTEGER,tier VARCHAR(50),answers JSONB,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),UNIQUE(user_id,date));
CREATE INDEX IF NOT EXISTS idx_checkins_user_id ON checkins(user_id);CREATE INDEX IF NOT EXISTS idx_checkins_date ON checkins(date);
CREATE TABLE IF NOT EXISTS posts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(),author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,anonymous BOOLEAN NOT NULL DEFAULT false,title VARCHAR(255) NOT NULL,body TEXT NOT NULL DEFAULT '',category VARCHAR(50) NOT NULL DEFAULT 'general',flair VARCHAR(100) NOT NULL DEFAULT '',upvotes INTEGER NOT NULL DEFAULT 0,comment_count INTEGER NOT NULL DEFAULT 0,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE TABLE IF NOT EXISTS post_upvotes (user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,PRIMARY KEY(user_id,post_id));
CREATE TABLE IF NOT EXISTS comments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(),post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,anonymous BOOLEAN NOT NULL DEFAULT false,body TEXT NOT NULL,upvotes INTEGER NOT NULL DEFAULT 0,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE TABLE IF NOT EXISTS comment_upvotes (user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,PRIMARY KEY(user_id,comment_id));

-- Privacy-safe organization identity and support workflow.
ALTER TABLE users ADD COLUMN IF NOT EXISTS member_code VARCHAR(14) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS directory_visible BOOLEAN NOT NULL DEFAULT true;
CREATE TABLE IF NOT EXISTS support_requests (id BIGSERIAL PRIMARY KEY,user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,status VARCHAR(24) NOT NULL DEFAULT 'requested',reason VARCHAR(80),created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS support_messages (id BIGSERIAL PRIMARY KEY,request_id BIGINT NOT NULL REFERENCES support_requests(id) ON DELETE CASCADE,sender_role VARCHAR(24) NOT NULL,message TEXT NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE INDEX IF NOT EXISTS idx_support_requests_user ON support_requests(user_id,updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_messages_request ON support_messages(request_id,created_at);
