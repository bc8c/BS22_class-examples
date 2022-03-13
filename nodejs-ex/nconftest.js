var nconf = require("nconf");

nconf.argv();
console.log("A : " + nconf.get("A"));
console.log("B : " + nconf.get("B"));
