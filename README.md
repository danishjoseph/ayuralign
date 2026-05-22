# AyurAlign Backend

Health monitoring backend API built with NestJS + TypeORM + PostgreSQL.

## Tech Stack

- NestJS 11
- TypeORM with PostgreSQL

## Prerequisites

- Nix with flakes enabled

## Development

```bash
nix develop            # enter dev shell (Node 22 + pnpm + PostgreSQL CLI)
start-db               # initialize + start PostgreSQL
pnpm start:dev         # start NestJS with hot-reload
```

Swagger UI: http://localhost:3000/api

## Database Management

| Command     | Description |
|-------------|-------------|
| `start-db`  | Init (first run), start PG, create root role + smart_health DB |
| `stop-db`   | Gracefully stop PG |
| `status-db` | Check if PG is running |

Data persists in `.pgdata/` across restarts.

## Migrations

```bash
pnpm build                                    # compile entities to dist/
pnpm migration:generate src/database/migrations/MigrationName   # create migration
pnpm migration:run                            # apply pending migrations
```

## Testing

```bash
pnpm test:e2e      # E2E tests (creates isolated test databases)
```

## Project Structure

```
src/
├── main.ts              # Bootstrap + Swagger setup
├── app.module.ts        # Root module (ConfigModule + TypeORM)
├── database/
│   ├── data-source.ts   # TypeORM CLI config
│   └── migrations/      # Generated migration files
├── auth/                # POST /auth/register, POST /auth/login
├── health/              # POST /health/send, GET /health/recent, GET /health/latest
└── common/
    └── status-detector.ts   # Health vitals status detection logic
```
