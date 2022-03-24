// ExpressJS Setup
const express = require("express");
const app = express();
var bodyParser = require("body-parser");

// Hyperledger Bridge
const { Wallets, Gateway } = require("fabric-network");
const fs = require("fs");
const path = require("path");
const ccpPath = path.resolve(__dirname, "ccp", "connection-org1.json");
let ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

// Constants
const PORT = 8080;
const HOST = "0.0.0.0";

// use static file
app.use(express.static(path.join(__dirname, "views")));

// configure app to use body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// main page routing
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

async function cc_call(fn_name, args) {
    const walletPath = path.join(process.cwd(), "wallet");
    console.log(`Wallet path: ${walletPath}`);
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    console.log(`Wallet path: ${walletPath}`);

    const userExists = await wallet.get("appUser");
    if (!userExists) {
        console.log(
            'An identity for the user "appUser" does not exist in the wallet'
        );
        console.log("Run the registerUser.js application before retrying");
        return;
    }

    const gateway = new Gateway();
    await gateway.connect(ccp, {
        wallet,
        identity: "appUser",
        discovery: { enabled: true, asLocalhost: true },
    });

    const network = await gateway.getNetwork("mychannel");
    const contract = network.getContract("teamate");

    var result;

    if (fn_name == "addUser") {
        result = await contract.submitTransaction("addUser", args);
    } else if (fn_name == "addRating") {
        e = args[0];
        p = args[1];
        s = args[2];
        result = await contract.submitTransaction("addRating", e, p, s);
    } else if (fn_name == "readRating")
        result = await contract.evaluateTransaction("readRating", args);
    else result = "not supported function";

    return result;
}

// create mate
app.post("/mate", async (req, res) => {
    const email = req.body.email;
    console.log("add mate email: " + email);

    result = await cc_call("addUser", email);

    const myobj = { result: "success" };
    res.status(200).json(myobj);
});

// add score
app.post("/score", async (req, res) => {
    const email = req.body.email;
    const prj = req.body.project;
    const sc = req.body.score;
    console.log("add project email: " + email);
    console.log("add project name: " + prj);
    console.log("add project score: " + sc);

    var args = [email, prj, sc];
    result = await cc_call("addRating", args);

    const myobj = { result: "success" };
    res.status(200).json(myobj);
});

// find mate
app.post("/mate/:email", async (req, res) => {
    const email = req.body.email;
    console.log("email: " + req.body.email);

    result = await cc_call("readRating", email);
    console.log("result: " + result.toString());
    const myobj = JSON.parse(result, "utf8");

    res.status(200).json(myobj);
});

// server start
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
