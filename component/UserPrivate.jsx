import axios from "axios";
import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

function UserPrivate() {
    const BASE_URL = import.meta.env.VITE_URL;
    const [isAuth, setIsAuth] = useState(null);
useEffect(() => {
  const getRole = async () => {
    try {
      const token = localStorage.getItem("taskmanagement");
      if(!token){
        console.log("No token found");
      }
      const res = await axios.get(`${BASE_URL}/role`, {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
        withCredentials: true,
      });

      setIsAuth(res.data.message === "User");
    } catch (error) {
      console.log("Role fetch error:", error);
      setIsAuth(false);
    }
  };

  getRole();
}, []);


    if (isAuth === null) return <div>Loading...</div>;
    return isAuth ? <Outlet /> : <Navigate to="/error" replace />;
}

export default UserPrivate;
