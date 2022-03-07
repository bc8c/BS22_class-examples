#!/bin/bash

# COMPOSE_FILE_CA=docker/docker-compose-ca.yaml
COMPOSE_FILES_PEER=docker/docker-compose-peer.yaml
COMPOSE_FILES_ORDERER=docker/docker-compose-orderer.yaml
COMPOSE_FILES_COUCH=docker/docker-compose-couch.yaml

docker-compose -f $COMPOSE_FILES_PEER -f $COMPOSE_FILES_ORDERER -f $COMPOSE_FILES_COUCH down --volumes --remove-orphans


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