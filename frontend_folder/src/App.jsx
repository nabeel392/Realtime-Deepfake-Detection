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
import AdminLogin from "./AdminLogin";
import AdminRegister from "./AdminRegister";
import AdminDashboard from "./AdminDashboard";
import AdminUsers from "./ManageUsers";
import AdminFeedbacks from "./ManageFeedbacks";
import AdminVideos from "./ManageVideos";


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

const AdminPrivateRoute = ({ children }) => {
  const admin = JSON.parse(localStorage.getItem("admin"));
  return admin ? children : <Navigate to="/admin/login" replace />;
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

      <Route path="/admin/register" element={<AdminRegister />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
      path="/admin/dashboard"
      element={
      <AdminPrivateRoute>
        <AdminDashboard />
      </AdminPrivateRoute>
      }
    />
    <Route
      path="/admin/profile"
      element={
        <AdminPrivateRoute>
          <Profile />
        </AdminPrivateRoute>
      }
      />

      <Route path="/admin/users" element={
        <AdminPrivateRoute>
        <AdminUsers />
        </AdminPrivateRoute>
        } />
      <Route path="/admin/feedbacks" element={
        <AdminPrivateRoute>
        <AdminFeedbacks />
        </AdminPrivateRoute>
        } />
      <Route path="/admin/videos" element={
        <AdminPrivateRoute>
        <AdminVideos />
        </AdminPrivateRoute>
        } />

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
