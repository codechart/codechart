#!/bin/bash
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin $DOCKER_REGISTRY
docker push "$DOCKER_REGISTRY/$DOCKER_REPOSITORY:$DOCKER_TAG"