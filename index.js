/**
 * http://usejsdoc.org/
 */


var app = require("express")();

var http = require("http").Server(app);

var io= require("socket.io")(http);



app.get("/", function(req, res){
	res.sendFile(__dirname +"/index.html");
});
io.on("connection", function(socket){
	io.emit('connected', "user connected");
	console.log("user connected");
	
	socket.on("chat message", function(msg){
		io.emit("chat message", msg)
	});
	
	socket.on('disconnect', function(){
		io.emit("disconnect", "user disconnected");
		console.log('user disconnected');
	});
});

http.listen(8888, function(){
	console.log("listening on*:8888");
});