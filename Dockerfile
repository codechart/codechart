FROM golang AS license-api-builder
WORKDIR /usr/src/build
COPY packages/license-api/go* ./
RUN go mod download
COPY packages/license-api .
RUN go mod tidy
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

# IntelliJ plugin - coming soon
# FROM gradle:7.6-jdk17 AS intellij-plugin
# WORKDIR /usr/src/app
# COPY packages/intellij-plugin .
# RUN gradle buildPlugin --no-daemon

FROM node:20 AS vscode-plugin
WORKDIR /usr/src/app
COPY packages/vscode-plugin .
RUN npm install
RUN npm run package
RUN npx vsce package


FROM node:18 AS codechart
WORKDIR /usr/src/app
COPY packages/api/package*.json ./
RUN npm install
COPY packages/api ./
RUN npm run build
COPY --from=ui-build /ui/dist /usr/src/app/public
EXPOSE 2900
VOLUME [ "/usr/src/app/config/", "/root/.codechart/" ]

# Repplace repo to git, and set gitRemoteUrl to staging-diagrams
RUN sed -i 's|"repo": "[^"]*"|"repo": "git"|g' /usr/src/app/config/config.json && \
    sed -i 's|"gitRemoteUrl": "[^"]*"|"gitRemoteUrl": "https://github.com/codechart/staging-diagrams.git"|g' /usr/src/app/config/config.json &&\
    sed -i ':a;N;$!ba;s|\[.*\]|\
    []|g' /usr/src/app/config/paths.json

CMD node dist/

# Downloads Packager: Creates distributable packages for all platforms
FROM node:14-bullseye AS downloads-packager
RUN apt-get update && apt-get install zip
WORKDIR /usr/src/app
COPY --from=codechart /usr/src/app/ ./

# Build native executables for each platform and package with resources
RUN sed -i 's|"repo": ".*"|"repo": "local"|' config/config.json &&\
    sed -i 's/\[.*\]/\[\]/g' config/paths.json &&\
    # compile api into runables
    npx pkg . --out-path ./dist-runnables &&\
    mkdir out-linux out-macos out-win download &&\
    # Move compiled binaries to platform-specific folders
    mv dist-runnables/cochart-linux out-linux/ && mv dist-runnables/cochart-macos out-macos/ && mv dist-runnables/cochart-win.exe out-win/ &&\
    # Copy config and build-resources (scripts, validators, etc.) to each platform folder
    cp -r config out-linux/ && cp -r config out-macos/ && cp -r config out-win/ &&\
    cp -r build-resources/* out-linux/ && cp -r build-resources/* out-macos/ && cp -r build-resources/* out-win/ &&\
    # Archive each platform into compressed packages for download
    tar -czvf download/cochart-linux.tar.gz -C out-linux $(ls out-linux) &&\
    tar -czvf download/cochart-mac.tar.gz -C out-macos $(ls out-macos) &&\
    cd out-win && zip -r ../download/cochart-win.zip $(ls) && cd ..

# Build JavaScript bundle for nodejs, with obfuscation
RUN npx ncc build -m -o out-js &&\
    npx javascript-obfuscator out-js/index.js --output out-js/cochart.js &&\
    rm out-js/index.js &&\
    cp -r config out-js/ &&\
    tar -czvf download/cochart-js.tar.gz -C out-js $(ls out-js)


FROM node AS landing-page-builder
WORKDIR /usr/src/build
COPY packages/landing-page/package*.json ./
RUN npm install
COPY packages/landing-page .
RUN npm run build

FROM nginx AS landing-page
COPY --from=landing-page-builder /usr/src/build/dist /usr/share/nginx/html
COPY --from=downloads-packager /usr/src/app/download /usr/share/nginx/html/download
# IntelliJ plugin - coming soon
# COPY --from=intellij-plugin /usr/src/app/build/distributions/Cochart-IJ-Plugin.zip /usr/share/nginx/html/download/
COPY --from=vscode-plugin /usr/src/app/cochart-vscode-plugin-1.0.1-16.11.25-21.14.vsix /usr/share/nginx/html/download/