# Etap budowania
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Build TypeScript
RUN npm run build

# Build Swagger / OpenAPI
RUN npm run docs:build

# Etap produkcyjny
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3030

CMD ["node", "dist/server.js"]