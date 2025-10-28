import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  PhoneIncoming,
} from "lucide-react";
import { toast } from "react-toastify";
import type { AppDispatch, RootState } from "../../../redux/store";
import {
  endCall,
  updateCallStatus,
  setIncomingCall,
  clearCallState,
  setCurrentCall,
} from "../../../redux/reducers/callReducer/callSlice";
import {
  socket,
  sendOffer,
  sendAnswer,
  sendIceCandidate,
  onOfferReceived,
  onAnswerReceived,
  onIceCandidateReceived,
  subscribeToCallAccepted,
  subscribeToCallRejected,
  subscribeToCallEnded,
  subscribeToIncomingCall,
} from "../../socket";
import { useNavigate, useParams} from "react-router-dom";

type ExtendedSignalingState =
  | "have-local-offer"
  | "have-local-pranswer"
  | "have-remote-offer"
  | "have-remote-pranswer"
  | "stable"
  | "closed";

const VideoCall: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentCall, incomingCall } = useSelector(
    (state: RootState) => state.call
  );
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const isStartingWebRTC = useRef(false);
  const currentCallId = useRef<string | null>(null);
const { sessionId } = useParams<{ sessionId: string }>();
const matchedCall = currentCall?.sessionId === sessionId ? currentCall : null;
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [error, setError] = useState<string | null>(null);


  // Redirect caller when call is accepted
  useEffect(() => {
    if (
      currentCall?.status === "accepted" &&
      currentCall.caller === user?._id
    ) {
      navigate(`/video/${currentCall._id}`);
    }
  }, [currentCall, user, navigate]);

  /** Initialize local media (camera + mic) */
  const initLocalMedia = async (): Promise<MediaStream> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        await localVideoRef.current.play().catch(() => {});
      }
      console.log("Local media initialized");
      return stream;
    } catch (err) {
      console.error("Failed to access media devices:", err);
      setError("Camera/microphone access denied.");
      throw err;
    }
  };

  /** Cleanup WebRTC and media */
  const cleanup = (clearRedux = true) => {
    console.log("Cleaning up resources", { clearRedux });
    localStream?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    localVideoRef.current && (localVideoRef.current.srcObject = null);
    pcRef.current?.close();
    pcRef.current = null;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    remoteVideoRef.current && (remoteVideoRef.current.srcObject = null);
    setRemoteStream(null);
    currentCallId.current = null;
    if (clearRedux) dispatch(clearCallState());
  };

  /** Start WebRTC connection */
  const startWebRTC = async (
    callId: string,
    isCaller: boolean,
    remoteUserId: string
  ) => {
    if (isStartingWebRTC.current || currentCallId.current === callId) return;
    isStartingWebRTC.current = true;
    currentCallId.current = callId;

    try {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayprojectsecret",
          },
        ],
      });
      pcRef.current = pc;

      pc.onconnectionstatechange = () => {
        if (["failed", "closed", "disconnected"].includes(pc.connectionState)) {
          setError("Connection failed.");
          handleEndCall();
        }
      };

      pc.onicecandidate = (e) => {
        if (
          e.candidate &&
          pc.signalingState !== ("closed" as ExtendedSignalingState)
        ) {
          sendIceCandidate(
            remoteUserId,
            e.candidate,
            callId,
            currentCall?.sessionId
          );
        }
      };

      pc.ontrack = (e) => {
        const stream = e.streams[0];
        setRemoteStream(stream);
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream;
      };

      const stream = localStream || (await initLocalMedia());
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const cleanupHandlers: Array<() => void> = [];

      cleanupHandlers.push(
        onOfferReceived(async ({ from, offer, callId: id }) => {
          if (isCaller || id !== callId) return;
          await pc.setRemoteDescription(offer);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendAnswer(from, answer, callId, currentCall?.sessionId);
        })
      );

 cleanupHandlers.push(
  onAnswerReceived(async ({ answer, callId, sessionId }) => {
    if (!isCaller || callId !== currentCallId.current) return;
    if (sessionId && sessionId !== currentCall?.sessionId) return;
    await pc.setRemoteDescription(answer);
  })
);

cleanupHandlers.push(
  onIceCandidateReceived(async ({ candidate, callId, sessionId }) => {
    if (!candidate || callId !== currentCallId.current) return;
    if (sessionId && sessionId !== currentCall?.sessionId) return;
    await pc.addIceCandidate(candidate);
  })
);

      if (isCaller) {
        if (!currentCall?.sessionId) throw new Error("Missing sessionId");
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sendOffer(
          remoteUserId,
          offer,
          user!._id,
          callId,
          currentCall.sessionId,
          currentCall.conversation
        );
      }

      return () => cleanupHandlers.forEach((fn) => fn());
    } catch (err) {
      console.error("WebRTC setup failed:", err);
      setError("Failed to establish connection.");
      cleanup(false);
    } finally {
      isStartingWebRTC.current = false;
    }
  };

  /** Auto-start WebRTC for caller */
  useEffect(() => {
    if (
      !currentCall ||
      currentCall.status !== "initiated" ||
      currentCall.caller !== user?._id ||
      currentCallId.current
    )
      return;

    if (!currentCall.sessionId) {
      setError("Missing session ID");
      return;
    }

    initLocalMedia().then(() =>
      startWebRTC(currentCall._id, true, currentCall.receiver)
    );
  }, [currentCall, user]);

  /** Listen for incoming calls */
  useEffect(() => {
    if (!user) return;

    const unsub = subscribeToIncomingCall((data) => {
      console.log("Incoming call:", data);
      dispatch(
        setIncomingCall({
          _id: data.callId,
          caller: data.from,
          receiver: user._id,
          conversation: data.conversationId,
          sessionId: data.sessionId,
          status: "initiated",
        })
      );
    });

    return () => {
      // This is the cleanup function
      unsub();
    };
  }, [dispatch, user]);
  /** Handle Accept Call */
const handleAccept = async () => {
  if (!incomingCall?._id || !incomingCall.sessionId) {
    setError("Invalid call data");
    return;
  }

  try {
    await initLocalMedia();

    const updatedCall = await dispatch(
      updateCallStatus({ callId: incomingCall._id, status: "accepted" })
    ).unwrap();

    // PRESERVE sessionId!
    dispatch(setCurrentCall({
      ...updatedCall,
      sessionId: incomingCall.sessionId,
    }));

    socket.emit("call_accepted", {
      to: incomingCall.caller,
      callId: incomingCall._id,
      sessionId: incomingCall.sessionId,
    });

    dispatch(setIncomingCall(null));

    await startWebRTC(incomingCall._id, false, incomingCall.caller);

   navigate(`/video/${incomingCall.sessionId}`);
    toast.success("Call accepted");
  } catch (err) {
    console.error("Accept failed:", err);
    setError("Failed to accept call");
  }
};

  /** Handle Reject Call */
  const handleReject = async () => {
    if (!incomingCall?._id || !incomingCall.sessionId) return;

    try {
      await dispatch(
        updateCallStatus({ callId: incomingCall._id, status: "rejected" })
      ).unwrap();
      socket.emit("call_rejected", {
        to: incomingCall.caller,
        callId: incomingCall._id,
        sessionId: incomingCall.sessionId,
      });
      dispatch(setIncomingCall(null));
      cleanup(true);
      toast.info("Call rejected");
    } catch (err) {
      console.log("Reject failed:", err);
      setError("Failed to reject call");
    }
  };

  /** Handle End Call */
  const handleEndCall = async () => {
    if (!currentCall) return;

    try {
      cleanup(true);
      await dispatch(endCall({ callId: currentCall._id })).unwrap();
      const target =
        currentCall.caller === user?._id
          ? currentCall.receiver
          : currentCall.caller;
      socket.emit("end_call", { to: target, callId: currentCall._id });
      toast.info("Call ended");
    } catch (err) {
      console.log("Reject failed:", err);
      setError("Failed to end call");
    }
  };

  /** Auto-reject unanswered incoming call */
  useEffect(() => {
    if (!incomingCall) return;

    const timeout = setTimeout(() => {
      console.log("Auto-rejecting unanswered call");
      handleReject();
    }, 30_000);

    return () => clearTimeout(timeout);
  }, [incomingCall]);

  /** Socket event listeners */
  useEffect(() => {
    const unsub1 = subscribeToCallAccepted(({ callId }) => {
      if (callId === currentCall?._id) {
        dispatch(updateCallStatus({ callId, status: "accepted" }));
        toast.success("Call accepted");
      }
    });

    const unsub2 = subscribeToCallRejected(({ callId }) => {
      if (callId === currentCall?._id) {
        cleanup(true);
        toast.error("Call rejected");
      }
    });

    const unsub3 = subscribeToCallEnded(({ callId }) => {
      if (callId === currentCall?._id) {
        cleanup(true);
        toast.info("Call ended");
      }
    });

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [currentCall, dispatch]);

  /** Cleanup on unmount */
  useEffect(() => {
    return () => {
      if (!currentCall || ["ended", "rejected"].includes(currentCall.status)) {
        cleanup(true);
      }
    };
  }, []);

  // 1. Incoming Call Screen
  if (incomingCall) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50 text-white">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full mx-4">
          <div className="w-20 h-20 mx-auto mb-4 bg-green-600 rounded-full flex items-center justify-center animate-pulse">
            <PhoneIncoming size={36} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Incoming Video Call</h2>
          <p className="text-lg text-gray-300 mb-6">
            {incomingCall.caller || "Unknown Caller"}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleAccept}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 rounded-full hover:bg-green-500 transition font-medium"
            >
              <PhoneIncoming size={20} /> Accept
            </button>
            <button
              onClick={handleReject}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 rounded-full hover:bg-red-500 transition font-medium"
            >
              <PhoneOff size={20} /> Reject
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. No Call
  if (!currentCall) {
    return null;
  }

  // 3. Block Recipient from Joining Early
  const isCaller = currentCall.caller === user?._id;
  const isAccepted = currentCall.status === "accepted";

  if (!isCaller && !isAccepted) {
    // Recipient: Not accepted → block video UI
    console.log(
      "Recipient blocked from joining early. Status:",
      currentCall.status
    );
    return null;
  }

  // 4. Active Call UI (Only for caller OR accepted recipient)
  return (
    <div className="flex flex-col items-center justify-center bg-gray-900 h-screen text-white relative">
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg z-50 animate-pulse">
          {error}
        </div>
      )}

      {/* Remote Video */}
      <div className="relative w-full max-w-6xl h-[80vh] p-4">
        <div className="w-full h-full bg-black rounded-xl overflow-hidden shadow-2xl">
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-lg">
              {isCaller && currentCall.status === "initiated"
                ? "Ringing... Waiting for answer"
                : "Connecting..."}
            </div>
          )}
        </div>

        {/* Local Video (PiP) */}
        <div className="absolute top-8 right-8 w-48 h-32 bg-black border-2 border-gray-700 rounded-lg overflow-hidden shadow-lg">
          {videoOn && localStream ? (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              Camera Off
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-10 flex gap-4 bg-gray-800 bg-opacity-80 p-3 rounded-full backdrop-blur">
        <button
          onClick={() => {
            localStream?.getAudioTracks().forEach((t) => (t.enabled = !micOn));
            setMicOn(!micOn);
          }}
          className={`p-4 rounded-full transition ${
            micOn ? "bg-gray-700 hover:bg-gray-600" : "bg-red-600"
          }`}
        >
          {micOn ? <Mic size={24} /> : <MicOff size={24} />}
        </button>

        <button
          onClick={() => {
            localStream
              ?.getVideoTracks()
              .forEach((t) => (t.enabled = !videoOn));
            setVideoOn(!videoOn);
          }}
          className={`p-4 rounded-full transition ${
            videoOn ? "bg-gray-700 hover:bg-gray-600" : "bg-red-600"
          }`}
        >
          {videoOn ? <Video size={24} /> : <VideoOff size={24} />}
        </button>

        <button
          onClick={handleEndCall}
          className="p-4 rounded-full bg-red-600 hover:bg-red-500 transition"
        >
          <PhoneOff size={24} />
        </button>
      </div>
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
  Session: {currentCall?.sessionId?.slice(0, 8)}...
</div>
    </div>
  );
};

export default VideoCall;
