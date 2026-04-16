# Split-Smart Monorepo

Split-Smart is a full-stack expense splitting app with separate frontend and backend projects managed from a single root workspace.

## Project Structure

- `frontend/`: Vite + React client
- `backend/`: Node.js + Express + MongoDB API
- `package.json`: root scripts to run both services together

## Prerequisites

- Node.js 18+ (recommended)
- npm
- MongoDB running locally on `mongodb://localhost:27017`

## Install Dependencies

From the repository root:

```bash
npm run install:all
```

## Run in Development

From the repository root:

```bash
npm run dev
```

This starts:

- backend on port `5001`
- frontend on Vite default port (usually `5173`)

You can also run them separately:

```bash
npm run dev:backend
npm run dev:frontend
```

## Backend Environment

Create `backend/.env` with:

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/splitsmart
JWT_SECRET=your_secret_here
```

## Health Check

```bash
curl -i http://localhost:5001/api/health
```

Expected behavior:

- `200 OK` with `{"status":"ok","database":"connected"}` when DB is connected
- `503` with `{"status":"degraded","database":"disconnected"}` when DB is down

## MongoDB Notes (macOS + Homebrew)

Start MongoDB if backend cannot connect:

```bash
brew services start mongodb-community
```

Check if MongoDB is listening:

```bash
lsof -nP -iTCP:27017 -sTCP:LISTEN
```
