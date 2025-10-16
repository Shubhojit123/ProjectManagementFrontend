import React, { useState } from "react";
import { useAppContext } from "../ContextApi/AppContext";
import { Button, Form, Input, message } from "antd";
import { Navigate, useNavigate } from "react-router-dom";

function Login() {
    const [messageApi, contextHolder] = message.useMessage();
    const { setLoggin, login } = useAppContext();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true)
        let role;
        const res = await login(values).then((result) => {
            messageApi.open({
                type: 'success',
                content: "Login Successfully",
            });
            role = result.data.role;
            localStorage.setItem("taskmanagement", result.data.token);
            if (role === "User") {
                navigate("/user/dashboard")
            }
            if (role === "Admin") {
                navigate("/admin/dashboard")
            }
            if (role === "Manager") {
                navigate("/manager/dashboard")
            }
        })
        .catch((err) => {
            console.log(err)
            messageApi.open({
                type: 'error',
                content: `${err.response.data.error}`,
            });
        })
        setTimeout(() => {
            setLoading(false);
            setLoggin(true);
        }, [2000, res]);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4">
            {contextHolder}
            
            {/* Main Card */}
            <div className="flex bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden w-full max-w-4xl border border-slate-700/50 relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-3xl"></div>
                
                {/* Left Side - Branding */}
                <div className="w-1/2 p-12 flex flex-col items-center justify-center bg-gradient-to-br from-slate-800/50 to-slate-900/50 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-l-3xl"></div>
                    <div className="relative z-10 text-center">
                        <div className="mb-8">
                            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-blue-500/25">
                                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-4">TaskFlow</h1>
                            <p className="text-slate-300 text-lg leading-relaxed">
                                Streamline your workflow and boost productivity with our comprehensive task management solution.
                            </p>
                        </div>
                        <div className="flex justify-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-150"></div>
                            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse delay-300"></div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-1/2 p-12 flex flex-col justify-center relative">
                    <div className="max-w-sm mx-auto w-full">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                            <p className="text-slate-400">Sign in to your account</p>
                        </div>

                        <Form
                            name="login"
                            layout="vertical"
                            onFinish={onFinish}
                            autoComplete="off"
                            className="space-y-6"
                        >
                            <Form.Item
                                label={<span className="text-slate-300 font-medium">Email Address</span>}
                                name="email"
                                rules={[
                                    { required: true, message: "Please input your email!" },
                                    { type: "email", message: "Please enter a valid email!" },
                                ]}
                            >
                                <Input 
                                    placeholder="Enter your email"
                                    className="h-12 bg-slate-700/50 border-slate-600 rounded-xl text-white placeholder-slate-400 hover:border-blue-500 focus:border-blue-500"
                                />
                            </Form.Item>

                            <Form.Item
                                label={<span className="text-slate-300 font-medium">Password</span>}
                                name="password"
                                rules={[{ required: true, message: "Please input your password!" }]}
                            >
                                <Input.Password 
                                    placeholder="Enter your password"
                                    className="h-12 bg-slate-700/50 border-slate-600 rounded-xl text-white placeholder-slate-400 hover:border-blue-500 focus:border-blue-500"
                                />
                            </Form.Item>

                            <Form.Item className="mb-6">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    block
                                    loading={loading}
                                    className="h-12 bg-gradient-to-r from-blue-600 to-purple-600 border-0 rounded-xl font-semibold text-base hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-105"
                                >
                                    {loading ? "Signing In..." : "Sign In"}
                                </Button>
                            </Form.Item>
                        </Form>

                        <div className="text-center">
                            <p className="text-slate-400 mb-2">Don't have an account?</p>
                            <button
                                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-200 underline-offset-4 hover:underline"
                                onClick={() => setLoggin(false)}
                            >
                                Create Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
