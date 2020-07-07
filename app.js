var express = require("express");
var http = require("http");
var path = require("path");
var bodyParser = require("body-parser");

var app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded()); // to support URL-encoded bodies

var port = Number(process.env.PORT || 3000);

var server = http.createServer(app).listen(port, function () {
  console.log("Listening on " + port);
});

app.get("/", function (req, res) {
  res.sendfile("index.html");
});




