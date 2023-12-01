(cluster = require("cluster")),
  (zmq = require("zeromq")),
  (backAddr = "tcp://127.0.0.1:12345"),
  (frontAddr = "tcp://127.0.0.1:12346"),
  (clients = 1);

function makeASocket(sockType, idPrefix, addr, bindSyncOrConnect) {
  var sock = zmq.socket(sockType);
  sock.identity = idPrefix;
  sock[bindSyncOrConnect](addr);
  return sock;
}

function clientTask(id) {
  console.log(`Client ${id} started`);
  var sock = makeASocket("dealer", id, frontAddr, "connect");

  var count = 1;
  var interval = setInterval(function () {
    sock.send(`request #${count}`);
    console.log(`Req #${count} sent..`);
    count++;
  }, 2000);

  sock.on("message", function (data) {
    var args = Array.apply(null, arguments);
    console.log(sock.identity + ` received: ${args[1]}`);
  });
}

if (cluster.isMaster) {
  for (var i = 0; i < clients; i++) {
    cluster.fork({ TYPE: "client" });
  }
} else {
  clientTask(process.argv[2]);
}
