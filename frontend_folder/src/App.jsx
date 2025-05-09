import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Home from "./Homepage";
import PreRecordedDetection from "./RecordedDetection";
import RealTimeDetection from "./RealtimeDetection";
import Login from "./Login";
import Register from "./Register";
import Navbar from "./Navbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserProvider, useUser } from "./UserContext";
import VideoDetail from "./VideoDetail";
import Profile from "./Profile";

// Component wrapper for protected routes (such as login/register)
// Redirects authenticated users to the homepage if they try to access login/register
const PublicRoute = ({ children }) => {
  const { user } = useUser();

  if (user) {
    // If user is logged in, redirect to home page
    return <Navigate to="/" replace />;
  }

  return children;
};

const PrivateRoute = ({ children }) => {
  const { user } = useUser();

  if (!user) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  return children;
};

function AppRoutes() {
  const { user } = useUser();

  return (
    <Routes>
      {/* Protected routes, accessible only if the user is authenticated */}
      <Route path="/" element={<Home />} />
      <Route path="/pre-recorded" element={<PreRecordedDetection />} />
      <Route path="/real-time" element={<RealTimeDetection />} />
      <Route path="/video/:filename" element={<VideoDetail />} />
      <Route
      path="/profile"
      element={
        <PrivateRoute>
          <Profile />
        </PrivateRoute>
      }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <UserProvider>
      <Router>
        <Navbar />
        <div className="min-h-screen bg-slate-200">
          <ToastContainer
            position="top-center"
            autoClose={3000}
            hideProgressBar
            newestOnTop={false}
            closeButton={false}
            pauseOnHover
          />
          <AppRoutes />
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
