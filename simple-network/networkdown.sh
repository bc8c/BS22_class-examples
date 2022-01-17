#!/bin/bash

COMPOSE_FILE_CA=docker/docker-compose-ca.yaml

docker-compose -f $COMPOSE_FILE_CA down --volumes --remove-orphans


# cleen up the MSP directory
if [ -d "organizations/peerOrganizations" ]; then
    rm -Rf organizations/peerOrganizations && rm -Rf organizations/ordererOrganizations
fi