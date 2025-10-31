FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install all dependencies (including dev)
COPY package*.json ./
# Native build deps for better-sqlite3
RUN apk add --no-cache python3 make g++ \
  && npm install

# Copy source and build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Prune to production dependencies
RUN npm prune --omit=dev

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy runtime artifacts
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./

# Create non-root user and data directory with correct permissions
RUN adduser -D nodeuser \
  && mkdir -p /app/data \
  && chown -R nodeuser:nodeuser /app
USER nodeuser

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/index.js"]
