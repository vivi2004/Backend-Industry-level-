

# Tasks Project API – Backend

A backend service for managing projects, tasks, file processing, OCR extraction, and AI summarization.  
Built with Node.js, Express, MongoDB, BullMQ, Redis, Cloudinary, Tesseract OCR, and OpenAI.

## 🚀 Features

- User authentication (JWT + refresh token)
- Projects CRUD
- Tasks CRUD + attachments
- File upload via Cloudinary
- OCR extraction via Tesseract worker
- AI summarization via OpenAI API
- Background job processing using BullMQ
- Real-time job tracking via SSE
- Job cancellation (safe + worker-aware)
- Secure worker-to-API communication using `x-worker-secret`

## 📦 Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- Redis + BullMQ
- Tesseract OCR
- Cloudinary uploads
- OpenAI API
- Server-Sent Events (SSE)
- Worker authentication using secrets

## 📁 Folder Structure

```
src/
 ├── controllers/
 │    └── v1/
 │         ├── aiProcess.controller.js
 │         ├── job.controller.js
 │         ├── project.controller.js
 │         └── task.controller.js
 │
 ├── models/
 │    └── Job.js
 │
 ├── routes/
 │    └── v1/
 │         ├── ai.routes.js
 │         ├── job.routes.js
 │         ├── project.routes.js
 │         └── task.routes.js
 │         └── webhook.routes.js
 │
 ├── workers/
 │    └── fileProcessing.worker.js
 │
 ├── queues/
 │    └── fileProcessing.queue.js
 │
 ├── middlewares/
 │    ├── auth.js
 │    ├── workerAuth.js
 │    └── rateLimiter.js
 │
 ├── utils/
 │    └── downloadFile.js
 │
 ├── app.js
 └── server.js
```

## 🔧 Environment Variables

Add these to `.env`:

```
PORT=4000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret

CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx

REDIS_HOST=localhost
REDIS_PORT=6379

OPENAI_API_KEY=your_openai_key
WORKER_SECRET=supersecret123
```

## ▶️ Install & Run

Install dependencies:

```bash
npm install
```

Start API:

```bash
npm run dev
```

Start Redis:

```bash
redis-server
```

Start Worker:

```bash
node src/workers/fileProcessing.worker.js
```

# 🧪 API Testing (Postman)

## 🔐 Auth

### Register

POST `/api/v1/auth/register`

### Login

POST `/api/v1/auth/login`

### Refresh Token

POST `/api/v1/auth/refresh-token`

## 📂 OCR Extraction

POST `/api/v1/ai/extract-text`

Headers:

```
Authorization: Bearer <token>
Content-Type: application/json
```

Body:

```json
{
  "fileUrl": "https://cloudinary.com/.../image.jpg"
}
```

## 🧠 AI Summarization (Worker Only)

POST `/api/v1/ai/summarize`

Headers:

```
x-worker-secret: supersecret123
Content-Type: application/json
```

Body:

```json
{
  "jobId": "your_job_id",
  "text": "Extracted OCR text"
}
```

## 📡 Real-time Job Progress (SSE)

GET `/api/v1/jobs/:jobId/live`

## ❌ Cancel a Job

DELETE `/api/v1/jobs/:jobId/cancel`

## 📁 Projects

POST `/api/v1/projects`  
GET `/api/v1/projects`

## 📌 Tasks

POST `/api/v1/projects/:projectId/tasks`  
POST `/api/v1/projects/:projectId/tasks/:taskId/attachments`

# 🔄 Processing Flow

1. User uploads file → job created
2. Worker downloads file
3. OCR extraction with progress
4. Worker triggers summarization
5. API stores summary
6. SSE streams updates
7. Job completes

# 🔐 Worker Security

Worker must send:

```
x-worker-secret: supersecret123
```

# 🚀 Deployment

Works with Render, Railway, AWS, Docker.

You must configure:

- MongoDB Atlas
- Redis
- Cloudinary
- OpenAI

# 🎉 Done

Backend is complete and documented.  
Ask anytime if you want a frontend starter (React + Vite).
>>>>>>> 740d9ed (feat: add comprehensive README.md for project documentation)
