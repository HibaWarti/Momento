FROM node:22-alpine

WORKDIR /app

COPY database ./database
COPY services/notification-service ./services/notification-service

WORKDIR /app/database
RUN npm install
RUN npm run generate

WORKDIR /app/services/notification-service
RUN npm install
RUN npm run build

EXPOSE 3006

CMD ["npm", "start"]