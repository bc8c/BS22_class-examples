
set -e

# clean out any old identites in the wallets
rm -rf javascript/wallet/*

# launch network; create channel and join peer to channel
pushd ../basic-network-ca
./startnetwork.sh
sleep 5
./createchannel.sh
sleep 5
./setAnchorPeerUpdate.sh
sleep 5
popd
./deployCC.sh


set -x
### Only for static (application-javascript-static example)  ###
# Where am I?
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Copy the MSP for ORG1.
mkdir -p ${DIR}/msp/org1.example.com/users/signcerts
mkdir -p ${DIR}/msp/org1.example.com/users/keystore
cp "${DIR}/../basic-network-ca/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/signcerts/"* "${DIR}/msp/org1.example.com/users/signcerts/User1@org1.example.com-cert.pem"
cp "${DIR}/../basic-network-ca/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/keystore/"* "${DIR}/msp/org1.example.com/users/keystore/priv_sk"

# Copy the MSP for ORG2.
mkdir -p ${DIR}/msp/org2.example.com/users/signcerts
mkdir -p ${DIR}/msp/org2.example.com/users/keystore
cp "${DIR}/../basic-network-ca/organizations/peerOrganizations/org2.example.com/users/User1@org2.example.com/msp/signcerts/"* "${DIR}/msp/org2.example.com/users/signcerts/User1@org2.example.com-cert.pem"
cp "${DIR}/../basic-network-ca/organizations/peerOrganizations/org2.example.com/users/User1@org2.example.com/msp/keystore/"* "${DIR}/msp/org2.example.com/users//keystore/priv_sk"
{ set +x; } 2>/dev/null