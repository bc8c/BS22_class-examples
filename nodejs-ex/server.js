var express = require("express");
var path = require("path");
var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(function (req, res, next) {
  console.log("First Middleware");
  console.log(req.body);
  console.log(req.query);
  var paramId = req.body.id || req.query.id;
  var paramPassword = req.body.password || req.query.password;

  res.writeHead("200", { "Content-Type": "text/html" });
  res.write("<h1>Express Server Replied</h1>");
  res.write("<div><p>Param ID : " + paramId + "</p></div>");
  res.write("<div><p>Param Password : " + paramPassword + "</p></div>");
  res.end();
});

app.listen(8080, function () {
  console.log("Express Server Running at 127.0.0.1:8080");
});
