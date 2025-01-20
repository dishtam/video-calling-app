import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

const PeerContext = createContext(null);

export const usePeer = () => {
  return useContext(PeerContext);
};

const peer = new RTCPeerConnection({
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
});

const PeerProvider = ({ children }) => {
  const [remoteStream, setRemoteStream] = useState(null);

  const createOffer = async () => {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    return offer;
  };

  const createAnswer = async (offer) => {
    await peer.setRemoteDescription(offer);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    return answer;
  };

  const setRemoteAns = async (ans) => {
    await peer.setRemoteDescription(ans);
  };

  const sendStream = async (stream) => {
    const tracks = await stream.getTracks();
    // const senders = peer.getSenders();

    for (const track of tracks) {
    //   if (!senders.some(sender => sender.track === track)) {
      peer.addTrack(track, stream);
    //   }
    }
  };

  const handleTrackEvent = useCallback((ev) => {
    const streams = ev.streams;
    setRemoteStream(streams[0]);
  }, []);

  useEffect(() => {
    peer.addEventListener("track", handleTrackEvent);
    return () => {
      peer.removeEventListener("track", handleTrackEvent);
    };
  }, [handleTrackEvent]);

  return (
    <PeerContext.Provider
      value={{
        peer,
        createOffer,
        createAnswer,
        setRemoteAns,
        sendStream,
        remoteStream,
      }}
    >
      {children}
    </PeerContext.Provider>
  );
};

export default PeerProvider;
