const { spawn } = require('child_process');
const express = require('express');
const { createServer } = require('http');
const { join } = require('path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {

    res.sendFile(join("/home/alethea/Public/Manju_Works/ping-app", "index.html"))
    // res.send("Welcome to Ping App");
    // res.end();
})

io.on('connection', (socket) => {
    console.log("User is connected!")

    socket.on('pingRequest', (ipAddress) => {
        // io.emit('pingRequest', ipAddress)

        var png = spawn('ping', [ipAddress, '-w', '30']);

        png.stdout.on('data', (data) => {
            console.log("Ping Data: ", data);
            socket.emit('pingResponce', data.toString())
        })
    })

})


server.listen(3005, () => {
    console.log("Server is Running at port 3005....");
})