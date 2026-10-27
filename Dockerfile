# syntax=docker/dockerfile:1
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

FROM deps AS build
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate && npx next build

# --- Application Next.js (standalone) ---
FROM node:20-alpine AS app
WORKDIR /app
RUN apk add --no-cache openssl && mkdir -p /data/uploads && chown node:node /data/uploads
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
CMD ["node", "server.js"]

# --- Worker : migrations, rappels push, sauvegarde quotidienne ---
FROM deps AS worker
RUN apk add --no-cache postgresql16-client
COPY . .
RUN npx prisma generate
ENV NODE_ENV=production
CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx worker/index.ts"]
