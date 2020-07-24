var express = require("express");
var http = require("http");
var ios = require("socket.io");
var path = require("path");
var bodyParser = require("body-parser");
var users = [];
var messages = [];
var onlineClient = {};

var app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded()); // to support URL-encoded bodies

var port = Number(process.env.PORT || 8000);

var server = http.createServer(app).listen(port, function () {
  console.log("Listening on " + port);
});

var io = ios.listen(server);

app.get("/", function (req, res) {
  res.sendfile("index.html");
});



io.sockets.on("connection", function (socket) {
 
  socket.on("chkUser", function (data) {
    var chk = users.indexOf(data.name);
    if (chk == -1) {
     
      users.push(data.name);
     
     
      onlineClient[data.name] = socket;
    }
    socket.emit("chkUser", chk);
  });

  socket.on("joined", function (data) {
   
    socket.username = data.name;
    io.sockets.emit("totalOnlineUser", users, socket.username);
    socket.emit("myInfo", socket.username);
    io.sockets.emit("newOne", data, messages);
   
  });

  socket.on("chatMsg", function (data) {
    
    var data = {
      name: socket.username ,
      msg: data.msg,
    };
    messages.push(data);
    io.sockets.emit("msgEveryOne", data);
  });

  socket.on("disconnect", function (data) {
   
    if (socket.username != undefined) {
      var ax = users.indexOf(socket.username);
      users.splice(ax, 1);
      io.sockets.emit("totalOnlineUser", users, socket.username);
     

    ;
      socket.emit("usersDisconnect");
      //socket.emit("disconnect",{});
    }
  });

  socket.on("typing", function (data) {
    io.sockets.emit("isTyping", { isTyping: data, user: socket.username });
  });

  
  ////// Create room /////
  socket.on("sendPrivateChat", function (data) {
    var socketTo = onlineClient[data.toName];
    var socketFrom = onlineClient[data.fromName];
    var group = "private";
    socketTo.join(group); //create room
    socketFrom.join(group);
    //io.sockets.in(data.name).emit('privateChat', data);
    socketTo.emit("privateChat", data);
    socketFrom.emit("privateChat", data);
  });

  socket.on("sendprivatechat", function (key, msg) {
    var clientSocket = onlineClient[key];
    if (clientSocket == null) {
    } else {
      clientSocket.emit("getprivatemsg", socket.username, key, msg);
    }
  });
});
