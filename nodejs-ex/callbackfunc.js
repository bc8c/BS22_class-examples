function add(a, b, callback) {
  var result = a + b;
  callback(result);
}

add(100, 5, function (result) {
  console.log("result is : " + result);
});
