import React, { useState, useEffect } from "react";
import axios from "axios";

const RealtimeDetection = () => {
  const [showLive, setShowLive] = useState(false);
  const [stream, setStream] = useState(null);
  const [classification, setClassification] = useState("Waiting...");
  const [avgScore, setAvgScore] = useState(null);

  useEffect(() => {
    if (showLive) {
      const interval = setInterval(() => {
        fetchResult();
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [showLive]);

  const fetchResult = async () => {
    try {
      const response = await axios.get("http://localhost:5000/get-result");
      setClassification(response.data.classification);
      setAvgScore(response.data.avg_score);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
    <h1 className="text-3xl font-bold text-gray-800 mb-6">Real-Time Deepfake Detection</h1>
  
    <button
      onClick={() => setShowLive(!showLive)}
      className={`px-6 py-3 rounded-lg font-medium text-white transition ${
        showLive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
      }`}
    >
      {showLive ? "Stop Live Detection" : "Start Live Detection"}
    </button>
  
    {showLive && (
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mt-6 bg-slate-200 p-6 rounded-lg shadow-lg w-full max-w-4xl">
        <div className="w-full md:w-1/2">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Live Detection Feed:</h3>
          <img
            src="http://localhost:5000/video_feed"
            alt="Live Detection"
            className="w-full h-auto rounded-lg shadow-md border-0"
          />
        </div>
  
        <div className="w-full md:w-1/2">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Classification:</h3>
          <p className="text-xl font-bold text-blue-600">{classification}</p>
  
          <h3 className="text-lg font-semibold text-gray-700 mt-4">Confidence Score:</h3>
          <p className="text-xl font-bold text-blue-600">
            {avgScore ? avgScore.toFixed(2) : "N/A"}
          </p>
        </div>
      </div>
    )}
  </div>
  
  );
};

export default RealtimeDetection;
