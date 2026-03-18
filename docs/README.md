# Battle Born Intelligence (BBI)

Bloomberg Terminal for Innovation Ecosystems — a vertical intelligence platform for Nevada's innovation ecosystem.

## Quick Start

### Prerequisites
- Node.js 18+
- Docker Desktop (Linux containers mode)
- PostgreSQL 16 (via Docker)

### Setup
```bash
# Start database
docker compose up -d

# Run migrations
for f in database/migrations/*.sql; do
  docker exec -i battlebornintel-postgres-1 psql -U bbi -d battlebornintel < "$f"
done

# Seed data
cd database/seeds && npm install && DATABASE_URL=postgresql://bbi:bbi_dev_password@localhost:5433/battlebornintel node seed.js

# Start API
cd api && npm install && npm run dev

# Start frontend
cd frontend && npm install && npm run dev
```

Frontend: http://localhost:5173
API: http://localhost:3001

## Views
- **Executive Dashboard** — KPIs, momentum rankings, sector heat
- **Companies** — 127 tracked companies with IRS scoring
- **Funds** — 8 funds with portfolio analysis
- **Graph** — Interactive relationship graph (824+ edges)
- **Weekly Brief** — Automated intelligence digest
- **Activity Feed** — Bloomberg-style stakeholder activity
- **GOED Dashboard** — Government stakeholder lens
- **Ecosystem Map** — 67 organizations on Kauffman/ICP axes

## Documentation
- [Architecture](./ARCHITECTURE.md)
- [API Reference](./API.md)
- [Database Schema](./DATABASE.md)
- [Deployment](./DEPLOYMENT.md)
