import React, { useEffect, useRef, useState } from "react";
import { useAdmin } from "../AdminComponent/AdminContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Avatar, Spin } from "antd";
import { FaCheckCircle } from "react-icons/fa";

function MsgComponent({ member, socket, isOnline }) {
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState("");
  const [typingUser, setTypingUser] = useState("");
  const { getMsg, sendMsg } = useAdmin();
  const queryClient = useQueryClient();
  const BASE_URL = import.meta.env.VITE_URL;

  const scrollRef = useRef(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["getmsg", member?._id],
    queryFn: async () => {
      const res = await getMsg(member._id);
      return res.data;
    },
    enabled: !!member?._id,
  });

  const handleTypingMsg = (e) => {
    setMessage(e.target.value);
    if (e.target.value.length > 0) {
      socket.emit("typing", { toUserId: member._id, fromUsername: profile?.username || "You" });
    } else {
      socket.emit("stop-typing", { toUserId: member._id });
    }
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("display-typing", (data) => {
      setTypingUser(data);
    });


    socket.on("hide-typing", () => {
      setTypingUser("");
    });

    return () => {
      socket.off("display-typing");
      socket.off("hide-typing");
    };
  }, [socket]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/profile`, { withCredentials: true });
        setProfile(res.data.message);
      } catch (error) {
        console.error("Profile fetch error:", error);
      }
    };
    fetchProfile();
  }, [BASE_URL]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification(`Message from ${msg.senderName || "User"}`, {
            body: msg.message,
            icon: "/chat-icon.png",
          });
        } else if (Notification.permission === "default") {
          Notification.requestPermission();
        }
      }

      queryClient.setQueryData(["getmsg", member._id], (old = []) => [...old, msg]);
    };

    socket.on("msg-recieve", handleNewMessage);
    return () => socket.off("msg-recieve", handleNewMessage);
  }, [socket, member._id, queryClient]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMsg = async () => {
    if (!message.trim()) return;

    const optimisticMsg = {
      senderId: profile?._id,
      receiverId: member._id,
      message,
      optimistic: true,
    };

    queryClient.setQueryData(["getmsg", member._id], (old = []) => [...old, optimisticMsg]);
    setMessage("");
    socket.emit("stop-typing", { toUserId: member._id });

    try {
      await sendMsg(member._id, message);
    } catch (error) {
      console.error("Send error:", error);
      queryClient.setQueryData(["getmsg", member._id], (old = []) =>
        old.filter((m) => m !== optimisticMsg)
      );
    }
  };

  if (isLoading)
  {
      return(
        <div className="p-4 w-full h-full flex flex-col justify-center items-center">
            <Spin/>
        </div>
      )
  }

  return (
    <div className="p-4 w-full h-full flex flex-col">
      <div className="border-b border-gray-700 pb-2 mb-2 flex justify-between items-center">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Avatar src={member.profileImage} />
          <span>{member.username}</span>

          {isOnline && (
            <span className="text-green-500 h-4 w-4" title="Online"><FaCheckCircle /></span>
          )}
           {!isOnline && (
            <span className="text-gray-400 h-4 w-4" title="Online"><FaCheckCircle /></span>
          )}


          {typingUser && typingUser.toUserId === member._id && (
            <span className="text-sm text-green-500 font-semibold ml-2">
              typing<span className="typing-dots">...</span>
            </span>
          )}
        </h2>

        <span className="text-sm text-gray-400">{member.role}</span>
      </div>

      <div className="flex-1 text-gray-300 space-y-2 overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded-lg max-w-xs ${msg.senderId === profile?._id
              ? "bg-purple-600 text-white self-end ml-auto"
              : "bg-gray-700 text-white mr-auto"
              }`}
          >
            {msg.message}
          </div>
        ))}

        {typingUser.toUserId == member._id && (
          <p className="text-sm text-green-500 font-semibold">
            {typingUser.fromUsername} is typing
            <span className="typing-dots">...</span>
          </p>
        )}


        <div ref={scrollRef} />
      </div>

      <div className="mt-2 flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-purple-500"
          value={message}
          onChange={handleTypingMsg}
          onKeyDown={(e) => e.key === "Enter" && handleSendMsg()}
        />
        <button
          className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
          onClick={handleSendMsg}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default MsgComponent;
