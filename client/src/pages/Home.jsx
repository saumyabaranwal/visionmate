import "./Home.css";
import Navbar from "../components/Navbar";
import { FaMicrophone } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

function Home() {
  const navigate = useNavigate();
  const hasSpoken = useRef(false);

  useEffect(() => {
    if (hasSpoken.current) return;

    hasSpoken.current = true;

    const speech = new SpeechSynthesisUtterance(
      "Welcome to VisionMate. Tap anywhere on the screen to choose a feature. Or simply say Read Text, Object Detection, Currency Identification, or Describe Surroundings."
    );

    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
  }, []);

  return (
    <>
      <Navbar />

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

          <span className="tap-text">
    Tap anywhere to continue
</span>

<p className="sub-text">
    Or simply say:
    <br /><br />
    Read Text • Object Detection
    <br />
    Currency Detection • Describe Surroundings
</p>

        </section>
      </main>
    </>
  );
}

export default Home;