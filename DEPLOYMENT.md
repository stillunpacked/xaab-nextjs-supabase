# XAAB Deployment Guide

This guide will help you deploy the XAAB website to production.

## 🚀 Quick Deployment

### Option 1: One-Click Deploy (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/xaab)

### Option 2: Manual Deployment

## 📋 Prerequisites

Before deploying, ensure you have:

1. **Google OAuth Credentials**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs

2. **MongoDB Database**
   - [MongoDB Atlas](https://www.mongodb.com/atlas) (Recommended)
   - Or local MongoDB instance

3. **Cloudinary Account**
   - Sign up at [Cloudinary](https://cloudinary.com/)
   - Get your cloud name, API key, and secret

4. **Email Service**
   - Gmail with App Password (for development)
   - Or professional email service (SendGrid, Mailgun, etc.)

## 🌐 Frontend Deployment (Vercel)

### Step 1: Prepare Repository
```bash
# Push your code to GitHub
git add .
git commit -m "Initial commit"
git push origin main
```

### Step 2: Deploy to Vercel
1. Go to [Vercel](https://vercel.com/)
2. Sign in with GitHub
3. Click "New Project"
4. Import your repository
5. Configure build settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Step 3: Environment Variables
Add these environment variables in Vercel dashboard:

```env
# NextAuth
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# API URL
NEXT_PUBLIC_API_URL=https://your-backend-url.com

# Supabase (if using)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 🖥️ Backend Deployment (Railway)

### Step 1: Prepare Backend
```bash
# Create production build
cd server
npm install --production
```

### Step 2: Deploy to Railway
1. Go to [Railway](https://railway.app/)
2. Sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository
6. Set root directory to `server`

### Step 3: Environment Variables
Add these environment variables in Railway dashboard:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/xaab

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=admin@xaab.com

# Server
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-domain.vercel.app
```

## 🗄️ Database Setup (MongoDB Atlas)

### Step 1: Create Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Choose your preferred region
4. Select cluster tier (M0 for free tier)

### Step 2: Configure Access
1. **Database Access**:
   - Create a database user
   - Set username and password
   - Grant "Atlas admin" role

2. **Network Access**:
   - Add IP address (0.0.0.0/0 for all IPs)
   - Or add specific IPs for security

### Step 3: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database password
5. Replace `<dbname>` with `xaab`

## 📧 Email Configuration

### Gmail Setup
1. Enable 2-Factor Authentication
2. Generate App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the app password in `EMAIL_PASS`

### Professional Email Service
For production, consider using:
- **SendGrid**: Reliable email delivery
- **Mailgun**: Developer-friendly
- **AWS SES**: Cost-effective for high volume

## 🔧 Domain Configuration

### Custom Domain (Optional)
1. **Vercel**:
   - Go to project settings
   - Add custom domain
   - Update DNS records

2. **Railway**:
   - Add custom domain in project settings
   - Update DNS records

### SSL Certificates
- Vercel: Automatic SSL
- Railway: Automatic SSL
- Custom domains: Automatic SSL with Let's Encrypt

## 🚀 Deployment Commands

### Local Testing
```bash
# Test production build locally
npm run build
npm run start

# Test backend
cd server
npm start
```

### Production Deployment
```bash
# Frontend (Vercel)
vercel --prod

# Backend (Railway)
railway up
```

## 📊 Monitoring & Analytics

### Vercel Analytics
1. Enable Vercel Analytics in dashboard
2. View performance metrics
3. Monitor Core Web Vitals

### Railway Monitoring
1. View logs in Railway dashboard
2. Monitor resource usage
3. Set up alerts

### Database Monitoring
1. MongoDB Atlas provides built-in monitoring
2. Set up alerts for performance issues
3. Monitor connection counts

## 🔒 Security Checklist

- [ ] Environment variables are secure
- [ ] Database access is restricted
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] HTTPS is enforced
- [ ] Security headers are set
- [ ] Input validation is in place
- [ ] Authentication is working
- [ ] File uploads are secure

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Database Connection Issues**
   - Check MongoDB Atlas IP whitelist
   - Verify connection string
   - Check database user permissions

3. **OAuth Issues**
   - Verify redirect URIs
   - Check client ID and secret
   - Ensure Google+ API is enabled

4. **File Upload Issues**
   - Check Cloudinary credentials
   - Verify file size limits
   - Check CORS settings

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# Check environment variables
console.log(process.env)
```

## 📈 Performance Optimization

### Frontend
- Enable Vercel Analytics
- Optimize images with Next.js Image
- Use CDN for static assets
- Implement caching strategies

### Backend
- Enable gzip compression
- Implement Redis caching
- Optimize database queries
- Use connection pooling

### Database
- Create proper indexes
- Monitor query performance
- Regular backups
- Scale as needed

## 🔄 CI/CD Pipeline

### GitHub Actions
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 📞 Support

If you encounter issues during deployment:

1. Check the logs in Vercel/Railway dashboards
2. Verify all environment variables
3. Test locally with production settings
4. Contact support:
   - Vercel: [Vercel Support](https://vercel.com/support)
   - Railway: [Railway Support](https://railway.app/support)
   - MongoDB: [Atlas Support](https://support.mongodb.com/)

## 🎉 Post-Deployment

After successful deployment:

1. **Test all features**:
   - User registration/login
   - Content management
   - File uploads
   - Email notifications

2. **Set up monitoring**:
   - Uptime monitoring
   - Error tracking
   - Performance monitoring

3. **Configure backups**:
   - Database backups
   - File backups
   - Regular testing

4. **Update documentation**:
   - API documentation
   - User guides
   - Admin documentation

---

**Congratulations! Your XAAB website is now live! 🚀**
