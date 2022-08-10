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
// 4.0.1 /admin POST 라우팅 ( id, password )
app.post("/admin", async (req, res) => {
  const id = req.body.id;
  const pw = req.body.password;

  console.log(id, pw);

  try {
    // Create a new CA client for interacting with the CA.
    const caInfo = ccp.certificateAuthorities["ca.org1.example.com"];
    const caTLSCACerts = caInfo.tlsCACerts.pem;
    const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), "wallet");
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the admin user.
    const identity = await wallet.get(id);
    if (identity) {
      console.log(`An identity for the admin user ${id} already exists in the wallet`);
      const res_str = `{"result":"failed","msg":"An identity for the admin user ${id} already exists in the wallet"}`;
      res.json(JSON.parse(res_str));
      return;
    }

    // Enroll the admin user, and import the new identity into the wallet.
    const enrollment = await ca.enroll({ enrollmentID: id, enrollmentSecret: pw });
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: "Org1MSP",
      type: "X.509",
    };
    await wallet.put(id, x509Identity);

    // response to client
    console.log('Successfully enrolled admin user "admin" and imported it into the wallet');
    const res_str = `{"result":"success","msg":"Successfully enrolled admin user ${id} in the wallet"}`;
    res.status(200).json(JSON.parse(res_str));
  } catch (error) {
    console.error(`Failed to enroll admin user ${id}`);
    const res_str = `{"result":"failed","msg":"failed to enroll admin user - ${id} : ${error}"}`;
    res.json(JSON.parse(res_str));
  }
});
// 4.0.2 /user POST 라우팅 ( id, userrole )
app.post("/user", async (req, res) => {
  const id = req.body.id;
  const userrole = req.body.userrole;

  console.log(id, userrole);

  try {
    // Create a new CA client for interacting with the CA.
    const caInfo = ccp.certificateAuthorities["ca.org1.example.com"];
    const caTLSCACerts = caInfo.tlsCACerts.pem;
    const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), "wallet");
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.
    const userIdentity = await wallet.get(id);
    if (userIdentity) {
      console.log('An identity for the user "appUser" already exists in the wallet');
      const res_str = `{"result":"failed","msg":"An identity for the user ${id} already exists in the wallet"}`;
      res.json(JSON.parse(res_str));
      return;
    }

    // Check to see if we've already enrolled the admin user.
    const adminIdentity = await wallet.get("admin");
    if (!adminIdentity) {
      console.log('An identity for the admin user "admin" does not exist in the wallet');
      const res_str = `{"result":"failed","msg":"An identity for the admin user ${id} does not exists in the wallet"}`;
      res.json(JSON.parse(res_str));
      return;
    }

    // build a user object for authenticating with the CA
    const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, "admin");

    // Register the user, enroll the user, and import the new identity into the wallet.
    const secret = await ca.register(
      {
        affiliation: "org1.department1",
        enrollmentID: id,
        role: userrole,
      },
      adminUser
    );
    const enrollment = await ca.enroll({
      enrollmentID: id,
      enrollmentSecret: secret,
    });
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: "Org1MSP",
      type: "X.509",
    };
    await wallet.put(id, x509Identity);

    // response to client
    console.log('Successfully registered and enrolled admin user "appUser" and imported it into the wallet');
    const res_str = `{"result":"success","msg":"Successfully enrolled user ${id} in the wallet"}`;
    res.status(200).json(JSON.parse(res_str));
  } catch (error) {
    console.error(`Failed to enroll admin user ${id}`);
    const res_str = `{"result":"failed","msg":"failed to register user - ${id} : ${error}"}`;
    res.json(JSON.parse(res_str));
  }
});
// 4.1 /asset POST (자산생성)
app.post("/asset", async (req, res) => {
  const cert = req.body.cert;
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
  const identity = await wallet.get(cert);
  if (!identity) {
    console.log(`An identity for the user does not exists in the wallet`);
    const res_str = `{"result":"failed","msg":"An identity for the user does not exists in the wallet"}`;
    res.json(JSON.parse(res_str));
    return;
  }

  // Create a new gateway for connecting to our peer node.
  const gateway = new Gateway();
  await gateway.connect(ccp, { wallet, identity: cert, discovery: { enabled: true, asLocalhost: true } });

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
  const cert = req.query.cert;
  const id = req.query.id;
  console.log("/asset-get-" + id);

  // Create a new file system based wallet for managing identities.
  const walletPath = path.join(process.cwd(), "wallet");
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  console.log(`Wallet path: ${walletPath}`);

  // Check to see if we've already enrolled the admin user.
  const identity = await wallet.get(cert);
  if (!identity) {
    console.log(`An identity for the user does not exists in the wallet`);
    const res_str = `{"result":"failed","msg":"An identity for the user does not exists in the wallet"}`;
    res.json(JSON.parse(res_str));
    return;
  }

  // Create a new gateway for connecting to our peer node.
  const gateway = new Gateway();
  await gateway.connect(ccp, { wallet, identity: cert, discovery: { enabled: true, asLocalhost: true } });

  // Get the network (channel) our contract is deployed to.
  const network = await gateway.getNetwork("mychannel");

  // Get the contract from the network.
  const contract = network.getContract("basic");

  // Submit the specified transaction.
  console.log(`\n--> Evaluate Transaction: ReadAsset, function returns "${id}" attributes`);
  result = await contract.evaluateTransaction("ReadAsset", id);

  // response -> client
  await gateway.disconnect();
  const res_str = `{"result":"success","msg":${result}}`;
  res.status(200).json(JSON.parse(res_str));
});
// 4.3 /update POST (자산변경)
app.post("/update", async (req, res) => {
  const cert = req.body.cert;
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
  const identity = await wallet.get(cert);
  if (!identity) {
    console.log(`An identity for the user does not exists in the wallet`);
    const res_str = `{"result":"failed","msg":"An identity for the user does not exists in the wallet"}`;
    res.json(JSON.parse(res_str));
    return;
  }

  // Create a new gateway for connecting to our peer node.
  const gateway = new Gateway();
  await gateway.connect(ccp, { wallet, identity: cert, discovery: { enabled: true, asLocalhost: true } });

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
  const cert = req.body.cert;
  const id = req.body.id;
  console.log("/delete-post-" + id);

  // Create a new file system based wallet for managing identities.
  const walletPath = path.join(process.cwd(), "wallet");
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  console.log(`Wallet path: ${walletPath}`);

  // Check to see if we've already enrolled the admin user.
  const identity = await wallet.get(cert);
  if (!identity) {
    console.log(`An identity for the user does not exists in the wallet`);
    const res_str = `{"result":"failed","msg":"An identity for the user does not exists in the wallet"}`;
    res.json(JSON.parse(res_str));
    return;
  }

  // Create a new gateway for connecting to our peer node.
  const gateway = new Gateway();
  await gateway.connect(ccp, { wallet, identity: cert, discovery: { enabled: true, asLocalhost: true } });

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
// 4.5 /assets GET (모든자산조회)
app.get("/assets", async (req, res) => {
  const cert = req.query.cert;
  console.log("/asset-get-" + cert);

  // Create a new file system based wallet for managing identities.
  const walletPath = path.join(process.cwd(), "wallet");
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  console.log(`Wallet path: ${walletPath}`);

  // Check to see if we've already enrolled the admin user.
  const identity = await wallet.get(cert);
  if (!identity) {
    console.log(`An identity for the user does not exists in the wallet`);
    const res_str = `{"result":"failed","msg":"An identity for the user does not exists in the wallet"}`;
    res.json(JSON.parse(res_str));
    return;
  }

  // Create a new gateway for connecting to our peer node.
  const gateway = new Gateway();
  await gateway.connect(ccp, { wallet, identity: cert, discovery: { enabled: true, asLocalhost: true } });

  // Get the network (channel) our contract is deployed to.
  const network = await gateway.getNetwork("mychannel");

  // Get the contract from the network.
  const contract = network.getContract("basic");

  // Submit the specified transaction.
  console.log(`\n--> Evaluate Transaction: GetAllAssets, function returns attributes`);
  result = await contract.evaluateTransaction("GetAllAssets");

  // response -> client
  await gateway.disconnect();
  const res_str = `{"result":"success","msg":${result}}`;
  res.status(200).json(JSON.parse(res_str));
});

// 4.6 /transfer POST (소유주변경)
app.post("/transfer", async (req, res) => {
  const cert = req.body.cert;
  const id = req.body.id;
  const owner = req.body.owner;
  console.log("/transfer-post-" + owner);

  // Create a new file system based wallet for managing identities.
  const walletPath = path.join(process.cwd(), "wallet");
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  console.log(`Wallet path: ${walletPath}`);

  // Check to see if we've already enrolled the admin user.
  const identity = await wallet.get(cert);
  if (!identity) {
    console.log(`An identity for the user does not exists in the wallet`);
    const res_str = `{"result":"failed","msg":"An identity for the user does not exists in the wallet"}`;
    res.json(JSON.parse(res_str));
    return;
  }

  // Create a new gateway for connecting to our peer node.
  const gateway = new Gateway();
  await gateway.connect(ccp, { wallet, identity: cert, discovery: { enabled: true, asLocalhost: true } });

  // Get the network (channel) our contract is deployed to.
  const network = await gateway.getNetwork("mychannel");

  // Get the contract from the network.
  const contract = network.getContract("basic");

  // Submit the specified transaction.
  console.log("\n--> Submit Transaction: UpdateAsset asset");
  await contract.submitTransaction("TransferAsset", id, owner);
  console.log("Transaction(TransferAsset) has been submitted");

  // response -> client
  await gateway.disconnect();
  const res_str = `{"result":"success","msg":"Transaction(TransferAsset) has been submitted"}`;
  res.status(200).json(JSON.parse(res_str));
});

// 5. 서버시작
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
