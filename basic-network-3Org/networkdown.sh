#!/bin/bash

COMPOSE_FILE_CA=docker/docker-compose-ca.yaml
COMPOSE_FILES=docker/docker-compose-net.yaml
COMPOSE_FILES_COUCH=docker/docker-compose-couch.yaml

docker-compose -f $COMPOSE_FILE_CA -f $COMPOSE_FILES -f $COMPOSE_FILES_COUCH down --volumes --remove-orphans


# cleen up the MSP directory
if [ -d "organizations/peerOrganizations" ]; then
    rm -Rf organizations/peerOrganizations && rm -Rf organizations/ordererOrganizations
    sudo rm -Rf organizations/fabric-ca/*
fi

# cleen up the genesis block directory
if [ -d "system-genesis-block" ]; then
    rm -Rf system-genesis-block/*
fi

# cleen up the genesis block directory
if [ -d "channel-artifacts" ]; then
    rm -Rf channel-artifacts/*
fi