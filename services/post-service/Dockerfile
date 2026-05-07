FROM node:22-alpine

WORKDIR /app

COPY database ./database
COPY services/post-service ./services/post-service

WORKDIR /app/database
RUN npm install
RUN npm run generate

WORKDIR /app/services/post-service
RUN npm install
RUN npm run build

EXPOSE 3003

CMD ["npm", "start"]