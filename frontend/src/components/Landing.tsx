import { useEffect, useRef, useState } from "react"
import { Room } from "./Room";
import Send from "../assets/sendBg.png";

export const Landing = () => {
    const [name, setName] = useState("");
    const [localAudioTrack, setLocalAudioTrack] = useState<MediaStreamTrack | null>(null);
    const [localVideoTrack, setlocalVideoTrack] = useState<MediaStreamTrack | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const [joined, setJoined] = useState(false);

    const getCam = async () => {
        const stream = await window.navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        })
        // MediaStream
        const audioTrack = stream.getAudioTracks()[0]
        const videoTrack = stream.getVideoTracks()[0]
        setLocalAudioTrack(audioTrack);
        setlocalVideoTrack(videoTrack);
        if (!videoRef.current) {
            return;
        }
        videoRef.current.srcObject = new MediaStream([videoTrack])
        videoRef.current.play();
        // MediaStream
    }

    useEffect(() => {
        if (videoRef && videoRef.current) {
            getCam()
        }
    }, [videoRef]);

    if (!joined) {
            
    return <div className="flex flex-col items-center justify-center h-screen mx-4">
            <h1 className="font-extrabold text-5xl mb-1 heading p-2">Omegle 2.0</h1>
            <h2 className="font-bold text-2xl mb-5 sub-heading">Connect, Chat, Discover</h2>
            <video autoPlay ref={videoRef} width={640} height={360} className="shadow-2xl rounded-2xl border-1 border-white"></video>
                <div className="flex rounded-2xl border-grey-200 border-1 p-2 mt-5 bg-white">
                <input type="text" className="outline-none px-2" placeholder="Enter your name" required onChange={(e) => {
                    setName(e.target.value);
                }}>
                </input>
                <button onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        setJoined(true);
                    }
                }} onClick={() => {
                    setJoined(true);
                }}><img src={Send} alt="Join"/></button>
                </div>
        </div>
    }

    return <Room name={name} localAudioTrack={localAudioTrack} localVideoTrack={localVideoTrack} />
}