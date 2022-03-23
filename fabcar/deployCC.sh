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
export FABRIC_CFG_PATH=../basic-network-ca/config

# Chaincode config variable
CC_NAME="fabcar"
CC_SRC_PATH="./chaincode/"
CC_RUNTIME_LANGUAGE="golang"
CC_VERSION="1"
CHANNEL_NAME="mychannel"
NET_DIR_PATH="${PWD}/../basic-network-ca"


## package the chaincode
infoln "Packaging chaincode"
set -x
peer lifecycle chaincode package ${CC_NAME}.tar.gz --path ${CC_SRC_PATH} --lang ${CC_RUNTIME_LANGUAGE} --label ${CC_NAME}_${CC_VERSION} >&log.txt
{ set +x; } 2>/dev/null
cat log.txt

## Install chaincode on peer0.org1
infoln "Installing chaincode on peer0.org1..."

export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${NET_DIR_PATH}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${NET_DIR_PATH}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

set -x
peer lifecycle chaincode install ${CC_NAME}.tar.gz >&log.txt
{ set +x; } 2>/dev/null
cat log.txt


## Install chaincode on peer0.org2
infoln "Installing chaincode on peer0.org2..."

export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${NET_DIR_PATH}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${NET_DIR_PATH}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_ADDRESS=localhost:9051

set -x
peer lifecycle chaincode install ${CC_NAME}.tar.gz >&log.txt
{ set +x; } 2>/dev/null
cat log.txt

set -x
peer lifecycle chaincode queryinstalled >&log.txt  
{ set +x; } 2>/dev/null
PACKAGE_ID=$(sed -n "/${CC_NAME}_${CC_VERSION}/{s/^Package ID: //; s/, Label:.*$//; p;}" log.txt)



## approve the definition for org1
infoln "approve the definition on peer0.org1..."

ORDERER_CA=${NET_DIR_PATH}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${NET_DIR_PATH}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${NET_DIR_PATH}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

set -x
# endorsment policy option : --signature-policy "OR('Org1MSP.member', 'Org2MSP.member')"
peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME} --version ${CC_VERSION} --package-id ${PACKAGE_ID} --sequence 1 >&log.txt
{ set +x; } 2>/dev/null
cat log.txt


## approve the definition for org2
infoln "approve the definition on peer0.org2..."

ORDERER_CA=${NET_DIR_PATH}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${NET_DIR_PATH}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${NET_DIR_PATH}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_ADDRESS=localhost:9051

set -x
# endorsment policy option : --signature-policy "OR('Org1MSP.member', 'Org2MSP.member')"
peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME} --version ${CC_VERSION} --package-id ${PACKAGE_ID} --sequence 1 >&log.txt
{ set +x; } 2>/dev/null
cat log.txt



## commit the chaincode definition
infoln "commit the chaincode definition"

PEER_CONN_PARMS="--peerAddresses localhost:7051 --tlsRootCertFiles ${NET_DIR_PATH}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${NET_DIR_PATH}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt"

set -x
# endorsment policy option : --signature-policy "OR('Org1MSP.member', 'Org2MSP.member')"
peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME} $PEER_CONN_PARMS --version ${CC_VERSION} --sequence 1 >&log.txt
{ set +x; } 2>/dev/null
cat log.txt

peer lifecycle chaincode querycommitted --channelID $CHANNEL_NAME --name ${CC_NAME} --cafile $ORDERER_CA


## TEST1 : Invoking the chaincode
infoln "TEST1 : Invoking the chaincode"
set -x
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile $ORDERER_CA -C $CHANNEL_NAME -n ${CC_NAME} $PEER_CONN_PARMS -c '{"function":"InitLedger","Args":[]}' >&log.txt
{ set +x; } 2>/dev/null
cat log.txt
sleep 3

## TEST2 : Query the chaincode
infoln "TEST2 : Query the chaincode"
set -x
peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME} -c '{"Args":["QueryAllCars"]}' >&log.txt
{ set +x; } 2>/dev/null
cat log.txt