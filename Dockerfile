# Bailing Wooden Frontend (Next.js 15, SSR/ISR) - production image
# NOTE: NEXT_PUBLIC_API_BASE_URL is the FULL API base incl. '/api/v1' prefix
# (see src/lib/cms-api.ts). Same-origin deployment => '/api/v1' (proxied by
# Nginx to backend). Never ''. Env is inlined at build time; no secrets.
#   docker build -t bailing-ui:<commit> \
#     --build-arg NEXT_PUBLIC_API_BASE_URL=/api/v1 \
#     --build-arg NEXT_PUBLIC_UPLOADS_BASE_URL=http://43.159.152.116 \
#     --build-arg NEXT_PUBLIC_SITE_URL=http://43.159.152.116 \
#     --build-arg NEXT_PUBLIC_CMS_SOURCE=demo \
#     --build-arg NEXT_PUBLIC_PRODUCTS_SOURCE=demo \
#     --build-arg NEXT_PUBLIC_ALLOW_INDEXING=false \
#     .
# Base image pinned by major (node:22-alpine); no 'latest'.
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_API_BASE_URL="/api/v1"
ARG NEXT_PUBLIC_UPLOADS_BASE_URL="http://43.159.152.116"
ARG NEXT_PUBLIC_SITE_URL="http://43.159.152.116"
ARG NEXT_PUBLIC_CMS_SOURCE="demo"
ARG NEXT_PUBLIC_PRODUCTS_SOURCE="demo"
ARG NEXT_PUBLIC_ALLOW_INDEXING="false"
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL \
    NEXT_PUBLIC_UPLOADS_BASE_URL=$NEXT_PUBLIC_UPLOADS_BASE_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_CMS_SOURCE=$NEXT_PUBLIC_CMS_SOURCE \
    NEXT_PUBLIC_PRODUCTS_SOURCE=$NEXT_PUBLIC_PRODUCTS_SOURCE \
    NEXT_PUBLIC_ALLOW_INDEXING=$NEXT_PUBLIC_ALLOW_INDEXING \
    NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
# next start needs: .next, public, next.config.*, package.json, node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.ts ./
RUN chown -R node:node /app
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["npx", "next", "start"]
