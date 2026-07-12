import "./Hero.css";

function Hero() {
  return (
    <section className="hero">

      <div className="hero-content">

        <p className="tagline">
          AI Powered Navigation Assistant
        </p>

        <h1>
          VisionMate
        </h1>

        <h2>
          Helping the Visually Impaired
          Understand the World
        </h2>

        <p className="description">
          Upload an image or capture one using your camera.
          VisionMate analyzes the surroundings using AI and
          provides a simple voice description to make navigation
          easier and safer.
        </p>

        <div className="hero-buttons">
          <button className="primary-btn">
            Get Started
          </button>

          <button className="secondary-btn">
            Learn More
          </button>
        </div>

      </div>

      <div className="hero-image-container">

        <div className="hero-image">

          👁️

        </div>

      </div>

    </section>
  );
}

export default Hero;