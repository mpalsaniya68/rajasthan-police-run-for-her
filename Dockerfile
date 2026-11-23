# ==============================================================================
# Multi-Stage Production Dockerfile for Rajasthan Police Marathon 2027 Portal
# ==============================================================================

# --- Stage 1: Build the frontend bundle ---
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency specifications and install
COPY package*.json ./
RUN npm ci

# Copy full application source code and build
COPY . .
RUN npm run build

# --- Stage 2: Production runtime ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built frontend assets and server backend
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/public ./public
COPY --from=builder /app/api ./api

# Create writable data directory for local SQLite / backups
RUN mkdir -p /app/data && chown -R node:node /app

USER node
EXPOSE 3000

CMD ["node", "server/server.js"]
