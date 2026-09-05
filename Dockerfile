# =============================================================================
# Carthage-Clean Web App - Multi-stage Dockerfile
# =============================================================================
# Build stages:
# 1. base         - Base image with Node.js and pnpm
# 2. dependencies - Install all dependencies (including dev deps for build)
# 3. builder      - Build the Next.js application
# 4. runtime      - Production runtime with only production dependencies
# =============================================================================

# =============================================================================
# Stage 1: Base
# =============================================================================
FROM node:20-alpine AS base

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Set working directory
WORKDIR /app

# =============================================================================
# Stage 2: Dependencies
# =============================================================================
FROM base AS dependencies

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY apps/public-site/package.json ./apps/public-site/
COPY packages/config/package.json ./packages/config/
COPY packages/types/package.json ./packages/types/

# Install dependencies (including devDependencies for build)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# =============================================================================
# Stage 3: Builder
# =============================================================================
FROM dependencies AS builder

# Copy source code
COPY . .

# Build the web application
RUN pnpm --filter @carthage-clean/web build

# =============================================================================
# Stage 4: Runtime
# =============================================================================
FROM node:20-alpine AS runtime

# Install pnpm for runtime (needed for pnpm start if using pnpm)
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Copy built application from builder (using regular .next output, not standalone)
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/next.config.mjs ./apps/web/
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public/
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next ./apps/web/.next

# Copy workspace package.json for internal package references
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./
COPY --from=builder --chown=nextjs:nodejs /app/pnpm-lock.yaml ./
COPY --from=builder --chown=nextjs:nodejs /app/pnpm-workspace.yaml ./

# Copy internal packages
COPY --from=builder --chown=nextjs:nodejs /app/packages ./packages

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the application
CMD ["pnpm", "--filter", "@carthage-clean/web", "start"]