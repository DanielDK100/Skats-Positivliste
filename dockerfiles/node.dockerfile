FROM node:lts

WORKDIR /app

# Copy package.json and package-lock.json for dependency installation
COPY ./nestjs/package.json ./
COPY ./nestjs/package-lock.json ./

RUN npm install

# Copy the rest of the source code
COPY ./nestjs/src ./

EXPOSE 3001

# Run NestJS in development mode (hot reload)
CMD [ "npm", "run", "start:dev" ]