const express = require('express');
const { createServer } = require('http');
const url = require('url');
const dt = require('./ownModule')

const app = express();
const server = createServer(app);

app.get('/', (req, res) => {
    console.log(`Date: ${dt.dateModule()}`)
    res.write(`<h1> Welcome to Node.Js</h1> <br> <h6> Date: ${dt.dateModule()} </h6>`);
    res.write('Hello World!');
    res.write(`${req.url}`);

    // res.send(`<h1> Welcome to Node.Js</h1> <br> <h6> Date: ${dt.dateModule()} </h6>`);
    // res.send(`Date: ${dt.dateModule()}`)
 
    res.end();
})

server.listen(3003, ()=>{
    console.log("Server is running at port 3003")
    console.log(`Date: ${dt.dateModule()}`)
})