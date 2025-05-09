import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const slogans = [
  '"Detect the Fake. Protect the Truth."',
  '"Truth Matters. We Help You Find It."',
  '"Don\'t Be Fooled. Be Informed."',
  '"See Through the Lie."',
  '"What You See Isn\'t Always True."',
];


function HomePage() {
  const [videos, setVideos] = useState([]);
  const [currentSloganIndex, setCurrentSloganIndex] = useState(0);
  const [showSlogan, setShowSlogan] = useState(true);
  

  useEffect(() => {
    axios.get("http://localhost:5000/videos")
      .then(res => {
        const latestVideos = res.data.slice(0, 4);
        setVideos(latestVideos);
      })
      .catch(err => console.error("Error fetching videos:", err));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out before switching
      setShowSlogan(false);

      // After fade-out, switch slogan and fade back in
      setTimeout(() => {
        setCurrentSloganIndex(prev => (prev + 1) % slogans.length);
        setShowSlogan(true);
      }, 500); // fade-out duration
    }, 10000); // change every 5s

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col md:flex-row items-start justify-center min-h-screen px-4 py-8 bg-gray-100">
      {/* Left side: Video previews */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full md:w-1/2">
        {videos.map(video => (
          <Link to={`/video/${video.filename}`} key={video.filename}>
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow transform hover:scale-105 duration-300 p-2">
              <video
                src={`http://localhost:5000/samples/${video.filename}`}
                className="w-full h-48 object-cover rounded-md transition-opacity duration-300 opacity-90 hover:opacity-100"
                muted
                controls={false}
                preload="metadata"
              />
              <p className="text-sm text-center mt-2 truncate font-medium text-gray-700">
                {video.filename}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Right side: Buttons */}
      <div className="justify-center min-h-screen flex flex-col items-center gap-4 mt-8 md:mt-0 md:ml-8 w-full md:w-1/2">

        <h1 className="text-5xl font-bold text-blue-900">Deepfake Detection</h1>

        <h1 className="text-center text-gray-800 text-lg md:text-xl mb-4">
        Empowering you with cutting-edge AI to uncover the truth behind videos. Whether it's live or pre-recorded, we help you detect what's real and what's not because in a world of digital deception, clarity matters.
      </h1>
       
        {/* Animated Slogan */}
        <h1
          className={`text-center text-red-800 text-xl md:text-5xl font-bold transition-all duration-700 ease-in-out transform ${
            showSlogan
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-2"
          }`}
        >
          {slogans[currentSloganIndex]}
        </h1>

        <div className="flex flex-row gap-4 items-center h-full mt-4 ">
        <Link to="/pre-recorded">
          <button className="px-6 py-3 font-semibold bg-blue-900 hover:bg-blue-700 text-white rounded-lg w-full">
            Pre-recorded Detection
          </button>
        </Link>
        <Link to="/real-time">
          <button className="px-6 py-3 font-semibold bg-green-900 hover:bg-green-700 text-white rounded-lg w-full">
            Real-time Detection
          </button>
        </Link>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
