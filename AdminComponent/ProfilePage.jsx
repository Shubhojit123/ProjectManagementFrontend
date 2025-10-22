import React, { useEffect, useState } from "react";
import {
  Card,
  Avatar,
  Tag,
  Button,
  Spin,
  message,
  Modal,
  Input,
  Upload,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  CrownOutlined,
  LogoutOutlined,
  KeyOutlined,
  CameraOutlined,
  EditOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { IoCamera } from "react-icons/io5";

const ProfilePage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_URL;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/profile`, {
          withCredentials: true,
        });
        setProfile(res.data.message);
      } catch (error) {
        console.error("Profile fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get(`${BASE_URL}/logout`, { withCredentials: true });
      messageApi.success("Logged out successfully");
      localStorage.removeItem("taskmanagement");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleRequestOtp = async () => {
    if (!password) return messageApi.info("Enter new password first");
    try {
      const res = await axios.get(`${BASE_URL}/request-otp`, {
        withCredentials: true,
      });
      messageApi.success(`OTP ${res.data.generatedOtp}`);
      setOtpSent(true);
    } catch (error) {
      console.error(error);
      messageApi.error(error.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleChangePassword = async () => {
    if (!otp || !password) {
      return messageApi.info("Please enter OTP and new password");
    }
    try {
      await axios.post(
        `${BASE_URL}/reset-password`,
        { email: profile.email, otp, newPassword: password },
        { withCredentials: true }
      );
      messageApi.success("Password changed successfully!");
      setPassword("");
      setOtp("");
      setOtpSent(false);
      setOpenModal(false);
    } catch (error) {
      console.error(error);
      messageApi.error(
        error.response?.data?.message || "Failed to change password"
      );
    }
  };

  const handleImageUpload = async (file) => {
    setUploadLoading(true);

    try {
      if (file.size / 1024 / 1024 > 2) {
        message.error("File size must be ≤ 2 MB");
        setUploadLoading(false);
        return false;
      }

      const formData = new FormData();
      formData.append("image", file);

      await axios.post(`${BASE_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true
      });

      message.success("Profile image uploaded successfully");
    } catch (err) {
      message.error(err.response?.data?.message || "Error uploading profile image");
    } finally {
      setUploadLoading(false);
    }

    return false;
  };





  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8 px-4">
      {contextHolder}

      <div className="max-w-md mx-auto">
        {/* Header Card with Gradient */}
        <Card
          className="backdrop-blur-xl bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 shadow-2xl"
          style={{ borderRadius: "24px" }}
          bordered={false}
        >
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-t-3xl" />

          <div className="relative flex flex-col items-center pt-8">
            {/* Profile Picture with Upload */}
            <div className="relative group">
              <Avatar
                size={120}
                src={profile?.profileImage || undefined}
                icon={!profile?.profileImage && <UserOutlined />}
                className="border-4 border-gray-700 shadow-xl"
                style={{ backgroundColor: "#1a1a2e" }}
              />

              <Upload
                beforeUpload={handleImageUpload}
                showUploadList={false}
                accept="image/*"
              >
                <Button
                  shape="circle"
                  size="large"
                  icon={uploadLoading ? <Spin size="small" /> : <EditOutlined style={{ color: "black" }} />}
                  className="absolute bottom-0 right-0 shadow-lg bg-blue-600 hover:bg-blue-700 border-none"
                  style={{ width: "40px", height: "40px", color: "white" }}
                  disabled={uploadLoading}
                />
              </Upload>

            </div>

            {/* Name */}
            <h2 className="text-2xl font-bold mt-4 text-white">
              {profile?.username}
            </h2>

            {/* Email */}
            <div className="flex items-center gap-2 mt-2 text-gray-400">
              <MailOutlined />
              <span className="text-sm">{profile?.email}</span>
            </div>

            {/* Status Tags */}
            <div className="flex gap-3 mt-4">
              <Tag
                icon={<CrownOutlined />}
                color="blue"
                className="px-4 py-1 text-sm font-medium rounded-full"
              >
                {profile?.role}
              </Tag>
              <Tag
                color={profile?.userStatus ? "green" : "red"}
                className="px-4 py-1 text-sm font-medium rounded-full"
              >
                {profile?.userStatus ? "Active" : "Inactive"}
              </Tag>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent my-6" />

            {/* Action Buttons */}
            <div className="w-full space-y-3">
              <Button
                type="default"
                icon={<KeyOutlined />}
                size="large"
                className="w-full h-12 flex items-center justify-center text-white bg-gray-800/50 hover:bg-gray-700/50 border-gray-700 rounded-xl font-medium transition-all"
                onClick={() => setOpenModal(true)}
              >
                Change Password
              </Button>

              <Button
                danger
                icon={<LogoutOutlined />}
                size="large"
                className="w-full h-12 flex items-center justify-center rounded-xl font-medium transition-all"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Card
            className="backdrop-blur-xl bg-gray-800/30 border border-gray-700/50"
            style={{ borderRadius: "16px" }}
            bordered={false}
          >
            <div className="text-center">
              <div className="text-3xl mb-1">👤</div>
              <div className="text-xs text-gray-400">Account Type</div>
              <div className="text-sm font-semibold text-black mt-1">
                {profile?.role}
              </div>
            </div>
          </Card>

          <Card
            className="backdrop-blur-xl bg-gray-800/30 border border-gray-700/50"
            style={{ borderRadius: "16px" }}
            bordered={false}
          >
            <div className="text-center">
              <div className="text-3xl mb-1">
                {profile?.userStatus ? "✅" : "⏸️"}
              </div>
              <div className="text-xs text-gray-400">Status</div>
              <div className="text-sm font-semibold text-black mt-1">
                {profile?.userStatus ? "Active" : "Inactive"}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Password Change Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-black">
            <KeyOutlined />
            <span>Change Password</span>
          </div>
        }
        open={openModal}
        onCancel={() => {
          setOpenModal(false);
          setPassword("");
          setOtp("");
          setOtpSent(false);
        }}
        footer={null}
        centered
        styles={{
          content: {
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.1)",
          },
          header: {
            background: "transparent",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          },
          body: {
            padding: "24px",
          },
        }}
      >
        <div className="space-y-4">
          <Input.Password
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            size="large"
            className="rounded-lg"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "white",
            }}
          />

          {otpSent && (
            <Input
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              size="large"
              className="rounded-lg"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "white",
              }}
            />
          )}

          {!otpSent ? (
            <Button
              type="primary"
              block
              size="large"
              onClick={handleRequestOtp}
              className="rounded-lg font-medium h-12"
            >
              Request OTP
            </Button>
          ) : (
            <Button
              type="primary"
              block
              size="large"
              onClick={handleChangePassword}
              className="rounded-lg font-medium h-12"
            >
              Change Password
            </Button>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ProfilePage;