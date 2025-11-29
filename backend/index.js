import express from "express";
import http from "http";
import { Server } from "socket.io";
import axios from "axios";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const rooms = new Map();

io.on("connection", (socket) => {
  console.log("User Connected", socket.id);
  let currentRoom = null;
  let currentUser = null;

  socket.on("join", ({ roomId, userName }) => {
    if (currentRoom) {
      socket.leave(currentRoom);
      rooms.get(currentRoom).delete(currentUser);
      io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom)));
    }

    currentRoom = roomId;
    currentUser = userName;
    socket.join(roomId);

    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }

    rooms.get(roomId).add(userName);
    io.to(roomId).emit("userJoined", Array.from(rooms.get(currentRoom)));
    console.log("User joined room", roomId);
  });

  socket.on("codeChange", ({ roomId, code }) => {
    socket.to(roomId).emit("codeUpdate", code);
  });

  socket.on("typing", ({ roomId, userName }) => {
    socket.to(roomId).emit("userTyping", userName);
  });

  socket.on("languageChange", ({ roomId, language }) => {
    socket.to(roomId).emit("languageUpdate", language);
  });

  socket.on("compileCode",async({code,roomId, language,version})=>{
    if(rooms.has(roomId)){
      const room=rooms.get(roomId)
      const response=await axios.post("https://emkc.org/api/v2/piston/execute",{
        language,
        version,
        files:[
          {
            content:code
          }
        ]
      })
      room.output=response.data.run.output
      io.to(roomId).emit("codeResponse",response.data);
    }
  })

  socket.on("Exit", () => {
    if (currentRoom && rooms.has(currentRoom)) {
      rooms.get(currentRoom).delete(currentUser);
      io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom)));
      socket.leave(currentRoom);
    }
    currentRoom = null;
    currentUser = null;
  });

  socket.on("disconnect", () => {
    if (currentRoom && rooms.has(currentRoom)) {
      rooms.get(currentRoom).delete(currentUser);
      io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom)));
    }
    console.log("User Disconnected", socket.id);
  });
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});



// import express from "express";
// import http from "http";
// import { Server } from "socket.io";

// const app = express();

// const server = http.createServer(app);

// const io=new Server(server,{
//   cors:{
//     origin:'*'
//   },
// });

// const rooms=new Map();

// io.on("connection",(socket)=>{
//   console.log("User Connected",socket.id);
//   let currentRoom=null;
//   let currentUser=null;
//   socket.on("join",({roomId,userName})=>{
//     if(currentRoom){
//       socket.leave(currentRoom)
//       rooms.get(currentRoom).delete(currentUser)
//       io.to(currentRoom).emit("userJoined",Array.from(rooms.get(currentRoom)));
//     }

//     currentRoom=roomId;
//     currentUser=userName;
//     socket.join(roomId)
//     if(!rooms.has(roomId)){
//       rooms.set(roomId,new Set());
//     }
//     rooms.get(roomId).add(userName)

//     io.to(roomId).emit("userJoined",Array.from(rooms.get(currentRoom)));
//     console.log("user joined room",roomId);
//   });

// socket.on("codeChange",({roomId, code})=>{
//   socket.to(roomId).emit("codeUpdate",code);
// })
// });



// const port = process.env.PORT || 5000;
// server.listen(port, () => {
//   console.log("server is working on port 5000");
// });
