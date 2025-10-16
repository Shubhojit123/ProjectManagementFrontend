import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import { message } from 'antd'
import { useNavigate } from "react-router-dom";
const AdminContext = createContext();

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider = ({ children }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const BASE_URL = import.meta.env.VITE_URL;


  const [profile, setProfile] = useState(null);

  const [selectedKey, setSelectedKey] = useState("1");


  const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
  });

  const fetchAllDetails = async () => {
    try {
      const BASE_URL = import.meta.env.VITE_URL;
      const res = await axios.get(`${BASE_URL}/admin/all-details`, {
        withCredentials: true,
      });
      return res;
    } catch (error) {
      console.log(error);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/profile`, {
        withCredentials: true,
      });
      console.log(res)
      setProfile(res.data.message);
      return res.data;
    } catch (error) {
      console.error("Profile fetch error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${BASE_URL}/logout`, { withCredentials: true });
      messageApi.success("Logout Successfully");
      messageApi.success("Log Out Successfully");
      localStorage.removeItem("taskmanagement");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getAllMemebers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/admin/all-members`, { withCredentials: true });
      return res;
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  const getAllProjects = async () => {
    try {
      const res = await api.get("/admin/all-projects", { withCredentials: true });
      return res;
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }

  const getAllManagers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/admin/all-mangers`, { withCredentials: true });
      return res;
    }
    catch (error) {
      console.error(error);
    }
  }

  const getAllNotAssignUsers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/admin/not-assignuser`, { withCredentials: true });
      return res;
    } catch (error) {
      console.error(error);
    }
  }

  const createProject = async (payLoad) => {
    try {
      const res = await axios.post(`${BASE_URL}/admin/create-project`, payLoad, { withCredentials: true });
      return res;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  const assignUsersToManager = async (selectedManager, selectedUsers) => {
    try {
      console.log(selectedManager, selectedUsers);
      await axios.put(
        `${BASE_URL}/admin/user-assign`,
        {
          managerId: selectedManager,
          userIds: selectedUsers,
        },
        { withCredentials: true }
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const updateProjectStatus = async (projectId, status) => {
    try {
      const res = await api.put(
        "/admin/update-project-status", { projectId, status });
      return res;
    } catch (error) {
      console.error("Update status error:", error);
      throw error;
    }
  }


  const profileViews = async (id) => {
    try {
      const res = await api.get(`profile-view?id=${id}`);
      return res;
    } catch (error) {
      console.error("Update status error:", error);
      throw error;
    }
  }

  const getMsg = async (id) => {
    try {
      const res = await api.get(`/get-message/${id}`, { withCredentials: true });
      return res;
    } catch (error) {
      console.error(error);
    }
  }

  const sendMsg = async (recivedId, msg) => {
    try {
      const res = await api.post(`/send-message`, { recivedId: recivedId, msg: msg }, { withCredentials: true });
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <AdminContext.Provider value={{
      profile, fetchProfile, handleLogout,
      getAllMemebers, getAllProjects, fetchAllDetails, getAllManagers,
      getAllNotAssignUsers, createProject, assignUsersToManager, updateProjectStatus, profileViews,
      getMsg, sendMsg,setSelectedKey,selectedKey
    }}>
      {contextHolder}
      {children}
    </AdminContext.Provider>
  );
};
