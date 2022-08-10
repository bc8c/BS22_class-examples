#!/bin/bash

set -e

# don't rewrite paths for Windows Git Bash users


# clean out any old identites in the wallets
rm -rf wallet/*

# launch network; create channel and join peer to channel

pushd ../network

./startnetwork.sh

sleep 5

./createchannel.sh

sleep 5

./setAnchorPeerUpdate.sh

sleep 5

./deployCC.sh

popd