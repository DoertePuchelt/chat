/**
 * http://usejsdoc.org/
 */


var app = require("express")();

var http = require("http").Server(app);

var io = require("socket.io")(http);

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json());


// Root File for new connections
app.get("/", function(req, res){
	res.sendFile(__dirname +"/index.html");
});

var user = "";

// receive the username with a POST-Request from index.html 
// and forward the client to chat.html
app.post("/", function(req, res){
	res.sendFile(__dirname +"/chat.html");
	user = req.body.username.trim();
});

// List of connected Clients
var userList = {};

// receive the current timestamp
function timestamp(){
	var date = new Date().toLocaleDateString();
	var time = new Date().toLocaleTimeString();
	return "[" + date + " " + time + "] ";
}

// handle new connections
io.on("connection", function(client){
	client.join("chatroom");
	client.username = user;
	
	// add the client to userList
	userList[client.username] = client;
	
	// send the 'connected' event to all clients, with the name of the new client
	io.emit('connected', ""+timestamp()+"'"+client.username+"' connected");

	// handle 'userlist' event to send the list of all clients
	// to the client that requested
	client.on("userlist", function(){
		var onlineUsers = Object.getOwnPropertyNames(userList);
		userList[client.username].emit('userlist', onlineUsers);
	});
	
	// handle 'private message' event
	// send the message only to the sender and receiver
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
	
	// handle 'chat message' event
	// send message to all connected clients
	client.on("chat message", function(msg){
		io.emit("chat message", {timestamp:timestamp(), username:client.username, message:msg});
	});
	
	// handle 'disconnect' event
	// send to all clients which user disconnected
	client.on('disconnect', function(){
		delete userList[client.username];
		io.emit("disconnect", ""+timestamp()+"'"+client.username+"' disconnected");
	});
});

// start server on port 8888
http.listen(8888, function(){
	console.log("listening on*:8888");
});