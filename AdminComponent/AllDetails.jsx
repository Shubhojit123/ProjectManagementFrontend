import React, { useState, useEffect, useRef } from "react";
import {
    Row,
    Col,
    ConfigProvider,
    Progress,
    Modal,
    Tabs,
    Button,
    Tooltip,
    Badge,
    Avatar,
} from "antd";
import axios from "axios";
import { io } from "socket.io-client";
import {
    UserOutlined,
    TeamOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ProjectOutlined,
    PlusOutlined,
    EditOutlined,
} from "@ant-design/icons";
import { useAdmin } from "./AdminContext";
import Project from "./Component/Project";
import "./Admin.css";
import EditProject from "./Component/EditProject";
import AllManagers from "./Component/AllManagers";
import AllNotAssignUsers from "./Component/AllNotAssignUsers";
import CreateProject from "./Component/CreateProject";
import AntdCard from "../Utils/AntdCard";
import { useNavigate } from "react-router-dom";
import UserList from "../ChatPage/UserList";

const { TabPane } = Tabs;

function AllDetails() {
    const [data, setData] = useState({});
    const [members, setMembers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [alldetails, setAlldetails] = useState({});
    const [socketData, setSocketData] = useState({ type: "", data: [] });
    const { fetchAllDetails, getAllMemebers } = useAdmin();

    const navigate = useNavigate();
    const socket = useRef(null);

    // ✅ Socket connection
    useEffect(() => {
        const token = localStorage.getItem("taskmanagement");
        socket.current = io(import.meta.env.VITE_SOCKET, {
            auth: { token },
        });

        socket.current.on("connect", () => {
            console.log("Admin connected to socket:", socket.current.id);
        });

        socket.current.on("all-users", (msg) => {
            setSocketData(msg);
            console.log("All users from socket:", msg);
        });

        return () => {
            socket.current.disconnect();
        };
    }, []);

    // ✅ Fetch admin dashboard stats
    useEffect(() => {
        const fetchData = async () => {
            try {
                const BASE_URL = import.meta.env.VITE_URL;
                const res = await axios.get(`${BASE_URL}/admin/all-details`, {
                    withCredentials: true,
                });
                setData(res.data);
            } catch (error) {
                console.log(error);
            }
        };
        fetchData();
    }, []);

    // ✅ Fetch detailed info from AdminContext
    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await fetchAllDetails();
                setAlldetails(res.data);
            } catch (error) {
                console.log(error);
            }
        };
        fetchDetails();
    }, [fetchAllDetails]);

    // ✅ Fetch team members
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await getAllMemebers();
                setMembers(res.data.userData);
            } catch (error) {
                console.log(error);
            }
        };
        fetchMembers();
    }, [getAllMemebers]);

    const stats = [
        {
            title: "Total Projects",
            value: data.totalProject,
            icon: <ProjectOutlined />,
            gradient: "from-violet-500 via-purple-500 to-purple-600",
            glowColor: "shadow-purple-500/25",
        },
        {
            title: "Total Teams",
            value: data.totalTeam,
            icon: <TeamOutlined />,
            gradient: "from-pink-500 via-rose-700 to-red-500",
            glowColor: "shadow-pink-500/25",
        },
        {
            title: "Active Users",
            value: data.activeUser,
            icon: <UserOutlined />,
            gradient: "from-cyan-500 via-teal-500 to-blue-500",
            glowColor: "shadow-cyan-500/25",
        },
        {
            title: "Task Discuss",
            value: data.totalDiscuss,
            icon: <ClockCircleOutlined />,
            gradient: "from-orange-500 via-amber-500 to-yellow-500",
            glowColor: "shadow-orange-500/25",
            progress: data.totalDiscussProgress,
        },
    ];

    const handleProjectModal = () => setIsModalOpen(true);
    const handleCancel = () => setIsModalOpen(false);

    const handleMemberProfile = (member) => {
        navigate(`/auth/profile/${member._id}`, { state: { member } });
    };

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorBgBase: "#0f0f0f",
                    colorTextBase: "#ffffff",
                },
            }}
        >
            <div className="min-h-screen bg-black p-6 space-y-8">
                {/* ✅ Dashboard Stats */}
                <Row gutter={[24, 24]}>
                    {stats.map((stat, idx) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={idx}>
                            <div
                                className={`group relative p-[1px] rounded-2xl hover:scale-[1.02] transform transition-all duration-300 ${stat.glowColor}`}
                                style={{ borderRight: "1px solid gray" }}
                            >
                                <div className="bg-black/90 backdrop-blur-xl rounded-2xl p-6 h-full flex flex-col justify-between border border-white/10">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-white/80 text-sm font-medium mb-2">{stat.title}</p>
                                            <p className="text-3xl font-bold text-white mb-1">
                                                {socketData.type === "projects"
                                                    ? socketData.data.length
                                                    : stat.value}
                                            </p>
                                        </div>
                                        <div className="text-4xl text-white/70 group-hover:text-white transition-colors duration-300 group-hover:scale-110 transform">
                                            {stat.icon}
                                        </div>
                                    </div>

                                    {stat.progress !== undefined && (
                                        <div className="mt-4">
                                            <Progress
                                                percent={stat.progress}
                                                showInfo={false}
                                                strokeColor={{
                                                    "0%": "#8b5cf6",
                                                    "100%": "#06b6d4",
                                                }}
                                                trailColor="rgba(255,255,255,0.1)"
                                                strokeWidth={8}
                                                className="progress-modern"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>

                {/* ✅ Projects and Members */}
                <div className="w-full flex space-x-6 h-auto">
                    {/* Projects Section */}
                    <div className="flex-[3.5] bg-black/20 backdrop-blur-xl rounded-3xl p-6 text-white">
                        <div className="grid grid-cols-2 gap-6 h-full">
                            <AntdCard
                                title="Projects"
                                titleChild={`${alldetails.totalProject || 0} active projects`}
                                isExtra
                                cardBody={
                                    <div className="bg-black/40 backdrop-blur-xl rounded-xl w-full h-full">
                                        <div
                                            className="overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent rounded-lg"
                                            style={{ minHeight: "320px" }}
                                        >
                                            <Project />
                                        </div>
                                    </div>
                                }
                                onClick={handleProjectModal}
                            />

                            <AntdCard
                                title="Teams"
                                titleChild={`${alldetails.totalTeam || 0} teams`}
                                isExtra
                                cardBody={
                                    <div className="bg-black/40 backdrop-blur-xl rounded-xl w-full h-full border border-white/5 flex items-center justify-center">
                                        <div className="text-center text-white/60">
                                            <TeamOutlined className="text-4xl mb-4 text-white/40" />
                                            <p>Team analytics coming soon</p>
                                        </div>
                                    </div>
                                }
                            />
                        </div>
                    </div>

                    {/* Members Section */}
                    <div className="flex-[1.5] bg-black/20 backdrop-blur-xl border border-white/10 h-[75vh] rounded-3xl p-6 text-white flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                Team Members
                            </h2>
                            <Badge count={members?.length || 0} showZero color="#6366f1" />
                        </div>

                        <div className="flex-1 overflow-hidden space-y-3 scrollbar-thin scrollbar-thumb-gray-600/50 scrollbar-track-transparent pr-2">
                            {socket.current && <UserList socket={socket.current} admin={true} />}
                        </div>
                    </div>
                </div>

                {/* ✅ Modal for Project Management */}
                <Modal
                    title={
                        <div className="flex items-center gap-3 p-1">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                <ProjectOutlined className="text-white text-lg" />
                            </div>
                            <div>
                                <h3 className="text-slate-100 text-xl font-semibold m-0">Project Hub</h3>
                                <p className="text-slate-400 text-sm m-0">Manage projects and teams</p>
                            </div>
                        </div>
                    }
                    open={isModalOpen}
                    onCancel={handleCancel}
                    className="modern-modal"
                    width={"100%"}
                    centered
                    destroyOnClose
                    footer={null}
                    maskStyle={{
                        backdropFilter: "blur(8px)",
                        backgroundColor: "rgba(15, 23, 42, 0.8)",
                    }}
                >
                    <div className="bg-slate-800/50 border-t border-slate-700/30">
                        <Tabs defaultActiveKey="1" size="large" className="professional-tabs">
                            <TabPane
                                tab={
                                    <div className="flex items-center gap-2 px-6 py-3 text-slate-300 hover:text-blue-400 hover:bg-slate-700/50 rounded-t-lg transition-all duration-200 group">
                                        <EditOutlined className="text-base group-hover:scale-110 transition-transform duration-200" />
                                        <span className="font-medium">Edit Status</span>
                                    </div>
                                }
                                key="1"
                            >
                                <div className="p-6 bg-slate-800/30">
                                    <EditProject />
                                </div>
                            </TabPane>

                            <TabPane
                                tab={
                                    <div className="flex items-center gap-2 px-6 py-3 text-slate-300 hover:text-orange-400 hover:bg-slate-700/50 rounded-t-lg transition-all duration-200 group">
                                        <UserOutlined className="text-base group-hover:scale-110 transition-transform duration-200" />
                                        <span className="font-medium">Managers</span>
                                    </div>
                                }
                                key="2"
                            >
                                <div className="p-6 bg-slate-800/30">
                                    <AllManagers />
                                </div>
                            </TabPane>

                            <TabPane
                                tab={
                                    <div className="flex items-center gap-2 px-6 py-3 text-slate-300 hover:text-green-400 hover:bg-slate-700/50 rounded-t-lg transition-all duration-200 group">
                                        <PlusOutlined className="text-base group-hover:scale-110 transition-transform duration-200" />
                                        <span className="font-medium">Create</span>
                                    </div>
                                }
                                key="3"
                            >
                                <div className="p-6 bg-slate-800/30">
                                    <CreateProject />
                                </div>
                            </TabPane>

                            <TabPane
                                tab={
                                    <div className="flex items-center gap-2 px-6 py-3 text-slate-300 hover:text-purple-400 hover:bg-slate-700/50 rounded-t-lg transition-all duration-200 group">
                                        <TeamOutlined className="text-base group-hover:scale-110 transition-transform duration-200" />
                                        <span className="font-medium">Assign</span>
                                    </div>
                                }
                                key="4"
                            >
                                <div className="p-6 bg-slate-800/30">
                                    <AllNotAssignUsers />
                                </div>
                            </TabPane>
                        </Tabs>
                    </div>
                </Modal>
            </div>
        </ConfigProvider>
    );
}

export default AllDetails;
