FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./

COPY ServiceAccountKey.json /usr/src/app/ServiceAccountKey.json

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]