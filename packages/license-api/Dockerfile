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

# Environment variables for Railway (DATABASE_URL will be provided by Railway PostgreSQL)
ENV DATABASE_URL=postgres://license-api:password@localhost:5432/license-api

# Start the application
CMD ["./app"]