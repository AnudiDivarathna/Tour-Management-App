# Tour Management App (MERN)

Vehicle and tour scheduling app with **Admin** and **Driver** roles behind a login.

## Stack

- MongoDB Atlas + Express + React (Vite) + Node.js

## Setup

### Backend

```bash
cd backend
npm install
npm run seed
npm run dev
```

API runs at `http://localhost:5000`.

Copy `.env.example` to `.env` if needed. Do not commit `.env`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`.

## URLs

| View | URL |
|------|-----|
| Admin | http://localhost:5173/admin |
| Driver | http://localhost:5173/driver |

## Features

- **Admin:** vehicle CRUD, tour CRUD (all fields), vehicle calendars
- **Driver:** vehicle list → calendar → tour details; can edit fuel cost, highway bill, parking bill, accommodation, and food bill
- Seeded vehicles and historical tours (tours start with no vehicle assigned)
