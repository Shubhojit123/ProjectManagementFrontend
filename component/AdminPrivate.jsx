import axios from "axios";
import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Spin, message } from "antd";

function AdminPrivate() {
  const BASE_URL = import.meta.env.VITE_URL;
  const [isAuth, setIsAuth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const getRole = async () => {
      try {
        const token = localStorage.getItem("taskmanagement");
        const res = await axios.get(`${BASE_URL}/role`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });

        console.log(res);

        setIsAuth(res.data.message === "Admin");
      } catch (error) {
        console.log(error);
        setIsAuth(false);
      } finally {
        setLoading(false); 
      }
    };
    getRole();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      {isAuth ? <Outlet /> : <Navigate to="/error" replace />}
    </>
  );
}

export default AdminPrivate;
