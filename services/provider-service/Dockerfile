FROM node:22-alpine

WORKDIR /app

COPY database ./database
COPY services/provider-service ./services/provider-service

WORKDIR /app/database
RUN npm install
RUN npm run generate

WORKDIR /app/services/provider-service
RUN npm install
RUN npm run build

EXPOSE 3004

CMD ["npm", "start"]