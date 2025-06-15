import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/admin/login', {
        email,
        password,
      });

      // store admin in localStorage
      localStorage.setItem('admin', JSON.stringify(res.data));
      toast.success('Admin logged in successfully!');
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Admin login failed:', err);
      setError(err.response?.data?.error || 'Invalid credentials');
    }
  };

  return (
    <div className="select-none flex flex-col items-center justify-center min-h-screen bg-red-800 text-white px-4">
      <h2 className="text-3xl font-bold mb-6">Admin Login</h2>
      <div className="w-full max-w-md bg-white text-red-700 shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="admin-email">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-red-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold mb-2" htmlFor="admin-password">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-red-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-red-800 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Sign In
            </button>
            <Link
              to="/admin/forgot-password"
              className="inline-block align-baseline font-semibold text-sm text-red-500 hover:text-red-700"
            >
              Forgot Password?
            </Link>
          </div>
        </form>

        <p className="text-center text-sm mt-4 text-gray-500">
          Go back to{' '}
          <Link to="/" className="font-semibold text-red-500 hover:text-red-700">
            Home
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
