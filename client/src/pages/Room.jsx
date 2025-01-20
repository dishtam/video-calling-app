import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../providers/Socket";
import { usePeer } from "../providers/Peer";
import ReactPlayer from "react-player";

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

  // myStream is the stream of the user
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
      //   sendStream(myStream);
    },
    [setRemoteAns]
  );

  const getUserMediaStream = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    // sendStream(stream);
    setMyStream(stream);
  }, []);

  const handleNegotiationNeeded = useCallback(async () => {
    console.log("Negotiation needed");
    const localOffer = await createOffer();
    socket.emit("call-user", { emailId: remoteEmailId, offer: localOffer });
  }, []);

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

  // used to get the user media stream when page is loaded
  useEffect(() => {
    getUserMediaStream();
  }, [getUserMediaStream]);

  useEffect(() => {
    peer.addEventListener("negotiationneeded", handleNegotiationNeeded);
    return () => {
      peer.removeEventListener("negotiationneeded", handleNegotiationNeeded);
    };
  }, []);

  return (
    <div>
      <h1>Room Page</h1>
      <h4>You are connected to {remoteEmailId}</h4>
      <ReactPlayer url={myStream} playing muted />
      <ReactPlayer url={remoteStream} playing />
      <button onClick={(e) => sendStream(myStream)}>Send Stream</button>
    </div>
  );
};

export default RoomPage;
