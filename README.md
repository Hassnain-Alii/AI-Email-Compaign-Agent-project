# AI Email Campaign Agent 🚀

A modern, high-performance MERN stack application for creating and managing AI-powered email campaigns. This tool leverage OpenRouter (LLMs) to generate engaging email content and SendGrid for reliable delivery.

## ✨ Key Features

*   **AI Content Generation**: Generate high-converting email copy using curated free LLM models via OpenRouter.
*   **Drag & Drop Editor**: Rich text editing with React Quill.
*   **Dual-Audience Targeting**: Send to pre-defined recipient lists (via CSV/manual entry) or direct email addresses.
*   **Background Processing**: Uses BullMQ and Redis to handle high-volume email sending reliably without blocking the UI.
*   **Real-time Analytics**: Track delivery status, open rates (simulated), and engagement via an interactive dashboard.
*   **Premium UI**: Built with React, Tailwind CSS, and Framer Motion for a smooth, professional experience.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, TanStack Query, Lucide Icons.
- **Backend**: Node.js, Express, MongoDB (Mongoose).
- **Postman/Queue**: Redis + BullMQ.
- **AI**: OpenRouter API.
- **Email**: SendGrid API.

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or Atlas)
- Redis (Running locally or Upstash)

### 2. Environment Variables
Create a `.env` file in the `backend` directory:
```env
MONGODB_URI=your_mongodb_uri
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
JWT_SECRET=your_secret_key
SENDGRID_API_KEY=your_sendgrid_key
OPENROUTER_API_KEY=your_openrouter_key
FROM_EMAIL=your@email.com
```

### 3. Installation
```bash
# Install root dependencies
npm install

# Setup backend
cd backend
npm install

# Setup frontend
cd ../frontend
npm install
```

### 4. Running the App
```bash
# In backend directory
npm run dev

# In a separate terminal, start the worker
node run-worker.js

# In frontend directory
npm run dev
```

## 📦 Deployment

This project is prepared for deployment on **Vercel** (Frontend/API) and **Render/Railway** (Worker).
- The `vercel.json` in the root handles routing for monorepos.
- Ensure your production environment has a persistent Redis instance (like Upstash) for the BullMQ workers.

## 📜 License
MIT
