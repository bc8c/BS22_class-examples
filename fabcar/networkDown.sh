
set -ex

# Bring the test network down
pushd ../basic-network-ca
./networkdown.sh
popd

# clean out any old identites in the wallets
rm -rf application-javascript/wallet/*
rm -rf application-javascript-static/wallet/*
rm -rf application-web/wallet/*
rm -rf msp/*