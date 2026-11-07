FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html vite.config.js ./
COPY src ./src
COPY public ./public
RUN npm run build:server

FROM node:24-bookworm-slim AS runtime
ENV NODE_ENV=production PORT=3000 TAVOLA_DATA_DIR=/app/.data
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && mkdir -p /app/.data && chown node:node /app/.data
COPY --from=build /app/dist-server ./dist-server
COPY server.js access.js ./
COPY src/data.js src/actions.js ./src/
USER node
EXPOSE 3000
CMD ["node", "server.js"]
