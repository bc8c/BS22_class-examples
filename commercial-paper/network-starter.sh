#!/bin/bash
#
# SPDX-License-Identifier: Apache-2.0

function _exit(){
    printf "Exiting:%s\n" "$1"
    exit -1
}

# Exit on first error, print all commands.
set -ev
set -o pipefail

# Where am I?
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

export FABRIC_CFG_PATH="${DIR}/../config"

cd "${DIR}/../basic-network/"

docker kill cliDigiBank cliMagnetoCorp logspout || true
./networkdown.sh
./startnetwork.sh
sleep 1
./createchannel.sh

# Copy the connection profiles so they are in the correct organizations.
cp "${DIR}/../basic-network/organizations/peerOrganizations/org1.example.com/connection-org1.yaml" "${DIR}/organization/digibank/gateway/"
cp "${DIR}/../basic-network/organizations/peerOrganizations/org2.example.com/connection-org2.yaml" "${DIR}/organization/magnetocorp/gateway/"

cp ${DIR}/../basic-network/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/signcerts/* ${DIR}/../basic-network/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/signcerts/User1@org1.example.com-cert.pem
cp ${DIR}/../basic-network/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/keystore/* ${DIR}/../basic-network/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/keystore/priv_sk

cp ${DIR}/../basic-network/organizations/peerOrganizations/org2.example.com/users/User1@org2.example.com/msp/signcerts/* ${DIR}/../basic-network/organizations/peerOrganizations/org2.example.com/users/User1@org2.example.com/msp/signcerts/User1@org2.example.com-cert.pem
cp ${DIR}/../basic-network/organizations/peerOrganizations/org2.example.com/users/User1@org2.example.com/msp/keystore/* ${DIR}/../basic-network/organizations/peerOrganizations/org2.example.com/users/User1@org2.example.com/msp/keystore/priv_sk

echo Suggest that you monitor the docker containers by running
echo "./organization/magnetocorp/configuration/cli/monitordocker.sh net_test"
