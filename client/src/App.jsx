import { BrowserRouter, Routes, Route } from "react-router-dom";
import FeatureSelection from "./pages/FeatureSelection";

import Home from "./pages/Home";
import ReadText from "./pages/ReadText";
import ObjectDetection from "./pages/ObjectDetection";
import CurrencyDetection from "./pages/CurrencyDetection";
import Surroundings from "./pages/Surroundings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/read-text" element={<ReadText />} />
        <Route path="/object-detection" element={<ObjectDetection />} />
        <Route path="/currency-detection" element={<CurrencyDetection />} />
        <Route path="/surroundings" element={<Surroundings />} />
        <Route path="/features" element={<FeatureSelection />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;