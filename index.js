"use strict";

let http = require('http')
let request = require('request')
let url = require('url')

// Set a the default value for --host to 127.0.0.1
let argv = require('yargs')
    .default('host', '127.0.0.1:8000')
    .argv

let port = argv.port || (argv.host === '127.0.0.1' ? 8000 : 80)
let destinationUrl = argv.url || url.format({
   protocol: 'http',
   host: argv.host,
   port
})

let path = require('path')
let fs = require('fs')
let logPath = argv.log && path.join(__dirname, argv.log)
let logStream = logPath ? fs.createWriteStream(logPath) : process.stdout


http.createServer((req, res) => {
        console.log("Proxying request from $req.host")
        for (let header in req.headers) {
              res.setHeader(header, req.headers[header])
        }
        req.pipe(res)

}).listen(8000)


http.createServer((req, res) => {
  // Proxy code here
  let options = {
        headers: req.headers,
        url: destinationUrl,
        method: req.method
    }
    logStream.write('\n' + JSON.stringify(req.headers) + '\n')
    req.pipe(logStream, {end: false})
    //req.pipe(request(options)).pipe(res)
    let outboundResponse = request(options)
    req.pipe(outboundResponse)

    logStream.write('\n\n\n' + JSON.stringify(outboundResponse.headers))
    outboundResponse.pipe(logStream, {end: false})
    outboundResponse.pipe(res)

}).listen(8001)

