const express = require("express");
const { createServer } = require("http");
const { join } = require("path");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server, {
    connectionStateRecovery: {}
});


app.get("/", (req, res) => {

    res.sendFile(join("/home/alethea/Public/Manju_Works/socket_io", "index.html"));

});


io.on("connection", (socket) => {
    console.log("A User is connected");

    socket.on("chat message", (msg) => {
        io.emit("chat message", msg)
    })
})



server.listen(3001, () => {
    console.log("Server is running at http://localhost:3001")
})