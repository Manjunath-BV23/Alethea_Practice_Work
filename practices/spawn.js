const {spawn} = require("child_process");
const http = require("http");
const socketIo = require('socket.io');

    var ipAddress = process.argv[2]


    // var sp1 = spawn("ls", ["-lh", '/usr']);
    // var sp = spawn("ping", ["8.8.8.8", "-w", "30"])

    var sp = spawn("ping", [ipAddress, "-w", "30"])

    sp.stdout.on("data", (data)=>{
       // res.write(`Output: ${data}`);
        //res.end();

        console.log(`Output: ${data}`)
    })

    sp.stderr.on ("data", (err) => {
        console.error(`Error: ${err}`)
    })


    console.log("Server is running...")
    
