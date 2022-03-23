const { Gateway, Wallets } = require("fabric-network");
const path = require("path");
const fs = require("fs");

async function main() {
  const walletPath = path.join(process.cwd(), "wallet");
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  console.log(`Wallet path: ${walletPath}`);

  const identity = await wallet.get("appUser");
  if (!identity) {
    console.log("An identity for the user 'appUser' does not exist in the wallet");
    return;
  }

  const ccpPath = path.resolve(__dirname, "ccp", "connection-org1.json");
  const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf-8"));

  const gateway = new Gateway();
  await gateway.connect(ccp, { wallet, identity: "appUser", discovery: { enabled: true, asLocalhost: true } });

  const network = await gateway.getNetwork("mychannel");

  const contract = await network.getContract("fabcar");

  var result = await contract.evaluateTransaction("queryAllCars");
  console.log(`result is : ${result.toString()}`);

  result = await contract.evaluateTransaction("queryCar", "CAR4");
  console.log(`result is : ${result.toString()}`);

  // carNumber string, make string, model string, colour string, owner string
  await contract.submitTransaction("createCar", "CAR50", "tesla", "Model-X", "RED", "ShinHS");

  result = await contract.evaluateTransaction("queryCar", "CAR50");
  console.log(`result is : ${result.toString()}`);

  await gateway.disconnect();
}

main();
