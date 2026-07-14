import "./Home.css";
import { FaMicrophone } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

function Home() {
    const navigate = useNavigate();

    const hasSpoken = useRef(false);
    const recognitionRef = useRef(null);

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
            event.results[event.resultIndex][0].transcript.toLowerCase();

        console.log(command);

        if (command.includes("read") && command.includes("text")) {
            recognition.stop();
            navigate("/read-text");
        } else if (command.includes("object")) {
            recognition.stop();
            navigate("/object-detection");
        } else if (command.includes("currency")) {
            recognition.stop();
            navigate("/currency-detection");
        } else if (
            command.includes("surroundings") ||
            command.includes("surrounding")
        ) {
            recognition.stop();
            navigate("/surroundings");
        } else if (command.includes("feature")) {
            recognition.stop();
            navigate("/features");
        }
    };

    recognition.onerror = () => {
        recognition.start();
    };

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(
        "Welcome to VisionMate. Tap anywhere on the screen to choose a feature. Or simply say Read Text, Object Detection, Currency Identification, or Describe Surroundings."
    );

    speech.onend = () => {
        recognition.start();
    };

    window.speechSynthesis.speak(speech);

    return () => {
        recognition.stop();
        window.speechSynthesis.cancel();
    };
}, [navigate]);

    return (
        <main
            className="home"
            onClick={() => navigate("/features")}
        >
            <section className="hero">

                <h1>
                    Welcome to <span>VisionMate</span>
                </h1>

                <p>
                    Tap anywhere on the screen to choose a feature.
                    <br /><br />
                    Or simply say
                    <br /><br />
                    Read Text
                    <br />
                    Object Detection
                    <br />
                    Currency Identification
                    <br />
                    Describe Surroundings
                </p>

                <button className="mic-btn" disabled>
                    <FaMicrophone />
                </button>

            </section>
        </main>
    );
}

export default Home;