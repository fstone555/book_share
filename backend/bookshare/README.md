# BookShare Backend (Node.js + Express + MongoDB)

This is a starter backend for the BookShare project (second-hand book marketplace) using MongoDB and Mongoose.

## Setup

1. Copy `.env.example` to `.env` and fill in your MongoDB connection string and JWT secret.

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm run dev
# or
npm start
```

The server will connect to MongoDB automatically.
APIs will be available under `/api/...`.

## Notes
- Uploads are stored in the folder specified by `UPLOAD_DIR` in `.env` (default `uploads`).
- This is a starter template — for production use, consider validation, indices, migrations (or seed scripts), and additional security hardening.
