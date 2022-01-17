const express = require("express");
const path = require("path");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const IO = socketIO(server);

server.listen(3333, () => console.log("Server is running"));

app.use(express.static(path.join(__dirname, "public")));

// socket
let usersConnected = [];

IO.on("connection", (socket) => {
  console.log("Connect SOCKET");

  socket.on("join-request", (username) => {
    socket.username = username;
    usersConnected.push(username);

    console.log(usersConnected);

    socket.emit("user-ok", usersConnected);

    socket.broadcast.emit("list-update", {
      joined: username,
      list: usersConnected,
    });

    socket.on("disconnect", () => {
      usersConnected = usersConnected.filter((user) => user != socket.username);
      console.log(usersConnected);

      socket.broadcast.emit("list-update", {
        left: socket.username,
        list: usersConnected,
      });
    });

    socket.on("send-message", (message) => {
      let data = {
        username: socket.username,
        message,
      };

      socket.broadcast.emit("show-message", data);
    });
  });
});
