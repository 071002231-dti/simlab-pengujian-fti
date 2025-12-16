# =============================================================================
# Stage 1: Build
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (better layer caching)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build arguments for Vite (build-time defaults)
ARG VITE_API_BASE_URL=http://localhost:8000/api
ARG VITE_USE_MOCK_DATA=false
ARG VITE_BASE_PATH=/
ARG VITE_GOOGLE_CLIENT_ID=

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_USE_MOCK_DATA=$VITE_USE_MOCK_DATA
ENV VITE_BASE_PATH=$VITE_BASE_PATH
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Build the application
RUN npm run build

# =============================================================================
# Stage 2: Production
# =============================================================================
FROM nginx:alpine AS production

# Install envsubst for runtime environment variable substitution
RUN apk add --no-cache gettext

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy environment template
COPY nginx/env-config.template.js /usr/share/nginx/html/env-config.template.js

# Create startup script for runtime env injection
RUN cat > /docker-entrypoint.d/40-envsubst-env-config.sh << 'EOF'
#!/bin/sh
set -e

# Default values if not provided
export API_BASE_URL="${API_BASE_URL:-http://localhost:8000/api}"
export USE_MOCK_DATA="${USE_MOCK_DATA:-false}"

# Generate env-config.js from template
envsubst < /usr/share/nginx/html/env-config.template.js > /usr/share/nginx/html/env-config.js

# Remove template file
rm -f /usr/share/nginx/html/env-config.template.js

echo "Environment configuration generated:"
cat /usr/share/nginx/html/env-config.js
EOF

RUN chmod +x /docker-entrypoint.d/40-envsubst-env-config.sh

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Default command
CMD ["nginx", "-g", "daemon off;"]
