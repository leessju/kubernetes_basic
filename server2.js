var os   = require('os');
var http = require('http');

var www = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Hello World! I'm ver.2"+os.hostname());
  console.log("[" + Date(Date.now()).toLocaleString() + "] "+os.hostname());
});

www.listen(8080);