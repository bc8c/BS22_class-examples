#!/bin/bash

# Exit on first error
set -ex

# Bring the test network down
pushd ../network
./networkdown.sh
popd

# clean out any old identites in the wallets
rm -rf wallet/*
