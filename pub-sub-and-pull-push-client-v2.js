const zmq = require("zeromq");

async function main(clientID) {
  const subscriber = zmq.socket("sub");
  subscriber.connect("tcp://localhost:5557");
  subscriber.subscribe("");

  const publisher = zmq.socket("push");
  publisher.connect("tcp://localhost:5558");

  subscriber.on("message", (message) => {
    console.log(`${clientID}: receive status => ${message.toString()}`);
  });

  while (true) {
    const rand = Math.floor(Math.random() * 100) + 1;
    if (rand < 10) {
      await sleep(1000);
      const msg = `(${clientID}:ON)`;
      await publisher.send(msg);
      console.log(`${clientID}: send status - activated`);
    } else if (rand > 90) {
      await sleep(1000);
      const msg = `(${clientID}:OFF)`;
      await publisher.send(msg);
      console.log(`${clientID}: send status - deactivated`);
    }
  }
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Usage: node lec-04-prg-08-pub-sub-and-pull-push-client-v2.js client_id
const clientID = process.argv[2];
main(clientID).catch((err) => console.error(err));
