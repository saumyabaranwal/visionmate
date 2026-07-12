import "./CurrencyDetection.css";
import CameraView from "../components/CameraView";
import { FaArrowLeft, FaVolumeUp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";


function CurrencyDetection() {

    const navigate = useNavigate();

    const videoRef = useRef(null);

    const [result, setResult] = useState("Waiting for scan...");
    const [loading, setLoading] = useState(false);

    const captureImage = async () => {

        const video = videoRef.current;

        const canvas = document.createElement("canvas");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");

        ctx.drawImage(video, 0, 0);

        canvas.toBlob(async (blob) => {

            const formData = new FormData();

            formData.append("image", blob, "image.jpg");

            try {

                setLoading(true);
                const response = await fetch(
                    "http://127.0.0.1:8000/currency-detection",
                    {
                        method: "POST",
                        body: formData,
                    }
                );

                const data = await response.json();

                setResult(data.currency);
                setLoading(false);

                window.speechSynthesis.cancel();

                const speech = new SpeechSynthesisUtterance(data.currency);

                window.speechSynthesis.speak(speech);

            } catch {
                setLoading(false);
                setResult("Unable to connect to backend.");

            }

        }, "image/jpeg");

    };
    useEffect(() => {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {

        const command =
            event.results[0][0].transcript.toLowerCase();

        console.log(command);

        if (
            command.includes("scan") ||
            command.includes("capture") ||
            command.includes("read")
        ) {

            captureImage();

        }

    };

    recognition.start();

}, []);

useEffect(() => {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {

        const command =
            event.results[0][0].transcript.toLowerCase();

        console.log(command);

        if (
            command.includes("scan") ||
            command.includes("capture") ||
            command.includes("read")
        ) {

            captureImage();

        }

    };

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(
        "Currency Detection selected. Point your camera towards the text and say scan, or press the Scan Text button."
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

        <>

            <main className="read-page">

                <button
                    className="back-btn"
                    onClick={() => navigate("/features")}
                >
                    <FaArrowLeft /> Back
                </button>

                <h1>Currency Detection</h1>

                <p className="description">
                    Point the camera towards a currency note.
                </p>

                <CameraView videoRef={videoRef} />

                <button
                    className="scan-btn"
                    onClick={captureImage}
                    disabled={loading}
                >
                    Detect Currency
                </button>

                <div className="result-box">

                    <h3>Detected Currency</h3>

                    <p>{result}</p>

                </div>

                <button
                    className="speak-btn"
                    onClick={() => {

                        const speech = new SpeechSynthesisUtterance(result);

                        window.speechSynthesis.speak(speech);

                    }}
                >

                    <FaVolumeUp />

                    {" "}Speak Result

                </button>

            </main>

        </>

    );

}

export default CurrencyDetection;