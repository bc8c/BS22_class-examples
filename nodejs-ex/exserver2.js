var express = require("express");
var app = express();

app.use(function (req, res, next) {
  console.log("First middleware");
  res.write("<h1>Express Server</h1>");
  next();
});

app.use("/about", function (req, res, next) {
  console.log("Second middleware");
  res.write("<h2>About Page</h2>");
  next();
});

app.get("/", function (req, res) {
  res.end();
});

app.get("/about", function (req, res) {
  res.write("This is about page");
  res.end();
});

app.get("/about/me", function (req, res) {
  res.write("Hello! Nice to meet you!");
  res.end();
});

app.listen(8080, function (req, res) {
  console.log("Server running at 8080");
});
