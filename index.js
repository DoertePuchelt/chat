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
	user = req.body.username;
});

var userList = [];

function timestamp(){
	var date = new Date().toLocaleDateString();
	var time = new Date().toLocaleTimeString();
	return "[" + date + " " + time + "] ";
}

io.on("connection", function(client){
	client.join("chatroom");
	client.username = user;
	
	userList.push({username:client.username, userID:client.id});
	
	io.emit('connected', ""+timestamp()+"'"+client.username+"' connected");
//	console.log("user connected");
//	console.log(client.id);
	
//	var clients = io.sockets.adapter.rooms['chatroom'];
//	console.log(clients);
//	var c = io.sockets.clients();
//	console.log(c);
	client.on("chat message", function(msg){
		io.emit("chat message", {timestamp:timestamp(), username:client.username, message:msg})
	});
	
	client.on('disconnect', function(){
		io.emit("disconnect", ""+timestamp()+"'"+client.username+"' disconnected");
//		console.log('user disconnected');
	});
});

http.listen(8888, function(){
	console.log("listening on*:8888");
});