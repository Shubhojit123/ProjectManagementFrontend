import React, { useEffect, useState } from 'react'
import { IoFilterSharp } from "react-icons/io5";
import { FaPlus } from "react-icons/fa6";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdmin } from './AdminContext';
import { SiTask } from "react-icons/si";
import { MdOutlineShowChart } from "react-icons/md";
import { BsCalendar3Fill } from "react-icons/bs";
import dayjs from "dayjs";
import { Tooltip, Tag, Dropdown, Drawer } from "antd";
import { CheckCircleOutlined, BellOutlined, ClockCircleOutlined, MoreOutlined, CloseCircleOutlined, MinusOutlined, BarChartOutlined } from "@ant-design/icons";
import { RiCheckboxBlankCircleLine } from "react-icons/ri";
import { PiCircleHalfTiltFill } from "react-icons/pi";
import { BsCircleFill } from "react-icons/bs";
import { GoCheckCircleFill } from "react-icons/go";
import { BiCheckDouble } from "react-icons/bi";
import { FiInbox } from "react-icons/fi";


function Projects({ socket }) {
    const [notifications, setNotifications] = useState([]);


    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem("adminNotify"));
        console.log(localStorage.getItem("adminNotify"))
        setNotifications(Array.isArray(saved) ? saved : []);
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleNotification = (data) => {
            setNotifications(prev => {
                const updated = [...prev, data];
                localStorage.setItem("adminNotify", JSON.stringify(updated));
                return updated;
            });
        };

        socket.on("admin-notification", handleNotification);

        return () => {
            socket.off("admin-notification", handleNotification);
        };
    }, [socket]);



    const [tooltipOpen, setTooltipOpen] = useState(false);
    const [tooltipOpenMap, setTooltipOpenMap] = useState({});
    const [drawerOpen, setDrawerOpen] = useState(false);
    const { getAllProjects, updateProjectStatus } = useAdmin();
    const queryClient = useQueryClient();

    const { data: projects = [] } = useQuery({
        queryKey: ["projects"],
        queryFn: async () => {
            const res = await getAllProjects();
            return res.data.projects;
        },

    });


    const updateStatusMutation = useMutation({
        mutationFn: ({ projectId, newStatus }) =>
            updateProjectStatus(projectId, newStatus),
        onSuccess: (_, { projectId, newStatus }) => {
            queryClient.setQueryData(["projects"], (oldProjects) =>
                oldProjects?.map((p) =>
                    p._id === projectId ? { ...p, status: newStatus } : p
                )
            );
            handleTooltipOpenChange(projectId, false);
        },
    });

    const statusMenuItems = [
        { key: "Completed", label: "Completed" },
        { key: "Not Started", label: "Not Started" },
        { key: "Progress", label: "Progress" },
    ];

    const statusTooltipContent = (projectId, handleStatusChange) => (
        <div className="flex flex-col gap-2 text-xs">
            <span
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-700 rounded px-2 py-1"
                onClick={() => handleStatusChange(projectId, "Completed")}
            >
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-white">Completed</span>
            </span>

            <span
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-700 rounded px-2 py-1"
                onClick={() => handleStatusChange(projectId, "Not Started")}
            >
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="text-white">Not Started</span>
            </span>

            <span
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-700 rounded px-2 py-1"
                onClick={() => handleStatusChange(projectId, "Progress")}
            >
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span className="text-white">In Progress</span>
            </span>
        </div>
    );

    const handleStatusChange = (projectId, newStatus) => {
        updateStatusMutation.mutate({ projectId, newStatus });
    };

    const handleTooltipOpenChange = (projectId, open) => {
        setTooltipOpenMap((prev) => ({ ...prev, [projectId]: open }));
    };

    function handelDeleteNotification()
    {
        localStorage.removeItem("adminNotify")
    }



    return (
        <>
            <div className="container mx-auto m-2 border border-gray-700 flex flex-col h-[97vh] rounded-sm w-[98%]">
                <div className="w-full border-b border-gray-700 p-2 flex items-center justify-between">
                    <div className="flex items-center gap-4 pl-2">
                        <p className="text-sm font-semibold">{`Projects (${projects.length})`}</p>
                        <button className="flex items-center gap-1 text-sm font-semibold hover:bg-gray-900 transition duration-300 p-2 rounded-sm cursor-pointer">
                            <IoFilterSharp /> Filter
                        </button>
                    </div>

                    <div className="relative flex items-center gap-2">
                        <button
                            onClick={() => setDrawerOpen(true)}
                            className="group flex items-center gap-1 text-[15px] font-medium 
                                    hover:bg-gray-900 transition duration-300 p-2 rounded-sm cursor-pointer rounded text-white">
                            <p className="text-gray-400 group-hover:text-white">
                                <FaPlus />
                            </p>
                            <p className='text-[14px] text-gray-400 group-hover:text-white' onClick={() => setDrawerOpen(true)}>Add Project</p>
                        </button>
                        <Tooltip
                            title={
                                <div className="flex flex-col gap-2 max-w-xs max-h-60 overflow-y-auto">
                                    <p className="flex items-center justify-between text-white font-bold text-sm border-b border-gray-600 pb-1">
                                        <span>Notifications</span>
                                        <BiCheckDouble className="text-green-600 text-2xl cursor-pointer hover:text-green-400 transition 1s" onClick={handelDeleteNotification}/>
                                    </p>
                                    {notifications.length > 0 ? (
                                        notifications.map((note, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-2 rounded hover:bg-gray-700 transition duration-200 cursor-pointer"
                                            >
                                                <p className="text-sm text-white">{`${index + 1}. ${note}`}</p>

                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-300">No new notifications</p>
                                    )}
                                </div>
                            }
                            placement="bottomRight"
                            color="#1f2937"
                            arrow={true}
                        >
                            <div className="relative cursor-pointer">
                                <BellOutlined className="w-8 h-8 text-gray-400 hover:text-white text-xl" />
                                {notifications.length > 0 && (
                                    <span className="absolute top-1 left-2.5 w-3 h-3 bg-red-500 rounded-full border border-gray-900"></span>
                                )}
                            </div>
                        </Tooltip>
                    </div>
                </div>



                <div className="w-full border-b border-gray-700 p-2 flex items-center justify-between">
                    <div className="flex items-center gap-4 pl-2 justify-between w-[100%]">
                        <div className='w-[45%]'>
                            <p className='text-[12px] opacity-85'>Name</p>
                        </div>
                        <div className='w-[55%] flex flex-row'>
                            <p className='text-[12px] opacity-85 w-[25%]'>Health</p>
                            <p className='text-[12px] opacity-85 w-[20%]'>Lead</p>
                            <p className='text-[12px] opacity-85 w-[25%]'>Target Date</p>
                            <p className='text-[12px] opacity-85 w-[20%]'>Status</p>
                            <p className='text-[12px] opacity-85 w-[10%]'></p>
                        </div>
                    </div>
                </div>

                <div className="max-h-[100%] overflow-y-auto">
                    {projects?.map((proj) => (
                        <div
                            key={proj.id}
                            className="w-full p-2 flex items-center justify-between "
                        >
                            <div className="flex items-center gap-4 pl-2 justify-between w-full h-10 hover:bg-gray-900 transition 1s" >
                                <div className="w-[45%] flex items-center gap-3">
                                    <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-gray-700 transition-colors">
                                        <SiTask className="text-gray-400 text-sm" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white truncate">
                                            {proj.projectName}
                                        </p>

                                    </div>
                                </div>

                                <div className="w-[55%] flex flex-row items-center">
                                    <div className="flex items-center gap-1 w-[25%]">
                                        <MdOutlineShowChart className="w-4 h-4 rounded-full bg-green-700 text-green-300 p-1" />
                                        <span className="text-[10px] text-green-700 font-semibold">
                                            {proj.health || "On track"}
                                        </span>
                                    </div>

                                    <div className="text-[12px] w-[20%] flex items-center gap-2">
                                        <Tooltip placement="right" color="#1f2937" title={proj.manager?.username || "No Manager"}
                                            overlayInnerStyle={{
                                                backgroundColor: "#1f2937",
                                                color: "#fff",
                                                fontSize: "12px",
                                                borderRadius: "6px",
                                                padding: "4px 8px",
                                            }}
                                        >
                                            <img
                                                src={
                                                    proj.manager
                                                        ? `https://api.dicebear.com/6.x/initials/svg?seed=${proj.manager.username}`
                                                        : "https://api.dicebear.com/6.x/initials/svg?seed=Project"
                                                }
                                                alt={proj.manager?.username || "No Manager"}
                                                className="w-6 h-6 rounded-full object-cover cursor-pointer"
                                            />
                                        </Tooltip>
                                    </div>

                                    <div className="text-[12px] w-[18%] flex items-center gap-1">
                                        <Tooltip
                                            placement="top"
                                            arrow={{ pointAtCenter: true }}
                                            color="#1f2937"
                                            overlayInnerStyle={{
                                                backgroundColor: "#1f2937",
                                                color: "#fff",
                                                fontSize: "12px",
                                                borderRadius: "6px",
                                                padding: "4px 8px",
                                            }}
                                            title={proj.endDate ? dayjs(proj.endDate).format("DD MMM YYYY") : "No target date"}
                                        >
                                            <div className="flex items-center gap-1 cursor-pointer">
                                                <BsCalendar3Fill />
                                                <span>{proj.endDate ? dayjs(proj.endDate).format("MMM YY") : "NA"}</span>
                                            </div>
                                        </Tooltip>
                                    </div>


                                    <div className="text-[12px] w-[20%] flex items-center justify-center">
                                        <Tooltip
                                            title={proj.status || "No Status"}
                                            placement="left"
                                            color={
                                                proj.status === "Completed"
                                                    ? "green"
                                                    : proj.status === "Not Started"
                                                        ? "red"
                                                        : proj.status === "In Progress"
                                                            ? "blue"
                                                            : "gray"
                                            }
                                            overlayInnerStyle={{
                                                color: "#fff",
                                                fontSize: "12px",
                                                borderRadius: "6px",
                                                padding: "4px 8px",
                                            }}
                                            arrow={{ pointAtCenter: true }}
                                        >
                                            <span className="cursor-pointer text-lg">
                                                {proj.status === "Completed" ? (
                                                    <GoCheckCircleFill style={{ color: "#22c55e", fontSize: "20px" }} />
                                                ) : proj.status === "Progress" ? (
                                                    <PiCircleHalfTiltFill style={{ color: "#facc15", fontSize: "20px" }} />
                                                ) : proj.status === "Not Started" ? (
                                                    <RiCheckboxBlankCircleLine style={{ color: "#ef4444", fontSize: "20px" }} />
                                                ) : (
                                                    <MinusOutlined className="text-gray-400" />
                                                )}
                                            </span>
                                        </Tooltip>
                                    </div>
                                    <div className="w-[10%] flex justify-center">
                                        <Tooltip
                                            placement="right"
                                            open={tooltipOpenMap[proj._id] || false}
                                            onOpenChange={(open) => handleTooltipOpenChange(proj._id, open)}
                                            arrow={{ pointAtCenter: true }}
                                            overlayInnerStyle={{
                                                backgroundColor: "#1f2937",
                                                borderRadius: "10px",
                                                padding: "10px 14px",
                                                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                                            }}
                                            title={statusTooltipContent(proj._id, handleStatusChange)}
                                        >
                                            <MoreOutlined
                                                style={{ fontSize: "20px", cursor: "pointer", color: "#9ca3af" }}
                                                onClick={() => handleTooltipOpenChange(proj._id, true)}
                                            />
                                        </Tooltip>
                                    </div>




                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {projects.length < 1 && (
                    <>
                        <div className=' w-[100%] h-[90vh] flex justify-center items-center'>
                            <div>
                                <FiInbox className='text-9xl text-white opacity-50' />
                                <button
                                    onClick={() => setDrawerOpen(true)}
                                    className="group flex items-center gap-1 text-2xl font-medium  bg-gray-700
                                    hover:bg-gray-900 transition duration-300 p-2 rounded-sm cursor-pointer rounded text-white">
                                    <p className="text-white group-hover:text-white">
                                        <FaPlus />
                                    </p>
                                    <p className='text-xl text-white group-hover:text-white' >Add Project</p>
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <Drawer
                title="Add Project"
                closable={{ 'aria-label': 'Close Button' }}
                onClose={() => setDrawerOpen(false)}
                open={drawerOpen}
                style={{ backgroundColor: "#000", borderLeft: "1px solid #555" }}
            ></Drawer>
        </>
    )
}

export default Projects