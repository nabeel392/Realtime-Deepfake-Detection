import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminFeedbacks = () => {
    const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/admin/feedbacks')
      .then(res => {
        // Ensure it's an array
        const data = res.data;
        if (Array.isArray(data)) {
          setFeedbacks(data);
        } else {
          console.error('Expected array but got:', data);
          setFeedbacks([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch users:', err);
        setFeedbacks([]);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center mt-10">Loading feedbacks...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h2 className="text-2xl font-bold text-center mb-6">All Registered Users</h2>
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-lg shadow border-2 text-center">
          <thead>
            <tr className="bg-red-800 text-white">
              <th className="p-3">Sr</th>
              <th className="p-3">Feedback</th>
              <th className="p-3">Video Name</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.map((feedback,index) => (
              <tr key={feedback.userId} className="border-2 hover:bg-gray-100 text-center">
                <td className="p-3">{index + 1}</td>
                <td className="p-3">{feedback.message}</td>
                <td className="p-3">{feedback.video}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>


    
  );
};

export default AdminFeedbacks;
