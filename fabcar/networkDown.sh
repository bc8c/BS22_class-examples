
set -ex

# Bring the test network down
pushd ../basic-network-ca
./networkdown.sh
popd

# clean out any old identites in the wallets
rm -rf javascript/wallet/*