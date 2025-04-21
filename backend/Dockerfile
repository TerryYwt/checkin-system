FROM node:18-alpine

WORKDIR /app

# Install additional dependencies for database connections
RUN apk add --no-cache mysql-client

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Create directory for uploads
RUN mkdir -p uploads && chmod 777 uploads

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/api/health').then(r => r.json()).then(data => process.exit(data.status === 'ok' ? 0 : 1)).catch(() => process.exit(1))"

# Expose the port
EXPOSE 3000

# Initialize database and start the application
CMD ["sh", "-c", "npm run db:init && npm start"] 