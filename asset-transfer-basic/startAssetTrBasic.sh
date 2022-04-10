#!/bin/bash

pushd network

./startnetwork.sh

sleep 5

./createchannel.sh

sleep 5

./setAnchorPeerUpdate.sh

sleep 5

./deployCC.sh

popd