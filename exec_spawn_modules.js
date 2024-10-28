exec(`ping -c 4 ${host}`, (error, stdout, stderr) => {
    if(error) {
        console.log(`Error: ${error}`);
        return
    }
    if(stderr){
        console.error(`Stderr: ${stderr}`);
        return;
    }
    console.log(`Stdout: ${stdout}`)
});

    
const sp  = spawn("ping", ['-c', '4', host]);
    
sp.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
});
    
sp.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
});

sp.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
})
