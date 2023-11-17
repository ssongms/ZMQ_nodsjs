const zmq = require("zeromq");
const socket = zmq.socket("sub");

async function pub_sub_Client() {
  console.log("Collecting updates from weather server...");
  socket.connect("tcp://localhost:5556");

  const zip_filter = process.argv[2] || "10001";
  socket.subscribe(zip_filter);

  let total_temp = 0;
  let count = 0;

  socket.on("message", (message) => {
    count++;
    const [zipcode, temperature, relhumidity] = message.toString().split(" ");
    total_temp += parseInt(temperature, 10);
    console.log(`Receive temperature for zipcode '${zip_filter}' was ${temperature} F`);
    if (count == 20) {
      socket.close();
      console.log(`Average temperature for zipcode '${zip_filter}' was ${total_temp / 20} F`);
    }
  });
}

pub_sub_Client();
