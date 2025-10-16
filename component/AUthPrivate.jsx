import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from "react-router-dom";
import axios from 'axios';

function AuthPrivate() {
  const BASE_URL = import.meta.env.VITE_URL;
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    const getRole = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/loggedin`, {
          withCredentials: true
        });
        setIsAuth(res.data === "LoggedIn");
      } catch (error) {
        console.log(error);
        setIsAuth(false);
      }
    };
    getRole();
  }, [BASE_URL]);


  if (isAuth === null) return <div>Loading...</div>;
  return isAuth ? <Outlet /> : <Navigate to="/error" replace />;
}

export default AuthPrivate;
