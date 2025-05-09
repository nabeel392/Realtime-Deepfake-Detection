import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from './UserContext';
import { toast } from 'react-toastify';
import { usePersistentLocationState } from './usePersistentLocationState'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUserData } = useUser();

  const { navigateWithState, location } = usePersistentLocationState();

  const from = location.state?.from || '/';

  const handleLogin = async (e) => {
    e.preventDefault();

    // Check if the inputs are valid
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store user data in the context and localStorage
        setUserData(data.user); // Update user context
        toast.success('Logged in successfully!');
        
        // Redirect user after successful login
        navigateWithState(from, { replace: true });
      } else {
        // Display error message
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="select-none flex flex-col items-center justify-center min-h-screen bg-slate-200 text-blue-900 px-4">
      <h2 className="text-3xl font-bold mb-6 select-none">Login</h2>
      <div className="w-full max-w-md bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className=" select-none block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="select-none block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
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
              className="select-none bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Sign In
            </button>
            <Link to="/forgot-password" className="select-none inline-block align-baseline font-semibold text-sm text-blue-500 hover:text-blue-800">
              Forgot Password?
            </Link>
          </div>
        </form>
        <p className="select-none text-center text-gray-500 text-xs mt-4">
          Don't have an account? <Link to="/register" className="font-semibold text-blue-500 hover:text-blue-800">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
