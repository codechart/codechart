FROM golang:1.19-alpine

WORKDIR /usr/src/app

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code  
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o app .

# Expose port
EXPOSE 3000

# Set environment variables (will be overridden by Railway)
ENV DB_HOST=localhost \
    DB_PORT=5432 \
    DB_USER=license-api \
    DB_PASSWORD=password \
    DB_NAME=license-api

# Start the application
CMD ["./app"]