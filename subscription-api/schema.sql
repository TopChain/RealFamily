CREATE SCHEMA IF NOT EXISTS realfamily;
CREATE TABLE IF NOT EXISTS realfamily.subscribers (
 email text PRIMARY KEY, topics text[] NOT NULL,
 active boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now(),
 confirmed_at timestamptz, unsubscribe_hash text UNIQUE
);
CREATE TABLE IF NOT EXISTS realfamily.subscription_requests (
 token_hash text PRIMARY KEY, email text NOT NULL, topics text[] NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL,
 used_at timestamptz
);
CREATE INDEX IF NOT EXISTS subscription_requests_email ON realfamily.subscription_requests(email,created_at);
CREATE TABLE IF NOT EXISTS realfamily.mail_outbox (
 id bigserial PRIMARY KEY, recipient text NOT NULL, kind text NOT NULL CHECK(kind IN ('confirmation','digest')),
 subject text NOT NULL, html text NOT NULL, dedupe_key text UNIQUE NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), sent_at timestamptz, gmail_message_id text,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','sending','sent','uncertain','expired')),
 lease_id text, lease_at timestamptz
);
CREATE TABLE IF NOT EXISTS realfamily.subscription_preferences (
 email text PRIMARY KEY REFERENCES realfamily.subscribers(email),unsubscribe_url text NOT NULL
);
