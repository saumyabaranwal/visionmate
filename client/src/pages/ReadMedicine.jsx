import "./ReadMedicine.css";
import CameraView from "../components/CameraView";
import { FaArrowLeft, FaVolumeUp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";

function ReadMedicine() {
    const navigate = useNavigate();

    const videoRef = useRef(null);
    const recognitionRef = useRef(null);

    const [result, setResult] = useState("Waiting for scan...");
    const [loading, setLoading] = useState(false);

    const captureImage = async () => {
        if (loading) return;

        const video = videoRef.current;

        if (!video || video.videoWidth === 0) {
            setResult("Camera not ready.");
            return;
        }

        recognitionRef.current?.stop();

        const canvas = document.createElement("canvas");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0);

        canvas.toBlob(async (blob) => {
            if (!blob) return;

            const formData = new FormData();
            formData.append("image", blob, "image.jpg");

            try {
                setLoading(true);

                const response = await fetch("/api/read-medicine", {
                    method: "POST",
                    body: formData,
                });

                const data = await response.json();

                setResult(data.spoken_text);
                setLoading(false);

                window.speechSynthesis.cancel();

                const speech = new SpeechSynthesisUtterance(
                    data.spoken_text
                );

                speech.onend = () => {
                    recognitionRef.current?.start();
                };

                window.speechSynthesis.speak(speech);

            } catch (error) {
                console.log(error);

                setLoading(false);
                setResult("Unable to connect to backend.");

                recognitionRef.current?.start();
            }

        }, "image/jpeg");
    };

    useEffect(() => {
        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();

        recognitionRef.current = recognition;

        recognition.lang = "en-US";
        recognition.continuous = true;
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            const command =
                event.results[event.resultIndex][0].transcript.toLowerCase();

            console.log(command);

            if (
                !loading &&
                (
                    command.includes("scan") ||
                    command.includes("capture")
                )
            ) {
                captureImage();
            }
        };

        recognition.onerror = () => {
            setTimeout(() => {
                if (!loading) {
                    recognition.start();
                }
            }, 500);
        };

        window.speechSynthesis.cancel();

        const speech = new SpeechSynthesisUtterance(
            "Read Medicine selected. Point your camera towards medicine or prescription and say scan, or press the Read Medicine button."
        );

        speech.onend = () => {
            recognition.start();
        };

        window.speechSynthesis.speak(speech);

        return () => {
            recognition.stop();
            window.speechSynthesis.cancel();
        };

    }, []);

    return (
        <main className="read-page">

            <button
                className="back-btn"
                onClick={() => navigate("/features")}
            >
                <FaArrowLeft /> Back
            </button>

            <h1>Read Medicine</h1>

            <p className="description">
                Point the camera towards medicine or prescription.
            </p>

            <CameraView videoRef={videoRef} />

            <button
                className="scan-btn"
                onClick={captureImage}
                disabled={loading}
            >
                {loading ? "Scanning..." : "Read Medicine"}
            </button>

            <div className="result-box">
                <h3>Description</h3>
                <p>{result}</p>
            </div>

            <button
                className="speak-btn"
                onClick={() => {
                    window.speechSynthesis.cancel();

                    const speech = new SpeechSynthesisUtterance(result);

                    speech.onend = () => {
                        recognitionRef.current?.start();
                    };

                    window.speechSynthesis.speak(speech);
                }}
            >
                <FaVolumeUp /> Speak Result
            </button>

        </main>
    );
}

export default ReadMedicine;