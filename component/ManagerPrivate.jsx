import axios from "axios";
import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Spin } from "antd";

function ManagerPrivate() {
    const BASE_URL = import.meta.env.VITE_URL;
    const [isAuth, setIsAuth] = useState(null);

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
                setIsAuth(res.data.message === "Manager");
            } catch (error) {
                console.log(error);
                setIsAuth(false);
            }
        };
        getRole();
    }, []);

    if (isAuth === null)
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                }}
            >
                <Spin size="large" tip="Checking Authorization..." />
            </div>
        );

    return isAuth ? <Outlet /> : <Navigate to="/error" replace />;
}

export default ManagerPrivate;
