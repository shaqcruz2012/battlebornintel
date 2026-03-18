# Deployment Guide

## Local Development

### 1. Prerequisites
- Node.js 18+
- Docker Desktop (Linux containers mode)
- Git

### 2. Environment Variables

Copy `.env.example` to `.env` in the project root:

```env
# Database
POSTGRES_PASSWORD=bbi_dev_password
DATABASE_URL=postgresql://bbi:bbi_dev_password@localhost:5433/battlebornintel

# API
API_PORT=3001
NODE_ENV=development
ADMIN_API_KEY=           # Set to a strong secret to enable admin endpoints

# Frontend
VITE_API_URL=http://localhost:3001

# Agents (optional)
ANTHROPIC_API_KEY=sk-ant-xxx
```

### 3. Start PostgreSQL

```bash
docker compose up -d
```

This starts PostgreSQL 16 on port 5433 with:
- Database: `battlebornintel`
- User: `bbi`
- Password: from `POSTGRES_PASSWORD` env var (default: `bbi_dev_password`)
- Data persisted in Docker volume `pgdata`

Verify it is ready:
```bash
docker exec battlebornintel-postgres-1 pg_isready -U bbi -d battlebornintel
```

### 4. Run Migrations

Migrations are numbered SQL files applied in order:

```bash
for f in database/migrations/*.sql; do
  docker exec -i battlebornintel-postgres-1 psql -U bbi -d battlebornintel < "$f"
done
```

There are 100+ migrations. Many are idempotent (`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`). Some contain data inserts that may produce duplicate-key notices on re-run, which is safe.

### 5. Seed Data

```bash
cd database/seeds
npm install
DATABASE_URL=postgresql://bbi:bbi_dev_password@localhost:5433/battlebornintel node seed.js
```

### 6. Start API

```bash
cd api
npm install
npm run dev
```

API starts on port 3001. On startup it pre-warms the graph cache after 1 second.

### 7. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend starts on port 5173 (Vite dev server).

---

## Production Considerations

### Database

- **Backup before migration:** `pg_dump battlebornintel > backup_$(date +%Y%m%d).sql`
- **Materialized view refresh:** Schedule `REFRESH MATERIALIZED VIEW CONCURRENTLY latest_company_scores` hourly (via cron or application timer).
- **Connection pooling:** The `pg` Pool in `api/src/db/pool.js` manages connections. For production, consider PgBouncer if connection count exceeds pool limits.
- **ANALYZE after migrations:** Run `ANALYZE` on tables that received bulk inserts to update query planner statistics.

### API

- **ADMIN_API_KEY:** Must be set to a strong secret in production. Without it, all admin endpoints return 403.
- **Rate limiting:** Built-in rate limiter uses in-memory counters (300 req/min public, 10 req/min admin). For multi-instance deployments, replace with Redis-backed rate limiting.
- **Cache invalidation:** The in-memory cache auto-expires. For immediate invalidation after data updates, call the admin endpoints or restart the API process.
- **Compression:** gzip compression is enabled via the `compression` middleware.

### Frontend

- **Build for production:**
  ```bash
  cd frontend
  npm run build
  ```
  Output goes to `frontend/dist/`. Serve with any static file server (nginx, Cloudflare Pages, etc.).

- **Environment:** Set `VITE_API_URL` at build time to point to the production API URL.

### Docker Compose

The `docker-compose.yml` only defines PostgreSQL. For a full containerized deployment, add services for the API and a static file server for the frontend build.

### Security Checklist

- [ ] Set strong `POSTGRES_PASSWORD` (not the default)
- [ ] Set strong `ADMIN_API_KEY`
- [ ] Do not expose port 5433 publicly (database)
- [ ] Use HTTPS termination (nginx, Cloudflare, etc.) in front of the API
- [ ] Review CORS settings in `api/src/index.js` for production origins
- [ ] Do not commit `.env` files (`.env.example` is the template)
