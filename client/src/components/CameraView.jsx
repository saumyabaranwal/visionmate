import { useEffect, useRef } from "react";
import "./CameraView.css";

function CameraView({ videoRef }) {

    useEffect(() => {

        async function startCamera() {

            try {

                const stream = await navigator.mediaDevices.getUserMedia({

                    video: { facingMode: { ideal: "environment" } }
                });

                if (videoRef.current) {

                    videoRef.current.srcObject = stream;

                }

            }

            catch (err) {

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

                className="camera-feed"

            />

        </div>

    );

}

export default CameraView;