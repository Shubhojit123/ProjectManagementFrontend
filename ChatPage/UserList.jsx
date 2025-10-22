import React, { useEffect, useState } from "react";
import { useAdmin } from "../AdminComponent/AdminContext";
import { Avatar, Input, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { EyeOutlined, MessageOutlined } from "@ant-design/icons";

const { Search } = Input;

function UserList({ onSelectMember, socket, setIsOnline, admin }) {
  const { getAllMemebers, selectedKey, setSelectedKey } = useAdmin();
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const navigate = useNavigate();
  const [loading,setLoading] = useState(false)
  // Fetch all members
  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true)
      try {
        const res = await getAllMemebers();
        setMembers(res.data.userData);
      } catch (error) {
        console.log(error);
      }
      finally{
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("onlineUsers", (onlineIds) => {
      console.log(onlineIds)
      setOnlineUsers(onlineIds);
    });
    return () => socket.off("onlineUsers");
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    socket.on("display-typing", (data) => {
      setTypingUser(data);
    });

    socket.on("hide-typing", () => {
      setTypingUser(null);
      console.log("Hiding")
    });

    return () => {
      socket.off("display-typing");
      socket.off("hide-typing");
    };
  }, [socket]);

  const handleMemberProfile = (member) => {
    navigate(`/auth/profile/${member._id}`, { state: { member } });
  };

  console.log("typing", typingUser)

    if(loading)
    {
        return(
          <div className="h-[98vh] overflow-hidden flex flex-col justify-center items-center">
            <Spin />
          </div>
        )
    }

  return (
    <div className="h-[98vh] overflow-hidden flex flex-col">
      {/* Search Bar */}
      <div className="p-2">
        <Search
          placeholder="Search members..."
          allowClear
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="rounded-lg"
        />
      </div>

      {/* Member List */}
      <div className="flex-1 space-y-3 scrollbar-thin scrollbar-thumb-gray-600/50 scrollbar-track-transparent pr-2 h-full p-2 overflow-y-auto">
        {members
          ?.filter((member) =>
            member.username.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((member) => {
            const isOnline = onlineUsers.includes(member._id);
            console.log("onlineUsers", onlineUsers)
            return (
              <div
                key={member._id}
                className="group relative bg-black/30 backdrop-blur-sm border border-white/5 rounded-xl p-4 hover:bg-black/50 hover:border-white/20 transition-all duration-300 cursor-pointer"
                onClick={() => {
                  onSelectMember(member);
                  setIsOnline(isOnline);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* Avatar with Online Indicator */}
                    <div className="relative">
                      <Avatar
                        size={48}
                        src={member.profileImage}
                        className="border-2 border-white/20 group-hover:border-purple-500/50 transition-all duration-300"
                      >
                        {member.username[0]?.toUpperCase()}
                      </Avatar>
                      <div
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black ${isOnline
                            ? "bg-green-400 animate-pulse"
                            : "bg-gray-500"
                          }`}
                      />
                    </div>

                    {/* Member Info */}
                    <div className="flex flex-col">
                      <p className="font-medium text-white group-hover:text-purple-300 transition-colors">
                        {member.username}
                      </p>
                      <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                        {member.role}
                      </p>

                      {!admin && (
                        <>
                          <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                            {isOnline ? "Online" : "Offline"}
                          </p>

                          {typingUser?.toUserId === member._id && (
                            <div className="flex items-center space-x-1 mt-0.5">
                              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                              <p className="text-[11px] text-purple-400 animate-pulse">
                                typing...
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {admin && (
                    <>
                      <MessageOutlined
                        className="text-gray-400 hover:text-purple-400 text-lg transition-colors duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedKey("7");
                        }}
                      />

                      <EyeOutlined
                        className="text-gray-400 hover:text-purple-400 text-lg transition-colors duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMemberProfile(member);
                        }}
                      />
                    </>
                  )}

                </div>

                {/* Hover Glow */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default UserList;
