FROM node:22-alpine

WORKDIR /app

COPY database ./database
COPY services/chat-service ./services/chat-service

WORKDIR /app/database
RUN npm install
RUN npm run generate

WORKDIR /app/services/chat-service
RUN npm install
RUN npm run build

EXPOSE 3007

CMD ["npm", "start"]