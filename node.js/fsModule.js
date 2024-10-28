const http = require('http');
const fs = require('fs');


http.createServer((req, res)=>{
    // fs.readFile("demofile.html", (err, data) => {
    //     res.write(data);
    //     res.end();
    // })

    // fs.appendFile("newfile.txt", "Hello content!", (err) => {
    //     if(err) throw err;
    //     console.log("Saved!");
    // })

    // fs.open("newfile2.txt", 'w', (err, file) => {
    //     if(err) throw err;
    //     console.log("saved")
    // })

    // fs.writeFile("newfile3.txt", 'Hello new file!', (err) => {
    //     if(err) throw err;
    //     console.log("Saved!")
    // })

    // fs.appendFile("newfile.txt", "New Content!", (err) => {
    //     if(err) throw err;
    //     console.log("Updated");
    // })

    // fs.writeFile('newfile2.txt', 'new content', (err) => {
    //     if(err) throw err;
    //     console.log('Updated!')
    // })

    // fs.unlink('newfile2.txt', (err) => {
    //     if(err) throw err;
    //     console.log("File Deleted");
    // })

    fs.rename('newfile.txt', 'renamedfile.txt', (err) => {
        if(err) throw err;
        console.log("File Renamed!");
    })

}).listen(4000)