const fs = require("fs");
const { Wallets } = require("fabric-network");
const path = require("path");

async function main() {
  console.log("Start addToWallet");

  //   1. 지갑 생성 및 오픈
  const wallet = await Wallets.newFileSystemWallet("wallet");

  //   2. 지갑 조회 (중복확인)
  const checkidentity = await wallet.get("appUser");
  if (checkidentity) {
    console.log("An identity for the user 'appUser' already exists in the wallet");
    return;
  }

  // 3. 신원 발급 ( static : 이미 발급된 인증서 불러오기 )
  const credPath = path.join(__dirname, "/../msp");
  const certificate = fs.readFileSync(path.join(credPath, "/org1.example.com/users/signcerts/User1@org1.example.com-cert.pem")).toString();
  const privateKey = fs.readFileSync(path.join(credPath, "/org1.example.com/users/keystore/priv_sk")).toString();

  // 4. 지갑에 신원정보 저장하기
  const identity = { credentials: { certificate, privateKey }, mspId: "Org1MSP", type: "X.509" };

  await wallet.put("appUser", identity);
  console.log("Successfully import an user('appUser') into the wallet");
}

main();
