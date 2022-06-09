console.log("숫자 보여주기 %d", 100);

console.log("문자열 보여주기 %s", "안녕하세요");

console.log("JSON 객체 보여주기 %j", { name: "Alice" });

console.log("현재 실행한 파일의 이름 : %s", __filename);
console.log("현재 실행한 파일의 패스 : %s", __dirname);

var Person = { name: "소녀시대", age: 20 };
console.dir(Person);

console.log("argv 속성의 파라미터 수 : " + process.argv.length);
console.dir(process.argv);

process.argv.forEach(function (item, index) {
  console.log(index + " : ", item);
});
