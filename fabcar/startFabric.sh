
set -e

# # don't rewrite paths for Windows Git Bash users
# export MSYS_NO_PATHCONV=1
# starttime=$(date +%s)
# CC_SRC_LANGUAGE=${1:-"go"}
# CC_SRC_LANGUAGE=`echo "$CC_SRC_LANGUAGE" | tr [:upper:] [:lower:]`

# if [ "$CC_SRC_LANGUAGE" = "go" -o "$CC_SRC_LANGUAGE" = "golang" ] ; then
# 	CC_SRC_PATH="../chaincode/fabcar/go/"
# elif [ "$CC_SRC_LANGUAGE" = "javascript" ]; then
# 	CC_SRC_PATH="../chaincode/fabcar/javascript/"
# elif [ "$CC_SRC_LANGUAGE" = "java" ]; then
# 	CC_SRC_PATH="../chaincode/fabcar/java"
# elif [ "$CC_SRC_LANGUAGE" = "typescript" ]; then
# 	CC_SRC_PATH="../chaincode/fabcar/typescript/"
# else
# 	echo The chaincode language ${CC_SRC_LANGUAGE} is not supported by this script
# 	echo Supported chaincode languages are: go, java, javascript, and typescript
# 	exit 1
# fi




# clean out any old identites in the wallets
rm -rf javascript/wallet/*

# launch network; create channel and join peer to channel
pushd ../basic-network-ca
./startnetwork.sh
sleep 5
./createchannel.sh
sleep 5
popd
./deployCC.sh
