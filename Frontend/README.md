# IOCMS — Intra-Office Communication Management System

Frontend for the Oromia Science and Technology Authority (OSTA) IOCMS, built to the provided SRS/BRS spec.

## Tech Stack
- React 19 + TypeScript, Vite
- Tailwind CSS v4 (custom enterprise theme — deep blue/grey, Inter font)
- Redux Toolkit (auth, ui, messages, memos, notifications, users slices, with async thunks)
- React Router v6 (role-based route guards)
- Axios (typed API client, ready to swap mock data for a real backend)
- Recharts (dashboard charts), Lucide React (icons), Headless UI (accessible modal/menu primitives)

## Getting Started
```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build to dist/
npm run preview   # preview the production build
```

## Demo Login
The login screen includes a "Demo role" selector — pick any of the 5 roles
(System Admin, Head Office, Director, Team Leader, Employee) to see role-based
navigation, dashboards, and permissions. Any username/password (4+ chars) works.

## What's Implemented
- Role-based routing & RBAC-driven sidebar navigation
- Login with validation + loading state
- 3 dashboard variants (Executive/Director, Admin, Employee) with KPI cards and charts
- 1-on-1 Messaging + Departmental Channels (mock real-time UI)
- Memo/Circular creation with recipient multi-select, rich-text toolbar mock, attachments
- Full approval & forwarding workflow (Approve / Reject / Forward with comments)
- Visual status tracker (Issued → Received → Reviewed → Forwarded → Acknowledged → Completed)
- Read receipts (Delivered / Read / Pending)
- Approvals queue, searchable Archive, Reports with CSV export, Staff Directory
- Admin console: user management, role/permission matrix, system settings
- Responsive layout (collapsible sidebar, mobile hamburger menu)
- Loading skeletons, empty states, toast notifications

## Mock Data
All data (users, departments, memos, messages, notifications) is seeded in
`src/mocks/mockData.ts` and mirrors OSTA's structure (5 departments, 5 roles).
Redux thunks simulate network latency so loading states are visible.

## Connecting a Real Backend
Replace the mock-data-backed reducers with calls through `src/app/apiClient.ts`
(an Axios instance with auth-token interceptor already wired up) and point
`VITE_API_BASE_URL` at your API.
