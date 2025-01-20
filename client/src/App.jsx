import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/Home";
import "./App.css";
import { SocketProvider } from "./providers/Socket";
import PeerProvider  from "./providers/Peer";
import RoomPage from "./pages/Room";

function App() {
  return (
    <div>
      <PeerProvider>
        <SocketProvider>
          <Routes>
            <Route path="/" element={<HomePage />}></Route>
            <Route path="/room/:roomId" element={<RoomPage />}></Route>
          </Routes>
        </SocketProvider>
      </PeerProvider>
    </div>
  );
}

export default App;
