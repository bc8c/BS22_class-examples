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

// 3. 서버 설정
const app = express();
const PORT = 3000;
const HOST = "0.0.0.0";

app.use(express.static(path.join(__dirname, "views")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// 4. "/" GET 라우팅
app.get("/", (req, res) => {
  res.sendFile(__dirname + "index.html");
});

// 5. /admin POST 라우팅 ( id, password )
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

// 6. /user POST 라우팅 ( id, userrole )
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

// 7. server 시작
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
