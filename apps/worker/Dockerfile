FROM oven/bun:1
WORKDIR /app
COPY apps/worker/package.json ./apps/worker/
COPY apps/api/package.json ./apps/api/
COPY apps/api/src/ ./apps/api/src/
COPY package.json ./
RUN cd apps/worker && bun install --no-frozen-lockfile
COPY apps/worker/ ./apps/worker/
WORKDIR /app/apps/worker
CMD ["bun", "run", "src/index.ts"]
