CREATE TABLE IF NOT EXISTS realfamily.whatsapp_state (
 name text PRIMARY KEY CHECK(name IN ('auth','routes')),
 encrypted text NOT NULL, updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS realfamily.whatsapp_deliveries (
 lesson_id text PRIMARY KEY, destination_hash text NOT NULL,
 status text NOT NULL CHECK(status IN ('sending','sent','uncertain')),
 message_id text, created_at timestamptz NOT NULL DEFAULT now(), sent_at timestamptz
);
GRANT SELECT,INSERT,UPDATE ON realfamily.whatsapp_state,realfamily.whatsapp_deliveries TO realfamily_app;
