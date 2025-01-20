import { useState,useCallback, useEffect } from "react";
import ReactPlayer from "react-player";
import { useSocket } from "../providers/Socket";
import { usePeer } from "../providers/Peer";

const RoomPage = () => {
  const { socket } = useSocket();
  const {
    peer,
    createOffer,
    createAnswer,
    setRemoteAns,
    sendStream,
    remoteStream,
  } = usePeer();

  const [myStream, setMyStream] = useState(null);
  const [remoteEmailId, setRemoteEmailId] = useState(null);

  const handleNewUserJoined = useCallback(
    async (data) => {
      const { emailId } = data;
      console.log("New user joined room", emailId);
      const offer = await createOffer();
      socket.emit("call-user", { emailId, offer });
      setRemoteEmailId(emailId);
    },
    [createOffer, socket]
  );

  const handleIncomingCall = useCallback(
    async (data) => {
      const { from, offer } = data;
      console.log("Incoming call from", from, offer);
      const ans = await createAnswer(offer);
      socket.emit("call-accepted", { emailId: from, ans });
      setRemoteEmailId(from);
    },
    [createAnswer, socket]
  );

  const handleCallAccepted = useCallback(
    async (data) => {
      const { ans } = data;
      console.log("Call accepted", ans);
      await setRemoteAns(ans);
    },
    [setRemoteAns]
  );

  const getUserMediaStream = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    console.log("Stream obtained:", stream);
    setMyStream(stream);
    // sendStream(stream);  // Optional: send stream automatically
  }, [sendStream]);

  const handleNegotiationNeeded = useCallback(async () => {
    if (!remoteEmailId) {
      console.error("Remote email ID is not set");
      return;
    }
    console.log("Negotiation needed");
    const localOffer = await createOffer();
    socket.emit("call-user", { emailId: remoteEmailId, offer: localOffer });
  }, [createOffer, socket, remoteEmailId]);

  useEffect(() => {
    socket.on("user-joined", handleNewUserJoined);
    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-accepted", handleCallAccepted);
    return () => {
      socket.off("user-joined", handleNewUserJoined);
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-accepted", handleCallAccepted);
    };
  }, [socket, handleNewUserJoined, handleIncomingCall, handleCallAccepted]);

  useEffect(() => {
    getUserMediaStream();
  }, [getUserMediaStream]);

  useEffect(() => {
    peer.addEventListener("negotiationneeded", handleNegotiationNeeded);
    return () => {
      peer.removeEventListener("negotiationneeded", handleNegotiationNeeded);
    };
  }, [peer, handleNegotiationNeeded]);

  return (
    <div>
      <h1>Room Page</h1>
      <h4>You are connected to {remoteEmailId}</h4>

      {/* My stream (local user video) */}
      {myStream && (
        <ReactPlayer
          url={myStream}
          playing
          muted
          width="300px"
          height="200px"
          config={{
            file: {
              attributes: {
                controls: true,
              },
            },
          }}
        />
      )}

      {/* Remote stream (remote user video) */}
      {remoteStream && (
        <ReactPlayer
          url={remoteStream}
          playing
          width="300px"
          height="200px"
          config={{
            file: {
              attributes: {
                controls: true,
              },
            },
          }}
        />
      )}
      <button onClick={()=>sendStream(myStream)}>Send Stream</button>
    </div>
  );
};

export default RoomPage;