/**
 * http://usejsdoc.org/
 */

var express = {
  "name": "socket-chat-example",
  "version": "0.0.1",
  "description": "my first socket.io app",
  "dependencies": {}
};

var app = require("express")();

var http = require("http").Server(app);

var io= require("socket.io")(http);



app.get("/", function(req, res){
	res.sendFile(__dirname +"/index.html");
});
io.on("connection", function(socket){
	socket.on("chat message", function(msg){
		io.emit("chat message", msg)
	});
});

http.listen(8888, function(){
	console.log("listening on*:8888");
});