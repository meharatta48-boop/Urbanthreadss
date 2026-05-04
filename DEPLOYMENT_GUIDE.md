# Deployment Guide for Urban Threads

## Backend Deployment on Render.com

### Prerequisites
- Render.com account
- Git repository pushed to GitHub/GitLab
- MongoDB Atlas connection string (or use Render's MongoDB)
- All environment variables ready

### Step 1: Prepare Environment Variables

Update the following in your `.env.production`:
```
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://[username]:[password]@cluster.mongodb.net/ecommerceDB?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-here
FRONTEND_URL=https://your-frontend-url.onrender.com (or your custom domain)
CLOUDINARY_CLOUD_NAME=dhgri2ebn
CLOUDINARY_API_KEY=841767524421266
CLOUDINARY_API_SECRET=B5TpSAf9TcZd9Cz6wi09CbUnj18
```

### Step 2: Deploy Backend

1. Go to [Render.com Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the correct branch (main/master)
5. Configure as follows:
   - **Name**: urbanthreads-backend
   - **Environment**: Node
   - **Build Command**: `npm install --omit=dev`
   - **Start Command**: `node backend/server.js`
   - **Region**: Singapore (closest to your users)
   - **Plan**: Pay-as-you-go (for production)

6. Add Environment Variables:
   - Copy all key-value pairs from `.env.production`
   - Make sure `MONGO_URI` is set correctly
   - Set `FRONTEND_URL` to your frontend's deployed URL

7. Click **"Create Web Service"**
8. Wait for deployment (usually 2-5 minutes)

### Step 3: Update Frontend CORS

Once backend is deployed, update your `FRONTEND_URL` in Render dashboard to allow your frontend domain in CORS.

### Step 4: Connect Frontend

In your frontend, update API base URL to:
```
https://urbanthreads-backend.onrender.com/api
```

Or use environment variable:
```
VITE_API_URL=https://urbanthreads-backend.onrender.com/api
```

### Important Notes

✅ **Current Configuration:**
- Node.js backend with Express
- MongoDB Atlas connected
- Cloudinary for image storage
- JWT authentication enabled
- CORS configured

⚠️ **Security Checklist:**
- [ ] JWT_SECRET is secure and unique
- [ ] MONGO_URI uses strong password
- [ ] Cloudinary credentials are kept secure
- [ ] FRONTEND_URL matches your deployed frontend
- [ ] Environment variables set in Render (not in code)
- [ ] .env files are in .gitignore

### Testing Deployment

After deployment, test:
```bash
curl https://urbanthreads-backend.onrender.com/health
```

Should return 200 OK with health status.

### Troubleshooting

1. **503 Service Unavailable**: Check if MONGO_URI is correct
2. **CORS Errors**: Update FRONTEND_URL in Render environment variables
3. **Port Issues**: Ensure using PORT from environment variable (10000 on Render)
4. **Logs**: Check Render dashboard → "Logs" tab for error messages

### Database Options

**Current Setup**: MongoDB Atlas (Recommended)
- Free tier: 512MB storage
- Paid tiers available

**Alternative**: Use Render's PostgreSQL/MongoDB
- Included with Render service
- Easier setup, less configuration

### Rollback

To rollback to previous version:
1. Go to Render dashboard
2. Select your service
3. Click "Deployments"
4. Choose previous deployment
5. Click "Deploy"

