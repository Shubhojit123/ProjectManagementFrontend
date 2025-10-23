import React, { useEffect, useState } from "react";
import axios from "axios";
import { EyeOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar } from "antd";
import { useNavigate } from "react-router-dom";

function Community() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const BASE_URL = import.meta.env.VITE_URL;
    const navigate = useNavigate();
  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/user/get-community`, {
          withCredentials: true,
        });
        console.log("Community data:", res.data);
        setMembers(res.data.message.userAssign || []);
      } catch (err) {
        console.error("Error fetching community:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunity();
  }, []);

  const handleViewProfile = async (id) => {
    try {
      navigate(`/auth/profile/${id}`);
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-900 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gray-900 text-white p-4 overflow-auto">
      <h1 className="text-2xl font-bold mb-4">Community Members</h1>
      {members.length === 0 ? (
        <p>No members found.</p>
      ) : (
        <ul className="space-y-2">
          {members.map((member) => (
            <li
              key={member._id || member.id}
              className="p-3 bg-gray-800 rounded shadow flex justify-between items-center hover:bg-gray-700 transition"
            >
              <div className="flex items-center gap-3">
                <Avatar
                  src={member.profileImage}
                  icon={!member?.profileImage && <UserOutlined />}
                  alt={member.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">{member.username}</p>
                  <p className="text-gray-400 text-sm">{member.role}</p>
                </div>
              </div>
              <button
                onClick={() => handleViewProfile(member._id)}
                className="p-2 hover:bg-gray-700 rounded cursor-pointer transition"
              >
                <EyeOutlined style={{ fontSize: "18px", color: "white" }} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Community;
