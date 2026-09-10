-- IOCMS database schema
-- Mirrors the TypeScript types in Frontend/src/types/index.ts

CREATE TABLE IF NOT EXISTS departments (
  id   TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('System Admin','Head Office','Director','Team Leader','Employee')),
  department_id TEXT NOT NULL REFERENCES departments(id),
  title         TEXT NOT NULL,
  avatar_color  TEXT NOT NULL DEFAULT '#2A4F97',
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  online        BOOLEAN NOT NULL DEFAULT false,
  phone         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Direct message threads (between exactly two users)
CREATE TABLE IF NOT EXISTS direct_threads (
  id             TEXT PRIMARY KEY,
  user_a_id      TEXT NOT NULL REFERENCES users(id),
  user_b_id      TEXT NOT NULL REFERENCES users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_a_id, user_b_id)
);

CREATE TABLE IF NOT EXISTS channels (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  description  TEXT,
  department_id TEXT REFERENCES departments(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS channel_members (
  channel_id TEXT NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (channel_id, user_id)
);

-- Unified messages table: either thread_id or channel_id is set
CREATE TABLE IF NOT EXISTS messages (
  id          TEXT PRIMARY KEY,
  thread_id   TEXT REFERENCES direct_threads(id) ON DELETE CASCADE,
  channel_id  TEXT REFERENCES channels(id) ON DELETE CASCADE,
  sender_id   TEXT NOT NULL REFERENCES users(id),
  body        TEXT NOT NULL,
  attachment  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    (thread_id IS NOT NULL AND channel_id IS NULL) OR
    (thread_id IS NULL AND channel_id IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS message_reads (
  message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  read_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (message_id, user_id)
);

CREATE TABLE IF NOT EXISTS memos (
  id           TEXT PRIMARY KEY,
  reference    TEXT NOT NULL UNIQUE,
  type         TEXT NOT NULL CHECK (type IN ('Official Memo','Circular','Notice','Directive')),
  subject      TEXT NOT NULL,
  body         TEXT NOT NULL,
  sender_id    TEXT NOT NULL REFERENCES users(id),
  priority     TEXT NOT NULL CHECK (priority IN ('Low','Normal','High','Urgent')) DEFAULT 'Normal',
  status       TEXT NOT NULL CHECK (status IN ('Draft','Pending Approval','Approved','Rejected','Completed')) DEFAULT 'Draft',
  stage        TEXT NOT NULL CHECK (stage IN ('Issued','Received','Reviewed','Forwarded','Acknowledged','Completed')) DEFAULT 'Issued',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- recipients: either a user id or a channel/department id (frontend stores mixed ids as strings)
CREATE TABLE IF NOT EXISTS memo_recipients (
  memo_id      TEXT NOT NULL REFERENCES memos(id) ON DELETE CASCADE,
  recipient_id TEXT NOT NULL,
  PRIMARY KEY (memo_id, recipient_id)
);

CREATE TABLE IF NOT EXISTS memo_attachments (
  id       SERIAL PRIMARY KEY,
  memo_id  TEXT NOT NULL REFERENCES memos(id) ON DELETE CASCADE,
  name     TEXT NOT NULL,
  size     TEXT NOT NULL,
  type     TEXT NOT NULL CHECK (type IN ('pdf','docx','image')),
  file_path TEXT
);

CREATE TABLE IF NOT EXISTS memo_approval_chain (
  id         SERIAL PRIMARY KEY,
  memo_id    TEXT NOT NULL REFERENCES memos(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  role       TEXT NOT NULL,
  user_id    TEXT NOT NULL REFERENCES users(id),
  action     TEXT CHECK (action IN ('Approved','Rejected','Forwarded')),
  comment    TEXT,
  acted_at   TIMESTAMPTZ,
  UNIQUE (memo_id, step_order)
);

CREATE TABLE IF NOT EXISTS memo_read_receipts (
  memo_id    TEXT NOT NULL REFERENCES memos(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(id),
  status     TEXT NOT NULL CHECK (status IN ('delivered','read','pending')) DEFAULT 'pending',
  updated_at TIMESTAMPTZ,
  PRIMARY KEY (memo_id, user_id)
);

CREATE TABLE IF NOT EXISTS memo_stage_history (
  id       SERIAL PRIMARY KEY,
  memo_id  TEXT NOT NULL REFERENCES memos(id) ON DELETE CASCADE,
  stage    TEXT NOT NULL CHECK (stage IN ('Issued','Received','Reviewed','Forwarded','Acknowledged','Completed')),
  at_time  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  link        TEXT,
  kind        TEXT NOT NULL CHECK (kind IN ('memo','message','system','approval')),
  read        BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Archive is largely a materialized/query view over memos, but kept as its own
-- table so non-memo documents (letters/reports) can also be archived.
CREATE TABLE IF NOT EXISTS archive_docs (
  id            TEXT PRIMARY KEY,
  memo_id       TEXT REFERENCES memos(id),
  subject       TEXT NOT NULL,
  type          TEXT NOT NULL,
  sender_id     TEXT NOT NULL REFERENCES users(id),
  department_id TEXT NOT NULL REFERENCES departments(id),
  doc_date      DATE NOT NULL,
  status        TEXT NOT NULL
);

-- System-wide audit trail of notable admin/approval actions
CREATE TABLE IF NOT EXISTS audit_log (
  id         SERIAL PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id),
  action     TEXT NOT NULL,
  target     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_channel ON messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_memos_sender ON memos(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department_id);
