# Deployment Guide for EbrokerCRM on Vercel

## Prerequisites
- GitHub account with repository uploaded
- Vercel account (https://vercel.com)
- MongoDB Atlas cluster (or MongoDB provider)
- Environment variables ready

## Step-by-Step Deployment

### 1. **Set Up MongoDB**
- Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a free cluster
- Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/dbname`)
- Whitelist your IP address (or use 0.0.0.0 for development)

### 2. **Prepare Your Repository**
Ensure your repo has the correct structure:
```
/backend/api/index.py          (Vercel serverless function)
/backend/requirements.txt
/frontend/                     (React app)
/vercel.json                   (Vercel config)
```

### 3. **Deploy on Vercel**

#### Option A: Using Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Select your GitHub repository
4. In the build settings:
   - **Framework Preset**: React
   - **Build Command**: `cd frontend && npm run build`
   - **Output Directory**: `frontend/build`
   - **Install Command**: `cd frontend && npm install`

5. Add Environment Variables:
   - `MONGO_URL`: Your MongoDB connection string
   - `DB_NAME`: ebrokercrm
   - `JWT_SECRET_KEY`: Generate a strong secret (use: `openssl rand -hex 32`)
   - `CORS_ORIGINS`: Your Vercel domain (e.g., https://your-project.vercel.app)
   - `FRONTEND_URL`: Your Vercel domain
   - `REACT_APP_BACKEND_URL`: https://your-project.vercel.app

6. Click "Deploy"

#### Option B: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### 4. **Update Environment Variables**
After deployment, update the following in Vercel Dashboard:

**Settings → Environment Variables:**
- `REACT_APP_BACKEND_URL`: `https://your-project.vercel.app`
- All other variables from `.env.example`

**Redeploy** after adding/updating variables:
```bash
vercel --prod
```

### 5. **Test Your Deployment**
1. Visit: `https://your-project.vercel.app`
2. Test login at: `https://your-project.vercel.app/api/auth/login`
3. API docs at: `https://your-project.vercel.app/docs` (FastAPI auto-docs)

## Project Structure for Vercel

```
vercel.json          # Vercel configuration
backend/
  ├── api/
  │   └── index.py   # FastAPI app (Vercel serverless function)
  └── requirements.txt
frontend/
  ├── src/
  ├── public/
  ├── package.json
  └── ... other React files
```

## Key Files Configuration

### `vercel.json`
Routes all requests to your FastAPI backend's `/api` prefix, and serves the React frontend as static files.

### `backend/api/index.py`
Your FastAPI application converted to Vercel serverless format. The `app` variable is exported for Vercel to use.

### `frontend/.env.local` (local development)
```
REACT_APP_BACKEND_URL=http://localhost:8000
```

### `frontend/.env.production` (Vercel)
Set via Environment Variables in Vercel Dashboard:
```
REACT_APP_BACKEND_URL=https://your-project.vercel.app
```

## Troubleshooting

### "Cannot GET /api/..."
- Check `CORS_ORIGINS` environment variable
- Ensure `backend/api/index.py` exists
- Check build logs in Vercel dashboard

### Blank homepage
- Check `REACT_APP_BACKEND_URL` is set correctly
- Verify frontend builds: `cd frontend && npm run build`

### Authentication not working
- Check `JWT_SECRET_KEY` is set
- Verify MongoDB connection string in `MONGO_URL`

### Cold starts
- Vercel Python functions have ~15s cold start time
- This is normal, consider using a paid tier for faster response

## Additional Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Python Support](https://vercel.com/docs/functions/serverless-functions/python)
- [FastAPI on Vercel](https://github.com/vercel-community/python-template)

## Post-Deployment Checklist
- [ ] Database connection verified
- [ ] Environment variables set in Vercel
- [ ] Login/registration tested
- [ ] API endpoints responding
- [ ] Frontend loading correctly
- [ ] CORS working properly
- [ ] SSL certificate active (automatic with Vercel)
