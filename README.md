<<<<<<< HEAD
Tasks Project API

A backend service that processes file attachments, runs OCR using Tesseract, generates AI summaries, and streams real-time job updates through SSE. Jobs are queued and processed by a BullMQ worker.

⸻

🚀 Features
	•	User authentication and project/task management
	•	File upload with Cloudinary
	•	OCR text extraction using Tesseract (free)
	•	AI summarization using OpenAI
	•	Background job processing with BullMQ
	•	Real-time job updates using Server-Sent Events (SSE)
	•	Job cancellation support
	•	Secure internal routes for worker → API communication using WORKER_SECRET

⸻

🧱 Tech Stack
	•	Node.js + Express
	•	MongoDB + Mongoose
	•	BullMQ (Redis) — job queue
	•	Tesseract OCR — text extraction
	•	OpenAI — summarization
	•	Cloudinary — file storage
	•	SSE — live status updates

⸻

📦 Project Structure

src/
 ├── controllers/
 ├── models/
 ├── routes/
 ├── middlewares/
 ├── workers/
 │    └── fileProcessing.worker.js
 ├── utils/
 └── server.js


⸻

🔧 Environment Variables

Create a .env file:

PORT=4000
MONGO_URL=mongodb://localhost:27017/tasks
JWT_SECRET=yourjwt
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
OPENAI_API_KEY=xxx
REDIS_HOST=localhost
REDIS_PORT=6379
WORKER_SECRET=supersecret123


⸻

📤 API Endpoints

Authentication

POST /api/v1/auth/register
POST /api/v1/auth/login

Projects

GET  /api/v1/projects
POST /api/v1/projects
PUT  /api/v1/projects/:id
DELETE /api/v1/projects/:id

Tasks

POST /api/v1/projects/:id/tasks
GET  /api/v1/projects/:id/tasks
POST /api/v1/projects/:taskId/attachments

Jobs

GET /api/v1/jobs/:id          → get job status
GET /api/v1/jobs/:id/live     → SSE live updates
DELETE /api/v1/jobs/:id/cancel → cancel a running job

Webhooks (internal)

POST /api/v1/webhooks/file-processed
POST /api/v1/webhooks/summary-ready

Headers required:

x-worker-secret: WORKER_SECRET

AI

Used internally by the worker:

POST /api/v1/ai/summarize
Headers:
  x-worker-secret: WORKER_SECRET


⸻

🏃 Running the Server

Install dependencies

npm install

Start server

npm run dev

Start worker

node src/workers/fileProcessing.worker.js


⸻

🔍 Worker Flow Overview
	1.	User uploads a file → creates a Job
	2.	Worker downloads the file from Cloudinary
	3.	Tesseract extracts the text
	4.	Worker sends file-processed webhook
	5.	Worker triggers AI summarization
	6.	AI returns summary → stored in DB
	7.	SSE pushes updates in real time

⸻

🛑 Job Cancellation
	•	User calls DELETE /jobs/:id/cancel
	•	API marks job as cancelled
	•	Worker polls /jobs/:id/check-cancel
	•	Worker stops if cancelled

⸻

📡 Live Updates via SSE

Frontend connects:

GET /api/v1/jobs/:id/live

This stream sends:
	•	progress
	•	status
	•	summary_ready
	•	errors

⸻

🤖 Tesseract OCR Setup

Install locally:

brew install tesseract           # macOS
sudo apt install tesseract-ocr   # Linux

No subscription needed.

⸻

🎯 Summary

This backend handles file uploads, OCR, summarization and real-time updates. The worker pipeline is fully secure and optimized for production.

Let me know if you want a frontend README, API docs, or a full Postman collection.
=======
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
