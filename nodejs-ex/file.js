var fs = require("fs");

fs.open("./output.txt", "a+", function (err, fd) {
  if (err) throw err;
  var buf = new Buffer.from("Hello!");
  fs.write(fd, buf, 0, buf.length, null, function (err, written, buffer) {
    if (err) throw err;
    console.log(err, written, buffer);

    fs.close(fd, function () {
      console.log("File Open, write, close done");
    });
  });
});

console.log("11111111111");
console.log("22222222222");
console.log("33333333333");
console.log("44444444444");
