FROM node:lts

WORKDIR /app

COPY ./src/package.json .

RUN npm install

COPY ./src .

EXPOSE 8181

CMD [ "npm", "run", "build" ]