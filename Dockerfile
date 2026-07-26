FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9 --activate

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/api ./apps/api

RUN pnpm install --frozen-lockfile
RUN cd apps/api && npx prisma generate
RUN pnpm --filter @unipath/shared build
RUN pnpm --filter @unipath/api build

FROM node:22-alpine AS runner
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

RUN cd apps/api && npx prisma@6 generate

ENV PORT=4000
EXPOSE 4000

CMD ["node", "apps/api/dist/index.js"]
