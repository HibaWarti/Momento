FROM node:22-alpine

WORKDIR /app

COPY database ./database
COPY services/auth-service ./services/auth-service

WORKDIR /app/database
RUN npm install
RUN npm run generate

WORKDIR /app/services/auth-service
RUN npm install
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]