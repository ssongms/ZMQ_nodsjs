const zmq = require("zeromq");
const randrange = require("lodash");

console.log("Publishing updates at weather server...");
const socket = zmq.socket("pub");

async function pub_sub_Server() {
  await socket.bindSync("tcp://*:5556");
  while (true) {
    const zipcode = randrange.random(1, 100000);
    const temperature = randrange.random(-80, 135);
    const relhumidity = randrange.random(10, 60);

    await socket.send(`${zipcode} ${temperature} ${relhumidity}`);
  }
}

pub_sub_Server();
