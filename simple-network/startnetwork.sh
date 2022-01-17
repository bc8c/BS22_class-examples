#!/bin/bash

C_YELLOW='\033[1;33m'
C_BLUE='\033[0;34m'
C_RESET='\033[0m'

# subinfoln echos in blue color
function infoln() {
  echo -e "${C_YELLOW}${1}${C_RESET}"
}

function subinfoln() {
  echo -e "${C_BLUE}${1}${C_RESET}"
}

# add PATH to ensure we are picking up the correct binaries
export PATH=${HOME}/fabric-samples/bin:$PATH

# cleen up the MSP directory
if [ -d "organizations/peerOrganizations" ]; then
    rm -Rf organizations/peerOrganizations && rm -Rf organizations/ordererOrganizations
fi


# Generate certificates using Fabric CA
infoln "------------- Generating certificates using Fabric CA"
COMPOSE_FILE_CA=docker/docker-compose-ca.yaml
IMAGE_TAG=latest docker-compose -f $COMPOSE_FILE_CA up -d 2>&1
sleep 2


# Create Org1 Identities
infoln "------------- Creating Org1 Identities"
mkdir -p organizations/peerOrganizations/org1.example.com/
export FABRIC_CA_CLIENT_HOME=${PWD}/organizations/peerOrganizations/org1.example.com/

subinfoln "Enrolling the CA admin"
set -x
fabric-ca-client enroll -u http://admin:adminpw@localhost:7054 --caname ca-org1
{ set +x; } 2>/dev/null

subinfoln "Registering peer0"
set -x
fabric-ca-client register --caname ca-org1 --id.name peer0 --id.secret peer0pw --id.type peer
{ set +x; } 2>/dev/null

subinfoln "Registering user"
set -x
fabric-ca-client register --caname ca-org1 --id.name user1 --id.secret user1pw --id.type client
{ set +x; } 2>/dev/null

subinfoln "Registering the org admin"
set -x
fabric-ca-client register --caname ca-org1 --id.name org1admin --id.secret org1adminpw --id.type admin
{ set +x; } 2>/dev/null

subinfoln "Enrolling the peer0 msp"
set -x
fabric-ca-client enroll -u http://peer0:peer0pw@localhost:7054 --caname ca-org1 -M ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/msp --csr.hosts peer0.org1.example.com
{ set +x; } 2>/dev/null

subinfoln "Enrolling the user msp"
set -x
fabric-ca-client enroll -u http://user1:user1pw@localhost:7054 --caname ca-org1 -M ${PWD}/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp
{ set +x; } 2>/dev/null

echo -E "Enrolling the org admin msp"
set -x
fabric-ca-client enroll -u http://org1admin:org1adminpw@localhost:7054 --caname ca-org1 -M ${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
{ set +x; } 2>/dev/null


# Create Orderer Identities
infoln "------------- Creating Orderer Org Identities"
mkdir -p organizations/ordererOrganizations/example.com
export FABRIC_CA_CLIENT_HOME=${PWD}/organizations/ordererOrganizations/example.com

subinfoln "Enrolling the CA admin"
set -x
fabric-ca-client enroll -u http://admin:adminpw@localhost:8054 --caname ca-orderer
{ set +x; } 2>/dev/null

subinfoln "Registering orderer"
set -x
fabric-ca-client register --caname ca-orderer --id.name orderer --id.secret ordererpw --id.type orderer
{ set +x; } 2>/dev/null

subinfoln "Registering the orderer admin"
set -x
fabric-ca-client register --caname ca-orderer --id.name ordererAdmin --id.secret ordererAdminpw --id.type admin
{ set +x; } 2>/dev/null

subinfoln "Generating the orderer msp"
set -x
fabric-ca-client enroll -u http://orderer:ordererpw@localhost:8054 --caname ca-orderer -M ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp --csr.hosts orderer.example.com --csr.hosts localhost
{ set +x; } 2>/dev/null

subinfoln "Generating the admin msp"
set -x
fabric-ca-client enroll -u http://ordererAdmin:ordererAdminpw@localhost:8054 --caname ca-orderer -M ${PWD}/organizations/ordererOrganizations/example.com/users/Admin@example.com/msp --tls.certfiles ${PWD}/organizations/fabric-ca/ordererOrg/tls-cert.pem
{ set +x; } 2>/dev/null

# createConsortium 부터 따라 가도록