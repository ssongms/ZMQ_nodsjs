(cluster = require("cluster")),
  (zmq = require("zeromq")),
  (backAddr = "tcp://127.0.0.1:12345"),
  (frontAddr = "tcp://127.0.0.1:12346"),
  (clients = 5),
  (workers = 3);

function makeASocket(sockType, idPrefix, addr, bindSyncOrConnect) {
  var sock = zmq.socket(sockType);
  sock.identity = idPrefix + process.pid;
  sock[bindSyncOrConnect](addr);
  return sock;
}

function serverTask() {
  var backSvr = makeASocket("dealer", "back", backAddr, "bindSync");
  backSvr.on("message", function () {
    var args = Array.apply(null, arguments);
    frontSvr.send(args);
  });

  var frontSvr = makeASocket("router", "front", frontAddr, "bindSync");
  frontSvr.on("message", function () {
    var args = Array.apply(null, arguments);
    backSvr.send(args);
  });
}

function workerTask() {
  var sock = makeASocket("dealer", "wkr", backAddr, "connect");

  sock.on("message", function () {
    var args = Array.apply(null, arguments);
    console.log(`Worker#0 received ${args[1]} from ${args[0]}`);
    sock.send([args[0], "", `${args[1]}`]);
  });
}

if (cluster.isMaster) {
  for (var i = 0; i < workers; i++) {
    cluster.fork({ TYPE: "worker" });
  }
  cluster.on("death", function (worker) {
    console.log("worker " + worker.pid + " died");
  });

  var deadClients = 0;
  cluster.on("disconnect", function (worker) {
    deadClients++;
    if (deadClients === clients) {
      console.log("finished");
      process.exit(0);
    }
  });
  serverTask();
  console.log(`Worker#${0} started.`);
} else {
  workerTask();
}
