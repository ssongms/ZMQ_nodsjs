const zmq = require("zeromq");
const publisher = zmq.socket("pub");
const collector = zmq.socket("pull");

async function main() {
  publisher.bindSync("tcp://*:5557");
  collector.bindSync("tcp://*:5558");

  collector.on("message", (message) => {
    console.log(`I: publishing update ${message.toString()}`);
    publisher.send(message);
  });
}

main();
