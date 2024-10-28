const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { exec, spawn } = require('child_process');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

var ipAddress = process.argv[2];

console.log(process)

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {

  socket.on('pingRequest', (ipAddress) => {
    console.log(`Ping request received for: ${ipAddress}`);


    var cp =spawn('ping',[ipAddress,'-w', '30']);
    
    
    cp.stdout.on('data', (data) => {
        console.log(`Ping output: ${data}`);
        socket.emit('pingResponse', data.toString());
    });
  });
  
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});


