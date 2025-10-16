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
  TeamOutlined,
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
  const [team, setTeam] = useState(null);
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_URL;

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/user/user-info`, {
          withCredentials: true,
        });
        setProfile(res.data.message.userData);
        setTeam(res.data.message.userTeam);
      } catch (error) {
        console.error("Profile fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Logout
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

  // Request OTP
  const handleRequestOtp = async () => {
    if (!password) return messageApi.info("Enter new password first");
    try {
      const res = await axios.get(`${BASE_URL}/request-otp`, {
        withCredentials: true,
      });
      console.log(res)
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
      messageApi.error(error.response?.data?.message || "Failed to change password");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-gray-100">
      {contextHolder}
      <Card className="w-[400px] shadow-lg rounded-2xl p-6">
        <div className="flex flex-col items-center">
          <Avatar
            size={100}
            src={profile?.profileImage || undefined}
            icon={!profile?.profileImage && <UserOutlined />}
            className="border-4 border-blue-500"
          />
          <h2 className="text-xl font-semibold mt-3 flex items-center gap-2">
            <UserOutlined /> {profile?.username}
          </h2>
          <p className="text-gray-600 flex items-center gap-2">
            <MailOutlined /> {profile?.email}
          </p>

          <div className="mt-4 flex flex-col gap-2 w-full">
            <div className="flex justify-between items-center">
              <span className="font-medium flex items-center gap-1">
                <TeamOutlined /> Role:
              </span>
              <Tag color="blue">{profile?.role}</Tag>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Status:</span>
              <Tag color={profile?.userStatus ? "green" : "red"}>
                {profile?.userStatus ? "Active" : "Inactive"}
              </Tag>
            </div>
            {profile?.role !== "Admin" && (
              <>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Manager Name:</span>
                  <Tag color={profile?.manager ? "geekblue" : "default"}>
                    {profile?.manager?.username || "Not Assigned"}
                  </Tag>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Project:</span>
                  <Tag color={team?.teamName ? "gold" : "default"}>
                    {team?.projectDetails?.projectName || "Not Assigned"}
                  </Tag>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Assigned Team:</span>
                  <Tag color={team?.teamName ? "magenta" : "default"}>
                    {team?.teamName || "Not Assigned"}
                  </Tag>
                </div>
              </>
            )}
          </div>

          <Button
            type="default"
            icon={<KeyOutlined />}
            className="mt-4 w-full flex items-center justify-center"
            onClick={() => setOpenModal(true)}
          >
            Change Password
          </Button>

          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            className="mt-3 w-full flex items-center justify-center"
            onClick={handleLogout}
          >
            Logout
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
      >
        <Input.Password
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-3"
        />

        {otpSent && (
          <Input
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="mb-3"
          />
        )}

        {!otpSent ? (
          <Button type="primary" block onClick={handleRequestOtp}>
            Request OTP
          </Button>
        ) : (
          <Button type="primary" block onClick={handleChangePassword}>
            Change Password
          </Button>
        )}
      </Modal>
    </div>
  );
};

export default ProfilePage;
