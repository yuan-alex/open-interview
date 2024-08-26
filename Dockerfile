FROM oven/bun:alpine AS base
WORKDIR /usr/src/app

FROM base AS install
RUN mkdir -p /temp/dev
COPY . /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

ENV NODE_ENV=production
RUN bun run build

FROM base AS release
COPY --from=install /temp/dev/node_modules node_modules
COPY --from=prerelease /usr/src/app/packages/backend-hono/dist/ ./dist/backend
COPY --from=prerelease /usr/src/app/packages/client-svelte/dist/ .dist/client

USER bun
EXPOSE 3000/tcp
VOLUME /usr/src/app/data
ENTRYPOINT [ "bun", "run", "./dist/backend/main.js" ]
