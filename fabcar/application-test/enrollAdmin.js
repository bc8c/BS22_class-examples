const fs = require("fs");
const { Wallets } = require("fabric-network");
const path = require("path");
const FabricCAServices = require("fabric-ca-client");

async function main() {
  console.log("Start addToWallet");

  const ccpPath = path.resolve(__dirname, "ccp", "connection-org1.json");
  const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf-8"));

  const caInfo = ccp.certificateAuthorities["ca.org1.example.com"];
  const caTLSCACerts = caInfo.tlsCACerts.pem;

  const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

  //   1. 지갑 생성 및 오픈
  const wallet = await Wallets.newFileSystemWallet("wallet");

  //   2. 지갑 조회 (중복확인)
  const checkidentity = await wallet.get("appUser");
  if (checkidentity) {
    console.log("An identity for the user 'appUser' already exists in the wallet");
    return;
  }

  // 3. 신원 발급 ( static : 이미 발급된 인증서 불러오기 )
  // const credPath = path.join(__dirname, "/../msp");
  // const certificate = fs.readFileSync(path.join(credPath, "/org1.example.com/users/signcerts/User1@org1.example.com-cert.pem")).toString();
  // const privateKey = fs.readFileSync(path.join(credPath, "/org1.example.com/users/keystore/priv_sk")).toString();

  const enrollment = await ca.enroll({ enrollmentID: "admin", enrollmentSecret: "adminpw" });

  const x509Identity = {
    credentials: {
      certificate: enrollment.certificate,
      privateKey: enrollment.key.toBytes(),
    },
    mspId: "Org1MSP",
    type: "X.509",
  };

  await wallet.put("admin", x509Identity);

  // build a user object for authenticating with the CA
  const adminIdentity = await wallet.get("admin");
  const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
  const adminUser = await provider.getUserContext(adminIdentity, "admin");

  const secret = await ca.register({ affiliation: "org1.department1", enrollmentID: "appUser", role: "client" }, adminUser);

  const enrollmentuser = await ca.enroll({ enrollmentID: "appUser", enrollmentSecret: secret });

  const x509Identityuser = {
    credentials: {
      certificate: enrollmentuser.certificate,
      privateKey: enrollmentuser.key.toBytes(),
    },
    mspId: "Org1MSP",
    type: "X.509",
  };

  await wallet.put("appUser", x509Identityuser);

  // // 4. 지갑에 신원정보 저장하기
  // const identity = { credentials: { certificate, privateKey }, mspId: "Org1MSP", type: "X.509" };

  // await wallet.put("appUser", identity);
  console.log("Successfully import an user('appUser') into the wallet");
}

main();
