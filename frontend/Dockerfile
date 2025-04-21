# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy source files
COPY . .

# Use the zeabur-package.json which has vite in dependencies
COPY zeabur-package.json package.json

# Install dependencies from modified package.json
RUN npm install

# Build the application (vite should now be in node_modules)
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy the built files to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Create a simple nginx config with proper SPA routing
RUN echo 'server { \
  listen 80; \
  root /usr/share/nginx/html; \
  index index.html; \
  location / { \
    try_files $uri $uri/ /index.html; \
  } \
}' > /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 