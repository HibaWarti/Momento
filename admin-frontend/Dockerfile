FROM node:22-alpine AS build

WORKDIR /app/admin-frontend

COPY admin-frontend/package*.json ./
RUN npm install --no-audit --no-fund

COPY admin-frontend ./
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/admin-frontend/dist /usr/share/nginx/html
COPY admin-frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]