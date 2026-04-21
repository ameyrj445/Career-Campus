# Career Compass

A full-stack Job and Internship Portal built with a React frontend and an Express/MySQL backend.

## Project Overview

This repository contains two main parts:

- `frontend/` — React application for browsing jobs and internships with filters, search, and listing details.
- `backend/` — Express.js API server that queries MySQL and exposes job, internship, and filter endpoints.
- `extras/` — Supplemental data and documentation files used during development.

## Tech Stack

- Frontend: React, React Router, Axios, Material UI
- Backend: Node.js, Express, MySQL, dotenv, cors
- Database: MySQL

## Repository Structure

- `backend/`
  - `server.js` — Express server and API route definitions
  - `internshipQueries.js`, `jobQueries.js`, `utilQueries.js` — database query logic
  - `package.json` — backend dependencies and scripts
- `frontend/`
  - `src/` — React source code
  - `public/` — static files and HTML template
  - `package.json` — frontend dependencies and scripts
- `extras/`
  - example data files for jobs and internships
- `.gitignore` — root ignore rules
- `README.md` — this file

## Prerequisites

- Node.js (recommended 18.x or later)
- npm
- MySQL database

## Setup

### Backend

1. Open a terminal inside the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in `backend/` with your database configuration:
   ```env
   SQL_HOST=localhost
   SQL_USER=your_db_user
   SQL_PASSWORD=your_db_password
   SQL_DATABASE=your_db_name
   PORT=5001
   ```
4. Start the backend server:
   ```bash
   npm start
   ```

If you want automatic reload during development, use:
```bash
npm run dev
```

The backend runs by default on `http://localhost:5001`.

### Frontend

1. Open a terminal inside the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React app:
   ```bash
   npm start
   ```

The frontend runs by default on `http://localhost:3000`.

## API Endpoints

The backend exposes the following endpoints:

- `GET /api/jobs`
- `GET /api/internships`
- `GET /api/jobs/:id`
- `GET /api/internships/:id`
- `GET /api/categories`
- `GET /api/locations`
- `GET /api/companies`
- `GET /api/tags`
- `GET /api/job-filter-options`
- `GET /api/internship-filter-options`
- `GET /api/search?q=...`

## Notes

- The frontend expects the backend API to be available during development.
- If using a custom backend port, update the frontend API base URL accordingly.
- The `backend` code reads MySQL credentials from environment variables.

