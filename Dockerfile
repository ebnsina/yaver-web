# syntax=docker/dockerfile:1

# ---- build ----
FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build && pnpm prune --prod

# ---- runtime ----
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
# adapter-node listens on $PORT (default 3000). Put a reverse proxy in front that
# routes /v1, /public, and /widget.js to the API so the session cookie stays
# first-party (see README).
ENV PORT=3000
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
EXPOSE 3000
CMD ["node", "build"]
