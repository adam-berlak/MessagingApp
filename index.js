/*
Socket.IO messaging base functionality based off:

Author(s) Name: N/A
Date: 2019, January 02
Title: Create a basic chat application
Type: Source Code
Web Address: https://socket.io/get-started/chat/
*/

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


var connection_counter = 0;
var message_log = new Array();
var user_counter = 0;
var user_list = new Array();
var user_settings = new Array();


app.get('/', function(req, res)
{
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket)
{
  socket.nickname = "Anonymous-User-" + connection_counter;
  user_list.push(socket.nickname);
  user_settings.push(["none"]);
  io.emit('assign-name', ["None", socket.nickname, connection_counter, user_list, user_settings]);
  loadLoggedMessages(socket.nickname, connection_counter);
  connection_counter++;
  updateUserList();
  
  socket.on('chat message', function(msg)
  {
	 // Change Color Settings
	if (msg[1].includes("/nickcolor"))
	{
		color = msg[1].replace("/nickcolor", "");
		io.emit('assign-color', [msg[2], msg[2], color, msg[0]]);
		io.emit('assign-color', ["Everybody", msg[2], color, msg[0]]);
		user_settings[msg[2]] = color;
	}
	// Change Nickname Settings Error
	else if (msg[1].includes("/nick") & user_list.includes(msg[1].replace("/nick", "")))
	{
		io.emit('chat message', [msg[0], "Unable to change name as it is already in use!", msg[2]]);	
	}
	// Change Nickname Settings
	else if (msg[1].includes("/nick"))
	{
		name = msg[1].replace("/nick", "");
		io.emit('assign-name', [msg[0], name, msg[2], user_list]);
		io.emit('chat message', ["Everybody", msg[0] + " changed his name to: " + name, msg[2]]);
		message_log.push(msg[0] + " changed his name to: " + name);
		user_list[msg[2]] = name;
		updateUserList();
	}
	else 
	{
		date = new Date();
		io.emit('chat message', ["Everybody", date + " " + msg[0] + " Says: " + msg[1], msg[2], user_settings[msg[2]]]);
		message_log.push([date + " " + msg[0] + " Says: " + msg[1], msg[2]]);
	}
  });
});

function updateUserList()
{
	io.emit('update-users', user_list);
}

function loadLoggedMessages(name, id)
{
	for (var message in message_log)
		
		io.emit('chat message', [id, message_log[message][0], message_log[message][1], user_settings[message_log[message][1]]]);
	}
}

http.listen(50, function()
{
  console.log('listening on *:50');
});