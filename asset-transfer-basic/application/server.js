// 1. 모듈포함
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const FabricCAServices = require("fabric-ca-client");
const { Gateway, Wallets } = require("fabric-network");

// 2. connection.json 객체화
const ccpPath = path.resolve(__dirname, "ccp", "connection-org1.json");
const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

// 3. 서버설정
const app = express();
const PORT = 3000;
const HOST = "0.0.0.0";

app.use(express.static(path.join(__dirname, "views")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// 4. REST api 라우팅
// 4.1 /asset POST (자산생성)
app.post("/asset", async (req, res) => {
  const id = req.body.id;
  const color = req.body.color;
  const size = req.body.size;
  const owner = req.body.owner;
  const value = req.body.value;
  console.log("/asset-post-" + id + ":" + color + ":" + size + ":" + owner + ":" + value);

  // Create a new file system based wallet for managing identities.
  const walletPath = path.join(process.cwd(), "wallet");
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  console.log(`Wallet path: ${walletPath}`);

  // Check to see if we've already enrolled the admin user.
  const identity = await wallet.get("appUser");
  if (!identity) {
    console.log(`An identity for the user does not exists in the wallet`);
    const res_str = `{"result":"failed","msg":"An identity for the user does not exists in the wallet"}`;
    res.json(JSON.parse(res_str));
    return;
  }

  // Create a new gateway for connecting to our peer node.
  const gateway = new Gateway();
  await gateway.connect(ccp, { wallet, identity: "appUser", discovery: { enabled: true, asLocalhost: true } });

  // Get the network (channel) our contract is deployed to.
  const network = await gateway.getNetwork("mychannel");

  // Get the contract from the network.
  const contract = network.getContract("basic");

  // Submit the specified transaction.
  console.log("\n--> Submit Transaction: CreateAsset, creates new asset with ID, color, owner, size, and appraisedValue arguments");
  await contract.submitTransaction("CreateAsset", id, color, size, owner, value);
  console.log("Transaction(CreateAsset) has been submitted");

  // response -> client
  await gateway.disconnect();
  const resultPath = path.join(process.cwd(), "/views/result.html");
  var resultHTML = fs.readFileSync(resultPath, "utf-8");
  resultHTML = resultHTML.replace("<dir></dir>", "<div><p>Transaction(CreateAsset) has been submitted</p></div>");
  res.status(200).send(resultHTML);
});
// 4.2 /asset GET (자산조회)
app.get("/asset", async (req, res) => {
  const id = req.query.id;
  console.log("/asset-get-" + id);

  // Create a new file system based wallet for managing identities.
  const walletPath = path.join(process.cwd(), "wallet");
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  console.log(`Wallet path: ${walletPath}`);

  // Check to see if we've already enrolled the admin user.
  const identity = await wallet.get("appUser");
  if (!identity) {
    console.log(`An identity for the user does not exists in the wallet`);
    const res_str = `{"result":"failed","msg":"An identity for the user does not exists in the wallet"}`;
    res.json(JSON.parse(res_str));
    return;
  }

  // Create a new gateway for connecting to our peer node.
  const gateway = new Gateway();
  await gateway.connect(ccp, { wallet, identity: "appUser", discovery: { enabled: true, asLocalhost: true } });

  // Get the network (channel) our contract is deployed to.
  const network = await gateway.getNetwork("mychannel");

  // Get the contract from the network.
  const contract = network.getContract("basic");

  // Submit the specified transaction.
  console.log(`\n--> Evaluate Transaction: ReadAsset, function returns "${id}" attributes`);
  result = await contract.evaluateTransaction("ReadAsset", id);

  // response -> client
  await gateway.disconnect();
  const resultPath = path.join(process.cwd(), "/views/result.html");
  var resultHTML = fs.readFileSync(resultPath, "utf-8");
  resultHTML = resultHTML.replace("<dir></dir>", `<div><p>ReadAsset :${result}</p></div>`);
  res.status(200).send(resultHTML);
});
// 4.3 /update POST (자산변경)
app.post("/update", async (req, res) => {
  const id = req.body.id;
  const color = req.body.color;
  const size = req.body.size;
  const owner = req.body.owner;
  const value = req.body.value;
  console.log("/update-post-" + id + ":" + color + ":" + size + ":" + owner + ":" + value);

  // Create a new file system based wallet for managing identities.
  const walletPath = path.join(process.cwd(), "wallet");
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  console.log(`Wallet path: ${walletPath}`);

  // Check to see if we've already enrolled the admin user.
  const identity = await wallet.get("appUser");
  if (!identity) {
    console.log(`An identity for the user does not exists in the wallet`);
    const res_str = `{"result":"failed","msg":"An identity for the user does not exists in the wallet"}`;
    res.json(JSON.parse(res_str));
    return;
  }

  // Create a new gateway for connecting to our peer node.
  const gateway = new Gateway();
  await gateway.connect(ccp, { wallet, identity: "appUser", discovery: { enabled: true, asLocalhost: true } });

  // Get the network (channel) our contract is deployed to.
  const network = await gateway.getNetwork("mychannel");

  // Get the contract from the network.
  const contract = network.getContract("basic");

  // Submit the specified transaction.
  console.log("\n--> Submit Transaction: UpdateAsset asset");
  await contract.submitTransaction("UpdateAsset", id, color, size, owner, value);
  console.log("Transaction(UpdateAsset) has been submitted");

  // response -> client
  await gateway.disconnect();
  const resultPath = path.join(process.cwd(), "/views/result.html");
  var resultHTML = fs.readFileSync(resultPath, "utf-8");
  resultHTML = resultHTML.replace("<dir></dir>", "<div><p>Transaction(UpdateAsset) has been submitted</p></div>");
  res.status(200).send(resultHTML);
});
// 4.4 /delete POST (자산삭제)
app.post("/delete", async (req, res) => {
  const id = req.body.id;
  console.log("/delete-post-" + id);

  // Create a new file system based wallet for managing identities.
  const walletPath = path.join(process.cwd(), "wallet");
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  console.log(`Wallet path: ${walletPath}`);

  // Check to see if we've already enrolled the admin user.
  const identity = await wallet.get("appUser");
  if (!identity) {
    console.log(`An identity for the user does not exists in the wallet`);
    const res_str = `{"result":"failed","msg":"An identity for the user does not exists in the wallet"}`;
    res.json(JSON.parse(res_str));
    return;
  }

  // Create a new gateway for connecting to our peer node.
  const gateway = new Gateway();
  await gateway.connect(ccp, { wallet, identity: "appUser", discovery: { enabled: true, asLocalhost: true } });

  // Get the network (channel) our contract is deployed to.
  const network = await gateway.getNetwork("mychannel");

  // Get the contract from the network.
  const contract = network.getContract("basic");

  // Submit the specified transaction.
  console.log("\n--> Submit Transaction: UpdateAsset asset");
  await contract.submitTransaction("DeleteAsset", id);
  console.log("Transaction(UpdateAsset) has been submitted");

  // response -> client
  await gateway.disconnect();
  const resultPath = path.join(process.cwd(), "/views/result.html");
  var resultHTML = fs.readFileSync(resultPath, "utf-8");
  resultHTML = resultHTML.replace("<dir></dir>", "<div><p>Transaction(DeleteAsset) has been submitted</p></div>");
  res.status(200).send(resultHTML);
});

// 5. 서버시작
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
