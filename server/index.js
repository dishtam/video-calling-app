const express = require('express');
const bodyParser = require('body-parser');
const {Server} = require('socket.io');

const io = new Server({
  cors: true
});
const app = express();

app.use(bodyParser.json());

const emailToSocketMapping = new Map();
const socketToEmailMapping = new Map();

io.on('connection', (socket) => {
  console.log("New Connection");

  // When user join the room with specific emailId and roomId;
  socket.on("join-room",(data)=>{
    const {roomId,emailId} =  data;
    console.log("User",emailId,"joined room",roomId);
    // Store the emailId and socketId mapping
    emailToSocketMapping.set(emailId,socket.id);
    socketToEmailMapping.set(socket.id,emailId);
    // Join the room
    socket.join(roomId);
    // Emit to the user that he has joined the room
    socket.emit("joined-room",{roomId});
    // Broadcast to other users in the room that this user has joined
    socket.broadcast.to(roomId).emit("user-joined",{emailId});
  });

  socket.on("call-user",(data)=>{
    const {emailId,offer} = data;
    const fromEmail = socketToEmailMapping.get(socket.id);
    const socketId = emailToSocketMapping.get(emailId);
    socket.to(socketId).emit("incoming-call",{from:fromEmail,offer})
  });

  socket.on("call-accepted",(data)=>{
    const {emailId,ans} = data;
    const socketId = emailToSocketMapping.get(emailId); 
    socket.to(socketId).emit('call-accepted',{ans});
  });

});

app.listen(800,()=>console.log('Server is running on port 8000'));
io.listen(8001);