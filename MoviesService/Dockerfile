FROM node:14.15-alpine

WORKDIR /app

COPY ./package.json ./yarn.lock ./
RUN yarn install

RUN mkdir ./src
COPY . .

CMD yarn start