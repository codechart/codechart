FROM golang AS license-api-builder
WORKDIR /usr/src/build
COPY packages/license-api/go* ./
RUN go mod download
COPY packages/license-api .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o app .

FROM scratch AS license-api
EXPOSE 3000
COPY --from=license-api-builder /usr/src/build/app app
ENV DB_HOST=auditdb \
    DB_PORT=5432 \
    DB_USER=postgres \
    DB_PASSWORD=postgres \
    DB_NAME=postgres 
CMD [ "./app" ]

FROM node:14 AS landing-page-builder
WORKDIR /usr/src/build
COPY packages/landing-page/package*.json ./
RUN npm install
COPY packages/landing-page .
RUN npx ng build --prod

FROM nginx:alpine AS landing-page
COPY --from=landing-page-builder /usr/src/build/dist/cc-landing-page /usr/share/nginx/html

FROM node:14 AS ui-build
WORKDIR /ui
COPY packages/ui/package*.json .
RUN npm install
COPY packages/ui .
RUN npm run build

FROM node:14 AS codechart
WORKDIR /usr/src/app
COPY packages/api/package*.json ./
RUN npm install
COPY packages/api ./
RUN npm run build
COPY --from=ui-build /ui/dist /usr/src/app/public
EXPOSE 2900
VOLUME [ "/usr/src/app/config/", "/root/.codechart/" ]
CMD node dist/
