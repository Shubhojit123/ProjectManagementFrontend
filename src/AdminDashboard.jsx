import React, { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";

import {
  UserOutlined,
  TeamOutlined,
  ProfileOutlined,
  LineChartOutlined,
  SolutionOutlined,
  FileTextOutlined,
  CaretDownOutlined,
  CaretRightOutlined,
  SettingOutlined,
  LogoutOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import {
  Layout,
  Menu,
  theme,
  ConfigProvider,
  Avatar,
  Dropdown,
  Button,
  Modal,
  notification
} from "antd";
import { BiCube } from "react-icons/bi";

import "../src/index.css";

import AllDetails from "../AdminComponent/AllDetails";
import AdminList from "../AdminComponent/AdminList";
import UserList from "../AdminComponent/UserList";
import ManagerList from "../AdminComponent/ManagerList";
import AdminTask from "../AdminComponent/AdminTask";
import ProfilePage from "../AdminComponent/ProfilePage";
import { useAdmin } from "../AdminComponent/AdminContext";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import AIChatComponent from "../component/AIChatModal";
import AiLogo from "./assets/Ab.jpg";
import Projects from "../AdminComponent/Projects";
import { IoChatboxOutline } from "react-icons/io5";
import ChatPage from "../ChatPage/chatPage";
const { Sider, Content } = Layout;

const AdminDashboard = () => {
  const [api, contextHolder] = notification.useNotification();

  const { fetchProfile, profile, handleLogout } = useAdmin();
  const [collapsed, setCollapsed] = useState(false);
  const {selectedKey, setSelectedKey} = useAdmin()
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const navigate = useNavigate();
  const [disabled, setDisabled] = useState(false);
  const draggleRef = useRef(null);

  let socket = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("taskmanagement");
    socket.current = io(import.meta.env.VITE_SOCKET, {
      auth: { token },
      transports: ["websocket"],
      upgrade: true,
    });

    socket.current.on("connect", () => {
      console.log("Admin connected to socket:", socket.current.id);
    });

    socket.current.on("connect_error", (err) => {
      console.error("Socket connect error:", err.message);
    });


    socket.current.on("project-admin", (data) => {
      api.open({
        message: "Project Assign",
        description: data,
        duration: 0,
        style: { color: "#000" }
      });
    })
    

    socket.current.on("msg-recieve", (data) => {
      console.log("chat recived", data)
      if (Notification.permission === "granted") {
        new Notification(`Message from ${data.senderName || "Unknown"}`, {
          body: data.message,
        });
        console.log("Notification sent");
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification(`Message from ${data.senderName || "Unknown"}`, {
              body: data.message,
            });
          }
          console.log("Notification permission:", permission);
        });
      }
      })


    return () => {
      socket.current.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchProfile();
  }, []);

  const {
    token: { borderRadiusLG },
  } = theme.useToken();

  const renderContent = () => {
    switch (selectedKey) {
      case "1":
        return <AllDetails />;
      case "2":
        return <AdminList />;
      case "3":
        return <UserList />;
      case "4":
        return <ManagerList />;
      case "5":
        return <AdminTask />;
      case "6":
        return <Projects socket={socket.current} />;
      case "7":
        return <ChatPage socket={socket.current} />;
      default:
        return <h2 className="text-white p-4">Welcome to Dashboard</h2>;
    }
  };

  function handelCancelChat() {
    setChatVisible(false);
  }

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
      {contextHolder}
      <Layout style={{ minHeight: "100vh" }}>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          style={{ background: "#000000", }}
        >
          <div className="h-16 flex items-center justify-center text-white font-bold ">
            <Dropdown
              trigger={["click"]}
              open={dropdownOpen}
              onOpenChange={(open) => setDropdownOpen(open)}
              dropdownRender={() => (
                <div className="bg-black p-2 rounded-md shadow-lg w-40">
                  <Button
                    className="w-full mb-2 bg-white text-black font-semibold rounded-md !border-gray-500 hover:!bg-purple-600 hover:!text-white transition"
                    onClick={() => { }}
                  >
                    Settings <SettingOutlined />
                  </Button>

                  <Button
                    className="w-full mb-2 bg-white text-black font-semibold rounded-md !border-gray-500 hover:!bg-purple-600 hover:!text-white transition"
                    onClick={async () => {
                      try {
                        await handleLogout();
                        navigate("/");
                      } catch (error) {
                        console.log(error);
                      }
                    }}
                  >
                    Logout <LogoutOutlined />
                  </Button>
                </div>
              )}
            >
              <div className="flex items-center gap-2 cursor-pointer">
                <Avatar src={profile?.profileImage} icon={<UserOutlined />} />
                {!collapsed && (
                  <>
                    <span>{profile?.username || "Admin"}</span>
                    {dropdownOpen ? (
                      <CaretDownOutlined style={{ fontSize: "12px" }} />
                    ) : (
                      <CaretRightOutlined style={{ fontSize: "12px" }} />
                    )}
                  </>
                )}
              </div>
            </Dropdown>
          </div>

          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            onClick={(e) => setSelectedKey(e.key)}
            style={{
              background: "#000000",
              border: "none",
              color: "white",
            }}
          >
            <Menu.Item key="1" icon={<LineChartOutlined />}>
              All Details
            </Menu.Item>

            <Menu.SubMenu
              key="sub1"
              title={<span style={{ marginRight: "4px" }}>Your Team</span>}
              expandIcon={({ isOpen }) =>
                isOpen ? (
                  <CaretDownOutlined style={{ fontSize: "12px" }} />
                ) : (
                  <CaretRightOutlined style={{ fontSize: "12px" }} />
                )
              }
            >
              <Menu.Item key="2" icon={<UserOutlined />}>
                Admin List
              </Menu.Item>
              <Menu.Item key="3" icon={<TeamOutlined />}>
                User List
              </Menu.Item>
              <Menu.Item key="4" icon={<SolutionOutlined />}>
                Manager List
              </Menu.Item>
            </Menu.SubMenu>

            <Menu.SubMenu
              key="sub2"
              title={<span style={{ marginRight: "4px" }}>Workspace</span>}
              expandIcon={({ isOpen }) =>
                isOpen ? (
                  <CaretDownOutlined style={{ fontSize: "14px" }} />
                ) : (
                  <CaretRightOutlined style={{ fontSize: "14px" }} />
                )
              }
            >
              <Menu.Item key="5" icon={<FileTextOutlined />}>
                Admin Task
              </Menu.Item>
              <Menu.Item key="6" icon={<BiCube />}>
                Projects
              </Menu.Item>
            </Menu.SubMenu>
            <Menu.Item key="7" icon={<IoChatboxOutline />}>
              Chat
            </Menu.Item>
          </Menu>

        </Sider>

        {/* Content */}
        <Layout>
          <Content style={{ minHeight: 280, background: "#000000" }}>
            {renderContent()}
          </Content>
        </Layout>
        <Draggable nodeRef={draggleRef}>
          <Button
            ref={draggleRef}
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
              background: "#000",
              border: "none",
              padding: 0,
              zIndex: 999,
              cursor: "move",
              draggable: true
            }}
            onClick={() => setChatVisible(true)}
          >
            <img
              src={AiLogo}
              alt="AI"
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                scale: "1.1",
                opacity: "1",
                boxShadow: "0 8px 32px gray",
              }}
            />
          </Button>
        </Draggable>
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
              WebkitBackdropFilter: "blur(5px)",
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
          {/* Custom Header */}
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
            <Draggable nodeRef={draggleRef}>
              <div
                ref={draggleRef}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  background: "#1e293b",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  cursor: "move",
                  width: "fit-content",
                }}
              >
                <img
                  src={AiLogo}
                  alt="AI"
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                  }}
                />
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
            </Draggable>
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
      </Layout>
    </ConfigProvider>
  );
};

export default AdminDashboard;