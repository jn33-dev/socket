const http = require("http");
const express = require("express");
const ws = require("ws");

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);
const server = http.createServer(app);
const wss = new ws.Server({ server });

const sockets = [];

//socket 메소드 사용해서 브라우저로 데이터 송출
// back에서의 socket은 방금 접속한 브라우저를 의미
wss.on("connection", (socket) => {
  sockets.push(socket);
  socket["nickname"] = "Anon";
  console.log("Connected to Browser ❤");
  socket.on("close", () => {
    sockets.splice(sockets.indexOf(socket), 1);
    console.log("Disconnected from the Browser 💔");
    console.log(sockets.length);
  });
  socket.on("message", (msg) => {
    const message = JSON.parse(msg);
    switch (message.type) {
      case "message":
        sockets.forEach((aSocket) =>
          aSocket.send(`${socket.nickname} : ${message.payload}`)
        );
      case "nickname":
        socket["nickname"] = message.payload;
    }
  });
});

server.listen(3000, handleListen);
