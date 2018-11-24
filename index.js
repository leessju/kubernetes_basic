
// ========== Basic
var os   = require('os');
var http = require('http');

var www = http.createServer((req, res) => {
  // healthy
  if(request.url == '/readiness') {
    if(fs.existsSync('/tmp/healthy')){
      res.writeHead(200);
      res.end("Im ready I'm  "+os.hostname() +" \n");
    }else{
      res.writeHead(500);
      res.end("Im not ready I'm  "+os.hostname() +" \n");
    }
  }else{
    res.writeHead(200);
    res.end("Hello World! I'm  "+os.hostname() +" \n");
  } else {
    res.writeHead(200);
    res.end("Hello World! I'm "+os.hostname());
    console.log("[" + Date(Date.now()).toLocaleString() + "] "+os.hostname());
  }
});

www.listen(8080);


// ========== Ingress (users)
// var os   = require('os');
// var http = require('http');

// var www = http.createServer((req, res) => {
//   res.writeHead(200);
//   res.end("Hello World! I'm User Server "+os.hostname());
//   console.log("[" + Date(Date.now()).toLocaleString() + "] "+os.hostname());
// });

// www.listen(8080);

// ========== Ingress (products)
// var os   = require('os');
// var http = require('http');

// var www = http.createServer((req, res) => {
//   res.writeHead(200);
//   res.end("Hello World! I'm Product Server "+os.hostname());
//   console.log("[" + Date(Date.now()).toLocaleString() + "] "+os.hostname());
// });

// www.listen(8080);