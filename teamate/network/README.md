# Running the network

## 1. starting the network

The `startnetwork.sh` script generates crypto meterials in the `"./organizations"` directory and genesis.block, channel transactions in the `"./channel-artifacts"` directory. The script then uses the `docker-compose` tool to instantiate network components into containers.

```bash
./startnetwork.sh
```

## 2. create channel and join

In this step, a channel is created in the running network according to the following `channel settings`, and all suitable peers participate.

the channel settings :

- channel name : `mychannel`
- channel member : `ORG1` and `ORG2` and `ORG3`
- ORG1's peer : peer0.org1.example.com
- ORG2's peer : peer0.org2.example.com
- ORG3's peer : peer0.org3.example.com

```bash
./createchannel.sh
```

## 3. set anchor peers

All organizations participating in `mychannel` set up one anchor peer in the channel.

```bash
./setAnchorPeerUpdate.sh
```

## 4. network shutdown

Terminate the running network and delete all generated materials.

```bash
./networkdown.sh
```
