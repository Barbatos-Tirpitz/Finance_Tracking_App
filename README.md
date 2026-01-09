# Finance Tracking App — Frontend

This repository contains the React frontend for the Finance Tracking App — a minimal personal finance tracker with transaction entry, reporting charts, and account auth.

Key features
- Add, edit, and delete transactions (income / expense)
- Monthly filters, category breakdown, and charts (Bar, Pie, Line)
- Authentication (register / login / logout)

Live API (backend)
- The frontend expects the backend API at `http://localhost:5000` (see `frontend/src/api.js`). Make sure the backend server is running on port 5000 and connected to the database.

Getting started (development)
1. Install dependencies

```bash
cd frontend
npm install
```

2. Run the app

```bash
npm start
```

The app will open at `http://localhost:3000`. It communicates with the backend at `http://localhost:5000/api` (session cookies enabled).

Build for production

```bash
npm run build
```

This produces a production build in the `build/` folder which can be served by a static server or integrated with the backend.

API endpoints used by the frontend
- `POST /api/register` — register a new user
- `POST /api/login` — login (session cookie returned)
- `POST /api/logout` — logout (destroys session)
- `GET /api/me` — get current user
- `GET /api/transactions` — list user transactions
- `POST /api/transaction` — add a transaction
- `PUT /api/transaction/:id` — update a transaction
- `POST /api/request-reset` — request password reset
- `POST /api/reset-password` — submit new password

Configuration & environment
- The frontend does not require environment variables by default. It communicates with the backend at `http://localhost:5000/api` as configured in `frontend/src/api.js`.
- The backend requires DB credentials and server configuration — see `backend/index.js` and set corresponding `DB_*` and session env vars in the backend `.env`.

UX notes
- Form submissions show inline feedback and a loading indicator (the form is disabled while saving).
- Transactions are persisted to the backend; local state updates are synchronized with server responses.

Troubleshooting
- If you see CORS/session issues, ensure the backend `cors` config allows `http://localhost:3000` and `credentials: true`.
- If transactions appear in the UI but aren't persisted, confirm the backend is running and the database is reachable.

Contributing
- Feel free to open issues or submit PRs. Small improvements welcome: better validation, more charts, pagination, or test coverage.

License
- MIT

Contact
- For questions about the repo, open an issue or reach out to the project owner.
