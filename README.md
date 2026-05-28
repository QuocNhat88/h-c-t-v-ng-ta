# CloneQL

Fullstack vocabulary learning app inspired by modern flashcard workflows.

## Stack

- Backend: Node.js, Express, modular folder architecture
- Frontend: React, Vite, TailwindCSS
- Local data: JSON file storage for MVP

## MongoDB Atlas

Create `backend/.env` from `backend/.env.example` and paste your Atlas URI:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/cloneql?retryWrites=true&w=majority
```

Make sure your Atlas database user has read/write permission and your IP is allowed in Network Access.

## Run

```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.
Backend runs on `http://localhost:4000`.
