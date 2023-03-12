FROM golang:1.16 AS builder
WORKDIR /usr/src/build
COPY go* ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o app .

FROM scratch AS runner
EXPOSE 3000
COPY --from=builder /usr/src/build/app app
ENV DB_HOST=auditdb \
    DB_PORT=5432 \
    DB_USER=postgres \
    DB_PASSWORD=postgres \
    DB_NAME=postgres 
CMD [ "./app" ]