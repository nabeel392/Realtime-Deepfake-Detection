import React, { useEffect, useState } from "react";

function Profile() {
  const [data, setData] = useState(null);
  const [role, setRole] = useState(null); // 'user' or 'admin'

  useEffect(() => {
    const adminData = localStorage.getItem("admin");
    const userData = localStorage.getItem("user");

    // Prefer admin if both are accidentally present
    if (adminData) {
      try {
        setData(JSON.parse(adminData));
        setRole("admin");
      } catch (err) {
        console.error("Error parsing admin data", err);
      }
    } else if (userData) {
      try {
        setData(JSON.parse(userData));
        setRole("user");
      } catch (err) {
        console.error("Error parsing user data", err);
      }
    }
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-800">
        <p className="text-white text-lg">No profile data found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-800 p-6">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center text-red-600">
          {role === "admin" ? "Admin Profile" : "User Profile"}
        </h1>
        <div className="space-y-3">
          <p><strong>Name:</strong> {data.name}</p>
          <p><strong>Email:</strong> {data.email}</p>
        </div>
      </div>
    </div>
  );
}

export default Profile;
