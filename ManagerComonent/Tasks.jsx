import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Modal,
  Spin,
  message,
  Form,
  Input,
  DatePicker,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";

function Tasks() {
  const [messageApi, contextHolder] = message.useMessage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserTasks, setSelectedUserTasks] = useState([]);
  const [selectedUsername, setSelectedUsername] = useState("");

  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedComments, setSelectedComments] = useState([]);
  const [selectedTaskTitle, setSelectedTaskTitle] = useState("");

  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedProjectEndDate, setSelectedProjectEndDate] = useState(null); 
  const [taskForm] = Form.useForm();

  const BASE_URL = import.meta.env.VITE_URL;


  const fetchUsers = async () => {
  try {
    setLoading(true);
    const res = await axios.get(`${BASE_URL}/manager/user-list`, { withCredentials: true });
    setUsers(res.data || []);
    setLoading(false);
  } catch (err) {
    console.error(err);
    setLoading(false);
  }
};


  useEffect(() => {
    fetchUsers();
  }, []);

  const openTaskModal = (user) => {
    setSelectedUserTasks(user.taskDetails || []);
    setSelectedUsername(user.username);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedUserTasks([]);
    setSelectedUsername("");
  };

  const openCommentModal = (task) => {
    if (!task.comments || task.comments.length === 0) {
      messageApi.info("No comments for this task");
      return;
    }
    setSelectedComments(task.comments);
    setSelectedTaskTitle(task.title);
    setIsCommentModalOpen(true);
  };

  const handleCommentModalCancel = () => {
    setIsCommentModalOpen(false);
    setSelectedComments([]);
    setSelectedTaskTitle("");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "red";
      case "Discuss":
        return "yellow";
      case "Complete":
        return "green";
      case "Process":
        return "blue";
      default:
        return "gray";
    }
  };

  // Open Add Task Modal
  const openAddTaskModal = (user) => {
    if (!user.userStatus) {
      messageApi.warning("Cannot assign task to inactive user");
      return;
    }
    setSelectedUserId(user._id);
    setSelectedProjectEndDate(user.projectEndDate || null); 
    taskForm.resetFields();
    setIsAddTaskModalOpen(true);
  };

  const handleAddTask = async (values) => {
    try {
      const managerId = localStorage.getItem("managerId");
      await axios.post(
        `${BASE_URL}/manager/assign-task`,
        {
          title: values.title,
          description: values.description,
          manager: managerId,
          endDate: values.endDate ? values.endDate.toISOString() : null,
          userId: selectedUserId,
        },
        { withCredentials: true }
      );
      messageApi.success("Task assigned successfully! ");
      setIsAddTaskModalOpen(false);
    } catch (err) {
      console.error(err);
      messageApi.error("Failed to assign task");
    }
  };

  const columns = [
    {
      title: "Avatar",
      dataIndex: "profileImage",
      key: "avatar",
      render: (text, record) =>
        record.profileImage ? (
          <img
            src={record.profileImage}
            alt={record.username}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold">
            {record.username?.charAt(0).toUpperCase()}
          </div>
        ),
    },
    { title: "Username", dataIndex: "username", key: "username" },
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
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <>
          <Button
            type="primary"
            size="small"
            onClick={() => openTaskModal(record)}
            style={{ marginRight: 5 }}
          >
            Show Tasks
          </Button>
          <Button
            type="default"
            size="small"
            onClick={() => openAddTaskModal(record)}
            disabled={!record.userStatus} 
          >
            Add Task
          </Button>
        </>
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

  if (loading) return <Spin size="large" />;

  return (
    <>
      {contextHolder}
      <Table
        dataSource={users}
        columns={columns}
        rowKey="_id"
        pagination={{ pageSize: 5 }}
      />

      {/* User's Tasks Modal */}
      <Modal
        title={`Tasks of ${selectedUsername}`}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={700}
      >
        {selectedUserTasks.length === 0 ? (
          <p>No tasks available</p>
        ) : (
          <Table
            dataSource={selectedUserTasks}
            rowKey="_id"
            pagination={{ pageSize: 5 }}
            columns={taskColumns}
          />
        )}
      </Modal>

      {/* Task Comments Modal */}
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

      {/* Add Task Modal */}
      <Modal
        title="Assign Task"
        open={isAddTaskModalOpen}
        onCancel={() => setIsAddTaskModalOpen(false)}
        footer={null}
      >
        <Form form={taskForm} layout="vertical" onFinish={handleAddTask}>
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
                  if (
                    !value ||
                    !selectedProjectEndDate ||
                    value.isBefore(dayjs(selectedProjectEndDate)) ||
                    value.isSame(dayjs(selectedProjectEndDate), "day")
                  ) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Task end date must be before project end date")
                  );
                },
              }),
            ]}
          >
            <DatePicker
              format="DD/MM/YYYY"
              style={{ width: "100%" }}
              disabledDate={(current) =>
                selectedProjectEndDate
                  ? current &&
                    current > dayjs(selectedProjectEndDate).endOf("day")
                  : false
              }
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Assign Task
          </Button>
        </Form>
      </Modal>
    </>
  );
}

export default Tasks;
