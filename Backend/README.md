# IOCMS Backend

Node.js + Express + PostgreSQL backend for the OSTA Intra-Office Communication
Management System. Built to match the data model and API expectations of the
`IOCMS` React frontend (see `src/app/apiClient.ts` and `src/types/index.ts` in
that project) — point the frontend's `VITE_API_BASE_URL` at this server and
swap the mock Redux thunks for real `apiClient` calls.

## Stack
- Express 4
- PostgreSQL (via `pg`)
- JWT auth (`jsonwebtoken` + `bcryptjs`)
- Zod for request validation

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create a PostgreSQL database** and user (adjust names/passwords as you like):
   ```sql
   CREATE USER iocms_user WITH PASSWORD 'iocms_password';
   CREATE DATABASE iocms OWNER iocms_user;
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # then edit .env: DATABASE_URL, JWT_SECRET, CORS_ORIGIN
   ```

4. **Run migrations and seed demo data**
   ```bash
   npm run setup   # runs migrate then seed
   ```
   This creates all tables and seeds the same demo organization (OSTA, 5
   departments, 5 roles, ~35 users, channels, sample memos) that the frontend's
   `mockData.ts` uses — so the two are drop-in compatible for demoing.

   All seeded users share the password: `Passw0rd!`
   Example logins:
   - `netsanet.fikru@osta.gov.et` — System Admin
   - `girma.wolde@osta.gov.et` — Head Office
   - `hana.tesfaye@osta.gov.et` — Director
   - `selam.kassa@osta.gov.et` — Team Leader
   - `meron.alemu@osta.gov.et` — Employee

5. **Run the server**
   ```bash
   npm run dev     # auto-restarts on file changes (node --watch)
   npm start       # plain start
   ```
   Server listens on `http://localhost:4000` by default. Health check:
   `GET /api/health`.

## Connecting the frontend

In the `Frontend` project, set:
```
VITE_API_BASE_URL=http://localhost:4000/api
```
The existing `apiClient.ts` axios instance already reads this env var and
attaches the JWT from `sessionStorage` automatically. You'll need to update the
Redux thunks (currently reading from `src/mocks/mockData.ts`) to call
`apiClient.get/post(...)` against the endpoints below instead.

## API Overview

All endpoints are prefixed with `/api` and (except `/auth/login`) require
`Authorization: Bearer <token>`.

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/auth/login` | `{ email, password }` → `{ user, token }` |
| GET | `/auth/me` | Current authenticated user |
| POST | `/auth/logout` | Marks user offline |

### Users
| Method | Path | Description |
|---|---|---|
| GET | `/users` | List users. Query: `department`, `role`, `status`, `search` |
| GET | `/users/:id` | Get one user |
| POST | `/users` | Create user (System Admin only) |
| PATCH | `/users/:id` | Update user (System Admin only) |
| PATCH | `/users/:id/status` | Activate/deactivate (System Admin only) |
| DELETE | `/users/:id` | Delete user (System Admin only) |

### Messaging
| Method | Path | Description |
|---|---|---|
| GET | `/messages/threads` | List my direct-message threads |
| POST | `/messages/threads` | `{ participantId }` → get or create a thread |
| GET | `/messages/threads/:threadId/messages` | List messages in a thread (marks them read) |
| POST | `/messages/threads/:threadId/messages` | `{ body, attachment? }` |
| GET | `/messages/channels` | List channels I belong to |
| GET | `/messages/channels/:channelId/messages` | List channel messages |
| POST | `/messages/channels/:channelId/messages` | `{ body, attachment? }` |

### Memos
| Method | Path | Description |
|---|---|---|
| GET | `/memos` | List memos visible to me. Query: `status`, `priority`, `type`, `search` |
| GET | `/memos/:id` | Full memo detail (attachments, approval chain, read receipts, stage history) |
| POST | `/memos` | Create a memo. `{ type, subject, body, recipients[], priority, attachments[], approvalChain[] }` |
| POST | `/memos/:id/approve` | Approve as the current approver. `{ comment? }` |
| POST | `/memos/:id/reject` | Reject as the current approver. `{ comment? }` |
| POST | `/memos/:id/forward` | Forward to the next approver. `{ toUserId, toRole, comment? }` |
| POST | `/memos/:id/read` | Mark memo as read (read receipt) |
| POST | `/memos/:id/acknowledge` | Acknowledge; completes the memo once everyone has acknowledged |

Memo workflow notes:
- `approvalChain` on create is optional — omit it for memo types that don't
  need approval (e.g. simple Circulars/Notices), and the memo is issued
  directly as `Completed`.
- The "current approver" is whichever chain step has the lowest `step_order`
  with no `action` yet. Only that user can approve/reject/forward.
- Approving the last step sets the memo to `Approved` / stage `Acknowledged`.
- Forwarding appends a new step after the current one and notifies the new approver.

### Notifications
| Method | Path | Description |
|---|---|---|
| GET | `/notifications` | My last 50 notifications |
| PATCH | `/notifications/:id/read` | Mark one as read |
| PATCH | `/notifications/read-all` | Mark all as read |

### Archive
| Method | Path | Description |
|---|---|---|
| GET | `/archive` | List archived documents. Query: `type`, `department`, `status`, `search` |

### Dashboard / Reports
| Method | Path | Description |
|---|---|---|
| GET | `/dashboard/kpis` | My KPI counters (total memos, pending approvals, unread notifications, active users) |
| GET | `/dashboard/department-volume` | Memo volume per department (for bar chart) |
| GET | `/dashboard/status-breakdown` | Memo counts by status (for pie chart) |
| GET | `/dashboard/user-growth` | New users per month (for line chart) |

### Departments
| Method | Path | Description |
|---|---|---|
| GET | `/departments` | List department names (for dropdowns) |

## Project structure
```
src/
  app.js              Express app + route mounting
  server.js           Entry point
  config/db.js        PostgreSQL pool + query/transaction helpers
  middleware/         auth (JWT + role guard), error handling
  routes/             one file per resource
  controllers/        request handlers / business logic
  db/
    schema.sql        full table definitions
    migrate.js         runs schema.sql
    seed.js            seeds demo OSTA data (mirrors frontend mockData.ts)
```

## Notes / next steps
- File uploads for memo attachments are currently metadata-only (`name`,
  `size`, `type`). Wire up `multer` (already a dependency) to a real upload
  route + object storage (S3/disk) when you're ready to handle actual files.
- Channel "unread" counts are stubbed to `0` — add a per-user channel
  read-cursor table if you need real unread badges there.
- For production, put this behind HTTPS, rotate `JWT_SECRET`, and consider
  short-lived access tokens + refresh tokens instead of a single 8h JWT.
