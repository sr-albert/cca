# Built locally from your checkout. The image contains mirror content: never push it.
FROM node:22-alpine AS build
WORKDIR /app/hub
COPY hub/package.json hub/package-lock.json ./
RUN npm ci
# The whole context, narrowed by .dockerignore: mirror/ comes along only if it exists,
# and without it the extractor builds CCAR-F only.
COPY . /app/
ARG GIT_COMMIT
ARG GIT_DIRTY
ENV GIT_COMMIT=$GIT_COMMIT GIT_DIRTY=$GIT_DIRTY
RUN npm run build

# The feedback service: runs from source with tsx. It imports src/feedback/payload.ts and src/data/schema.ts.
FROM node:22-alpine AS feedback
WORKDIR /app/hub
COPY hub/package.json hub/package-lock.json ./
RUN npm ci
COPY hub/server ./server
COPY hub/src ./src
ENV DATA_DIR=/data
CMD ["npx", "tsx", "server/main.ts"]

FROM nginx:1.27-alpine
COPY hub/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/hub/dist /usr/share/nginx/html
EXPOSE 80
