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

FROM squidfunk/mkdocs-material AS docs-builder
COPY packages/docs /docs
RUN mkdocs build

FROM nginx AS docs
COPY --from=docs-builder /docs/site /usr/share/nginx/html

FROM node:14 AS ui-build
WORKDIR /ui
COPY packages/ui/package*.json .
RUN npm install
COPY packages/ui .
RUN npm run build

FROM gradle AS intellij-plugin
WORKDIR /usr/src/app
COPY packages/intellij-plugin .
RUN gradle buildPlugin --no-daemon

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

FROM node:14 AS downloads-packager
RUN apt-get update && apt-get install zip
WORKDIR /usr/src/app
COPY --from=codechart /usr/src/app/ ./
RUN sed -i 's|"gitRemoteUrl": ".*"|"gitRemoteUrl": ""|' config/config.json &&\
    npx pkg . --out-path ./dist-runnables &&\
    mkdir out-linux out-macos out-win download &&\
    mv dist-runnables/covalent-linux out-linux/ && mv dist-runnables/covalent-macos out-macos/ && mv dist-runnables/covalent-win.exe out-win/ &&\
    cp -r config out-linux/ && cp -r config out-macos/ && cp -r config out-win/ &&\
    cp pkg-readme.md out-linux/readme.md && cp pkg-readme.md out-macos/readme.md && cp pkg-readme.md out-win/readme.md &&\
    tar -czvf download/covalent-linux.tar.gz -C out-linux $(ls out-linux) &&\
    tar -czvf download/covalnet-mac.tar.gz -C out-macos $(ls out-macos) &&\
    cd out-win && zip -r ../download/code-chart-win.zip $(ls) && cd ..


FROM node AS landing-page-builder
WORKDIR /usr/src/build
COPY packages/landing-page/package*.json ./
RUN npm install
COPY packages/landing-page .
RUN npm run build

FROM nginx AS landing-page
COPY --from=landing-page-builder /usr/src/build/dist /usr/share/nginx/html
COPY --from=downloads-packager /usr/src/app/download /usr/share/nginx/html/download
COPY --from=intellij-plugin /usr/src/app/build/distributions/* /usr/share/nginx/html/download/