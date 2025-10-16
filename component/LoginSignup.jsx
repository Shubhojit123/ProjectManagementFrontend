import React, { useState, useEffect } from 'react'
import Login from '../Layout/Login'
import SignUp from '../Layout/SignUp'
import { useAppContext } from '../ContextApi/AppContext'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function LoginSignup() {
  const { isLoggedin } = useAppContext();
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_URL;
  
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
        const role = res.data.message;
        console.log(role)
        if (role === "User") {
          navigate("/user/dashboard")
        }
        if (role === "Admin") {
          navigate("/admin/dashboard")
        }
        if (role === "Manager") {
          navigate("/manager/dashboard")
        }
      } catch (error) {
        console.log(error);
      }
    };
    getRole();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {isLoggedin ? (<Login />) : (<SignUp />)}
      </div>
    </div>
  )
}

export default LoginSignup;
