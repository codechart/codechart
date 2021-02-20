FROM node:14
WORKDIR /usr/src/app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build
VOLUME [ "/usr/src/app/public/", "/usr/src/app/config/", "/root/.codechart/" ]
CMD node dist/