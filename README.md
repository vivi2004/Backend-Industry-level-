Sure, here is the complete README.md for your backend — clean, professional, and ready to paste directly into your project.

⸻

Tasks Project API — Backend

A production-ready backend for a task & project workflow system with AI OCR, AI summarization, Cloudinary uploads, BullMQ workers, Redis, JWT authentication, and real-time job tracking using SSE.

⸻

🚀 Features
	•	User authentication (JWT + Refresh Token)
	•	CRUD for Projects and Tasks
	•	File uploads using Cloudinary
	•	OCR text extraction using Tesseract
	•	AI summarization using OpenAI
	•	Job processing using BullMQ + Redis
	•	Job timelines & progress tracking
	•	Real-time job updates via Server-Sent Events
	•	Job cancellation
	•	Worker authentication using x-worker-secret
	•	Rate limiting, CORS, Helmet protection

⸻

 Tech Stack
	•	Node.js + Express
	•	MongoDB + Mongoose
	•	Redis + BullMQ
	•	Cloudinary
	•	OpenAI API
	•	Tesseract OCR
	•	Server-Sent Events (SSE)

⸻

📁 Folder Structure

src/
 ├── controllers/
 │    ├── v1/
 │    │     ├── aiProcess.controller.js
 │    │     ├── job.controller.js
 │    │     ├── project.controller.js
 │    │     └── task.controller.js
 │
 ├── models/
 │    └── Job.js
 │
 ├── queues/
 │    └── fileProcessing.queue.js
 │
 ├── workers/
 │    └── fileProcessing.worker.js
 │
 ├── middlewares/
 │    ├── auth.js
 │    ├── workerAuth.js
 │    └── rateLimiter.js
 │
 ├── routes/
 │    ├── v1/
 │    │     ├── ai.routes.js
 │    │     ├── job.routes.js
 │    │     ├── project.routes.js
 │    │     ├── task.routes.js
 │    │     └── webhook.routes.js
 │
 ├── utils/
 │    └── downloadFile.js
 │
 ├── app.js
 └── server.js


⸻

🔧 Environment Variables

Create a .env file in the root:

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


⸻

  Running the Backend

Install dependencies:

npm install

Start the backend:

npm run dev

Start the worker:

node src/workers/fileProcessing.worker.js

Make sure Redis is running:

redis-server


⸻

  API Endpoints for Postman

⸻

  Auth Routes

Register

POST /api/v1/auth/register

Login

POST /api/v1/auth/login

Refresh Token

POST /api/v1/auth/refresh-token

⸻

  AI OCR Extraction

Start text extraction

POST /api/v1/ai/extract-text

Headers:

Authorization: Bearer <token>
Content-Type: application/json

Body:

{
  "fileUrl": "https://res.cloudinary.com/.../image.jpg"
}


⸻

 AI Summarization (Worker Only)

Summarization request

POST /api/v1/ai/summarize

Headers:

x-worker-secret: supersecret123
Content-Type: application/json

Body:

{
  "jobId": "64f...",
  "text": "Extracted OCR content..."
}


⸻

 Live Job Progress via SSE

Subscribe to real-time updates

GET /api/v1/jobs/:jobId/live

⸻

 Cancel a Job

DELETE /api/v1/jobs/:jobId/cancel

⸻

📁 Job Management

Get a single job with timeline

GET /api/v1/jobs/:jobId

Get all jobs (paginated)

GET /api/v1/jobs?page=1&limit=10

⸻

📁 Projects

Create Project

POST /api/v1/projects

Get Projects (paginated)

GET /api/v1/projects?page=1&limit=10

⸻

 Tasks

Create Task

POST /api/v1/projects/:projectId/tasks

Upload Task Attachment

POST /api/v1/projects/:projectId/tasks/:taskId/attachments

⸻

 Worker Pipeline Summary
	1.	User uploads a file
	2.	Job created → queued
	3.	Worker downloads file
	4.	OCR using Tesseract
	5.	Save text → update timeline
	6.	Worker queues summarization
	7.	/ai/summarize called with x-worker-secret
	8.	Summary saved
	9.	Job marked completed
	10.	SSE streams updates to frontend

⸻

 Security

The backend includes:
	•	Rate limiting
	•	CORS restriction
	•	Helmet security headers
	•	Worker-only access using x-worker-secret

⸻

🚀 Deployment Notes

Backend deploy options:
	•	Render
	•	Railway
	•	AWS EC2
	•	Docker

Make sure environment variables & Redis URL are correct.

