var express = require("express");
var app = express();

app.get("/page/:id", function (req, res) {
  var id = req.params.id;
  res.send("<h1>" + id + "page</h1>");
});

app.listen(8080, function (req, res) {
  console.log("Server running at http://127.0.0.1:8080");
});
