# =========================
# BASE BUILD STAGE
# =========================
FROM node:22 AS base

# Use a non-root user
USER node
WORKDIR /app

# Copy package files first for caching
COPY --chown=node:node package.json yarn.lock .yarnrc.yml tsconfig*.json migrate-mongo-config.js ./
COPY --chown=node:node .yarn/releases ./.yarn/releases

# Copy migrations (optional, needed if you run migrate-mongo inside container)
COPY --chown=node:node migrations ./migrations

# Install dependencies
RUN yarn install --immutable

# Copy the rest of the source
COPY --chown=node:node . .

# Build TypeScript to /dist using build-specific tsconfig
RUN yarn tsc -p tsconfig.build.json

# =========================
# PRODUCTION IMAGE
# =========================
FROM node:22-alpine AS production

# Create log file and ensure node user can write
RUN touch /var/log/fa.log && chown node:node /var/log/fa.log

USER node
WORKDIR /app

# Copy only what’s needed for production
COPY --chown=node:node --from=base /app/package.json ./package.json
COPY --chown=node:node --from=base /app/node_modules ./node_modules
COPY --chown=node:node --from=base /app/migrate-mongo-config.js ./migrate-mongo-config.js
COPY --chown=node:node --from=base /app/migrations ./migrations
COPY --chown=node:node --from=base /app/dist ./dist

# Run the compiled NestJS app
CMD ["node", "dist/main.js"]