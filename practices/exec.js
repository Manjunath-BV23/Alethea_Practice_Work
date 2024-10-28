const express = require("express");
const http = require("http");
const { exec } = require('child_process');
const path = require("path");
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
// const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));

    exec("ls", (error, stderr, stdout)=> {
        if(error){
            console.error(`Error: ${error}`);
            return;
        }
        if(stderr){
            console.error(`Stderr: ${stderr}`);
            return;
        }
        console.log(`Stdout: ${stdout}`)
        // stdout.on("data", (data) => {
        // })
    })



// exec('ls', (error, stdout, stderr) => {
//     if (error) {
//         console.error(`Error: ${error.message}`);
//         return;
//     }
//     if (stderr) {
//         console.error(`Stderr: ${stderr}`);
//         return;
//     }
//     console.log(`Stdout: ${stdout}`);
// });

server.listen(3002, () => {
    console.log('Server is running on port 3001');
});