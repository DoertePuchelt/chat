/**
 * http://usejsdoc.org/
 */


var app = require("express")();

var http = require("http").Server(app);

var io = require("socket.io")(http);

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json());



app.get("/", function(req, res){
	res.sendFile(__dirname +"/index.html");
});

var user = "";

app.post("/", function(req, res){
	res.sendFile(__dirname +"/chat.html");
	user = req.body.username.trim();
});


var userList = {};

function timestamp(){
	var date = new Date().toLocaleDateString();
	var time = new Date().toLocaleTimeString();
	return "[" + date + " " + time + "] ";
}

io.on("connection", function(client){
	client.join("chatroom");
	client.username = user;
	
	userList[client.username] = client;
	
	io.emit('connected', ""+timestamp()+"'"+client.username+"' connected");

	
	client.on("userlist", function(){
		var onlineUsers = Object.getOwnPropertyNames(userList);
		userList[client.username].emit('userlist', onlineUsers);
	});
	
	client.on('private message', function(text){
		text = text.substr(1, text.length);
		var userInput = text.split(" ");
		var toUser = text.substr(0,text.indexOf(' '));
		var privateMessage = text.substr(text.indexOf(' ')+1);
		
		var privateUserInfoReceiver = "Private Message From '"+client.username+"'";
		var privateUserInfoSender = "Private Message to '"+toUser+"'";
		userList[toUser].emit("chat message", {timestamp:timestamp(), username:privateUserInfoReceiver, message:privateMessage});
		userList[client.username].emit("chat message", {timestamp:timestamp(), username:privateUserInfoSender, message:privateMessage});
	});
	
	client.on("chat message", function(msg){
		io.emit("chat message", {timestamp:timestamp(), username:client.username, message:msg});
	});
	
	client.on('disconnect', function(){
		delete userList[client.username];
		io.emit("disconnect", ""+timestamp()+"'"+client.username+"' disconnected");
	});
});

http.listen(8888, function(){
	console.log("listening on*:8888");
});