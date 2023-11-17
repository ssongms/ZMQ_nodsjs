const zmq = require("zeromq");
const socket = zmq.socket("rep");

async function req_rep_Server() {
  await socket.bindSync("tcp://*:5555");

  socket.on("message", async (message) => {
    console.log(`Received request: ${message}`);
    await sleep(1000);
    socket.send("World");
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

req_rep_Server();
