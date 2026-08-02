
# Home Services Platform

A slot-based home services platform built with:

- React Native
- NestJS
- PostgreSQL
- Prisma
- Redis
- Docker

---

# Project Structure

home-services-platform/

apps/
    mobile/
    server/

docker/

docs/

---

# Prerequisites

Install:

- Node.js 22+
- npm
- Docker Desktop
- Git
- VS Code (Recommended)

---

# Clone Repository

```bash
git clone <repository-url>

cd home-services-platform
```

---

# Install Backend Dependencies

```bash
cd apps/server

npm install
```

---

# Install Mobile Dependencies

```bash
cd ../mobile

npm install
```

---

# Start Docker

Open Docker Desktop.

Wait until Docker is running.

Verify:

```bash
docker --version

docker compose version
```

---

# Start Database

Go to docker folder.

```bash
cd docker
```

Run

```bash
docker compose up -d
```

Verify

```bash
docker ps
```

Expected

```
home-services-postgres
home-services-redis
```

Stop Containers

```bash
docker compose down
```

Restart

```bash
docker compose restart
```

View Logs

```bash
docker compose logs -f
```

---

# PostgreSQL

Database

```
home_services
```

Username

```
postgres
```

Password

```
postgres
```

Port

```
5432
```

---

# Environment

Create

```
apps/server/.env
```

Example

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/home_services?schema=public"

PORT=3000

JWT_SECRET=secret

REDIS_HOST=localhost

REDIS_PORT=6379
```

---

# Prisma

Generate Client

```bash
npx prisma generate
```

Run Migration

```bash
npx prisma migrate dev --name init
```

Open Prisma Studio / Database

```bash
npx prisma studio
```

---

# Run Backend

```bash
cd apps/server

npm run start:dev
```

API

```
http://localhost:3000
```

Swagger

```
http://localhost:3000/api
```

Health Check

```
http://localhost:3000/api/health
```

---

# Run Mobile

```bash
cd apps/mobile

npm start
```

or

```bash
npx expo start
```

---

# Docker Commands

Start

```bash
docker compose up -d
```

Stop

```bash
docker compose down
```

Restart

```bash
docker compose restart
```

Running Containers

```bash
docker ps
```

Logs

```bash
docker compose logs -f
```

Shell into PostgreSQL

```bash
docker exec -it home-services-postgres psql -U postgres -d home_services
```

List Tables

```sql
\dt
```

Exit

```sql
\q
```

---

# Useful Prisma Commands

Generate Client

```bash
npx prisma generate
```

Run Migration

```bash
npx prisma migrate dev
```

Reset Database

```bash
npx prisma migrate reset
```

Open Studio

```bash
npx prisma studio
```

Pull Database

```bash
npx prisma db pull
```

Push Schema

```bash
npx prisma db push
```

---

# Troubleshooting

## PostgreSQL Connection Error (P1001)

Check Docker

```bash
docker ps
```

If PostgreSQL is not running

```bash
cd docker

docker compose up -d
```

---

## Prisma Client Error

Generate client

```bash
npx prisma generate
```

Restart NestJS.

---

## Port Already in Use

Check

```bash
lsof -i :3000
```

Kill Process

```bash
kill -9 <PID>
```

---

# Development Flow

1. Start Docker

```
docker compose up -d
```

2. Generate Prisma Client

```
npx prisma generate
```

3. Run Migration

```
npx prisma migrate dev
```

4. Start Backend

```
npm run start:dev
```

5. Start Mobile

```
npm start
```