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
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  CrownOutlined,
  LogoutOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[150px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "black" }}>
      {contextHolder}
      <Card
        className="" 
        style={{ background: "#000", color: "white", border: "none", boxShadow: "none" }}
        bordered={false}
      >

        <div className="flex flex-col items-center">
          <Avatar
            size={40}
            src={profile?.profileImage || undefined}
            icon={!profile?.profileImage && <UserOutlined />}
            className=" border-blue-500"
          />

          <h2 className="text-lg font-semibold mt-2 flex items-center gap-1">
            <UserOutlined /> {profile?.username}
          </h2>
          <p className="text-gray-300 flex items-center gap-1 text-sm">
            <MailOutlined /> {profile?.email}
          </p>

          <div className="mt-3 flex flex-col gap-1 w-full text-sm">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1">
                <CrownOutlined /> Role:
              </span>
              <Tag color="blue" style={{ padding: "0 6px", fontSize: "12px" }}>
                {profile?.role}
              </Tag>
            </div>

            <div className="flex justify-between items-center">
              <span>Status:</span>
              <Tag
                color={profile?.userStatus ? "green" : "red"}
                style={{ padding: "0 6px", fontSize: "12px" }}
              >
                {profile?.userStatus ? "Active" : "Inactive"}
              </Tag>
            </div>
          </div>

          <Button
            type="default"
            icon={<KeyOutlined />}
            className="mt-3 w-full text-sm flex items-center justify-center"
            onClick={() => setOpenModal(true)}
          >
            Change Password
          </Button>

        </div>
      </Card>

      <Modal
        title="Change Password"
        open={openModal}
        onCancel={() => {
          setOpenModal(false);
          setPassword("");
          setOtp("");
          setOtpSent(false);
        }}
        footer={null}
        centered
        bodyStyle={{ background: "#1a1a1a", color: "white", padding: "16px" }}
      >
        <Input.Password
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-2"
          size="small"
        />

        {otpSent && (
          <Input
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="mb-2"
            size="small"
          />
        )}

        {!otpSent ? (
          <Button type="primary" block size="small" onClick={handleRequestOtp}>
            Request OTP
          </Button>
        ) : (
          <Button type="primary" block size="small" onClick={handleChangePassword}>
            Change Password
          </Button>
        )}
      </Modal>
    </div>
  );
};

export default ProfilePage;
