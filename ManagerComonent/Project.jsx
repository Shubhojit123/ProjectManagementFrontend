import React, { useState, useEffect } from "react";
import {
  Table,
  Modal,
  Tag,
  Button,
  Form,
  Input,
  message,
  DatePicker,
  Spin,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";

function Project({ socket }) {
  const [messageApi, contextHolder] = message.useMessage();
  const VITE_URL = import.meta.env.VITE_URL;

  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedTaskTitle, setSelectedTaskTitle] = useState("");
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedComments, setSelectedComments] = useState([]);
  const [openTeamsModal, setOpenTeamsModal] = useState(false);
  const [openUsersModal, setOpenUsersModal] = useState(false);
  const [isProjectModal, setIsProjectModal] = useState(false);
  const [isTeamModal, setIsTeamModal] = useState(false);
  const [isAssignModal, setIsAssignModal] = useState(false);
  const [assignUsersModal, setAssignUsersModal] = useState(false);

  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [isShowTaskModalOpen, setIsShowTaskModalOpen] = useState(false);

  const [notAssignedUsers, setNotAssignedUsers] = useState([]);
  const [selectedAssignUsers, setSelectedAssignUsers] = useState([]);
  const [assigningTeamId, setAssigningTeamId] = useState(null);

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedUsername, setSelectedUsername] = useState("");

  const [taskForm] = Form.useForm();
  const [projectForm] = Form.useForm();
  const [teamForm] = Form.useForm();

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "orange";
      case "In Progress": return "blue";
      case "Completed": return "green";
      default: return "default";
    }
  };

  const openCommentModal = (task) => {
    if (!task.comments?.length) return messageApi.info("No comments for this task");
    setSelectedComments(task.comments);
    setSelectedTaskTitle(task.title);
    setIsCommentModalOpen(true);
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${VITE_URL}/api/v1/manager/project-list`, { withCredentials: true });
      setProjects(Array.isArray(res.data) ? res.data.reverse() : []);
    } catch (err) {
      console.error(err);
      messageApi.error("Failed to fetch projects");
    }
  };

  useEffect(() => {
    fetchProjects();

    if (!socket) return;
    socket.on("new-Project", (data) => {
      console.log("New project received:", data);
      setProjects(data);
    });

    return () => socket.off("new-Project");
  }, [socket]);

  const handleProjectClick = async (projectId) => {
    try {
      const res = await axios.get(`${VITE_URL}/api/v1/manager/teams-list?projectid=${projectId}`, { withCredentials: true });
      setTeams(Array.isArray(res.data) ? res.data : []);
      setSelectedProjectId(projectId);
      const proj = projects.find((p) => p._id === projectId);
      setSelectedProject(proj || null);
      setOpenTeamsModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserTasks = async (userId, username) => {
    try {
      setLoadingTasks(true);
      const res = await axios.get(`${VITE_URL}/api/v1/manager/task-by-id?userId=${userId}`, { withCredentials: true });
      setTasks(res.data.task || []);
      setSelectedUsername(username || "");
      setIsShowTaskModalOpen(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleTeamClick = async (teamId) => {
    try {
      const res = await axios.get(`${VITE_URL}/api/v1/manager/user-team?teamsid=${teamId}`, { withCredentials: true });
      setUsers(Array.isArray(res.data) ? res.data : []);
      setOpenUsersModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAssignTask = (userId) => {
    setSelectedUserId(userId);
    taskForm.resetFields();
    setIsAssignModal(true);
  };

  const handleAssignTask = async (values) => {
    try {
      const taskData = {
        title: values.title,
        description: values.description,
        endDate: values.endDate ? values.endDate.toISOString() : null,
        userId: selectedUserId,
      };
      await axios.post(`${VITE_URL}/api/v1/manager/assign-task`, taskData, { withCredentials: true });
      messageApi.success("Task assigned successfully!");
      setIsAssignModal(false);
      fetchProjects();
    } catch (err) {
      console.error(err);
      messageApi.error("Failed to assign task");
    }
  };

  const handleOpenAssignUsers = async (teamId) => {
    try {
      const res = await axios.get(`${VITE_URL}/api/v1/manager/notassign`, { withCredentials: true });
      setNotAssignedUsers(res.data.notAssign || []);
      setAssigningTeamId(teamId);
      setAssignUsersModal(true);
      setSelectedAssignUsers([]);
    } catch (err) {
      console.error(err);
      messageApi.error("Failed to fetch users");
    }
  };

  const handleAssignSelectedUsers = async () => {
    if (!selectedAssignUsers.length) return messageApi.warning("Please select at least one user");

    try {
      await axios.put(`${VITE_URL}/api/v1/manager/set-user`,
        { assignUser: selectedAssignUsers, teamId: assigningTeamId },
        { withCredentials: true }
      );
      messageApi.success("Users assigned successfully!");
      setAssignUsersModal(false);
      fetchProjects();
    } catch (err) {
      console.error(err);
      messageApi.error("Failed to assign users");
    }
  };

  const handleCreateProject = async (values) => {
    try {
      await axios.post(`${VITE_URL}/api/v1/manager/create-project`, {
        projectName: values.projectName,
        endDate: values.endDate ? values.endDate.toISOString() : null,
      }, { withCredentials: true });
      messageApi.success("Project created successfully!");
      projectForm.resetFields();
      setIsProjectModal(false);
      fetchProjects();
    } catch (error) {
      console.error(error);
      messageApi.error("Failed to create project");
    }
  };

  const handleCreateTeam = async (values) => {
    try {
      await axios.post(`${VITE_URL}/api/v1/manager/create-team`,
        { projectId: selectedProjectId, teamName: values.teamName },
        { withCredentials: true }
      );
      messageApi.success("Team created successfully!");
      teamForm.resetFields();
      setIsTeamModal(false);
      fetchProjects();
    } catch (error) {
      console.error(error);
      messageApi.error("Failed to create team");
    }
  };

  const handleCommentModalCancel = () => {
    setIsCommentModalOpen(false);
    setSelectedComments([]);
    setSelectedTaskTitle("");
  };
  const handleCommentModalCancel = () => {
    setIsCommentModalOpen(false);
    setSelectedComments([]);
    setSelectedTaskTitle("");
  };

  const projectColumns = [
    {
      title: "Project Name",
      dataIndex: "projectName",
      key: "projectName",
      render: (text, record) => (
        <Button type="link" onClick={() => handleProjectClick(record._id)}>
          {text}
        </Button>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "endDate",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Total Teams",
      dataIndex: "teamsDetails",
      key: "teamsDetails",
      render: (teams) => (
        <Tag color="blue">{Array.isArray(teams) ? teams.length : 0}</Tag>
      ),
    },
    {
      title: "Total Users",
      key: "totalUsers",
      render: (record) =>
        Array.isArray(record.teamsDetails)
          ? record.teamsDetails.reduce(
            (sum, t) => sum + (t.userAssign?.length || 0),
            0
          )
          : 0,
    },
    {
      title: "Action",
      key: "action",
      render: (record) => (
        <Button
          type="dashed"
          onClick={() => {
            setSelectedProjectId(record._id);
            setSelectedProject(record);
            setIsTeamModal(true);
          }}
        >
          + Create Team
        </Button>
      ),
    },
  ];

  const taskColumns = [
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "endDate",
      render: (date) => (date ? dayjs(date).format("DD MMM YYYY") : "—"),
    },
    {
      title: "Comments",
      key: "comments",
      render: (_, record) => (
        <Button size="small" onClick={() => openCommentModal(record)}>
          View Comments
        </Button>
      ),
    },
  ];

  return (
    <div>
      {contextHolder}
      <h2 className="text-lg font-bold mb-2">Projects</h2>

      <Button
        type="primary"
        style={{ marginBottom: "16px" }}
        onClick={() => setIsProjectModal(true)}
      >
        + Create Project
      </Button>

      <Table
        rowKey="_id"
        dataSource={Array.isArray(projects) ? projects : []}
        columns={projectColumns}
        pagination={{ pageSize: 5 }}
        bordered
      />

      {/* Teams Modal */}
      <Modal
        title={`Comments for "${selectedTaskTitle}"`}
        open={isCommentModalOpen}
        onCancel={handleCommentModalCancel}
        footer={null}
        width={400}
      >
        <ul>
          {selectedComments.map((cmt, index) => (
            <li key={index}>{cmt}</li>
          ))}
        </ul>
      </Modal>
      <Modal
        title="Teams"
        open={openTeamsModal}
        onCancel={() => setOpenTeamsModal(false)}
        footer={null}
      >
        <ul className="space-y-2">
          {(teams || []).map((t) => (
            <li key={t._id} className="flex items-center justify-between">
              <div>
                <Button type="link" onClick={() => handleTeamClick(t._id)}>
                  {t.teamName}
                </Button>
                <Tag color="green">Users: {t.userAssign?.length || 0}</Tag>
              </div>
              <Button size="small" onClick={() => handleOpenAssignUsers(t._id)}>
                Assign Users
              </Button>
            </li>
          ))}
        </ul>
      </Modal>

      {/* Users Modal */}
      <Modal
        title="Users"
        open={openUsersModal}
        onCancel={() => setOpenUsersModal(false)}
        footer={null}
        width={900}
      >
        <Table
          rowKey="_id"
          dataSource={Array.isArray(users) ? users : []}
          pagination={false}
          bordered
          columns={[
            {
              title: "Avatar",
              dataIndex: "profileImage",
              render: (img, record) =>
                img ? (
                  <img
                    src={img}
                    alt={record.username}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "linear-gradient(to right, orange, pink)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {record.username?.charAt(0).toUpperCase()}
                  </div>
                ),
            },
            { title: "Name", dataIndex: "username" },
            { title: "Email", dataIndex: "email" },
            {
              title: "Status",
              dataIndex: "userStatus",
              render: (status) => (
                <Tag color={status ? "green" : "red"}>
                  {status ? "Active" : "Inactive"}
                </Tag>
              ),
            },
            {
              title: "Task Assign",
              dataIndex: "taskAssign",
              render: (assign) => (
                <Tag color={assign ? "blue" : "default"}>
                  {assign ? "Assigned" : "Not Assigned"}
                </Tag>
              ),
            },
            {
              title: "Assign Task",
              key: "assignTask",
              render: (_, record) => (
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handleOpenAssignTask(record._id)}
                >
                  Assign Task
                </Button>
              ),
            },
            {
              title: "Show Tasks",
              key: "tasks",
              render: (_, record) => (
                <Button
                  type="primary"
                  size="small"
                  style={{ marginRight: 5 }}
                  onClick={() => {
                    setSelectedUserId(record._id);
                    fetchUserTasks(record._id, record.username);
                  }}
                >
                  Show Tasks
                </Button>
              ),
            },
          ]}
        />
      </Modal>

      {/* Show User Tasks Modal */}
      <Modal
        title={`Tasks of ${selectedUsername || "User"}`}
        open={isShowTaskModalOpen}
        onCancel={() => setIsShowTaskModalOpen(false)}
        footer={null}
        width={700}
      >
        {loadingTasks ? (
          <Spin />
        ) : tasks.length === 0 ? (
          <p>No tasks available</p>
        ) : (
          <Table
            dataSource={tasks}
            rowKey="_id"
            pagination={{ pageSize: 5 }}
            columns={taskColumns}
          />
        )}
      </Modal>

      {/* Assign Users Modal */}
      <Modal
        title="Assign Users"
        open={assignUsersModal}
        onCancel={() => setAssignUsersModal(false)}
        footer={null}
        width={700}
      >
        <Table
          rowKey="_id"
          dataSource={Array.isArray(notAssignedUsers) ? notAssignedUsers : []}
          pagination={{ pageSize: 5 }}
          rowSelection={{
            type: "checkbox",
            onChange: (selectedRowKeys) =>
              setSelectedAssignUsers(selectedRowKeys),
          }}
          columns={[
            { title: "Name", dataIndex: "username", key: "username" },
            { title: "Email", dataIndex: "email", key: "email" },
            {
              title: "Status",
              dataIndex: "userStatus",
              key: "status",
              render: (status) => (
                <Tag color={status ? "green" : "red"}>
                  {status ? "Active" : "Inactive"}
                </Tag>
              ),
            },
          ]}
        />
        <Button
          type="primary"
          style={{ marginTop: 16 }}
          block
          onClick={handleAssignSelectedUsers}
        >
          Assign Selected Users
        </Button>
      </Modal>

      {/* Assign Task Modal */}
      <Modal
        title="Assign Task"
        open={isAssignModal}
        onCancel={() => setIsAssignModal(false)}
        footer={null}
      >
        <Form form={taskForm} layout="vertical" onFinish={handleAssignTask}>
          <Form.Item
            name="title"
            label="Task Title"
            rules={[{ required: true, message: "Please enter task title" }]}
          >
            <Input placeholder="Enter task title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Task Description"
            rules={[
              { required: true, message: "Please enter task description" },
            ]}
          >
            <Input.TextArea rows={3} placeholder="Enter description" />
          </Form.Item>

          <Form.Item
            name="endDate"
            label="Task End Date"
            rules={[
              { required: true, message: "Please select task end date" },
              () => ({
                validator(_, value) {
                  console.log(selectedProject.createdAt)
                  if (!value || !selectedProject?.createdAt || !selectedProject?.endDate) {
                    return Promise.resolve();
                  }

                  const projectStart = dayjs(selectedProject.createdAt);
                  const projectEnd = dayjs(selectedProject.endDate);

                  if (value.isBefore(projectStart, "day")) {
                    return Promise.reject(
                      new Error("Task end date cannot be before project start date")
                    );
                  }

                  if (value.isAfter(projectEnd, "day")) {
                    return Promise.reject(
                      new Error("Task end date must be on or before project end date")
                    );
                  }

                  return Promise.resolve();
                },
              }),
            ]}
          >
            <DatePicker
              format="DD/MM/YYYY"
              style={{ width: "100%" }}
              disabledDate={(current) => {
                if (!current || !selectedProject) return false;
                const projectStart = dayjs(selectedProject.createdAt).startOf("day");
                const projectEnd = dayjs(selectedProject.endDate).endOf("day");
                return current < projectStart || current > projectEnd;
              }}
            />

          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Assign Task
          </Button>
        </Form>
      </Modal>

      {/* Create Project Modal */}
      <Modal
        title="Create Project"
        open={isProjectModal}
        onCancel={() => setIsProjectModal(false)}
        footer={null}
      >
        <Form
          form={projectForm}
          onFinish={handleCreateProject}
          layout="vertical"
        >
          <Form.Item
            name="projectName"
            label="Project Name"
            rules={[{ required: true, message: "Please enter project name" }]}
          >
            <Input placeholder="Enter project name" />
          </Form.Item>

          <Form.Item
            name="endDate"
            label="End Date"
            rules={[{ required: true, message: "Please select end date" }]}
          >
            <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Create
          </Button>
        </Form>
      </Modal>

      {/* Create Team Modal */}
      <Modal
        title="Create Team"
        open={isTeamModal}
        onCancel={() => setIsTeamModal(false)}
        footer={null}
      >
        <Form form={teamForm} onFinish={handleCreateTeam} layout="vertical">
          <Form.Item
            name="teamName"
            label="Team Name"
            rules={[{ required: true, message: "Please enter team name" }]}
          >
            <Input placeholder="Enter team name" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Create
          </Button>
        </Form>
      </Modal>
    </div>
  );
}

export default Project;
