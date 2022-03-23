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


infoln "Fetching channel config for channel $CHANNEL_NAME"

# add PATH to ensure we are picking up the correct binaries
export PATH=${HOME}/fabric-samples/bin:$PATH
export FABRIC_CFG_PATH=${PWD}/config

CHANNEL_NAME="mychannel"

export ORDERER_CA=${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
export CORE_PEER_TLS_ENABLED=true

#########################################################
######## set anchor peer for Org1 in the channel ########
#########################################################

# Fetching the most recent configuration block for the channel
infoln "Fetching the most recent configuration block for the channel"
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

pushd channel-artifacts
set -x
peer channel fetch config config_block.pb -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com -c $CHANNEL_NAME --tls --cafile "$ORDERER_CA"
{ set +x; } 2>/dev/null


# Decoding config block to JSON and isolating config to config.json
infoln "Decoding config block to JSON and isolating config to config.json"
set -x
configtxlator proto_decode --input config_block.pb --type common.Block --output config_block.json
jq '.data.data[0].payload.data.config' config_block.json > config.json
{ set +x; } 2>/dev/null


set -x
infoln "Modify the configuration to append the anchor peer"
Modify the configuration to append the anchor peer 
jq '.channel_group.groups.Application.groups.Org1MSP.values += {"AnchorPeers":{"mod_policy": "Admins","value":{"anchor_peers": [{"host": "peer0.org1.example.com","port": 7051}]},"version": "0"}}' config.json > modified_config.json
{ set +x; } 2>/dev/null


# Compute a config update, based on the differences between config.json and modified_config.json
infoln "Compute a config update, based on the differences between config.json and modified_config.json"

set -x
configtxlator proto_encode --input config.json --type common.Config --output config.pb  
configtxlator proto_encode --input modified_config.json --type common.Config --output modified_config.pb
configtxlator compute_update --channel_id "${CHANNEL_NAME}" --original config.pb --updated modified_config.pb --output config_update.pb


configtxlator proto_decode --input config_update.pb --type common.ConfigUpdate --output config_update.json
echo '{"payload":{"header":{"channel_header":{"channel_id":"'$CHANNEL_NAME'", "type":2}},"data":{"config_update":'$(cat config_update.json)'}}}' | jq . > config_update_in_envelope.json
configtxlator proto_encode --input config_update_in_envelope.json --type common.Envelope --output Org1MSPAnchor.tx
{ set +x; } 2>/dev/null


# Anchor peer set for org1 on channel
infoln "Anchor peer set for org1 on channel"
peer channel update -f Org1MSPAnchor.tx -c "${CHANNEL_NAME}" -o localhost:7050  --ordererTLSHostnameOverride orderer.example.com --tls --cafile "$ORDERER_CA"
popd




#########################################################
######## set anchor peer for Org2 in the channel ########
#########################################################

# Fetching the most recent configuration block for the channel
infoln "Fetching the most recent configuration block for the channel"
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_ADDRESS=localhost:9051

pushd channel-artifacts
set -x
peer channel fetch config config_block.pb -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com -c $CHANNEL_NAME --tls --cafile "$ORDERER_CA"
{ set +x; } 2>/dev/null


# Decoding config block to JSON and isolating config to config.json
infoln "Decoding config block to JSON and isolating config to config.json"
set -x
configtxlator proto_decode --input config_block.pb --type common.Block --output config_block.json
jq '.data.data[0].payload.data.config' config_block.json > config.json
{ set +x; } 2>/dev/null


set -x
infoln "Modify the configuration to append the anchor peer"
Modify the configuration to append the anchor peer 
jq '.channel_group.groups.Application.groups.Org2MSP.values += {"AnchorPeers":{"mod_policy": "Admins","value":{"anchor_peers": [{"host": "peer0.org2.example.com","port": 9051}]},"version": "0"}}' config.json > modified_config.json
{ set +x; } 2>/dev/null


# Compute a config update, based on the differences between config.json and modified_config.json
infoln "Compute a config update, based on the differences between config.json and modified_config.json"

set -x
configtxlator proto_encode --input config.json --type common.Config --output config.pb  
configtxlator proto_encode --input modified_config.json --type common.Config --output modified_config.pb
configtxlator compute_update --channel_id "${CHANNEL_NAME}" --original config.pb --updated modified_config.pb --output config_update.pb


configtxlator proto_decode --input config_update.pb --type common.ConfigUpdate --output config_update.json
echo '{"payload":{"header":{"channel_header":{"channel_id":"'$CHANNEL_NAME'", "type":2}},"data":{"config_update":'$(cat config_update.json)'}}}' | jq . > config_update_in_envelope.json
configtxlator proto_encode --input config_update_in_envelope.json --type common.Envelope --output Org2MSPAnchor.tx
{ set +x; } 2>/dev/null


# Anchor peer set for org2 on channel
infoln "Anchor peer set for org2 on channel"
peer channel update -f Org2MSPAnchor.tx -c "${CHANNEL_NAME}" -o localhost:7050  --ordererTLSHostnameOverride orderer.example.com --tls --cafile "$ORDERER_CA"
popd



#########################################################
######## set anchor peer for Org3 in the channel ########
#########################################################

# Fetching the most recent configuration block for the channel
infoln "Fetching the most recent configuration block for the channel"
export CORE_PEER_LOCALMSPID="Org3MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp
export CORE_PEER_ADDRESS=localhost:9051

pushd channel-artifacts
set -x
peer channel fetch config config_block.pb -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com -c $CHANNEL_NAME --tls --cafile "$ORDERER_CA"
{ set +x; } 2>/dev/null


# Decoding config block to JSON and isolating config to config.json
infoln "Decoding config block to JSON and isolating config to config.json"
set -x
configtxlator proto_decode --input config_block.pb --type common.Block --output config_block.json
jq '.data.data[0].payload.data.config' config_block.json > config.json
{ set +x; } 2>/dev/null


set -x
infoln "Modify the configuration to append the anchor peer"
Modify the configuration to append the anchor peer 
jq '.channel_group.groups.Application.groups.Org3MSP.values += {"AnchorPeers":{"mod_policy": "Admins","value":{"anchor_peers": [{"host": "peer0.org3.example.com","port": 11051}]},"version": "0"}}' config.json > modified_config.json
{ set +x; } 2>/dev/null


# Compute a config update, based on the differences between config.json and modified_config.json
infoln "Compute a config update, based on the differences between config.json and modified_config.json"

set -x
configtxlator proto_encode --input config.json --type common.Config --output config.pb  
configtxlator proto_encode --input modified_config.json --type common.Config --output modified_config.pb
configtxlator compute_update --channel_id "${CHANNEL_NAME}" --original config.pb --updated modified_config.pb --output config_update.pb


configtxlator proto_decode --input config_update.pb --type common.ConfigUpdate --output config_update.json
echo '{"payload":{"header":{"channel_header":{"channel_id":"'$CHANNEL_NAME'", "type":2}},"data":{"config_update":'$(cat config_update.json)'}}}' | jq . > config_update_in_envelope.json
configtxlator proto_encode --input config_update_in_envelope.json --type common.Envelope --output Org3MSPAnchor.tx
{ set +x; } 2>/dev/null


# Anchor peer set for org3 on channel
infoln "Anchor peer set for org3 on channel"
peer channel update -f Org3MSPAnchor.tx -c "${CHANNEL_NAME}" -o localhost:7050  --ordererTLSHostnameOverride orderer.example.com --tls --cafile "$ORDERER_CA"
popd