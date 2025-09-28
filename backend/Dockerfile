# syntax=docker/dockerfile:1

FROM golang:1.24-alpine AS build
WORKDIR /app
COPY backend/go.mod ./
RUN go mod download
COPY backend/ ./
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /out/finpro-api ./cmd/api

FROM alpine:3.19
WORKDIR /app
COPY --from=build /out/finpro-api /usr/local/bin/finpro-api
ENV BIND_ADDR=:8080
CMD ["/usr/local/bin/finpro-api"]
