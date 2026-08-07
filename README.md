# BrickWeb

Fullstack portfolio with a Pink Floyd / *The Wall* aesthetic — every project is a brick in the wall.

| Layer | Stack |
| --- | --- |
| Frontend | Next.js (App Router), SCSS Modules, Framer Motion |
| Backend | Nest.js, TypeORM, PostgreSQL |
| Monorepo | npm workspaces (`apps/*`, `packages/*`) |

---

## Screenshots

> Place screenshots here after deploy:
>
> - `docs/screenshots/home.png` — project brick wall
> - `docs/screenshots/lab.png` — synthesizer wall
> - `docs/screenshots/about.png` — skills & timeline

---

## Local setup

### Prerequisites

- Node.js 18+
- Docker (for PostgreSQL)

### 1. Install

```bash
npm install
```

### 2. Start the database

```bash
docker-compose up -d
# or: npm run db:up
```

Postgres: `localhost:5432` · user/password/db: `postgres` / `postgres` / `brickweb`  
pgAdmin (optional): [http://localhost:5050](http://localhost:5050)

### 3. Seed data

```bash
npm run seed
npm run seed:skills-timeline
```

### 4. Run apps

```bash
npm run dev:backend   # http://localhost:4000
npm run dev:frontend  # http://localhost:3000
```

In development the frontend proxies `/api/*` → `localhost:4000`. Leave `NEXT_PUBLIC_API_URL` empty.

---

## Environment

See [`.env.example`](.env.example) for all variables.

| Variable | Where | Notes |
| --- | --- | --- |
| `PORT` | backend | Default `4000` |
| `DATABASE_URL` | backend | Production Postgres URL (Railway, etc.) |
| `CORS_ORIGIN` | backend | Comma-separated allowed origins |
| `NEXT_PUBLIC_API_URL` | frontend | Backend origin in production; empty in dev |

---

## Deploy

### Frontend → Vercel

- Root / app directory: `apps/frontend`
- Set `NEXT_PUBLIC_API_URL` to your backend URL
- No Dockerfile required

### Backend → Railway / VPS

- Build with [`apps/backend/Dockerfile`](apps/backend/Dockerfile) (monorepo context = repo root)
- Or: `npm run build --workspace=@brickweb/backend` then `npm run start:prod --workspace=@brickweb/backend`
- Provide `DATABASE_URL`, `PORT`, `CORS_ORIGIN`

### Optional local prod simulation

```bash
docker compose -f docker-compose.prod.yml up --build
```

---

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev:frontend` | Next.js dev server |
| `npm run dev:backend` | Nest.js watch mode |
| `npm run seed` | Seed demo projects |
| `npm run seed:skills-timeline` | Seed skills + timeline |
| `npm run db:up` / `db:down` | Start / stop Postgres |

---

## Easter Eggs

Something in the masonry is listening. Keep looking — and if the wall goes quiet for a while, you might feel a little *comfortably numb*.

*Is there anybody out there?*
