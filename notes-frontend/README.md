# G-Notes
GITAM Notes Sharing Platform

Problem:
Students often lose access to useful academic notes after
each semester because notes are shared through temporary
channels such as WhatsApp and Telegram.

Solution:
A persistent platform where GITAM students can upload,
organize, search and download academic notes.

Architecture:

React → Express → MongoDB
                  ↓
              Cloudinary

Features:
- Register and sign in with JWT-backed accounts.
- Browse notes and search titles, subject names, and filenames.
- Upload, edit, and delete notes while authenticated.
- Restrict note files to PDF/PPT/PPTX and semesters 1 through 8.

Backend configuration:
`MONGO_URI` is optional and defaults to the local MongoDB database
`mongodb://127.0.0.1:27017/gnotes`. Start the local MongoDB service before
launching the backend, or set `MONGO_URI` to use a different database.
Set `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`,
`CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in
`notes-backend/.env`. `JWT_SECRET` must be a private, sufficiently
random value. Set `CLIENT_URL` when the frontend is not running at
`http://localhost:5173`.

Notes are limited to PDF, PPT, and PPTX files up to 15 MB, titles must be
3–100 characters, and semester values are limited to 1–8. The API provides
`GET /api/notes/:id/download` for inline file viewing
(`?download=true` downloads the file), `GET /api/notes/detailed-join` for
aggregation-based uploader details, and `GET /api/analytics/db-stats` for
count, sum, average, minimum, and maximum statistics. The
`GET /api/analytics/summary` endpoint remains available as well.
Note deletion and editing are restricted to the uploader or an administrator.
