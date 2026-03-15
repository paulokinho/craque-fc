FROM oven/bun:1
WORKDIR /app
COPY apps/web/package.json ./apps/web/
COPY package.json ./
RUN cd apps/web && bun install --no-frozen-lockfile
COPY apps/web/ ./apps/web/
WORKDIR /app/apps/web
EXPOSE 5173
CMD ["bun", "run", "dev", "--host", "0.0.0.0"]
