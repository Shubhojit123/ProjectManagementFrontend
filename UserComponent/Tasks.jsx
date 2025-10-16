import axios from 'axios';
import React, { useEffect, useState, useMemo, useRef } from 'react'
import { Layout, Button, Modal, Form, Input, Segmented, List, Badge, notification,ConfigProvider } from "antd";
import { AppstoreOutlined, BarsOutlined, BellOutlined } from '@ant-design/icons';
const { Header } = Layout
const BASE_URL = import.meta.env.VITE_URL
import Drag from './Drag';
import dayjs from "dayjs";
import { io } from "socket.io-client";
import './user.css'

function Tasks() {

  const [api, contextHolder] = notification.useNotification();
  const [data, setData] = useState(null);
  const [PendingData, setPendingData] = useState(null);
  const [isProgress, setInProgress] = useState(null);
  const [disucss, setDiscuss] = useState(null);
  const [deployed, setDeployed] = useState(null);
  const [isKanban, setIsKanban] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notifications, setNotification] = useState(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const fetchTask = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/tasks`, { withCredentials: true });
      setData(res.data.message.reverse());
    } catch (error) {
      console.log(error);
    }
  };
  const handleChange = (value) => {
    if (value === "Kanban") {
      setIsKanban(true);
    } else {
      setIsKanban(false);
    }
  };
  let socket = useRef(null);






  const dividedData = () => {
    if (!data) return;

    const PendingDatas = data
      .filter(task => task.status === "Pending")
      .map(task => ({ ...task, formattedEndDate: task.endDate ? dayjs(task.endDate).format("DD MMM YYYY") : "N/A" }));

    const ProcessData = data
      .filter(task => task.status === "Process")
      .map(task => ({ ...task, formattedEndDate: task.endDate ? dayjs(task.endDate).format("DD MMM YYYY") : "N/A" }));

    const DicussionData = data
      .filter(task => task.status === "Discuss")
      .map(task => ({ ...task, formattedEndDate: task.endDate ? dayjs(task.endDate).format("DD MMM YYYY") : "N/A" }));

    const DeployData = data
      .filter(task => task.status === "Complete")
      .map(task => ({ ...task, formattedEndDate: task.endDate ? dayjs(task.endDate).format("DD MMM YYYY") : "N/A" }));

    setPendingData(PendingDatas);
    setInProgress(ProcessData);
    setDeployed(DeployData);
    setDiscuss(DicussionData);
  };


  useEffect(() => {
    fetchTask();
    const SOCKET_URL = import.meta.env.VITE_SOCKET;
    console.log("Socket" + SOCKET_URL)
    const token = localStorage.getItem("taskmanagement");
    socket.current = io(SOCKET_URL, { auth: { token }, });

    socket.current.on("connect", () => {
      console.log("User connected to socket:", socket.current.id);
    });

    socket.current.on("connect_error", (err) => {
      console.log("Socket connect error:", err.message);
    });


    socket.current.on("all-tasks", (tasksFromServer) => {
      setData(tasksFromServer.reverse());
      dividedData(tasksFromServer.reverse());
    });


    socket.current.on("user-notification", (notificaionMsg) => {
      setNotification(notificaionMsg);
      api.open({
        message: <span style={{ color: "white" }}>Task Given</span>,
        description: <span style={{ color: "white" }}>{notificaionMsg}</span>,
        duration: 10,
        style: {
          backgroundColor: "#333",
        },
        className: 'custom-notification'
      });

    })

    return () => {
      socket.current.off("all-tasks");
    };
  }, []);


  useEffect(() => {
    if (data) dividedData();
  }, [data]);


  const UserData = useMemo(() => ({
    "Pending": PendingData,
    "Process": isProgress,
    "Discuss": disucss,
    "Complete": deployed
  }), [PendingData, isProgress, disucss, deployed]);


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
    <div>
      {contextHolder}
      <Layout className='sticky '>

        <Header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#000",
            padding: "0 20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Segmented
              style={{
                backgroundColor: "#111",
                color: "#fff",
                border: "1px solid #333",
                borderRadius: "6px",
              }}
            // options={[
            //   { value: "List", icon: <BarsOutlined style={{ color: "#fff" }} /> },
            //   { value: "Kanban", icon: <AppstoreOutlined style={{ color: "#fff" }} /> },
            // ]}
            />
          </div>

          <div style={{ cursor: "pointer" }} onClick={openModal}>
            <Badge dot={notifications !== null} offset={[-2, 2]}>
              <BellOutlined style={{ color: "#fff", fontSize: "20px" }} />
            </Badge>
          </div>

          {/* Modal */}
          <Modal
            title="Notifications"
            open={isModalOpen}
            onCancel={closeModal}
            footer={null}
            className='border-gray-600'
          >
            {notifications === null ? (<p>No new notifications</p>) : (
              <div>
                <p className='text-white'>{notifications}</p>
              </div>)}
          </Modal>
        </Header>


      </Layout>

      {isKanban ? (<Drag values={UserData}></Drag>) : (<List values={UserData} />)}



    </div>
    </ConfigProvider>
  )
}

export default Tasks