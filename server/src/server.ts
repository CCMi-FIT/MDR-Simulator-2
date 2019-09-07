import * as http  from "http";
import app from "./app";
import * as urls from "./urls";

//import { convertModel } from "./convert";
//console.log("converting model");
//convertModel();


/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string"
    ? "pipe " + addr
    : "port " + (addr ? addr.port : "");
  console.log("Listening on " + bind);
}

// Setup and go

var port = urls.port;
app.set("port", port);

var server = http.createServer(app);

server.listen(port);
console.log("MDR Simulator 2 server is listening on " + port);
server.on("listening", onListening);



