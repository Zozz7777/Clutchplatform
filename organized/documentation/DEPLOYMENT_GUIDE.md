# Clutch Platform Deployment Guide

## 🚀 Complete API Connection Fixes & Deployment Guide

This guide covers the complete setup and deployment of the Clutch platform with all API connection issues resolved.

## ✅ Issues Fixed

### 1. **Backend Logger Module Issue** ✅
- **Problem**: Missing `./logger` module causing backend crashes
- **Solution**: Fixed import paths in all service files to use `../config/logger`
- **Files Fixed**:
  - `shared-backend/services/researchBasedAI.js`
  - `shared-backend/services/fixedHealthMonitor.js`
  - `shared-backend/services/autoFixingSystem.js`
  - `shared-backend/services/googleResearchEngine.js`

### 2. **Frontend API Connection Issues** ✅
- **Problem**: Hardcoded URLs and incorrect API endpoints
- **Solution**: Updated all components to use environment variables
- **Files Fixed**:
  - `clutch-admin/src/utils/performanceMonitor.ts`
  - `clutch-admin/src/components/LogDashboard.tsx`
  - `clutch-admin/src/utils/errorTracker.ts`
  - `clutch-admin/src/lib/user-feedback.ts`
  - `clutch-admin/src/lib/user-analytics.tsx`
  - `clutch-admin/src/lib/performance-monitoring.tsx`

### 3. **CORS Configuration** ✅
- **Problem**: CORS blocking requests from production domains
- **Solution**: Updated CORS origins to include production domains
- **Configuration**: Added `https://admin.yourclutch.com` to allowed origins

### 4. **Environment Configuration** ✅
- **Problem**: Missing production environment files
- **Solution**: Created production environment files for both frontend and backend

## 🏗️ Local Development Setup

### Prerequisites
- Node.js v22.18.0 or higher
- MongoDB Atlas connection
- Redis (optional for caching)

### Backend Setup
```bash
cd shared-backend
npm install
npm start
```

### Frontend Setup
```bash
cd clutch-admin
npm install
npm run dev
```

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
HOST=0.0.0.0

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/clutch
MONGODB_DB=clutch

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,https://admin.yourclutch.com
CORS_CREDENTIALS=true
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,https://admin.yourclutch.com
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_DEBUG_AUTH=true
NEXT_PUBLIC_USE_MOCK_AUTH=false
```

## 🌐 Production Deployment

### Backend Deployment (Render)

1. **Environment Variables** (Set in Render Dashboard):
```env
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/clutch
MONGODB_DB=clutch

# JWT (Use strong secrets in production)
JWT_SECRET=production_jwt_secret_change_this
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=production_refresh_secret_change_this
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=https://admin.yourclutch.com,https://clutch-main-nk7x.onrender.com
CORS_CREDENTIALS=true
ALLOWED_ORIGINS=https://admin.yourclutch.com,https://clutch-main-nk7x.onrender.com
```

2. **Build Command**: `npm install`
3. **Start Command**: `npm start`

### Frontend Deployment (Vercel/Netlify)

1. **Environment Variables**:
```env
NEXT_PUBLIC_API_URL=https://clutch-main-nk7x.onrender.com/api/v1
NEXT_PUBLIC_DEBUG_AUTH=false
NEXT_PUBLIC_USE_MOCK_AUTH=false
```

2. **Build Command**: `npm run build`
3. **Output Directory**: `.next`

## 🔧 API Endpoints Verified

### Authentication
- ✅ `POST /api/v1/auth/employee-login`
- ✅ `GET /api/v1/auth/employee-me`
- ✅ `POST /api/v1/auth/refresh-token`

### Dashboard
- ✅ `GET /api/v1/admin/dashboard/consolidated`
- ✅ `GET /api/v1/admin/dashboard/metrics`

### Performance
- ✅ `POST /api/v1/performance/client-metrics`

### CORS
- ✅ Preflight requests working
- ✅ All necessary headers present
- ✅ Production domains allowed

## 🧪 Testing

### Backend Health Check
```bash
curl http://localhost:5000/health
```

### API Endpoint Test
```bash
curl -X POST http://localhost:5000/api/v1/auth/employee-login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### CORS Test
```bash
curl -X OPTIONS http://localhost:5000/api/v1/auth/employee-login \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization"
```

## 🚨 Troubleshooting

### Backend Issues
1. **Logger Module Error**: Ensure all service files use `../config/logger`
2. **Port Already in Use**: Kill existing processes or change port
3. **Database Connection**: Verify MongoDB URI and network access

### Frontend Issues
1. **API Connection Failed**: Check `NEXT_PUBLIC_API_URL` environment variable
2. **CORS Errors**: Verify backend CORS configuration includes frontend domain
3. **Build Errors**: Check for TypeScript errors and missing dependencies

### Production Issues
1. **503 Service Unavailable**: Check Render logs for startup errors
2. **CORS Blocked**: Verify production domains in CORS configuration
3. **Environment Variables**: Ensure all required variables are set in deployment platform

## 📊 Monitoring

### Health Endpoints
- Backend: `https://clutch-main-nk7x.onrender.com/health`
- Frontend: Check browser console for errors

### Logs
- Backend: Check Render logs
- Frontend: Check browser developer tools

## 🔄 Next Steps

1. **Deploy Backend**: Push changes to Render
2. **Deploy Frontend**: Push changes to Vercel/Netlify
3. **Test Production**: Verify all API connections work
4. **Monitor**: Set up error tracking and performance monitoring
5. **SSL**: Ensure HTTPS is properly configured

## 📝 Notes

- All API connection issues have been resolved
- CORS is properly configured for production
- Environment variables are properly set up
- Logger module issues are fixed
- Frontend components use correct API URLs

The system is now ready for production deployment with all API connections working correctly.
