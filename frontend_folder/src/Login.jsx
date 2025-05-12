import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from './UserContext';
import { toast } from 'react-toastify';
import { usePersistentLocationState } from './usePersistentLocationState'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setUserData } = useUser();
  const { navigateWithState, location } = usePersistentLocationState();

  const from = location.state?.from || '/';

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUserData(data.user);
        toast.success('Logged in successfully!');
        navigateWithState(from, { replace: true });
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="select-none flex flex-col items-center justify-center min-h-screen bg-red-800 text-white px-4">
      <h2 className="text-3xl font-bold mb-6">Login</h2>
      <div className="w-full max-w-md bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-red-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-red-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-red-800 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Sign In
            </button>
            <Link to="/forgot-password" className="inline-block align-baseline font-semibold text-sm text-red-500 hover:text-red-700">
              Forgot Password?
            </Link>
          </div>
        </form>
        <p className="text-center text-sm mt-4 text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-red-500 hover:text-red-700">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
