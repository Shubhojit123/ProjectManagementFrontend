import React, { useState, useEffect } from "react";
import { useAdmin } from "../AdminContext";
import { Avatar, Badge, Button, Tooltip, Input } from "antd";
import {
  MessageOutlined,
  EyeOutlined,
  PhoneOutlined,
  VideoCameraOutlined,
  SearchOutlined,
  UserOutlined,
  CrownOutlined
} from "@ant-design/icons";

const { Search } = Input;

function AllManagers() {
  const [members, setMembers] = useState([]);
  const { getAllManagers } = useAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredMember, setHoveredMember] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAllManagers = async () => {
    try {
      setLoading(true);
      const res = await getAllManagers();
      console.log(res);
      setMembers(res.data.message || []);
    } catch (error) {
      console.log(error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllManagers();
  }, []);

  const handleMemberChat = (member) => {
    console.log(`Opening chat with ${member.username}`);
    // Add your chat functionality here
  };

  const handleMemberProfile = (member) => {
    console.log(`Opening profile for ${member.username}`);
    // Add your profile functionality here
  };

  const filteredMembers = members?.filter((member) =>
    member.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full bg-gradient-to-br from-black/40 to-gray-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
            <CrownOutlined className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Manager Directory
            </h2>
            <p className="text-sm text-gray-400">
              {filteredMembers?.length || 0} managers found
            </p>
          </div>
        </div>
        <Badge count={members?.length || 0} showZero color="#f59e0b" />
      </div>

      {/* Enhanced Search Bar */}
      <div className="relative mb-6">
        <Search
          placeholder="Search managers by name..."
          allowClear
          size="large"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="manager-search"
          style={{
            backgroundColor: 'transparent',
          }}
        />
        <style jsx global>{`
          .manager-search .ant-input {
            background: rgba(0, 0, 0, 0.3) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            color: white !important;
            border-radius: 12px !important;
            padding: 12px 16px !important;
          }
          .manager-search .ant-input:focus,
          .manager-search .ant-input-focused {
            background: rgba(0, 0, 0, 0.4) !important;
            border-color: rgba(139, 92, 246, 0.5) !important;
            box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1) !important;
          }
          .manager-search .ant-input::placeholder {
            color: rgba(156, 163, 175, 0.8) !important;
          }
          .manager-search .ant-input-suffix {
            color: rgba(156, 163, 175, 0.6) !important;
          }
        `}</style>
      </div>

      {/* Enhanced Scrollable Container */}
      <div className="flex-1 min-h-0 relative">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
          </div>
        ) : filteredMembers?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <UserOutlined className="text-4xl mb-4 opacity-50" />
            <p className="text-lg mb-2">No managers found</p>
            <p className="text-sm">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div 
            className="h-full overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent hover:scrollbar-thumb-purple-500/50 transition-colors"
            style={{
              scrollbarWidth: 'thin',
              scrollBehavior: 'smooth'
            }}
          >
            {filteredMembers.map((member, index) => (
              <div
                key={member._id}
                className="group relative bg-gradient-to-r from-black/30 to-gray-900/30 backdrop-blur-sm border border-white/5 rounded-xl p-4 hover:from-black/50 hover:to-gray-900/50 hover:border-white/20 transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
                onMouseEnter={() => setHoveredMember(member._id)}
                onMouseLeave={() => setHoveredMember(null)}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: 'fadeInUp 0.4s ease-out forwards'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Enhanced Avatar */}
                    <div className="relative">
                      <Avatar
                        size={52}
                        src={member.profileImage}
                        className="border-2 border-white/20 group-hover:border-amber-500/50 transition-all duration-300 shadow-lg"
                        style={{
                          backgroundColor: member.profileImage ? 'transparent' : '#f59e0b'
                        }}
                      >
                        {member.username?.[0]?.toUpperCase()}
                      </Avatar>
                      
                      {/* Status Indicator */}
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black ${
                        member.userStatus 
                          ? 'bg-green-400 animate-pulse shadow-lg shadow-green-400/50' 
                          : 'bg-gray-500'
                      }`} />
                      
                      {/* Manager Crown Badge */}
                      <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                        <CrownOutlined className="text-white text-xs" />
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="flex flex-col flex-1 min-w-0">
                      <p className="font-semibold text-white group-hover:text-amber-300 transition-colors duration-200 truncate">
                        {member.username}
                      </p>
                      <p className="text-sm text-amber-400 font-medium mb-1">
                        {member.role || 'Manager'}
                      </p>
                      <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                        {member.userStatus ? 'Online now' : 'Last seen recently'}
                      </p>
                    </div>
                  </div>

                  {/* Hover Actions */}
                  <div className={`flex items-center space-x-2 transition-all duration-300 ${
                    hoveredMember === member._id 
                      ? 'opacity-100 translate-x-0' 
                      : 'opacity-0 translate-x-4'
                  }`}>
                    <Tooltip title="View Profile" placement="top">
                      <Button
                        type="text"
                        icon={<EyeOutlined />}
                        className="text-white/70 hover:text-white hover:bg-white/10 border-none rounded-lg w-8 h-8 flex items-center justify-center transition-all duration-200"
                        onClick={() => handleMemberProfile(member)}
                      />
                    </Tooltip>
                    
                    <Tooltip title="Send Message" placement="top">
                      <Button
                        type="text"
                        icon={<MessageOutlined />}
                        className="text-white/70 hover:text-white hover:bg-purple-500/20 border-none rounded-lg w-8 h-8 flex items-center justify-center transition-all duration-200"
                        onClick={() => handleMemberChat(member)}
                      />
                    </Tooltip>

                    {member.userStatus && (
                      <>
                        <Tooltip title="Voice Call" placement="top">
                          <Button
                            type="text"
                            icon={<PhoneOutlined />}
                            className="text-white/70 hover:text-white hover:bg-green-500/20 border-none rounded-lg w-8 h-8 flex items-center justify-center transition-all duration-200"
                          />
                        </Tooltip>
                        
                        <Tooltip title="Video Call" placement="top">
                          <Button
                            type="text"
                            icon={<VideoCameraOutlined />}
                            className="text-white/70 hover:text-white hover:bg-blue-500/20 border-none rounded-lg w-8 h-8 flex items-center justify-center transition-all duration-200"
                          />
                        </Tooltip>
                      </>
                    )}
                  </div>
                </div>

                {/* Gradient Border Effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            ))}
          </div>
        )}

        {/* Scroll Indicator */}
        {filteredMembers?.length > 5 && (
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/50 to-transparent pointer-events-none rounded-b-xl" />
        )}
      </div>

      {/* Add animation styles */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Custom scrollbar styles */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 3px;
          transition: background 0.3s ease;
        }
        
        .scrollbar-thin:hover::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>
    </div>
  );
}

export default AllManagers;