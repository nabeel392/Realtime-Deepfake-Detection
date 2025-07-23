import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminUsers = () => {
  const [users, setUsers] = useState([]); // Default to empty array
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/admin/users')
      .then(res => {
        // Ensure it's an array
        const data = res.data;
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error('Expected array but got:', data);
          setUsers([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch users:', err);
        setUsers([]);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center mt-10">Loading users...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h2 className="text-2xl font-bold text-center mb-6">All Registered Users</h2>
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-lg shadow border-2">
          <thead>
            <tr className="bg-red-800 text-white text-center">
              <th className="p-3">Sr</th>
              <th className="p-3">Username</th>
              <th className="p-3">Email</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user,index ) => (
              <tr key={user._id} className="border-2 hover:bg-gray-100 text-center">
                <td className="p-3">{index + 1}</td>
                <td className="p-3">{user.username}</td>
                <td className="p-3">{user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
