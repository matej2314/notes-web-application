FROM node:20.18.0

WORKDIR /app

COPY package*.json ./
COPY . .

RUN npm install

EXPOSE 8088

CMD [ "node", "server.js" ]
