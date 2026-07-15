import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import FeatureSelection from "./pages/FeatureSelection";
import ReadText from "./pages/ReadText";
import ObjectDetection from "./pages/ObjectDetection";
import CurrencyDetection from "./pages/CurrencyDetection";
import ReadMedicine from "./pages/ReadMedicine";

function App() {
  return (
    <>
     <Navbar/>

     <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/read-text" element={<ReadText />} />
        <Route path="/object-detection" element={<ObjectDetection />} />
        <Route path="/currency-detection" element={<CurrencyDetection />} />
        <Route path="/read-medicine" element={<ReadMedicine />} />
        <Route path="/features" element={<FeatureSelection />} />
      </Routes>
    </BrowserRouter>
    </>
    
  );
}

export default App;