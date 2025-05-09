import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function VideoDetail() {
  const { filename } = useParams();
  const [result, setResult] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Trigger backend classification on page load
    axios.post("http://localhost:5000/classify", { filename })
      .then(res => {
        setResult(res.data.result);
        setConfidence(res.data.confidence);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching classification result:", err);
        setLoading(false);
      });
  }, [filename]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen p-8 bg-gray-50">
      {/* Detection Results */}
      <div className="md:w-1/2 mb-8 md:mb-0">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Detection Result</h2>
        {loading ? (
          <p className="text-gray-600">Analyzing video...</p>
        ) : (
          <div className="bg-white p-4 mr-4 rounded shadow">
            <p><strong>Result:</strong> {result}</p>
            <p><strong>Confidence:</strong> {confidence?.toFixed(2)}</p>
          </div>
        )}
      </div>

      {/* Video Player */}
      <div className="md:w-1/2">
        <video
          src={`http://localhost:5000/samples/${filename}`}
          controls
          autoPlay
          className="w-full h-auto rounded-lg shadow-lg"
        />
        <p className="mt-4 text-center text-sm text-gray-600">{filename}</p>
      </div>
    </div>
  );
}

export default VideoDetail;
