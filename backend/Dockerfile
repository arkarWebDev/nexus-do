FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src

RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app

COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/dist ./dist

RUN npm ci --omit=dev && npm install drizzle-kit pg

COPY drizzle.config.ts ./
COPY drizzle ./drizzle

EXPOSE 3001

COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]
