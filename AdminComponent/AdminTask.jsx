import React, { useEffect, useState } from "react";
import { Table, Input, Modal, Button, message, Form, Select } from "antd";
import axios from "axios";

function AdminTask() {
  const [messageApi, contextHolder] = message.useMessage();
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [assigning, setAssigning] = useState(false);

  // extra state for create employee
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [form] = Form.useForm();

  const BASE_URL = import.meta.env.VITE_URL;

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/admin/all-mangers`, { withCredentials: true });
      setManagers(res.data.message);
    } catch (err) {
      console.log(err);
      message.error("Failed to load managers");
    } finally {
      setLoading(false);
    }
  };

  const handleManagerClick = async (manager) => {
    setSelectedManager(manager);
    setOpenModal(true);
    try {
      const res = await axios.get(`${BASE_URL}/admin/not-assignuser`, { withCredentials: true });
      setUsers(res.data.message.filter((u) => u.taskAssign === false));
    } catch (err) {
      console.log(err);
      message.error("Failed to load users");
    }
  };

  const handleAssign = async () => {
    if (!selectedUsers.length) {
      message.warning("Please select at least one user");
      return;
    }
    setAssigning(true);
    try {
      await axios.put(
        `${BASE_URL}/admin/user-assign`,
        {
          managerId: selectedManager._id,
          userId: selectedUsers,
        },
        { withCredentials: true }
      );

      messageApi.success("User Assign Successfully");
      setOpenModal(false);
      setSelectedUsers([]);
      fetchManagers();
    } catch (err) {
      console.log(err);
      messageApi.error("Failed to assign users");
    } finally {
      setAssigning(false);
    }
  };

  const handleCreate = async (values) => {
    setCreating(true);
    try {
      await axios.post(`${BASE_URL}/admin/create-employee`, values, { withCredentials: true });
      messageApi.success("Employee created successfully");
      setOpenCreateModal(false);
      form.resetFields();
      fetchManagers();
    } catch (err) {
      console.log(err);
      messageApi.error(err?.response?.data?.message || "Failed to create employee");
    } finally {
      setCreating(false);
    }
  };

  const columns = [
    { title: "Name", dataIndex: "username", key: "username" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Action",
      render: (_, record) => (
        <Button type="link" onClick={() => handleManagerClick(record)}>
          Assign Users
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6">
      {contextHolder}

      <div className="flex justify-between mb-4">
        <Input.Search
          placeholder="Search manager"
          allowClear
          onChange={(e) => setSearchText(e.target.value.toLowerCase())}
          className="w-1/3"
        />

        <Button type="primary" onClick={() => setOpenCreateModal(true)}>
          + Create Employee
        </Button>
      </div>

      <Table
        dataSource={managers.filter(
          (m) =>
            m.username.toLowerCase().includes(searchText) ||
            m.email.toLowerCase().includes(searchText)
        )}
        columns={columns}
        rowKey="_id"
        loading={loading}
      />

      {/* Assign Users Modal */}
      <Modal
        title={`Assign Users to ${selectedManager?.username}`}
        open={openModal}
        onCancel={() => setOpenModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setOpenModal(false)}>
            Cancel
          </Button>,
          <Button key="assign" type="primary" loading={assigning} onClick={handleAssign}>
            Assign
          </Button>,
        ]}
      >
        <Table
          rowSelection={{
            type: "checkbox",
            onChange: (selectedRowKeys) => setSelectedUsers(selectedRowKeys),
          }}
          dataSource={users}
          columns={[
            { title: "Name", dataIndex: "username", key: "username" },
            { title: "Email", dataIndex: "email", key: "email" },
          ]}
          rowKey="_id"
        />
      </Modal>

      {/* Create Employee Modal */}
      <Modal
        title="Create Employee"
        open={openCreateModal}
        onCancel={() => setOpenCreateModal(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Please input email" }, { type: "email" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please input username" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input password" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: "Please select role" }]}
            initialValue="Admin"
          >
            <Select>
              <Select.Option value="Admin">Admin</Select.Option>
              <Select.Option value="Manager">Manager</Select.Option>
              <Select.Option value="User">User</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={creating}>
              Create
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default AdminTask;
