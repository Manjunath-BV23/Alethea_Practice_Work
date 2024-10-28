const { exec, spawn } = require('child_process')

const ping = (host, callback) => {
    // exec(`ping -c 4 ${host}`, (error, stdout, stderr) => {
    //     if(error){
    //         callback(`Error: ${error}`);
    //         return;
    //     }
    //     if(stderr) {
    //         callback(`Stderr: ${stderr}`)
    //         return;
    //     }
    //     else {
    //         callback(null, stdout);
    //     }
    // })

    const sp = spawn('ping', ['-c', '10', host]);

    var result = '';
    sp.stdout.on('data', (data)=>{        
        // result += data.toString();
        callback(null, data.toString())
    });

    sp.stderr.on('data', (data) => {
        callback(`Error: ${data}`)
    });
    sp.on('close', (code) => {
        if(code === 0){
            callback(null, result)
        }
        else {
            callback(`ping process exited with code ${code}`)
        }
    })
}

module.exports = ping




// exec(`ping -c 4 ${host}`, (error, stdout, stderr) => {
//     if(error) {
//         console.log(`Error: ${error}`);
//         return
//     }
//     if(stderr){
//         console.error(`Stderr: ${stderr}`);
//         return;
//     }
//     console.log(`Stdout: ${stdout}`)
// })



// const sp  = spawn("ping", ['-c', '4', host]);
 
// sp.stdout.on('data', (data) => {
//     console.log(`stdout: ${data}`);
//   });
  
// sp.stderr.on('data', (data) => {
// console.error(`stderr: ${data}`);
// });

// sp.on('close', (code) => {
// console.log(`child process exited with code ${code}`);
// })