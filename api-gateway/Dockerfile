FROM node:22-alpine

WORKDIR /app/api-gateway

COPY api-gateway/package*.json ./
RUN npm install

COPY api-gateway ./

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]