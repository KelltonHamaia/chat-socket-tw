const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
const server = http.createServer(app);

server.listen(3000, ()=> {
    console.log(`http://127.0.0.1:3000`);
});

const io = socketIO(server);
let connectedUsers = [];

io.on('connect', (socket)=> {
    console.log('conectado');

    socket.on("join-request", (username) => {
        socket.username = username;
        connectedUsers.push(username);
        socket.emit("user-ok", connectedUsers);

        socket.broadcast.emit("list-update", {
            joined: socket.username,
            list: connectedUsers
        });
    });


    socket.on("disconnect", ()=> {
        connectedUsers = connectedUsers.filter( item => item != socket.username);
        socket.broadcast.emit("list-update", {
            left: socket.username,
            list: connectedUsers
        })
    });

    socket.on("send-msg", (txt) => {
        let obj = {
          username: socket.username,
          message: txt,
        };
    
        socket.broadcast.emit("show-msg", obj);
      });
});

