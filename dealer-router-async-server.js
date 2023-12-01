// 멀티 프로세싱 이용
let cluster = require("cluster"),
  zmq = require("zeromq"),
  backAddr = "tcp://127.0.0.1:12345",
  frontAddr = "tcp://127.0.0.1:12346",
  workers = process.argv[2],
  clients = 1;

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
  console.log(`Worker#${process.env.ID} started.`);
  var sock = makeASocket("dealer", "wkr", backAddr, "connect");

  sock.on("message", function () {
    var args = Array.apply(null, arguments);
    console.log(`Worker#${process.env.ID} received ${args[1]} from ${args[0]}`);
    sock.send([args[0], "", `${args[1]}`]);
  });
}

if (cluster.isMaster) {
  for (var i = 0; i < workers; i++) {
    cluster.fork({ TYPE: "worker", ID: i });
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
  serverTask(process.argv[2]);
} else {
  workerTask();
}
