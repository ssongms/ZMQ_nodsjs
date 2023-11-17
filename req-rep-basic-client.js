const zmq = require("zeromq");
const socket = zmq.socket("req");

async function req_rep_Client() {
  console.log("Connecting to hello world server...");
  socket.connect("tcp://localhost:5555");
  let count = 0;

  const intervalId = setInterval(function () {
    console.log(`Sending request ${count} …`);
    count++;
    socket.send("Hello");

    if (count == 10) {
      clearInterval(intervalId);
    }
  }, 2000);

  socket.on("message", (message) => {
    console.log(`Received reply ${count - 1} [${message.toString()}]`);
    if (count == 10) {
      socket.close();
    }
  });
}

req_rep_Client();
