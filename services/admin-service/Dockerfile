FROM node:22-alpine

WORKDIR /app

COPY database ./database
COPY services/admin-service ./services/admin-service

WORKDIR /app/database
RUN npm install
RUN npm run generate

WORKDIR /app/services/admin-service
RUN npm install
RUN npm run build

EXPOSE 3005

CMD ["npm", "start"]