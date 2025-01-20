import { useState, useEffect, useCallback } from "react";
import { useSocket } from "../providers/Socket";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const {socket} = useSocket();
  const navigate = useNavigate();

  const [email,setEmail] = useState();
  const [roomId,setRoomId] = useState();


  const handleRoomJoined = useCallback(({roomId})=>{
    navigate(`/room/${roomId}`);
  },[navigate]);

  useEffect(()=>{
    socket.on("joined-room",handleRoomJoined);
    return ()=>{
        socket.off("joined-room",handleRoomJoined);
    }
  },[socket,handleRoomJoined])

  const hadleRoomJoin = () => {
    socket.emit("join-room", { roomId, emailId: email });

  }

  return (
    <div className="homepage-container">
      <div className="input-container">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Enter your email here"
        />
        <input
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          type="text"
          placeholder="Enter room code"
        />
        <button onClick={hadleRoomJoin}>Enter Room</button>
      </div>
    </div>
  );
};

export default HomePage;
