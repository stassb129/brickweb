# Build from repository root:
#   docker build -f apps/backend/Dockerfile -t brickweb-backend .

FROM node:18-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/

RUN npm ci

COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend

RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=@brickweb/backend

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/apps/backend/package.json ./package.json
COPY --from=build /app/apps/backend/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/shared ./packages/shared

EXPOSE 4000

CMD ["node", "dist/main.js"]
