# Forcing Zeabur to Use Docker Instead of Static Site Builder

Based on the build logs, Zeabur is still using the static site builder (Caddy) instead of the Docker configuration we've set up. Here are specific steps to force Zeabur to use Docker:

## Option 1: Delete and Recreate the Service (Recommended)

1. **Delete the Current Service**:
   - Go to the Zeabur dashboard
   - Select your project
   - Find the service that's being incorrectly built as static
   - Click on the service settings (gear icon)
   - Scroll down to find "Delete Service" or similar option
   - Confirm deletion

2. **Create a New Service With Explicit Configuration**:
   - Click "Add Service"
   - Choose "Custom Deployment" or "Docker" option (instead of GitHub)
   - Upload the `backend-service.json` file (for backend) or `frontend-service.json` file (for frontend)
   - Upload the corresponding Dockerfile alongside the configuration file
   - Deploy the service

## Option 2: Force Docker Using API

If you can access the Zeabur API:

1. **Get an API Token**:
   ```bash
   zeabur auth token
   ```

2. **Force Docker Builder**:
   ```bash
   curl -X PATCH "https://api.zeabur.com/v1/services/YOUR_SERVICE_ID" \
     -H "Authorization: Bearer YOUR_API_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"builder": "docker", "buildConfig": {"dockerfile": "Dockerfile", "context": "."}}'
   ```

3. **Redeploy the Service**:
   ```bash
   zeabur service redeploy --service YOUR_SERVICE_ID
   ```

## Option 3: Direct Deployment of Docker Image

1. **Build Docker Image Locally**:
   ```bash
   # For backend
   cd backend
   docker build -t checkin-system-backend .
   
   # For frontend
   cd frontend
   docker build -t checkin-system-frontend .
   ```

2. **Push to Docker Registry**:
   ```bash
   # Tag with Zeabur registry
   docker tag checkin-system-backend registry.zeabur.com/your-username/checkin-system-backend
   docker tag checkin-system-frontend registry.zeabur.com/your-username/checkin-system-frontend
   
   # Login to Zeabur registry
   docker login registry.zeabur.com -u your-username
   
   # Push images
   docker push registry.zeabur.com/your-username/checkin-system-backend
   docker push registry.zeabur.com/your-username/checkin-system-frontend
   ```

3. **Deploy from Registry**:
   - In Zeabur dashboard, choose "Deploy from Docker Registry"
   - Enter the image URL
   - Configure environment variables manually

## Additional Troubleshooting Steps

1. **Add a `.zeabur-type` File**:
   - Create a file named `.zeabur-type` in your repository root
   - Add the content `docker` to the file
   - Commit and push
   - Redeploy your service

2. **Check Project Settings**:
   - In your Zeabur project settings, look for "Default Builder" or similar
   - Make sure it's not set to "static" or "web"

3. **Contact Zeabur Support**:
   - If all else fails, contact Zeabur support with your build logs
   - Ask them to manually set your builder type to Docker

## Verifying Successful Docker Deployment

You'll know Docker is being used when:

1. The build logs show `docker build` commands
2. You see references to your Dockerfile in the logs
3. The base image is not `caddy-static`

Remember to check the logs after redeployment to confirm the correct builder is being used. 