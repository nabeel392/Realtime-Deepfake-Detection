import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { UserCircleIcon } from '@heroicons/react/24/solid';

const Navbar = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user'));
  const admin = JSON.parse(localStorage.getItem('admin'));

  const handleLogout = () => {
    if (admin) {
      localStorage.removeItem('admin');
      navigate('/admin/login');
    } else if (user) {
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const name = admin?.name || user?.name;
  const isLoggedIn = !!(admin || user);
  const profileLink = admin ? '/admin/profile' : '/profile';


  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <nav className="bg-white px-6 py-4 flex justify-between items-center border-b-4 border-red-800">
      <Link to="/" className="text-xl font-bold text-red-800">Deepfake Detector</Link>

      <div className="flex space-x-4 items-center relative">
        {isLoggedIn ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 hover:text-red-800 focus:outline-none"
            >
              <UserCircleIcon className="w-6 h-6 text-red-800" />
              <span className="font-medium hidden sm:inline text-red-800">Hi, {name}</span>
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white border-red-800 rounded shadow-md z-50">
                <Link
                  to={profileLink}
                  className="block px-4 py-2 text-red-800 hover:bg-red-100"
                  onClick={() => setShowDropdown(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-white bg-red-800 hover:bg-red-900"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login" className="bg-red-800 text-white px-4 py-2 rounded font-bold hover:bg-red-600 transition duration-200">Login</Link>
            <Link to="/register" className="bg-red-800 text-white px-4 py-2 rounded font-bold hover:bg-red-600 transition duration-200">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
