# MIVA FixIt — Frontend

React SPA for the MIVA FixIt university maintenance management system. Students submit requests, officers manage their jobs, and admins oversee everything — all in one platform.

## Features

- **Three role dashboards** — Tailored views for Requesters, Maintenance Officers, and Admins
- **Request submission** — Multi-step form with category selection, priority, location, and photo attachments
- **Real-time status tracking** — Live updates via Socket.IO; status badges update without a page refresh
- **Officer job management** — Officers see their active assignments, update status, and upload completion proof
- **Admin control panel** — Manage all requests, assign officers, adjust priorities, manage users and categories
- **In-app notifications** — Bell icon with unread count; mark-all-read support
- **Reports** — Admins can export request data as CSV or PDF
- **Audit log** — Full action trail viewable by admins
- **Responsive design** — Works on mobile and desktop; sidebar collapses on small screens
- **JWT auth** — Access tokens (15m) refreshed silently via httpOnly cookie; protected routes enforce role access

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS + Radix UI primitives |
| Data fetching | TanStack React Query |
| Forms | React Hook Form + Zod |
| Routing | React Router v6 |
| HTTP client | Axios (with interceptors for token refresh) |
| Real-time | Socket.IO client |
| Icons | Hugeicons + Lucide |
| Testing | Vitest + Testing Library + MSW |

## Project Structure

```
src/
├── components/
│   ├── layout/      # AppLayout, Sidebar, TopBar, NotificationBell
│   ├── shared/      # StatusBadge, PriorityBadge, Spinner, EmptyState
│   └── ui/          # Radix-based primitives (Button, Input, Label, Card…)
├── context/         # AuthContext, ToastContext
├── lib/             # Axios instance with refresh interceptor
├── pages/
│   ├── admin/       # AdminDashboard, requests, users, categories, reports, audit
│   ├── officer/     # OfficerDashboard, OfficerJobsPage, OfficerJobDetailPage
│   └── requester/   # RequesterDashboard, MyRequestsPage, NewRequestPage, RequestDetailPage
├── routes/          # ProtectedRoute (auth + role guard)
├── tests/           # Vitest test suites and MSW handlers
└── types/           # Shared TypeScript interfaces
```

## Getting Started

### Prerequisites

- Node.js 18+
- The backend API running (see backend README)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:5001/api/v1
VITE_SOCKET_URL=http://localhost:5001
VITE_APP_NAME=MIVA FixIt
```

For production, set these in your hosting provider (e.g. Vercel environment variables):

```env
VITE_API_URL=https://your-backend.onrender.com/api/v1
VITE_SOCKET_URL=https://your-backend.onrender.com
```

### Running

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview
```

## Pages by Role

### Requester
| Page | Route |
|---|---|
| Dashboard | `/dashboard` |
| My Requests | `/requests` |
| New Request | `/requests/new` |
| Request Detail | `/requests/:id` |

### Officer
| Page | Route |
|---|---|
| Dashboard | `/officer` |
| All Jobs | `/officer/jobs` |
| Job Detail | `/officer/jobs/:id` |

### Admin
| Page | Route |
|---|---|
| Dashboard | `/admin` |
| All Requests | `/admin/requests` |
| Request Detail | `/admin/requests/:id` |
| Users | `/admin/users` |
| Categories | `/admin/categories` |
| Reports | `/admin/reports` |
| Audit Log | `/admin/audit` |

## Testing

```bash
npm test
```

Runs 27 component tests with Vitest and Testing Library. MSW intercepts API calls so tests run fully offline.

Test coverage includes:
- `StatusBadge` — all 8 status variants
- `ProtectedRoute` — unauthenticated redirect, role enforcement
- `LoginPage` — field rendering, validation, server errors
- `RegisterPage` — password mismatch, strength meter
- `NotificationBell` — unread badge, dropdown, mark-all-read
- `MyRequestsPage` — API-driven list rendering

## Deployment

The frontend is deployed on [Vercel](https://vercel.com). A `vercel.json` rewrite rule redirects all paths to `index.html` so client-side routing works on direct URL access and page refresh.
