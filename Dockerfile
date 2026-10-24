# Bailing Wooden Frontend (Next.js 15, SSR/ISR) - production image
# NOTE: NEXT_PUBLIC_API_BASE_URL is the FULL API base incl. '/api/v1' prefix
# (see src/lib/cms-api.ts). Same-origin deployment => '/api/v1' (proxied by
# Nginx to backend). Never ''. Env is inlined at build time; no secrets.
#
# ⚠️⚠️ 运行时环境变量陷阱（2026-10-23 生产事故，前台所有图片 400 裂图）⚠️⚠️
# 本镜像**不是** standalone 构建：runtime 阶段 COPY 了 next.config.ts，
# `next start` 会在**容器启动时**重新加载它。而 next.config.ts 里的
# images.remotePatterns 来自 process.env.NEXT_PUBLIC_*_BASE_URL。
# 因此：只把这些变量作为 --build-arg 传入是不够的——客户端包确实内联正确，
# 但 remotePatterns 会在运行期变成空数组，/_next/image 对每一个远程 URL
# 都返回 400 `"url" parameter is not allowed`。
# 结论：构建期传 build-arg（客户端用）**并且**运行期注入同样的环境变量
# （compose 的 frontend.environment，见生产 compose.app.yml）。
#   docker build -t bailing-ui:<commit> \
#     --build-arg NEXT_PUBLIC_API_BASE_URL=/api/v1 \
#     --build-arg NEXT_PUBLIC_UPLOADS_BASE_URL=https://bailingwooden.com \
#     --build-arg NEXT_PUBLIC_CDN_BASE_URL=https://cdn.bailingwooden.com \
#     --build-arg NEXT_PUBLIC_SITE_URL=https://bailingwooden.com \
#     --build-arg NEXT_PUBLIC_CMS_SOURCE=api \
#     --build-arg NEXT_PUBLIC_PRODUCTS_SOURCE=api \
#     --build-arg NEXT_PUBLIC_ALLOW_INDEXING=true \
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
ARG NEXT_PUBLIC_UPLOADS_BASE_URL="https://bailingwooden.com"
ARG NEXT_PUBLIC_CDN_BASE_URL="https://cdn.bailingwooden.com"
ARG NEXT_PUBLIC_SITE_URL="https://bailingwooden.com"
ARG NEXT_PUBLIC_CMS_SOURCE="api"
ARG NEXT_PUBLIC_PRODUCTS_SOURCE="api"
ARG NEXT_PUBLIC_ALLOW_INDEXING="true"
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL \
    NEXT_PUBLIC_UPLOADS_BASE_URL=$NEXT_PUBLIC_UPLOADS_BASE_URL \
    NEXT_PUBLIC_CDN_BASE_URL=$NEXT_PUBLIC_CDN_BASE_URL \
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
