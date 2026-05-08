FROM node:22-alpine AS build

WORKDIR /app/user-frontend

COPY user-frontend/package*.json ./
RUN npm install --no-audit --no-fund

COPY user-frontend ./
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/user-frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]