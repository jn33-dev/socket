import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const io = SocketIO(httpServer);

const roomList = [];
io.on("connection", (socket) => {
  socket.on("create-room", (room) => {
    room.roomId = roomList.length + 1;
    room.participants = [];
    roomList.push(room);
    const newRoom = {
      roomId: room.roomId,
      roomTitle: room.roomTitle,
      maxCount: room.maxCount,
      IsSecreteRoom: room.IsSecreteRoom,
    };
    socket.join(`${newRoom.roomId}`); // 방장 방에 입장
    for (const r of roomList) {
      if (r.roomId === newRoom.roomId) {
        r.participants.push(data.hostNickname);
      }
    }
    socket.broadcast("create-room", { data: newRoom });
  });

  socket.emit("room-list", {
    data: roomList.map((room) => {
      return {
        roomId: room.roomId,
        roomTitle: room.roomTitle,
        maxCount: room.maxCount,
        participants: room.participants.length,
        IsSecreteRoom: room.IsSecreteRoom,
      };
    }),
  });

  socket.on("enter-room", (data) => {
    for (const room of roomList) {
      if (room.roomId === data.roomId) {
        if (room.maxCount > room.participants.length) {
          if (data.IsSecreteRoom) {
            if (data.roomPassword === roomToEnter.roomPassword) {
              socket.join(`${data.roomId}`);
              room.participants.push(data.nickname);
              socket.to(`${data.roomId}`).emit("welcome");
            } else {
              socket.emit("enter-room", {
                errorMessage: "비밀번호가 일치하지 않습니다.",
              });
            }
          } else {
            socket.join(`${data.roomId}`);
            room.participants.push(data.nickname);
            socket.to(`${data.roomId}`).emit("welcome");
          }
        } else {
          socket.emit("enter-room", {
            errorMessage: "정원초과로 방 입장에 실패했습니다.",
          });
        }
      }
    }
  });

  socket.on("send-chat", (message) => {
    io.to(`${data.roomId}`).emit("receive-chat", message);
  });
});

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);
