# Stage 1: Install dependencies and build
FROM oven/bun:1-alpine AS builder
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# Stage 2: Production runtime
FROM node:22-alpine AS runner
RUN apk add --no-cache dumb-init wget

WORKDIR /app

# Non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy production artifacts
COPY package.json bun.lock ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts

# Set ownership
RUN chown -R appuser:appgroup /app

USER appuser

ENV NODE_ENV=production
ENV PORT=3000
ENV ORIGIN=https://merckel.dev

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget --no-verbose --spider http://localhost:3000/api/health || exit 1

# OCI labels
ARG BUILD_DATE
ARG VCS_REF
LABEL org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.source="https://github.com/merckel/merckel.dev"

ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "npx drizzle-kit migrate && node build"]
