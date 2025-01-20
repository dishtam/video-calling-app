import React, { useMemo, useEffect } from "react";
import { io } from "socket.io-client";

const SocketContext = React.createContext(null);

export const useSocket = () => {
  return React.useContext(SocketContext);
};

export const SocketProvider = (props) => {
  const socket = useMemo(() => io("http://localhost:8001"), []);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{socket}}>
      {props.children}
    </SocketContext.Provider>
  );
};
