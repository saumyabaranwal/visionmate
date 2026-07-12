import "./FeatureCard.css";

function FeatureCard({ icon, title, description, onClick }) {
  return (
    <button className="feature-card" onClick={onClick}>

      <div className="feature-icon">
        {icon}
      </div>

      <div className="feature-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

    </button>
  );
}

export default FeatureCard;