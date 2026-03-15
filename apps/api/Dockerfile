FROM oven/bun:1
WORKDIR /app
COPY apps/api/package.json ./apps/api/
COPY package.json ./
RUN cd apps/api && bun install --no-frozen-lockfile
COPY apps/api/ ./apps/api/
WORKDIR /app/apps/api
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
EXPOSE 3001
CMD ["bun", "run", "src/index.ts"]
