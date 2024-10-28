const express = require('express');
const { createServer } = require('http');

const ping = require('./pingModule');
const { error } = require('console');


const app = express();
const server = createServer(app);

app.get('/', (req, res) => {

    ping("8.8.8.8", (error, result) => {
        if(error) {
            console.error(error);
        }
        else {
            console.log(result)
            res.send(result);
            res.end();
        }
    })
    
})

server.listen(3006, ()=>{
    console.log("Server is running at port 3006")
})
