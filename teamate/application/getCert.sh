

# clean out any old identites in the wallets
rm -rf wallet/*

set -x
### Only for static (application-javascript-static example)  ###
# Where am I?
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Copy the MSP for ORG1.
mkdir -p ${DIR}/msp/org1.example.com/users/signcerts
mkdir -p ${DIR}/msp/org1.example.com/users/keystore
cp "${DIR}/../network/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/signcerts/"* "${DIR}/msp/org1.example.com/users/signcerts/User1@org1.example.com-cert.pem"
cp "${DIR}/../network/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/keystore/"* "${DIR}/msp/org1.example.com/users/keystore/priv_sk"

# Copy the MSP for ORG2.
mkdir -p ${DIR}/msp/org2.example.com/users/signcerts
mkdir -p ${DIR}/msp/org2.example.com/users/keystore
cp "${DIR}/../network/organizations/peerOrganizations/org2.example.com/users/User1@org2.example.com/msp/signcerts/"* "${DIR}/msp/org2.example.com/users/signcerts/User1@org2.example.com-cert.pem"
cp "${DIR}/../network/organizations/peerOrganizations/org2.example.com/users/User1@org2.example.com/msp/keystore/"* "${DIR}/msp/org2.example.com/users//keystore/priv_sk"
{ set +x; } 2>/dev/null


# Copy the MSP for ORG3.
mkdir -p ${DIR}/msp/org3.example.com/users/signcerts
mkdir -p ${DIR}/msp/org3.example.com/users/keystore
cp "${DIR}/../network/organizations/peerOrganizations/org3.example.com/users/User1@org3.example.com/msp/signcerts/"* "${DIR}/msp/org3.example.com/users/signcerts/User1@org3.example.com-cert.pem"
cp "${DIR}/../network/organizations/peerOrganizations/org3.example.com/users/User1@org3.example.com/msp/keystore/"* "${DIR}/msp/org3.example.com/users//keystore/priv_sk"
{ set +x; } 2>/dev/null