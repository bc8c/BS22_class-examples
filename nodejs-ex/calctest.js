var Calc = require("./calc2");

var calc = new Calc();
calc.emit("stop");
console.log("stop event sended to " + Calc.title);
