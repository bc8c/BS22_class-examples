var util = require("util");
var EventEmitter = require("events").EventEmitter;
var Calc = function () {
  var self = this;
  this.on("stop", function () {
    console.log("Calc has received stop event");
  });
};

util.inherits(Calc, EventEmitter);
// Calc.prototype = EventEmitter.prototype;
// Object.setPrototypeOf(Calc.prototype, EventEmitter.prototype);
Calc.prototype.add = function (a, b) {
  return a + b;
};

module.exports = Calc;
module.exports.title = "calculator";
