import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/admin/videos')
      .then(res => {
        if (Array.isArray(res.data)) {
          setVideos(res.data);
        } else {
          console.error("Expected array, got:", res.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching videos:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center mt-10">Loading videos...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h2 className="text-2xl font-bold text-center mb-6">All Uploaded Videos</h2>
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-lg shadow border-2">
          <thead>
            <tr className="bg-red-800 text-white text-center">
              <th className="p-3">Sr</th>
              <th className="p-3">Video Preview</th>
              <th className="p-3">File Name</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video, index) => (
              <tr key={index} className="border-2 hover:bg-gray-100 text-center">
                <td className="p-3">{index + 1}</td>
                <td className="p-3">
                  <video
                    src={`http://localhost:5000/samples/${video}`}
                    controls
                    className="w-64 h-40 rounded"
                  />
                </td>
                <td className="p-3 break-all">{video}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminVideos;
