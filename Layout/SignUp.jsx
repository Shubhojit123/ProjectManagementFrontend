import React, { useState } from "react";
import { useAppContext } from "../ContextApi/AppContext";
import { Button, Form, Input, message } from "antd";

function SignUp() {
    const [messageApi, contextHolder] = message.useMessage();
    const { setLoggin, signup } = useAppContext();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);

        try {
            const result = await signup(values);
            messageApi.open({
                type: 'success',
                content: `${result.message}`,
            });
            setLoggin(true);
        } catch (err) {
            console.error("Signup failed:", err);
            messageApi.open({
                type: "error",
                content: err.error || "Something went wrong!",
            });
            setLoggin(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4">
            {contextHolder}
            
            {/* Main Card */}
            <div className="flex bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden w-full max-w-5xl border border-slate-700/50 relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-3xl"></div>
                
                {/* Left Side - Branding */}
                <div className="w-1/2 p-12 flex flex-col items-center justify-center bg-gradient-to-br from-slate-800/50 to-slate-900/50 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10 rounded-l-3xl"></div>
                    <div className="relative z-10 text-center">
                        <div className="mb-8">
                            <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-purple-500/25">
                                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                                </svg>
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-4">Join TaskFlow</h1>
                            <p className="text-slate-300 text-lg leading-relaxed">
                                Create your account and start managing your tasks more efficiently than ever before.
                            </p>
                        </div>
                        <div className="flex justify-center space-x-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
                            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse delay-300"></div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Register Form */}
                <div className="w-1/2 p-12 flex flex-col justify-center relative">
                    <div className="max-w-sm mx-auto w-full">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                            <p className="text-slate-400">Get started with your free account</p>
                        </div>

                        <Form
                            name="register"
                            layout="vertical"
                            onFinish={onFinish}
                            autoComplete="off"
                            className="space-y-4"
                        >
                            <Form.Item
                                label={<span className="text-slate-300 font-medium">Username</span>}
                                name="username"
                                rules={[{ required: true, message: "Please input your username!" }]}
                            >
                                <Input 
                                    placeholder="Choose a username"
                                    className="h-12 bg-slate-700/50 border-slate-600 rounded-xl text-white placeholder-slate-400 hover:border-purple-500 focus:border-purple-500"
                                />
                            </Form.Item>

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
                                    className="h-12 bg-slate-700/50 border-slate-600 rounded-xl text-white placeholder-slate-400 hover:border-purple-500 focus:border-purple-500"
                                />
                            </Form.Item>

                            <Form.Item
                                label={<span className="text-slate-300 font-medium">Password</span>}
                                name="password"
                                rules={[{ required: true, message: "Please input your password!" }]}
                            >
                                <Input.Password 
                                    placeholder="Create a password"
                                    className="h-12 bg-slate-700/50 border-slate-600 rounded-xl text-white placeholder-slate-400 hover:border-purple-500 focus:border-purple-500"
                                />
                            </Form.Item>

                            <Form.Item
                                label={<span className="text-slate-300 font-medium">Confirm Password</span>}
                                name="confirmPassword"
                                dependencies={["password"]}
                                rules={[
                                    { required: true, message: "Please confirm your password!" },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue("password") === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(
                                                new Error("Passwords do not match!")
                                            );
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password 
                                    placeholder="Confirm your password"
                                    className="h-12 bg-slate-700/50 border-slate-600 rounded-xl text-white placeholder-slate-400 hover:border-purple-500 focus:border-purple-500"
                                />
                            </Form.Item>

                            <Form.Item className="mb-6">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    block
                                    loading={loading}
                                    className="h-12 bg-gradient-to-r from-purple-600 to-blue-600 border-0 rounded-xl font-semibold text-base hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/25 transition-all duration-300 hover:scale-105"
                                >
                                    {loading ? "Creating Account..." : "Create Account"}
                                </Button>
                            </Form.Item>
                        </Form>

                        <div className="text-center">
                            <p className="text-slate-400 mb-2">Already have an account?</p>
                            <button
                                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors duration-200 underline-offset-4 hover:underline"
                                onClick={() => setLoggin(true)}
                            >
                                Sign In Instead
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignUp;