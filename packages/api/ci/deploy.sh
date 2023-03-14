#!/bin/bash
ssh root@192.46.234.106 "docker-compose pull staging-api && docker-compose up -d"