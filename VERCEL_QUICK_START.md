# Quick Start: Deploy to Vercel

## 1️⃣ Prepare Your Code
Your code is already set up for Vercel deployment! These files were created:
- ✅ `vercel.json` - Vercel configuration
- ✅ `backend/api/index.py` - FastAPI serverless function
- ✅ `.env.example` - Environment variable template
- ✅ `VERCEL_DEPLOYMENT.md` - Full deployment guide

## 2️⃣ Get Your MongoDB URL
1. Sign up at https://mongodb.com/cloud/atlas
2. Create a cluster (free tier available)
3. Copy your connection string: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`

## 3️⃣ Deploy (Choose One)

### Via GitHub (Easiest)
1. Push code to GitHub
2. Go to https://vercel.com/new
3. Import your GitHub repository
4. Add environment variables (see below)
5. Click Deploy! 🚀

### Via Vercel CLI
```bash
npm install -g vercel
vercel --prod
```

## 4️⃣ Add Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```
MONGO_URL=mongodb+srv://user:password@cluster.mongodb.net/dbname
DB_NAME=ebrokercrm
JWT_SECRET_KEY=your-random-secret-key-here
CORS_ORIGINS=https://your-domain.vercel.app
FRONTEND_URL=https://your-domain.vercel.app
REACT_APP_BACKEND_URL=https://your-domain.vercel.app
```

## 5️⃣ That's It! 🎉

Your app will be live at: `https://your-project.vercel.app`

**Test it:**
- Frontend: `https://your-project.vercel.app`
- API: `https://your-project.vercel.app/api/stats`
- Docs: `https://your-project.vercel.app/docs`

---

### What changed?
- FastAPI server now runs as serverless functions
- React frontend served as static files
- Both deployed on same Vercel domain
- MongoDB handles all data

### Limitations
- Python cold starts ~15s (normal, use Pro plan for better performance)
- Serverless functions timeout after 60s on free tier
- MongoDB Atlas free tier has connection limits

For detailed troubleshooting, see `VERCEL_DEPLOYMENT.md`
