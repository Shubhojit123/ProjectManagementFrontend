import React, { useEffect, useState } from "react";
import { Tag, Spin, Card, Input, Empty } from "antd";
import axios from "axios";

const { Search } = Input;

function Community() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = import.meta.env.BASE_URL;

  useEffect(() => {
    axios
      .get(`${BASE_URL}/manager/user-list`, { withCredentials: true })
      .then((res) => {
        setUsers(res.data || []);
        setFilteredUsers(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Handle search
  const onSearch = (value) => {
    const filtered = users.filter((user) =>
      user.username.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-6">
      {/* Search Bar */}
      <div className="w-full max-w-md mb-8">
        <Search
          placeholder="Search by username..."
          allowClear
          enterButton="Search"
          size="large"
          onSearch={onSearch}
          onChange={(e) => onSearch(e.target.value)} // instant filter
        />
      </div>

      {/* User Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 w-full max-w-7xl">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <Card
              key={user._id}
              hoverable
              className="flex flex-col items-center text-center shadow-md rounded-2xl transition-transform hover:scale-105 h-full"
            >
              {/* Avatar */}
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.username}
                  className="w-20 h-20 rounded-full object-cover shadow-md border mb-2"
                />
              ) : (
                <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-r from-orange-400 to-pink-500 text-white text-2xl font-bold shadow-md mb-2">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Name */}
              <p className="mt-1 text-sm font-semibold text-gray-800">
                {user.username}
              </p>

              {/* Status */}
              <Tag
                color={user.userStatus ? "green" : "red"}
                className="mt-2 px-3 py-0.5 rounded-full text-xs"
              >
                {user.userStatus ? "Active" : "Inactive"}
              </Tag>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex justify-center items-center py-20">
            <Empty description="No users found" />
          </div>
        )}
      </div>
    </div>
  );
}

export default Community;
