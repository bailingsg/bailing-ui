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
# typescript 只声明在 devDependencies，--omit=dev 之后运行时不带它；而
# next.config.ts 是 TS 文件，`next start` 启动时要加载它 → Next 会退而在
# 容器内现场 `npm install typescript`，把新容器首启拖到 4~5 分钟（期间
# nginx 一直 502）。在构建期预装，容器启动即就绪。
# 注意：不能直接 `npm install --no-save typescript`——它已在 package.json 的
# devDependencies 里，NODE_ENV=production 下会被 --omit=dev 判定为「已忽略」，
# 只输出 `up to date` 而什么都不装。故装到独立前缀再拷进 node_modules。
RUN npm ci --omit=dev \
 && mkdir -p /tmp/ts \
 && npm install --no-audit --no-fund --prefix /tmp/ts typescript@5.8.2 \
 && cp -r /tmp/ts/node_modules/typescript /app/node_modules/typescript \
 && rm -rf /tmp/ts \
 && npm cache clean --force
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
