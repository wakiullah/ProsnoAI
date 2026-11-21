# ─────────────────────────────────────────────────────────────────────────────
# ProshnoAI Backend Dockerfile (Optimized for Hugging Face Spaces & Render)
# Includes Node 20 + System Chromium + Full Bengali & Arabic Fonts for PDF
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim

# Install Chromium & comprehensive Bengali + Arabic + Latin fonts for Puppeteer PDF
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    ca-certificates \
    fontconfig \
    fonts-noto-core \
    fonts-noto-extra \
    fonts-noto-ui-core \
    fonts-beng \
    fonts-beng-extra \
    fonts-hosny-amiri \
    fonts-sil-scheherazade \
    fonts-liberation \
    && fc-cache -fv \
    && rm -rf /var/lib/apt/lists/*

# Tell Puppeteer to use the pre-installed system Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    NODE_ENV=production \
    PORT=7860 \
    HOME=/home/node

WORKDIR /app

# Copy workspace manifests first for layer caching
COPY package.json yarn.lock ./
COPY shared/package.json ./shared/
COPY server/package.json ./server/
COPY client/package.json ./client/

# Install dependencies (using --ignore-engines to prevent strict Node engine version mismatch)
RUN yarn install --ignore-engines --frozen-lockfile || yarn install --ignore-engines

# Copy shared & server source code
COPY shared ./shared
COPY server ./server

# Build shared library and Express TypeScript server
RUN yarn build:shared && yarn build:server

# Hugging Face Spaces runs containers as user ID 1000 (node)
RUN chown -R node:node /app
USER node

EXPOSE 7860

CMD ["node", "server/dist/server.js"]
