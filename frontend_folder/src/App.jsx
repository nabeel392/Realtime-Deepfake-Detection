import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./HomePage";
import PreRecordedDetection from "./RecordedDetection";
import RealTimeDetection from "./RealtimeDetection";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pre-recorded" element={<PreRecordedDetection />} />
        <Route path="/real-time" element={<RealTimeDetection />} />
      </Routes>
    </Router>
  );
}

export default App;
