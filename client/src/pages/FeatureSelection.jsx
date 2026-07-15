import "./FeatureSelection.css";
import FeatureCard from "../components/FeatureCard";

import { useNavigate } from "react-router-dom";

import {
  FaFileAlt,
  FaCube,
  FaMoneyBillWave,
  FaPills,
  FaArrowLeft,
} from "react-icons/fa";

function FeatureSelection() {

  const navigate = useNavigate();

  return (
    <>

      <main className="feature-page">

        <button
          className="back-btn"
          onClick={() => navigate("/")}
        >
          <FaArrowLeft /> Back
        </button>

        <h1>Choose a Feature</h1>

        <p className="subtitle">
          Select one of the following options.
        </p>

        <div className="feature-list">

          <FeatureCard
            icon={<FaFileAlt />}
            title="Read Text"
            description="Read printed and handwritten text."
            onClick={() => navigate("/read-text")}
          />

          <FeatureCard
            icon={<FaCube />}
            title="Object Detection"
            description="Identify nearby everyday objects."
            onClick={() => navigate("/object-detection")}
          />

          <FeatureCard
            icon={<FaMoneyBillWave />}
            title="Currency Detection"
            description="Recognize Indian currency notes."
            onClick={() => navigate("/currency-detection")}
          />

          <FeatureCard
            icon={<FaPills />}
            title="Read Medicine"
            description="Read medicines and prescription."
            onClick={() => navigate("/read-medicine")}
          />

        </div>

      </main>
    </>
  );
}

export default FeatureSelection;