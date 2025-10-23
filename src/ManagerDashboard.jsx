import React, { useEffect, useRef, useState } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TeamOutlined,
  ProfileOutlined,
  FileTextOutlined,
  ProjectOutlined,
} from "@ant-design/icons";
import { Button, Layout, notification, Menu, theme } from "antd";
import AllDetails from "../AdminComponent/AllDetails";
import Community from "../ManagerComonent/Community";
import Task from "../ManagerComonent/Tasks";
import ProfilePage from "../AdminComponent/ProfilePage";
import Project from "../ManagerComonent/Project";
import { io } from "socket.io-client";
import ChatPage from "../ChatPage/ChatPage";
import { IoChatboxOutline } from "react-icons/io5";

const { Header, Sider, Content } = Layout;

const ManagerDashboard = () => {
  const [api, contextHolder] = notification.useNotification();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState("1");

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

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
          message: "Project Assigned",
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
        return <Project socket={socket.current} />;
      case "2":
        return <Community />;
      case "3":
        return <Task />;
      case "4":
        return <ProfilePage />;
      case "5":
        return (
         
            <ChatPage socket={socket.current} />
        );
      default:
        return <h2>Welcome to Dashboard</h2>;
    }
  };

  return (
    <>
      {contextHolder}
      <Layout style={{ height: "100vh", overflow: "hidden" }}>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          style={{
            height: "100vh",
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,
          }}
        >
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            onClick={(e) => setSelectedKey(e.key)}
            items={[
              { key: "1", icon: <ProjectOutlined />, label: "Projects & Teams" },
              { key: "2", icon: <TeamOutlined />, label: "Community" },
              { key: "3", icon: <FileTextOutlined />, label: "Manager Task" },
              { key: "4", icon: <ProfileOutlined />, label: "Profile" },
              { key: "5", icon: <IoChatboxOutline />, label: "Chat" },
            ]}
          />
        </Sider>

        <Layout
          style={{
            marginLeft: collapsed ? 80 : 200,
            transition: "margin-left 0.3s",
            height: "100vh",
            overflow: "hidden",
          }}
        >
          <Header
            style={{
              padding: 0,
              background: colorBgContainer,
              height: "64px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "16px",
                width: 64,
                height: 64,
              }}
            />
          </Header>

          <Content
            style={{
              margin: "16px",
              padding: 16,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              height: "calc(100vh - 96px)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {renderContent()}
          </Content>
        </Layout>
      </Layout>
    </>
  );
};

export default ManagerDashboard;
