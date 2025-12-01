# TestNova Front — Developer README

Quick steps to work on the frontend locally (Windows / PowerShell)

Prerequisites
- Node.js 18+ and npm installed
- Java (if you run the backend), Maven for backend projects

Install dependencies
```powershell
cd c:\Users\takwa\testnova
npm ci
```

Common tasks
- Start dev server: `npm start`
- Run tests: `npm test`
- Run linter (if configured): `npm run lint`

Notes
- This repository uses a small frontend app under `src/app` and expects a backend API on `http://localhost:8081` for CV analysis in some flows.
- For refactors, work on a feature branch and open a PR against `main`.
