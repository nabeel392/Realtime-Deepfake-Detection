import React from "react";
import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-200 text-white px-4">
      <h1 className="text-4xl font-bold mb-4 text-blue-900">Deepfake Detection System</h1>
      <p className="text-lg text-gray-600">Select the type of deepfake detection:</p>

      <div className="flex flex-wrap justify-center gap-6 mt-6">
        <Link to="/pre-recorded">
          <button className="px-6 py-3 text-lg font-semibold bg-blue-900 hover:bg-blue-500 rounded-lg shadow-md transition-all">
            Pre-recorded Detection
          </button>
        </Link>

        <Link to="/real-time">
          <button className="px-6 py-3 text-lg font-semibold bg-green-900 hover:bg-green-500 rounded-lg shadow-md transition-all">
            Real-time Detection
          </button>
        </Link>
      </div>
    </div>
  );
}

export default HomePage;
