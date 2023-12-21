const http = require("http");
const express = require("express");
const app = express();
// 소켓이 http모듈로 생성된 서버에서만 동작
const server = http.createServer(app);
const PORT = 8000;

// cors 이슈 : 다른 서버에서 보내는 요청을 제한함
const cors = require("cors");
app.use(cors());

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

const userIdArr = {};
// { "socket.id": "userIda", "socket.id": "userIdb" ,"socket.id": "userIdc"  }

const updateUserList = () => {
  io.emit("userList", userIdArr);
};

io.on("connection", (socket) => {
  console.log("socket id", socket.id);
  // abcdjfkladjflaksjrlew
  // [실습 3번] socket id를 이용해 입장 공지
  // io.emit("notice", { msg: `${socket.id}님이 입장하셨습니다.` });
  // [실습 3-3번] 퇴장시키키 -> 누가 입장하고 있는지 알아야 하고, 해당 정보를 전체적으로 저장할 필요가 있었다.
  // userIdArr[socket.id] = res.userId;

  // [실습 3-1번] 입장 시에 받은 user id로 입장 공지
  socket.on("entry", (res) => {
    // [실습 3-2]
    // Object.values(userIdArr) => ["userIda", "userIdb", "userIdc"]
    // includes : 문자열이나 배열에서 인자로 넘겨준 값이 존재하는지 안하는 지 찾을 수 있음.
    // indexOf : 배열에서 인자로 넘겨준 값의 인덱스를 추출, 없다면 -1을 반환
    if (Object.values(userIdArr).includes(res.userId)) {
      //닉네임이 중복될 경우에
      socket.emit("error", {
        msg: "중복된 아이디가 존재하여 입장이 불가합니다.",
      });
    } else {
      //중복되지 않을 경우에
      io.emit("notice", { msg: `${res.userId}님이 입장하셨습니다.` });
      socket.emit("entrySuccess", { userId: res.userId });
      userIdArr[socket.id] = res.userId;
      updateUserList();
    }
    console.log(userIdArr);
    // 중복된다는 오류 메세지를 보내주던지
  });

  // const obj = { abc: "aaa", "cd-e": "bbb" };
  // obj.abc;
  // obj["cd-e"];

  // [실습 3-3] 퇴장시키기
  socket.on("disconnect", () => {
    io.emit("notice", { msg: `${userIdArr[socket.id]}님이 퇴장하셨습니다.` });
    delete userIdArr[socket.id];
    console.log(userIdArr);
    updateUserList();
  });

  socket.on("sendMsg", (res) => {
    if (res.dm === "all") io.emit("chat", { userId: res.userId, msg: res.msg });
    else {
      // io.to(소켓아이디).emit()
      io.to(res.dm).emit("chat", {
        userId: res.userId,
        msg: res.msg,
        dm: true,
      });
      socket.emit("chat", { userId: res.userId, msg: res.msg, dm: true });
    }
  });
});

server.listen(PORT, function () {
  console.log(`Sever Open: ${PORT}`);
});
