import React, { useEffect, useState } from "react";
import { useAdmin } from "../AdminContext";
import {
    StopOutlined,
    BarChartOutlined,
    CheckCircleOutlined,
    
} from "@ant-design/icons";
import { useQuery } from '@tanstack/react-query'

function Project() {
    const [searchTerm, setSearchTerm] = useState("");
    const { getAllProjects, fetchAllDetails } = useAdmin();


    const { data: projects = [] } = useQuery({
        queryKey: ["projects"],
        queryFn: async () => {
            const res = await getAllProjects();
            return res.data.projects;
        },
    });


    const getStatusIcon = (status) => {
        if (status === "Not Started") {
            return <StopOutlined style={{ color: "#ef4444", fontSize: "20px" }} />;
        }
        if (status === "Progress") {
            return <BarChartOutlined style={{ color: "#facc15", fontSize: "20px" }} />;
        }
        if (status === "Completed") {
            return <CheckCircleOutlined style={{ color: "#22c55e", fontSize: "20px" }} />;
        }
        return <StopOutlined style={{ color: "#9ca3af", fontSize: "20px" }} />;
    };


    // filter projects by search
    const filteredProjects = projects.filter((project) =>
        project.projectName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-b rounded-2xl text-white h-full flex flex-col w-full">
            {/* Search Bar */}
            <input
                type="text"
                placeholder="Search projects..."
                className="m-2 mb-3 p-2 rounded-lg text-white bg-black/30 border-gray-900 border-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Projects List */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 w-full max-h-[260px]">
                <div className="space-y-3 w-full">
                    {filteredProjects?.map((project) => (
                        <div
                            key={project._id}
                            className="flex items-center justify-between p-3 bg-black/30 rounded-lg hover:bg-black/50 transition w-full"
                        >
                            <div className="flex flex-col">
                                <p className="font-semibold truncate">{project.projectName}</p>
                                <p className="text-sm text-gray-300">
                                    Teams: {project.teamsDetails?.length || 0}
                                </p>
                            </div>

                            <div className="relative group flex items-center">
                                {getStatusIcon(project.status)}

                                <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 ml-[-10px] rounded-md opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 whitespace-nowrap shadow-lg">
                                    {project.status}
                                </span>
                            </div>
                        </div>
                    ))}

                    {filteredProjects.length === 0 && (
                        <p className="text-center text-gray-400 text-sm">No projects found</p>
                    )}
                </div>
            </div>

        </div>
    );
}

export default Project;
