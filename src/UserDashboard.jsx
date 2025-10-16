import React, { useEffect, useRef, useState } from "react";
import {
  FileText,
  User,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Bot,
} from "lucide-react";
import { Button, Modal,ConfigProvider } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import Tasks from "../UserComponent/Tasks";
import AIChatComponent from "../component/AIChatModal"; 
import AiLogo from "./assets/Ab.jpg";
import ProfilePage from "../UserComponent/ProfilePage";
import { io } from "socket.io-client";
import ChatPage from "../ChatPage/chatPage";
import { IoChatbox } from "react-icons/io5";

const UserDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState("1");
  const [chatVisible, setChatVisible] = useState(false);

  const handelCancelChat = () => setChatVisible(false);

    let socket = useRef(null);
  


 useEffect(() => {
   try {
     const token = localStorage.getItem("taskmanagement");
     if (!token) return;
 
     socket.current = io(import.meta.env.VITE_SOCKET, {
       auth: { token },
       transports: ["websocket"],
     });
 
     socket.current.on("connect", () => {
       console.log("Socket connected:", socket.current.id);
     });
 
     socket.current.on("connect_error", (err) => {
       console.error("Socket connect error:", err.message);
     });
 
     socket.current.on("project-notification", (data) => {
       api.open({
         message: "Project Assign",
         description: data,
         duration: 0,
       });
     });
 
     return () => {
       socket.current.disconnect();
     };
   } catch (error) {
     console.log(error);
   }
 }, []);

  const renderContent = () => {
    switch (selectedKey) {
      case "1":
        return <Tasks />;
      case "2":
        return <h2 className="text-white text-xl">Community</h2>;
      case "3":
        return <ProfilePage/>
        case "4":
          return <ChatPage socket={socket.current}/>;
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-white">
              Welcome to Dashboard
            </h2>
            <p className="text-gray-400 mt-2">
              Select a menu item to get started
            </p>
          </div>
        );
    }
  };

  const menuItems = [
    { key: "1", icon: FileText, label: "All Tasks" },
    { key: "2", icon: MessageCircle, label: "Community" },
    { key: "3", icon: User, label: "Profile" },
    { key: "4", icon: IoChatbox, label: "Chat" },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorBgContainer: "#000000",
          colorTextBase: "#ffffff",
        },
        components: {
          Menu: {
            itemBg: "#000000",
            itemColor: "#bfbfbf",
            itemHoverBg: "#1a1a1a",
            itemHoverColor: "#ffffff",
            itemSelectedBg: "#262626",
            itemSelectedColor: "#ffffff",
            itemActiveBg: "#1f1f1f",
            itemDisabledColor: "#8c8c8c",
          },
          Modal: {
            contentBg: "#000000",
            headerBg: "#000000",
            footerBg: "#000000",
            titleColor: "#ffffff",
          },
        },
      }}
    >
    <div className="flex min-h-screen bg-black">
      <div
        className={`bg-black transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        } border-r border-gray-800`}
      >
        <div className="p-4">
          <div
            className={`font-bold text-xl text-white ${
              collapsed ? "text-center" : ""
            }`}
          >
            {collapsed ? "D" : "Dashboard"}
          </div>
        </div>
        <nav className="mt-8">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => setSelectedKey(item.key)}
                className={`w-full flex items-center px-4 py-3 text-left transition-colors ${
                  selectedKey === item.key
                    ? "bg-gray-800 text-white border-r-2 cursor-pointer"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <IconComponent className="w-5 h-5" />
                {!collapsed && <span className="ml-3">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex-1 flex flex-col">
        <header className="bg-gray-dark  p-4">

        </header>

        <main className="flex-1 p-6 overflow-auto">{renderContent()}</main>
      </div>

      <Button
        type="primary"
        shape="circle"
        size="large"
        style={{
          position: "fixed",
          bottom: 30,
          right: 30,
          width: 65,
          height: 65,
          borderRadius: "50%",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          background: "#fff",
          border: "none",
          padding: 0,
          zIndex: 999,
        }}
        onClick={() => setChatVisible(true)}
      >
        <img
              src={AiLogo}
              alt="AI"
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                scale:"2.1",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              }}
            />
      </Button>

      <Modal
        open={chatVisible}
        onCancel={handelCancelChat}
        footer={null}
        closeIcon={null}
        centered={false}
        width="450px"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          margin: 0,
          padding: 0,
          maxWidth: "none",
        }}
        styles={{
          wrapper: {
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(1px)",
            WebkitBackdropFilter: "blur(1px)",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "stretch",
            padding: 0,
            zIndex: 1000,
          },
          content: {
            background: "#000000",
            border: "1px solid #333",
            borderRadius: "0",
            height: "100vh",
            width: "450px",
            margin: 0,
            padding: 0,
            position: "relative",
            boxShadow: "-10px 0 30px rgba(0, 0, 0, 0.8)",
            display: "flex",
            flexDirection: "column",
          },
          body: {
            padding: 0,
            height: "100%",
            background: "#000000",
            display: "flex",
            flexDirection: "column",
          },
        }}
        maskClosable={true}
        destroyOnClose={false}
      >
        <div
          style={{
            background: "#111111",
            borderBottom: "1px solid #333",
            padding: "16px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            minHeight: "73px",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            
            <span
              style={{
                color: "#ffffff",
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              AI Assistant
            </span>
          </div>
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={handelCancelChat}
            style={{
              color: "#ffffff",
              border: "none",
              padding: "8px",
              borderRadius: "4px",
            }}
            className="hover:bg-gray-800"
          />
        </div>

        <div
          style={{
            flex: 1,
            background: "#000000",
            color: "#ffffff",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <AIChatComponent />
        </div>
      </Modal>
    </div>
    </ConfigProvider>
  );
};

export default UserDashboard;
