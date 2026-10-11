# Built locally from your checkout. The image contains mirror content: never push it.
FROM node:22-alpine AS build
WORKDIR /app/hub
COPY hub/package.json hub/package-lock.json ./
RUN npm ci
COPY hub/ ./
COPY mirror/ /app/mirror/
RUN npm run build

FROM nginx:1.27-alpine
COPY hub/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/hub/dist /usr/share/nginx/html
EXPOSE 80
