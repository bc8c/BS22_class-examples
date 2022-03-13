var fs = require("fs");

fs.open("./oputput.txt", "a+", function (err, fd) {
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
