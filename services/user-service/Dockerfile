FROM node:22-alpine

WORKDIR /app

COPY database ./database
COPY services/user-service ./services/user-service

WORKDIR /app/database
RUN npm install
RUN npm run generate

WORKDIR /app/services/user-service
RUN npm install
RUN npm run build

EXPOSE 3002

CMD ["npm", "start"]