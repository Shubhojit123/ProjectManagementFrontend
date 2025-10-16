import Password from "antd/es/input/Password";
import axios from "axios";
import React, { createContext, useContext, useState } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [isLoggedin, setLoggin] = useState(true);
    const BASE_URL = import.meta.env.VITE_URL;


    const login = async (values) => {
        const { email, password } = values;
        try {
            const res = axios.post(`${BASE_URL}/login`, { email, password },{withCredentials: true});
            return res
        } catch (error) {
            console.log(error);
        }
    }

const signup = async (values) => {
    const { email, username, password } = values;
    try {
        const res = await axios.post(
            `${BASE_URL}/signup`,
            { email, username, password },
            { withCredentials: true }
        );
        return res.data; 
    } catch (error) {
        console.error("Signup error:", error.response?.data || error.message);
        throw error.response?.data || { error: "Signup failed" };
    }
};


    const values = { isLoggedin, setLoggin, login, signup };
    return (
        <AppContext.Provider value={values}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
