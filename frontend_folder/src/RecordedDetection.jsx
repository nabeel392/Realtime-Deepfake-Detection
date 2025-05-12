import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function RecordedDetection() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoPath, setVideoPath] = useState("");
  const [result, setResult] = useState("");
  const [confidence, setConfidence] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const onFileChange = (event) => {
    setVideoFile(event.target.files[0]);
  };

  const onFileUpload = async () => {
    if (!user) {
      toast.error("Please log in first.");
      navigate("/login", { state: { from: "/pre-recorded" } });
      return;
    }
    if (!videoFile) {
      alert("Please select a video file first.");
      return;
    }

    const formData = new FormData();
    formData.append("video", videoFile);

    try {
      setIsLoading(true);
      const response = await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setVideoPath(response.data.video_path);
      setResult(response.data.result);
      setConfidence(response.data.confidence);
      setFeedback(""); // reset feedback field
      setFeedbackSubmitted(false); // reset state
    } catch (error) {
      console.error("Error uploading video:", error);
      alert("There was an error uploading the video. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const submitFeedback = async () => {
    if (!feedback.trim()) {
      toast.warn("Feedback cannot be empty.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/feedback", {
        userId: user.id,
        feedback,
        videoPath,
      });

      setFeedbackSubmitted(true);
      toast.success("Feedback submitted successfully!");
    } catch (err) {
      console.error("Error submitting feedback:", err);
      toast.error("Failed to submit feedback.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200 text-white px-6">
      <h1 className="text-3xl font-bold text-blue-900 mb-6">Deepfake Detection</h1>

      <div className="flex flex-col items-center gap-4 bg-gray-300 p-6 rounded-lg shadow-lg">
        <input
          type="file"
          onChange={onFileChange}
          className="block w-full text-sm text-gray-900 rounded-lg file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-900 file:text-white hover:file:bg-blue-500 cursor-pointer"
        />
        <button
          onClick={onFileUpload}
          className="px-6 py-2 bg-green-900 hover:bg-green-500 rounded-lg font-semibold transition-all"
        >
          {isLoading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {isLoading && <p className="text-yellow-900 mt-4">Processing video...</p>}

      {videoPath && (
        <div className="flex flex-col gap-6 mt-6 w-full max-w-4xl bg-gray-300 p-6 rounded-lg shadow-lg text-center">
          <div className="w-full">
            <h3 className="text-3xl font-bold text-blue-900">Video</h3>
            <video className="w-full rounded-lg mt-2" controls autoPlay muted loop>
              <source src={`http://localhost:5000/samples/${videoPath}`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="w-full">
            <h3 className="text-3xl font-bold text-blue-900">Prediction Result</h3>
            <p className="mt-2 text-blue-900"><strong>Classification:</strong> {result}</p>
            <p className="mt-2 text-blue-900"><strong>Confidence:</strong> {confidence ? confidence.toFixed(4) : "N/A"}</p>
          </div>

          {/* Feedback Section */}
          {!feedbackSubmitted && (
            <div className="w-full">
              <h3 className="text-xl font-bold text-blue-900 mt-4">Submit Feedback</h3>
              <textarea
                className="w-full p-3 mt-2 rounded-lg text-black resize-none"
                rows="4"
                placeholder="Share your feedback about the result..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
              <button
                onClick={submitFeedback}
                className="mt-2 px-4 py-2 bg-blue-900 hover:bg-blue-700 text-white font-semibold rounded"
              >
                Submit Feedback
              </button>
            </div>
          )}

          {feedbackSubmitted && (
            <p className="text-green-800 font-semibold mt-2">Thanks for your feedback!</p>
          )}
        </div>
      )}
    </div>
  );
}

export default RecordedDetection;
