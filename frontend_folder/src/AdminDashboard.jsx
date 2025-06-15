import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const admin = JSON.parse(localStorage.getItem('admin'));
  const navigate = useNavigate();

  const [counts, setCounts] = useState({
    users: 0,
    feedbacks: 0,
    videos: 0,
  });

  useEffect(() => {
    if (!admin) {
      navigate('/admin/login');
      return;
    }

    const fetchCounts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/admin/stats');
        setCounts(res.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      }
    };

    fetchCounts();
  }, [admin, navigate]);

  const Card = ({ title, count }) => (
    <div className="bg-white text-red-800 shadow-lg rounded-lg p-6 w-64 text-center">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-3xl font-bold mt-2">{count}</p>
    </div>
  );

  return (
    <div className="select-none flex flex-col items-center justify-center min-h-screen bg-red-800 text-white px-4">
      <h1 className="text-4xl font-bold mb-10">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card title="Total Users" count={counts.users} />
        <Card title="Total Feedbacks" count={counts.feedbacks} />
        <Card title="Total Videos" count={counts.videos} />
      </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">

      <Link
        to="/admin/users"
        className="bg-white text-red-800 px-6 py-3 rounded shadow hover:bg-red-100 transition font-semibold"
      >
        Manage Users
      </Link>

      <Link
        to="/admin/feedbacks"
        className="bg-white text-red-800 px-6 py-3 rounded shadow hover:bg-red-100 transition font-semibold"
      >
        View Feedback
      </Link>

      <Link
        to="/admin/videos"
        className="bg-white text-red-800 px-6 py-3 rounded shadow hover:bg-red-100 transition font-semibold"
      >
        Manage Videos
      </Link>

      </div>
    </div>
  );
};

export default AdminDashboard;
