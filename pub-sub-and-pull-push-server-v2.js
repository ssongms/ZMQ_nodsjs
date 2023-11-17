const zmq = require("zeromq");

function main() {
  const publisher = zmq.socket("pub");
  publisher.bindSync("tcp://*:5557");
  const collector = zmq.socket("pull");
  collector.bindSync("tcp://*:5558");

  collector.on("message", (message) => {
    console.log("server: publishing update => ", message.toString());
    publisher.send(message);
  });
}

main();
