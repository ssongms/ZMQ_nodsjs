const zmq = require("zeromq");
const random = require("lodash/random");

async function main() {
  const subscriber = zmq.socket("sub");
  subscriber.subscribe("");
  subscriber.connect("tcp://localhost:5557");

  const publisher = zmq.socket("push");
  publisher.connect("tcp://localhost:5558");

  subscriber.on("message", (message) => {
    console.log("I: received message ", message.toString());
  });

  while (true) {
    const rand = random(1, 100);
    if (rand < 10) {
      publisher.send(`"${rand}"`);
      console.log(`I: sending message `, rand);
    }
    await sleep(100);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main();
