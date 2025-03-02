import { useEffect, useRef, useState } from "react";

declare global {
    interface Window {
        pcr: RTCPeerConnection;
    }
}
import { Socket, io } from "socket.io-client";
// import ChatBox from "./Chat";

const URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3000';

export const Room = ({
    name,
    localAudioTrack,
    localVideoTrack
}: {
    name: string,
    localAudioTrack: MediaStreamTrack | null,
    localVideoTrack: MediaStreamTrack | null,
}) => {
    const [lobby, setLobby] = useState(true);
    const [socket, setSocket] = useState<null | Socket>(null);
    const [, setSendingPc] = useState<null | RTCPeerConnection>(null);
    const [, setReceivingPc] = useState<null | RTCPeerConnection>(null);
    const [, setRemoteVideoTrack] = useState<MediaStreamTrack | null>(null);
    const [, setRemoteAudioTrack] = useState<MediaStreamTrack | null>(null);
    const [, setRemoteMediaStream] = useState<MediaStream | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const [messages, setMessages] = useState<Array<{ sender: string; text: string }>>([]);
    const [message, setMessage] = useState("");
    const [roomId, setRoomId] = useState<string | null>(null);

    useEffect(() => {
        const socket = io(URL);
        socket.on('send-offer', async ({roomId}) => {
            console.log("sending offer");
            setLobby(false);
            setRoomId(roomId)
            const pc = new RTCPeerConnection();

            setSendingPc(pc);
            if (localVideoTrack) {
                console.error("added tack");
                console.log(localVideoTrack)
                pc.addTrack(localVideoTrack)
            }
            if (localAudioTrack) {
                console.error("added tack");
                console.log(localAudioTrack)
                pc.addTrack(localAudioTrack)
            }

            pc.onicecandidate = async (e) => {
                console.log("receiving ice candidate locally");
                if (e.candidate) {
                   socket.emit("add-ice-candidate", {
                    candidate: e.candidate,
                    type: "sender",
                    roomId
                   })
                }
            }

            pc.onnegotiationneeded = async () => {
                console.log("on negotiation neeeded, sending offer");
                const sdp = await pc.createOffer();
                //@ts-ignore
                pc.setLocalDescription(sdp)
                socket.emit("offer", {
                    sdp,
                    roomId
                })
            }
        });

        socket.on("offer", async ({roomId, sdp: remoteSdp}) => {
            console.log("received offer");
            setLobby(false);
            setRoomId(roomId)
            const pc = new RTCPeerConnection();
            pc.setRemoteDescription(remoteSdp)
            const sdp = await pc.createAnswer();
            //@ts-ignore
            pc.setLocalDescription(sdp)
            const stream = new MediaStream();
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = stream;
            }

            setRemoteMediaStream(stream);
            // trickle ice 
            setReceivingPc(pc);
            window.pcr = pc;
            pc.ontrack = () => {
                alert("ontrack");
                // console.error("inside ontrack");
                // const {track, type} = e;
                // if (type == 'audio') {
                //     // setRemoteAudioTrack(track);
                //     // @ts-ignore
                //     remoteVideoRef.current.srcObject.addTrack(track)
                // } else {
                //     // setRemoteVideoTrack(track);
                //     // @ts-ignore
                //     remoteVideoRef.current.srcObject.addTrack(track)
                // }
                // //@ts-ignore
                // remoteVideoRef.current.play();
            }

            pc.onicecandidate = async (e) => {
                if (!e.candidate) {
                    return;
                }
                console.log("omn ice candidate on receiving seide");
                if (e.candidate) {
                   socket.emit("add-ice-candidate", {
                    candidate: e.candidate,
                    type: "receiver",
                    roomId
                   })
                }
            }

            socket.emit("answer", {
                roomId,
                sdp: sdp
            });
            setTimeout(() => {
                const track1 = pc.getTransceivers()[0].receiver.track
                const track2 = pc.getTransceivers()[1].receiver.track
                console.log(track1);
                if (track1.kind === "video") {
                    setRemoteAudioTrack(track2)
                    setRemoteVideoTrack(track1)
                } else {
                    setRemoteAudioTrack(track1)
                    setRemoteVideoTrack(track2)
                }
                //@ts-ignore
                remoteVideoRef.current.srcObject.addTrack(track1)
                //@ts-ignore
                remoteVideoRef.current.srcObject.addTrack(track2)
                //@ts-ignore
                remoteVideoRef.current.play();
                //@ts-ignore
                // remoteAudioRef.current.play();
                // if (type == 'audio') {
                //     // setRemoteAudioTrack(track);
                //     // @ts-ignore
                //     remoteVideoRef.current.srcObject.addTrack(track)
                // } else {
                //     // setRemoteVideoTrack(track);
                //     // @ts-ignore
                //     remoteVideoRef.current.srcObject.addTrack(track)
                // }
                // //@ts-ignore
            }, 5000)
        });

        socket.on("answer", ({roomId, sdp: remoteSdp}) => {
            setLobby(false);
            setRoomId(roomId)
            setSendingPc(pc => {
                pc?.setRemoteDescription(remoteSdp)
                return pc;
            });
            console.log("loop closed");
            // setRoomId(roomId)
        })

        socket.on("lobby", () => {
            setLobby(true);
        })

        socket.on("add-ice-candidate", ({candidate, type}) => {
            console.log("add ice candidate from remote");
            console.log({candidate, type})
            if (type == "sender") {
                setReceivingPc(pc => {
                    if (!pc) {
                        console.error("receicng pc nout found")
                    } else {
                        console.error(pc.ontrack)
                    }
                    pc?.addIceCandidate(candidate)
                    return pc;
                });
            } else {
                setSendingPc(pc => {
                    if (!pc) {
                        console.error("sending pc nout found")
                    } else {
                        // console.error(pc.ontrack)
                    }
                    pc?.addIceCandidate(candidate)
                    return pc;
                });
            }
        })

        socket.on("chat-message", ({ sender, message }) => {
            setMessages((messages) => [...messages, { sender, text: message }]);
        });

        setSocket(socket)
    }, [name])

    useEffect(() => {
        if (localVideoRef.current) {
            if (localVideoTrack) {
                localVideoRef.current.srcObject = new MediaStream([localVideoTrack]);
                localVideoRef.current.play();
            }
        }
    }, [localVideoRef])

    const sendMessage = (name: string) => {
        if (message.trim() && socket && roomId) {
            socket.emit("chat-message", { name , message, roomId });
            setMessages([...messages, { sender: name, text: message }]);
            setMessage("");
            console.log("send message trig")
        }
        console.log(message, socket, roomId)
    };

  const nextPerson = () => {
    if (socket) {
      socket.emit("leave-room");
      setLobby(true);
      setMessages([]);
      setMessage("");
      setRoomId(null);
    }
  };

    // useEffect(() => {
    //     if (remoteAudioRef.current && remoteAudioTrack) {
    //         remoteAudioRef.current.srcObject = new MediaStream([remoteAudioTrack]);
    //         remoteAudioRef.current.play();
    //     }
    // }, [remoteAudioRef])

    return <div className="flex">
        <div className="h-screen flex flex-col items-center justify-center">
            <video autoPlay width={800} height={450} ref={localVideoRef} muted />
            {lobby ? <div className="flex flex-col items-center justify-center"> 
                <div 
                    className="text-white text-lg mt-3">
                    Waiting for someone to connect
                </div> 
                <span className="loader mt-1"></span>
            </div> : null}
            <video autoPlay width={800} height={450} ref={remoteVideoRef} /> 
        </div>
        
        <div className="rounded-lg overflow-hidden shadow-lg bg-white p-4 space-y-4 flex flex-col h-[100vh] w-full">
          <div className="flex-1 overflow-auto space-y-4 w-full">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start gap-4 ${
                  msg.sender === name ? "justify-end" : ""
                }`}
              >
                {msg.sender !== name && (
                  <span className="relative flex shrink-0 overflow-hidden rounded-full w-10 h-10 border">
                    <span className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                      {msg.sender[0].toUpperCase()}
                    </span>
                  </span>
                )}
                <div className={`text-sm ${msg.sender === name ? "text-right" : ""}`}>
                  <div className="font-semibold">{msg.sender}</div>
                  <div>{msg.text}</div>
                </div>
                {msg.sender === name && (
                  <span className="relative flex shrink-0 overflow-hidden rounded-full w-10 h-10 border">
                    <span className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                      {msg.sender[0].toUpperCase()}
                    </span>
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-start justify-between px-4 py-2 bg-white shadow">
            <div className="flex-1 mr-4">
              <input
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage(name);
                  }
                }}
              />
            </div>
            <button
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black text-white hover:bg-black/90 h-10 px-4 py-2 mr-2"
              onClick={() => sendMessage(name)}
            >
              Send
            </button>
            <button
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              onClick={nextPerson}
            >
              Next Person
            </button>
          </div>
        </div>
        </div>
}

  



