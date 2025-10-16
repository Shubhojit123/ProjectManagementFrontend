import React, { useState } from "react";
import { useAdmin } from "../AdminContext";
import { Input, Button, Dropdown, Menu, Pagination, Card, Typography, Spin, Select } from "antd";
import {
  EditOutlined,
  SearchOutlined,
  ProjectOutlined,
  TeamOutlined,
  UserOutlined,
  CalendarOutlined,
  MoreOutlined
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const { Search } = Input;
const { Text } = Typography;
const { Option } = Select;

function EditProject() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const { getAllProjects, updateProjectStatus } = useAdmin();
  const queryClient = useQueryClient();

  const { data: projectsData, isLoading, isError } = useQuery({
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
    },
  });

  const statusConfig = {
    "Not Started": { color: "#ef4444", bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" },
    "Progress": { color: "#f59e0b", bg: "bg-yellow-50", text: "text-yellow-600", dot: "bg-yellow-500" },
    "Completed": { color: "#10b981", bg: "bg-green-50", text: "text-green-600", dot: "bg-green-500" }
  };

  const statusOptions = [
    { value: "Not Started", label: "Not Started" },
    { value: "Progress", label: "In Progress" },
    { value: "Completed", label: "Completed" }
  ];

  const handleStatusChange = (projectId, newStatus) => {
    updateStatusMutation.mutate({ projectId, newStatus });
  };

  const getStatusDropdown = (project) => (
    <Menu
      items={statusOptions.map(status => ({
        key: status.value,
        label: (
          <div
            className="flex items-center gap-2 px-2 py-1 text-slate-700 hover:text-slate-900"
            onClick={() => handleStatusChange(project._id, status.value)}
          >
            <div className={`w-2 h-2 rounded-full ${statusConfig[status.value]?.dot}`} />
            <span>{status.label}</span>
          </div>
        ),
      }))}
    />
  );

  // Filter and paginate projects
  const filteredProjects = projectsData?.filter((project) => {
    const matchesSearch = project.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || project.status === selectedStatus;
    return matchesSearch && matchesStatus;
  }) || [];

  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getStats = () => {
    if (!projectsData) return { total: 0, notStarted: 0, progress: 0, completed: 0 };
    return {
      total: projectsData.length,
      notStarted: projectsData.filter(p => p.status === "Not Started").length,
      progress: projectsData.filter(p => p.status === "Progress").length,
      completed: projectsData.filter(p => p.status === "Completed").length,
    };
  };

  const stats = getStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <Text type="danger">Failed to load projects</Text>
      </div>
    );
  }

  return (
    <div className="bg-black rounded-lg border border-slate-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <EditOutlined className="text-white text-sm" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Edit Projects</h3>
              <p className="text-sm text-slate-600">Manage project status</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="text-center p-2 bg-slate-50 rounded-md">
            <div className="text-lg font-bold text-slate-900">{stats.total}</div>
            <div className="text-xs text-slate-600">Total</div>
          </div>
          <div className="text-center p-2 bg-red-50 rounded-md">
            <div className="text-lg font-bold text-red-600">{stats.notStarted}</div>
            <div className="text-xs text-slate-600">Not Started</div>
          </div>
          <div className="text-center p-2 bg-yellow-50 rounded-md">
            <div className="text-lg font-bold text-yellow-600">{stats.progress}</div>
            <div className="text-xs text-slate-600">Progress</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded-md">
            <div className="text-lg font-bold text-green-600">{stats.completed}</div>
            <div className="text-xs text-slate-600">Completed</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3">
          <div className="flex-1">
            <Search
              placeholder="Search projects..."
              allowClear
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-md"
            />
          </div>
          <Select
            value={selectedStatus}
            onChange={setSelectedStatus}
            className="w-32"
          >
            <Option value="all">All Status</Option>
            <Option value="Not Started">Not Started</Option>
            <Option value="Progress">Progress</Option>
            <Option value="Completed">Completed</Option>
          </Select>
        </div>
      </div>

      {/* Projects List */}
      <div className="p-4">
        <div className="space-y-2 mb-4" style={{ minHeight: '400px' }}>
          {paginatedProjects.map((project) => {
            const config = statusConfig[project.status] || statusConfig["Not Started"];
            return (
              <Card
                key={project._id}
                className="hover:shadow-md transition-all duration-200 border border-slate-200 hover:border-slate-300"
                bodyStyle={{ padding: '12px 16px' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ProjectOutlined className="text-slate-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white truncate">
                        {project.projectName}
                      </h4>
                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                        <div className="flex items-center gap-1">
                          <TeamOutlined />
                          <span>{project.teamsDetails?.length || 0} teams</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <UserOutlined />
                          <span className="truncate max-w-20">
                            {project.manager?.username || 'No manager'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarOutlined />
                          <span>
                            {project.startDate 
                              ? new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                              : 'N/A'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Status Badge */}
                    <div className={`flex items-center gap-2 px-2 py-1 rounded-full ${config.bg}`}>
                      <div className={`w-2 h-2 rounded-full ${config.dot}`} />
                      <span className={`text-xs font-medium ${config.text}`}>
                        {project.status === "Progress" ? "In Progress" : project.status}
                      </span>
                    </div>

                    {/* Action Dropdown */}
                    <Dropdown
                      overlay={getStatusDropdown(project)}
                      trigger={['click']}
                      placement="bottomRight"
                    >
                      <Button
                        type="text"
                        size="small"
                        icon={<MoreOutlined />}
                        className="text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                        loading={updateStatusMutation.isLoading}
                      />
                    </Dropdown>
                  </div>
                </div>
              </Card>
            );
          })}

          {paginatedProjects.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500">
              <ProjectOutlined className="text-3xl mb-2 opacity-50" />
              <Text className="text-slate-500">No projects found</Text>
              {searchTerm && (
                <Text className="text-xs text-slate-400 mt-1">
                  Try adjusting your search criteria
                </Text>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredProjects.length > pageSize && (
          <div className="flex justify-center pt-4 border-t border-slate-200">
            <Pagination
              current={currentPage}
              total={filteredProjects.length}
              pageSize={pageSize}
              onChange={setCurrentPage}
              showSizeChanger={false}
              showQuickJumper={false}
              showTotal={(total, range) => 
                `${range[0]}-${range[1]} of ${total} projects`
              }
              size="small"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default EditProject;