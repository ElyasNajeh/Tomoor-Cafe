# ☕ Tomoor Cafe

A full-stack coffee shop management system built with FastAPI, React, PostgreSQL, and Docker.

The project follows a Feature-Based Architecture in the backend and is fully containerized using Docker, making setup and development simple and consistent across different environments.

---
# ✨ Features

- Admin Authentication
- Dashboard
- Categories Management
- Products Management
- Product Images
- Sliders Management
- JWT Authentication
- Dockerized Development Environment

---

# 🚀 Tech Stack

## Backend
- FastAPI
- SQLAlchemy
- PostgreSQL
- JWT Authentication
- Pydantic

## Frontend
- React
- TypeScript
- Vite

## Database
- PostgreSQL

## DevOps
- Docker
- Docker Compose

---

# 📁 Project Structure

```text
Tomoor-Cafe/
│
├── .env
├── .env.example
├── docker-compose.yml
├── README.md
│
├── Tomoor-CafeAPI/ # FastAPI Backend
│
└── Tomoor-CafeUI/ # React Frontend
```

---

# 📋 Prerequisites

Before running the project, make sure you have installed:

- Docker Desktop
- Git

---

# ⚙️ Installation

Clone the repository:

```bash
git clone <repository-url>
```

Go to the project directory:

```bash
cd Tomoor-Cafe
```

Create your environment file:

Windows:

```powershell
copy .env.example .env
```

Update the `SECRET_KEY` value inside `.env` before running the project.

For local frontend development outside Docker, copy `Tomoor-CafeUI/.env.example` to `Tomoor-CafeUI/.env.local`. The default API URL is `http://localhost:8000`.

---

# ▶️ Running the Project

Build and start all services:

```bash
docker compose up --build
```

For the next runs:

```bash
docker compose up
```

Stop all services:

```bash
docker compose down
```

---

# 🌐 Services

| Service | URL |
|----------|-----|
| React | http://localhost:5173 |
| FastAPI | http://localhost:8000 |
| Swagger | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 |

---

# 🐳 Docker Services

The project contains three containers:

- PostgreSQL
- FastAPI
- React

Docker automatically:

- Creates the PostgreSQL container.
- Creates the project database.
- Starts the API.
- Starts the React development server.

Database schema changes are applied explicitly with Alembic before using the API:

```bash
docker compose exec api alembic upgrade head
```

To preview and then migrate existing product, category, and slider JPG/PNG uploads:

```bash
docker compose exec api python -m app.migrate_images_to_webp --dry-run
docker compose exec api python -m app.migrate_images_to_webp
```

The migration verifies each newly stored WebP, commits all matching database
references, verifies them again, and only then removes the old file. It skips
existing `.webp` references and is safe to rerun.

Slider uploads receive an additional slider-only composition pass before the
existing WebP encoder. The uploaded image is scaled proportionally until it
covers the full 1200 x 800 (3:2) target, then the excess is cropped equally from
the sides or top and bottom. The result is one edge-to-edge image with no
background layer, blur, padding, or contain-style inset.

To preview and then compose existing slider images, including sliders that are
already WebP but predate this pipeline:

```bash
docker compose exec api python -m app.migrate_slider_images --dry-run
docker compose exec api python -m app.migrate_slider_images
```

## Create the first admin

After migrations have run, bootstrap the first admin interactively (the password is prompted and is not stored in shell history):

```bash
docker compose exec api python -m app.bootstrap_admin
```

This command only works while the database has no admins. Further admins must be created by an authenticated admin through the protected admin API.

---

# 📚 API Documentation

Swagger UI:

```
http://localhost:8000/docs
```

---

# 🛠 Useful Commands

Rebuild images:

```bash
docker compose up --build
```

Stop containers:

```bash
docker compose down
```

View logs:

```bash
docker compose logs
```

View running containers:

```bash
docker ps
```

---

# 📌 Notes

- Environment variables are stored in the project root.
- `.env.example` contains the required configuration template.
- `.env` should never be committed to Git.
- The backend follows a Feature-Based Architecture.
- Docker volumes are used for live development.
