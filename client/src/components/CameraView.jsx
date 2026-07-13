import { useEffect } from "react";
import "./CameraView.css";

function CameraView({ videoRef }) {
    useEffect(() => {
        async function startCamera() {

            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: "environment", 
                    },
                    audio: false,
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;

                    await videoRef.current.play();

                    videoRef.current.onloadedmetadata = () => {
                        console.log(
                            videoRef.current.videoWidth,
                            videoRef.current.videoHeight
                        );
                    };
                }
            } catch (err) {
                console.error("Camera Error:", err);
            }
        }

        startCamera();

        return () => {
            if (videoRef.current?.srcObject) {
                videoRef.current.srcObject
                    .getTracks()
                    .forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <div className="camera-container">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="camera-feed"
            />
        </div>
    );
}

export default CameraView;