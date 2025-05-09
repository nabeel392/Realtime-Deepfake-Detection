import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { UserCircleIcon } from '@heroicons/react/24/solid';

const Navbar = () => {
  const { user, setUserData } = useUser();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    setUserData(null);
    navigate('/login');
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-blue-900 shadow-md px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-white">Deepfake Detector</Link>

      <div className="flex space-x-4 items-center relative">

        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 hover:text-white focus:outline-none"
            >
              <UserCircleIcon className="w-6 h-6 text-white" />
              <span className="font-medium hidden text-white sm:inline">Hi, {user.name}</span>
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-md z-50">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                  onClick={() => setShowDropdown(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login" className="text-white hover:underline font-bold">Login</Link>
            <Link to="/register" className="text-white hover:underline font-bold">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
