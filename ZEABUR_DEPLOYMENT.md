# Zeabur Deployment Guide

This project is configured for deployment on Zeabur with a monorepo structure containing both frontend (Vue.js) and backend (Node.js) components.

## Repository Structure

```
/
├── backend/                    # Node.js Express backend
│   ├── package.json
│   ├── src/
│   ├── Dockerfile             # Backend Docker configuration
│   └── zeabur.json            # Backend-specific configuration
├── frontend/                   # Vue.js frontend
│   ├── package.json
│   ├── src/
│   ├── Dockerfile             # Frontend Docker configuration
│   └── zeabur.json            # Frontend-specific configuration
├── zeabur.toml                 # Root configuration for Zeabur
└── ...
```

## Deployment Options

### Option 1: Deploy as Two Separate Services (Recommended)

1. **Backend Service**:
   - Create a new service in Zeabur
   - Select your GitHub repository
   - Set subdirectory to `/backend`
   - Select "Docker" as the deployment type
   - Zeabur will use `backend/Dockerfile` for building

2. **Frontend Service**:
   - Create another service in Zeabur
   - Select the same GitHub repository
   - Set subdirectory to `/frontend`
   - Select "Docker" as the deployment type
   - Zeabur will use `frontend/Dockerfile` for building

### Option 2: Deploy from Root (Using zeabur.toml)

1. Create a service in Zeabur
2. Select your GitHub repository (no subdirectory)
3. Zeabur will use the root `zeabur.toml` file
4. This will create both services as defined in the `[services]` section, each with its own Dockerfile

## Environment Variables

### Backend Environment Variables

Required variables for backend deployment:
- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `DB_NAME` - Database name
- `DB_USER` - Database username
- `DB_PASS` - Database password
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Set to "production" for production deployment

### Frontend Environment Variables

Required variables for frontend deployment:
- `VITE_API_URL` - URL of the backend API (e.g., "https://api.your-domain.com")

## Checking Deployment Status

You can verify your deployment by:
1. Checking the frontend URL: https://checkin-system.zeabur.app
2. Testing the backend health endpoint: https://checkin-system.zeabur.app/api/health

## Troubleshooting

If you encounter issues:
1. Check Zeabur logs in the dashboard
2. Verify environment variables are set correctly
3. Ensure database connection is working
4. Check CORS configuration if frontend can't connect to backend

## Why Dockerfiles?

We're using Dockerfiles to ensure that Zeabur correctly identifies our services instead of relying on auto-detection. This provides several benefits:
- More explicit control over the build process
- No ambiguity about project type
- Consistent builds across environments
- Better isolation between frontend and backend 