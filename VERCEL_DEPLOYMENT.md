# Vercel Deployment Guide

This guide explains how to deploy the WhatsApp Clone monorepo to Vercel.

## Architecture

This monorepo uses a **split deployment architecture**:
- **Frontend**: Deployed to Vercel (React/Vite static site)
- **Backend**: Deployed to a WebSocket-compatible platform (Render, Railway, Heroku, etc.)

This architecture is necessary because:
1. Vercel's serverless functions don't natively support long-lived WebSocket connections
2. Socket.io requires persistent server connections for real-time messaging
3. Separating concerns allows each service to be optimized for its specific needs

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Backend Deployment**: Your backend must be deployed first to a platform that supports WebSockets
3. **GitHub Repository**: Your code must be pushed to GitHub

## Step-by-Step Deployment

### Step 1: Deploy the Backend

First, deploy your backend to a platform that supports WebSocket connections:

#### Option A: Deploy to Render (Recommended)

1. Push your repository to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click "New +" → "Blueprint"
4. Connect your repository
5. Render will detect the `render.yaml` file
6. Set environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Auto-generated or provide your own
   - `CLOUDINARY_NAME`: Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY`: Your Cloudinary API key
   - `CLOUDINARY_SECRET`: Your Cloudinary API secret
7. Click "Apply" to deploy
8. **Note your backend URL** (e.g., `https://your-app.onrender.com`)

#### Option B: Deploy to Railway

1. Go to [Railway](https://railway.app)
2. Create a new project from your GitHub repository
3. Configure environment variables (same as above)
4. Railway will auto-detect and deploy your backend
5. **Note your backend URL**

### Step 2: Deploy the Frontend to Vercel

#### Method 1: Using the Vercel Dashboard (Easiest)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will automatically detect the `vercel.json` configuration
5. **Configure Environment Variables** (Optional but recommended):
   - Click "Environment Variables"
   - Add variable: `VITE_BACKEND_URL`
   - Value: Your backend URL (e.g., `https://your-app.onrender.com`)
   - Make sure to add it for Production, Preview, and Development environments
6. Click "Deploy"
7. Wait for the build to complete (usually 1-2 minutes)
8. Your frontend will be available at `https://your-project.vercel.app`

#### Method 2: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to project root
cd /path/to/Whatsapp-clone

# Login to Vercel
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

### Step 3: Update Backend URL (if not using environment variables)

⚠️ **IMPORTANT**: The `vercel.json` file currently contains a demo backend URL (`https://whatsapp-clone-waxc.onrender.com`). You MUST update this to point to your own backend deployment.

If you didn't set the `VITE_BACKEND_URL` environment variable, you need to update the `vercel.json` file:

1. Open `vercel.json` in the root directory
2. Update the `rewrites` section with your backend URL:

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

3. Commit and push the changes
4. Vercel will automatically redeploy

## Configuration Options

### Option 1: Environment Variables (Recommended)

**Pros**:
- No code changes needed to switch backends
- Different URLs for development/staging/production
- Secrets not committed to repository

**Cons**:
- Must configure in Vercel dashboard for each environment

Set `VITE_BACKEND_URL` in Vercel project settings to your backend URL.

### Option 2: Hardcoded in vercel.json

**Pros**:
- Simple, no environment variable setup needed
- Works immediately after deployment

**Cons**:
- Backend URL committed to repository
- Requires code change to switch backends
- Same backend for all environments

Update the `rewrites` section in `vercel.json` with your backend URL.

## How It Works

### Build Process

1. Vercel reads `vercel.json` configuration
2. Executes: `cd frontend && npm install && npm run build`
3. Vite builds the React app into static files
4. Static files are output to `frontend/dist`
5. Files are deployed to Vercel's CDN

### Runtime Behavior

1. User visits `https://your-project.vercel.app`
2. Vercel serves the React app from CDN
3. When the app makes API calls to `/api/*`:
   - If `VITE_BACKEND_URL` is set: App calls backend directly
   - If not set: Vercel rewrites to backend URL in `vercel.json`
4. Socket.io connections to `/socket.io/*` are proxied to backend
5. Backend handles all API and WebSocket traffic

## Troubleshooting

### Build Fails

**Issue**: Build fails with module not found errors
**Solution**: Ensure all dependencies are in `frontend/package.json`

**Issue**: Build fails with "command not found"
**Solution**: Check that build command in `vercel.json` is correct

### API Calls Fail

**Issue**: API calls return 404 or CORS errors
**Solution**: 
- Verify backend is running and accessible
- Check `VITE_BACKEND_URL` environment variable is set correctly
- Verify backend URL in `vercel.json` rewrites is correct
- Check backend CORS configuration allows Vercel domain

### Socket.io Connection Fails

**Issue**: Real-time messaging doesn't work
**Solution**:
- Verify backend supports WebSocket connections
- Check Socket.io rewrite in `vercel.json` points to backend
- Ensure backend's CORS configuration includes Vercel domain
- Check browser console for Socket.io connection errors

### Environment Variables Not Working

**Issue**: `VITE_BACKEND_URL` not being used
**Solution**:
- Redeploy after adding environment variables
- Ensure variable name starts with `VITE_` (Vite requirement)
- Check variable is set for all environments (Production/Preview/Development)

## Verifying Deployment

After deployment, verify everything works:

1. **Frontend loads**: Visit your Vercel URL
2. **API connection**: Try signing up or logging in
3. **Real-time messaging**: Send messages between two browsers/devices
4. **Image upload**: Test uploading profile pictures

## Updating Your Deployment

### Update Frontend

1. Push changes to your GitHub repository
2. Vercel automatically detects and deploys changes
3. Wait 1-2 minutes for build to complete
4. Changes are live

### Update Backend

1. Push changes to your GitHub repository
2. Your backend platform (Render/Railway) automatically deploys
3. No frontend changes needed (unless API contract changes)

## Advanced Configuration

### Custom Domain

1. Go to Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Vercel automatically provisions SSL certificate

### Preview Deployments

- Every pull request gets a unique preview URL
- Test changes before merging to production
- Preview deployments use same environment variables as Production

### Build Optimization

To speed up builds, you can:
1. Use Vercel's build cache
2. Minimize dependencies
3. Optimize assets during build

## Cost Considerations

### Vercel Pricing
- **Hobby Plan** (Free):
  - 100 GB bandwidth/month
  - Unlimited deployments
  - Good for personal projects

- **Pro Plan** ($20/month):
  - 1 TB bandwidth/month
  - Team collaboration features
  - Good for production apps

### Backend Pricing
- **Render Free Tier**: Sleeps after inactivity (suitable for demos)
- **Render Starter**: $7/month (always on)
- **Railway**: Pay-as-you-go ($5 minimum)

## Security Best Practices

1. **Never commit secrets**: Use environment variables for all sensitive data
2. **Use HTTPS**: Both Vercel and Render provide automatic SSL
3. **Configure CORS properly**: Only allow your Vercel domain in production
4. **Rotate JWT secrets**: Change periodically for security
5. **Monitor logs**: Check Vercel and backend logs regularly

## Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Discord**: [vercel.com/discord](https://vercel.com/discord)
- **GitHub Issues**: Report issues in this repository

## Summary

This monorepo is now configured for Vercel deployment with:
- ✅ Automated frontend builds from GitHub
- ✅ CDN distribution for fast global access
- ✅ API proxying to backend server
- ✅ WebSocket support via backend proxy
- ✅ Environment-based configuration
- ✅ Automatic deployments on push
