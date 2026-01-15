# WhatsApp Clone

A full-stack WhatsApp clone built with React, Express.js, Socket.io, and MongoDB.

## Project Structure

This is a monorepo containing:
- **Backend**: Express.js REST API with Socket.io for real-time messaging
- **Frontend**: React application built with Vite

## Tech Stack

### Backend
- Node.js with Express.js
- Socket.io for real-time communication
- MongoDB with Mongoose
- JWT authentication
- Cloudinary for media storage
- bcryptjs for password hashing

### Frontend
- React 19
- Vite for build tooling
- Tailwind CSS + DaisyUI
- Socket.io Client
- Zustand for state management
- React Router for navigation

## Local Development

### Prerequisites
- Node.js (v16 or higher)
- MongoDB instance
- Cloudinary account

### Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET=your_cloudinary_api_secret
```

### Installation & Running

1. Install dependencies and build the frontend:
```bash
npm run build
```
This command installs dependencies for both backend and frontend, then builds the frontend application.

2. Start the backend server (from root):
```bash
cd backend
npm run dev
```

3. Start the frontend development server (in a new terminal):
```bash
cd frontend
npm run dev
```

The backend will run on `http://localhost:5000` and the frontend on `http://localhost:5173`.

## Deployment

This project can be deployed using different strategies depending on your needs.

📖 **For detailed Vercel deployment instructions, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)**

### Deployment on Vercel (Recommended for Frontend)

Vercel is ideal for deploying the frontend with automatic CI/CD. The backend should be deployed separately on a service that supports WebSocket connections (like Render, Railway, or Heroku).

#### Prerequisites
1. A Vercel account ([sign up](https://vercel.com))
2. Backend deployed on a platform that supports WebSockets (see Render deployment below)

#### Deployment Steps

1. **Deploy Backend First** (see Render deployment section below)
   - Deploy your backend to Render, Railway, or another service
   - Note your backend URL (e.g., `https://your-backend.onrender.com`)

2. **Deploy Frontend to Vercel**
   - Fork or push this repository to GitHub
   - Log in to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect the configuration from `vercel.json`
   
3. **Configure Environment Variables** (Optional)
   - In your Vercel project settings, go to "Environment Variables"
   - Add `VITE_BACKEND_URL` with your backend URL (e.g., `https://your-backend.onrender.com`)
   - This allows the frontend to connect to your backend API
   
   **Note**: If you don't set `VITE_BACKEND_URL`, the default configuration in `vercel.json` will proxy API requests to `https://whatsapp-clone-waxc.onrender.com`. You should update the `vercel.json` file to point to your own backend URL, or use the environment variable approach.

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your frontend
   - Your app will be available at `https://your-project.vercel.app`

#### Updating the Default Backend URL

If you want to use a different backend URL as the default (instead of environment variables), update the `vercel.json` file in the root directory:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://YOUR-BACKEND-URL.onrender.com/api/:path*"
    },
    {
      "source": "/socket.io/:path*",
      "destination": "https://YOUR-BACKEND-URL.onrender.com/socket.io/:path*"
    }
  ]
}
```

Replace `YOUR-BACKEND-URL.onrender.com` with your actual backend URL.

#### How Vercel Deployment Works

1. Vercel builds the frontend React application using Vite
2. Static files are deployed to Vercel's CDN
3. API requests to `/api/*` are proxied to your backend server
4. Socket.io connections to `/socket.io/*` are proxied to your backend server
5. All other requests serve the React application

## Deployment on Render

This project is configured for easy deployment on Render using the included `render.yaml` file.

### Automated Deployment

1. Fork or push this repository to GitHub
2. Log in to [Render](https://render.com)
3. Click "New +" and select "Blueprint"
4. Connect your GitHub repository
5. Render will automatically detect the `render.yaml` file
6. Set up the following environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Will be auto-generated (or provide your own)
   - `CLOUDINARY_NAME`: Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY`: Your Cloudinary API key
   - `CLOUDINARY_SECRET`: Your Cloudinary API secret
7. Click "Apply" to start the deployment

### Manual Deployment

Alternatively, you can manually create a Web Service:

1. Go to Render Dashboard
2. Click "New +" → "Web Service"
3. Connect your repository
4. Configure the service:
   - **Name**: whatsapp-clone (or your preferred name)
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**: Add all required environment variables listed above
   - Set `NODE_ENV` to `production`
   - Set `PORT` to `10000` (or leave default)

5. Click "Create Web Service"

### How It Works

The deployment process:
1. Installs all dependencies (root, backend, and frontend)
2. Builds the frontend React app into static files
3. Starts the Express.js backend server
4. In production mode, the backend serves the built frontend files
5. All requests are routed through the backend server

The backend automatically serves the frontend when `NODE_ENV=production`, providing a unified deployment.

## Features

- 🔐 User authentication (signup/login)
- 💬 Real-time messaging with Socket.io
- 📷 Image upload support via Cloudinary
- 👥 User presence (online/offline status)
- 🎨 Modern UI with Tailwind CSS and DaisyUI
- 📱 Responsive design

## License

ISC
