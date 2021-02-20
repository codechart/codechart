#!/bin/bash
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin $DOCKER_REGISTRY
docker push "$DOCKER_REGISTRY/$DOCKER_REPOSITORY:$DOCKER_TAG"
ssh root@192.46.234.106 "docker-compose pull api && docker-compose up -d"